import { useEffect, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  ArrowLeft,
  X,
  Truck,
  MapPin,
  Gauge,
  Fuel,
  User,
  Route,
  FileText,
  Clock,
  Calendar,
  Download,
} from 'lucide-react';
import { Vehicle } from '../../../App';
import { formatCoordinate } from './VehicleDetails.tsx';
import { api } from "../../../services/api.ts";
import { VehicleTripHistory } from './VehicleTripHistory.tsx';

export type VehicleDetailTileProps = {
  vehicle: Vehicle;
  addressFallback?: string;
  onViewTrip: (trip) => void;
  onRecentTrip;
  onViewHistory?: (vehicle: Vehicle) => void;
  onClose: () => void;
  /** When true (default), render in a body portal. Set false to overlay a relative parent (e.g. Live Map). */
  usePortal?: boolean;
};

const TILE_BG = '#4A5364';
const TILE_CONTROL_BG = '#3F4756';
const TILE_BORDER = '#454E5E';

const VEHICLE_DATA_HEADERS = [
  'Trip ID',
  'Trip Date',
  'Address',
  'Latitude',
  'Longitude',
  'Timestamp',
];

function escapeCsv(value: unknown): string {
  const text = value == null ? '' : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

function vehicleDataFilename(name: string, extension: 'csv' | 'pdf'): string {
  const safe = name.trim().replace(/[^\w.-]+/g, '_') || 'vehicle';
  return `${safe}-vehicle-data.${extension}`;
}

function downloadCsvFile(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function buildVehicleDataCsv(rows: string[][]): string {
  return [VEHICLE_DATA_HEADERS, ...rows]
    .map((row) => row.map(escapeCsv).join(','))
    .join('\n');
}

function downloadVehicleDataPdf(name: string, rows: string[][]) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'letter' });
  const title = name.trim() || 'Vehicle';
  doc.setFontSize(16);
  doc.text(title, 40, 40);
  doc.setFontSize(10);
  doc.setTextColor(75, 85, 99);
  doc.text(
    rows.length === 0
      ? 'No data logged'
      : `${rows.length} record${rows.length === 1 ? '' : 's'}`,
    40,
    58,
  );
  doc.setTextColor(0, 0, 0);
  autoTable(doc, {
    startY: 72,
    head: [VEHICLE_DATA_HEADERS],
    body: rows,
    styles: { fontSize: 8, cellPadding: 4, overflow: 'linebreak' },
    headStyles: { fillColor: [74, 83, 100], textColor: 255 },
    margin: { left: 40, right: 40 },
  });
  doc.save(vehicleDataFilename(name, 'pdf'));
}

const FORMAT_TOGGLE_RESERVE = 78;

function getPresenceLabel(status) {
  switch (status) {
    case 1:
      return 'Online now';
    /*
    case 'idle':
      return 'Idle';
    */
    case 0:
      return 'Offline';
    /*
    case 'maintenance':
      return 'In maintenance';
    default:
      return 'Online now';
    */
  }
}

export function VehicleDetailTile({
  vehicle,
  addressFallback,
  onViewTrip,
  onRecentTrip,
  onViewHistory,
  onClose,
  usePortal = true,
}: VehicleDetailTileProps) {
  const [mode, setMode] = useState<'summary' | 'details'>('summary');
  const lastSeen = vehicle.address || addressFallback || 'No location logged';
  const hasLoggedLocation = Boolean(vehicle.address || addressFallback);
  const [selectedTripHistory, setSelectedTripHistory] = useState<any | null>(null);

  const presenceText = `${getPresenceLabel(vehicle.status)} · Updated ${vehicle.lastUpdate}`;
  const statusLabel =
    vehicle.status;
  
  const statusAccent =
    vehicle.status == 1
      ? '#4ade80'
      : vehicle.status === 'idle'
        ? '#facc15'
        : vehicle.status === 'maintenance'
          ? '#f87171'
          : '#94a3b8';

  const statusPillBg =
    vehicle.status == 1 
      ? 'rgba(74, 222, 128, 0.2)'
      : vehicle.status === 'idle'
        ? 'rgba(250, 204, 21, 0.2)'
        : vehicle.status === 'maintenance'
          ? 'rgba(248, 113, 113, 0.2)'
          : 'rgba(148, 163, 184, 0.2)';

  const rowStyle: CSSProperties = {
    display: 'flex',
    gap: '10px',
    padding: '10px 12px',
  };

  const labelStyle: CSSProperties = {
    margin: 0,
    fontSize: '12px',
    fontWeight: 500,
    lineHeight: 1,
    color: '#94A3B8',
  };

  const valueStyle: CSSProperties = {
    margin: '4px 0 0',
    fontSize: '14px',
    lineHeight: 1.35,
    color: '#F1F5F9',
  };

  const iconStyle: CSSProperties = {
    width: 16,
    height: 16,
    flexShrink: 0,
    marginTop: 2,
    color: '#94A3B8',
  };

  const primaryButtonStyle: CSSProperties = {
    borderRadius: 8,
    border: 'none',
    backgroundColor: '#3B82F6',
    color: '#FFFFFF',
    padding: '10px 12px',
    fontWeight: 500,
    cursor: 'pointer',
  };

  const secondaryButtonStyle: CSSProperties = {
    borderRadius: 8,
    border: `1px solid ${TILE_BORDER}`,
    backgroundColor: TILE_CONTROL_BG,
    color: '#E2E8F0',
    padding: '10px 12px',
    fontWeight: 500,
    cursor: 'pointer',
  };
  
  const [recentTrips, setRecentTrips] = useState([]);
  const [tripsLoaded, setTripsLoaded] = useState(false);
  const [isDownloadingData, setIsDownloadingData] = useState(false);
  const [downloadAsPdf, setDownloadAsPdf] = useState(false);

  async function handleDownloadVehicleData() {
    if (isDownloadingData) {
      return;
    }
    setIsDownloadingData(true);
    try {
      const fetchedTrips = await api.getVehicleTrips(vehicle.id);
      const trips = Array.isArray(fetchedTrips) ? fetchedTrips : [];
      const tripLocations = await Promise.all(
        trips.map(async (trip) => {
          if (!trip?.trip_id) {
            return { trip, locations: [] };
          }
          const fetchedLocs = await api.getTripLocations(trip.trip_id);
          return {
            trip,
            locations: Array.isArray(fetchedLocs) ? fetchedLocs : [],
          };
        }),
      );

      const rows: string[][] = [];
      for (const { trip, locations } of tripLocations) {
        if (locations.length === 0) {
          if (trip?.trip_id || trip?.trip_date) {
            rows.push([
              trip.trip_id ?? '',
              trip.trip_date ?? '',
              '',
              '',
              '',
              '',
            ]);
          }
          continue;
        }
        for (const loc of locations) {
          rows.push([
            trip?.trip_id ?? loc.trip_id ?? '',
            trip?.trip_date ?? '',
            loc.address ?? '',
            loc.lat ?? '',
            loc.lon ?? loc.lng ?? '',
            loc.timestamp ?? '',
          ]);
        }
      }

      if (downloadAsPdf) {
        downloadVehicleDataPdf(vehicle.name, rows);
      } else {
        const content = rows.length === 0 ? '' : buildVehicleDataCsv(rows);
        downloadCsvFile(vehicleDataFilename(vehicle.name, 'csv'), content);
      }
    } catch (error) {
      console.error(error);
      if (downloadAsPdf) {
        downloadVehicleDataPdf(vehicle.name, []);
      } else {
        downloadCsvFile(vehicleDataFilename(vehicle.name, 'csv'), '');
      }
    } finally {
      setIsDownloadingData(false);
    }
  }

  useEffect(() => {
    let cancelled = false;
    async function fetchTrips() {
      const fetchedTrips = await api.getVehicleTrips(vehicle.id);
      if (cancelled) {
        return;
      }
      if (Array.isArray(fetchedTrips) && fetchedTrips.length > 0) {
        setRecentTrips(fetchedTrips);
      }
      setTripsLoaded(true);
    }
    fetchTrips();
    return () => {
      cancelled = true;
    };
  }, [vehicle.id]);  

  const overlay = (
    <div
      className={
        usePortal
          ? 'fixed inset-0 z-[3000] flex items-center justify-center p-4'
          : 'absolute inset-0 flex items-center justify-center p-4'
      }
      style={usePortal ? undefined : { zIndex: 2000 }}
      role="dialog"
      aria-modal="true"
      aria-label={
        mode === 'details'
          ? `Full vehicle details for ${vehicle.name}`
          : `Vehicle summary for ${vehicle.name}`
      }
    >
      <button
        type="button"
        className="absolute inset-0"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.45)', border: 'none', cursor: 'pointer' }}
        aria-label="Dismiss vehicle details"
        onClick={onClose}
      />

      <div
        className="vehicle-detail-tile relative w-full shadow-xl"
        style={{
          zIndex: 1,
          maxWidth: mode === 'details' ? 520 : 400,
          maxHeight: '90vh',
          overflowY: 'auto',
          borderRadius: 12,
          backgroundColor: TILE_BG,
          color: '#F1F5F9',
          padding: 16,
          boxSizing: 'border-box',
        }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label={`Close details for ${vehicle.name}`}
          className="flex items-center justify-center"
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            width: 32,
            height: 32,
            borderRadius: 8,
            border: 'none',
            backgroundColor: 'transparent',
            color: '#94A3B8',
            cursor: 'pointer',
          }}
        >
          <X style={{ width: 16, height: 16 }} aria-hidden="true" />
        </button>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, paddingRight: 28 }}>
          <div
            className="flex flex-shrink-0 items-center justify-center"
            style={{
              width: 44,
              height: 44,
              borderRadius: '9999px',
              backgroundColor: TILE_CONTROL_BG,
            }}
            aria-hidden="true"
          >
            <Truck style={{ width: 20, height: 20, color: '#93C5FD' }} />
          </div>

          <div style={{ minWidth: 0, flex: 1 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 8,
              }}
            >
              <h3
                className="text-white"
                style={{
                  margin: 0,
                  fontSize: 16,
                  fontWeight: 600,
                  lineHeight: '20px',
                }}
              >
                {vehicle.name}
              </h3>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  flexShrink: 0,
                  borderRadius: 9999,
                  padding: '2px 8px',
                  fontSize: 12,
                  fontWeight: 500,
                  lineHeight: '16px',
                  backgroundColor: statusPillBg,
                  color: statusAccent,
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '9999px',
                    backgroundColor: statusAccent,
                    flexShrink: 0,
                  }}
                  aria-hidden="true"
                />
                {getPresenceLabel(vehicle.status)}
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                marginTop: 8,
                gap: 8,
                color: '#CBD5E1',
                fontSize: 12,
                lineHeight: 1,
              }}
            >
              {/*
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '9999px',
                  backgroundColor: statusAccent,
                  flexShrink: 0,
                }}
                aria-hidden="true"
              />
              <span style={{ lineHeight: 1, whiteSpace: 'nowrap' }}>
                {mode === 'details' ? vehicle.driver : presenceText}
              </span>
              */}
            </div>
          </div>
        </div>

        {mode === 'summary' ? (
          <>
            <div
              style={{
                marginTop: 12,
                overflow: 'hidden',
                borderRadius: 8,
                border: `1px solid ${TILE_BORDER}`,
                backgroundColor: TILE_CONTROL_BG,
              }}
            >
              <div style={rowStyle}>
                <MapPin style={iconStyle} aria-hidden="true" />
                <div className="min-w-0">
                  <p style={labelStyle}>Last Seen</p>
                  <p style={valueStyle}>{lastSeen}</p>
                </div>
              </div>

              {/*
              <div style={{ margin: '0 12px', borderTop: `1px solid ${TILE_BORDER}` }} />

              <div style={rowStyle}>
                <Gauge style={iconStyle} aria-hidden="true" />
                <div className="min-w-0">
                  <p style={labelStyle}>Speed</p>
                  <p style={valueStyle}>{vehicle.speed} mph</p>
                </div>
              </div>
              */}

              {/*
              <div style={{ margin: '0 12px', borderTop: `1px solid ${TILE_BORDER}` }} />

              <div style={rowStyle}>
                <Fuel style={iconStyle} aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p style={labelStyle}>Fuel / Battery</p>
                    <p style={{ ...valueStyle, margin: 0 }}>{vehicle.fuel}%</p>
                  </div>
                  <div
                    style={{
                      marginTop: 6,
                      height: 6,
                      overflow: 'hidden',
                      borderRadius: 9999,
                      backgroundColor: '#2f3642',
                    }}
                    role="progressbar"
                    aria-valuenow={vehicle.fuel}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`Fuel level ${vehicle.fuel} percent`}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${vehicle.fuel}%`,
                        borderRadius: 9999,
                        backgroundColor: vehicle.fuel > 30 ? '#4ade80' : '#f87171',
                      }}
                    />
                  </div>
                </div>
              </div>
              */}

              {/*
              <div style={{ margin: '0 12px', borderTop: `1px solid ${TILE_BORDER}` }} />

              <div style={rowStyle}>
                <User style={iconStyle} aria-hidden="true" />
                <div className="min-w-0">
                  <p style={labelStyle}>Driver</p>
                  <p className="truncate" style={valueStyle}>
                    {vehicle.driver}
                  </p>
                </div>
              </div>
              */}
            </div>
            <div style={{ marginTop: 12, display: 'grid', gap: 8 }}>
              <button
                type="button"
                onClick={onRecentTrip}
                aria-label={`View most recent trip for ${vehicle.name}`}
                className="flex w-full items-center justify-center gap-2 text-sm"
                style={primaryButtonStyle}
              >
                <Route style={{ width: 16, height: 16 }} aria-hidden="true" />
                View Most Recent Trip
              </button>
              <div
                style={{
                  ...secondaryButtonStyle,
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  padding: 0,
                  opacity: isDownloadingData ? 0.7 : 1,
                }}
              >
                <button
                  type="button"
                  onClick={handleDownloadVehicleData}
                  disabled={isDownloadingData}
                  aria-label={`Download vehicle data for ${vehicle.name} as ${downloadAsPdf ? 'PDF' : 'CSV'}`}
                  aria-busy={isDownloadingData}
                  className="flex w-full items-center justify-center gap-2 text-sm"
                  style={{
                    border: 'none',
                    background: 'transparent',
                    color: 'inherit',
                    fontWeight: 500,
                    cursor: isDownloadingData ? 'wait' : 'pointer',
                    padding: `10px ${FORMAT_TOGGLE_RESERVE}px`,
                    borderRadius: 8,
                    whiteSpace: 'nowrap',
                  }}
                >
                  <Download style={{ width: 16, height: 16 }} aria-hidden="true" />
                  {isDownloadingData ? 'Downloading...' : 'Download Vehicle Data'}
                </button>
                <button
                  type="button"
                  role="switch"
                  aria-checked={downloadAsPdf}
                  aria-label={
                    downloadAsPdf
                      ? 'PDF selected. Switch download format to CSV'
                      : 'CSV selected. Switch download format to PDF'
                  }
                  disabled={isDownloadingData}
                  onClick={() => setDownloadAsPdf((current) => !current)}
                  style={{
                    position: 'absolute',
                    right: 8,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 3,
                    border: 'none',
                    background: 'transparent',
                    padding: 0,
                    cursor: isDownloadingData ? 'wait' : 'pointer',
                  }}
                >
                  <span
                    style={{
                      fontSize: 9,
                      lineHeight: 1,
                      fontWeight: downloadAsPdf ? 500 : 700,
                      letterSpacing: '0.02em',
                      color: downloadAsPdf ? '#94A3B8' : '#F8FAFC',
                    }}
                  >
                    CSV
                  </span>
                  <span
                    aria-hidden="true"
                    style={{
                      position: 'relative',
                      display: 'block',
                      width: 28,
                      height: 14,
                      borderRadius: 9999,
                      border: `1px solid ${downloadAsPdf ? '#60A5FA' : TILE_BORDER}`,
                      backgroundColor: downloadAsPdf ? '#3B82F6' : '#2A3140',
                      transition: 'background-color 0.2s ease, border-color 0.2s ease',
                    }}
                  >
                    <span
                      style={{
                        position: 'absolute',
                        top: 1,
                        left: downloadAsPdf ? 13 : 1,
                        width: 10,
                        height: 10,
                        borderRadius: 9999,
                        backgroundColor: '#FFFFFF',
                        transition: 'left 0.2s ease',
                      }}
                    />
                  </span>
                  <span
                    style={{
                      fontSize: 9,
                      lineHeight: 1,
                      fontWeight: downloadAsPdf ? 700 : 500,
                      letterSpacing: '0.02em',
                      color: downloadAsPdf ? '#F8FAFC' : '#94A3B8',
                    }}
                  >
                    PDF
                  </span>
                </button>
              </div>
              <button
                type="button"
                onClick={() => setMode('details')}
                aria-label={`View details for ${vehicle.name}`}
                className="flex w-full items-center justify-center gap-2 text-sm"
                style={secondaryButtonStyle}
              >
                <FileText style={{ width: 16, height: 16 }} aria-hidden="true" />
                Details
              </button>
            </div>
          </>
        ) : (
          <>
            <div style={{ marginTop: 16, display: 'grid', gap: 12 }}>
              <div
                style={{
                  overflow: 'hidden',
                  borderRadius: 8,
                  border: `1px solid ${TILE_BORDER}`,
                  backgroundColor: TILE_CONTROL_BG,
                }}
              >
                <div style={rowStyle}>
                  <MapPin style={iconStyle} aria-hidden="true" />
                  <div className="min-w-0">
                    <p style={labelStyle}>Current Location</p>
                    <p style={valueStyle}>{lastSeen}</p>
                    {hasLoggedLocation && (
                      <p style={{ ...labelStyle, marginTop: 4, lineHeight: 1.35 }}>
                        Coordinates: {formatCoordinate(vehicle.location.lat)}, {formatCoordinate(vehicle.location.lng)}
                      </p>
                    )}
                  </div>
                </div>

                <div style={{ margin: '0 12px', borderTop: `1px solid ${TILE_BORDER}` }} />

                <div style={rowStyle}>
                  <Clock style={iconStyle} aria-hidden="true" />
                  <div className="min-w-0">
                    <p style={labelStyle}>Last Update</p>
                    <p style={valueStyle}>{vehicle.lastUpdate || 'No data logged'}</p>
                  </div>
                </div>

                {/*
                <div style={{ margin: '0 12px', borderTop: `1px solid ${TILE_BORDER}` }} />

                <div style={rowStyle}>
                  <User style={iconStyle} aria-hidden="true" />
                  <div className="min-w-0">
                    <p style={labelStyle}>Driver Information</p>
                    <p style={valueStyle}>{vehicle.driver}</p>
                    <p style={{ ...labelStyle, marginTop: 4, lineHeight: 1.35 }}>
                      License: DL-{vehicle.id.slice(-6)}
                    </p>
                  </div>
                </div>
                */}
              </div>

              {/*
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 8,
                }}
              >
                <div
                  style={{
                    borderRadius: 8,
                    border: `1px solid ${TILE_BORDER}`,
                    backgroundColor: TILE_CONTROL_BG,
                    padding: '12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#94A3B8' }}>
                    <Gauge style={{ width: 14, height: 14 }} aria-hidden="true" />
                    <span style={{ fontSize: 12, fontWeight: 500 }}>Speed</span>
                  </div>
                  <p style={{ ...valueStyle, marginTop: 8, fontSize: 20 }}>
                    {vehicle.speed} mph
                  </p>
                </div>

                <div
                  style={{
                    borderRadius: 8,
                    border: `1px solid ${TILE_BORDER}`,
                    backgroundColor: TILE_CONTROL_BG,
                    padding: '12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#94A3B8' }}>
                    <Fuel style={{ width: 14, height: 14 }} aria-hidden="true" />
                    <span style={{ fontSize: 12, fontWeight: 500 }}>Fuel Level</span>
                  </div>
                  <p style={{ ...valueStyle, marginTop: 8, fontSize: 20 }}>
                    {vehicle.fuel}%
                  </p>
                  <div
                    style={{
                      marginTop: 8,
                      height: 6,
                      overflow: 'hidden',
                      borderRadius: 9999,
                      backgroundColor: '#2f3642',
                    }}
                    role="progressbar"
                    aria-valuenow={vehicle.fuel}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`Fuel level ${vehicle.fuel} percent`}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${vehicle.fuel}%`,
                        borderRadius: 9999,
                        backgroundColor: vehicle.fuel > 30 ? '#4ade80' : '#f87171',
                      }}
                    />
                  </div>
                </div>
              </div>
              */}
              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    marginBottom: 8,
                    color: '#94A3B8',
                  }}
                >
                  <Calendar style={{ width: 14, height: 14 }} aria-hidden="true" />
                  <span style={{ fontSize: 12, fontWeight: 500 }}>Recent Trips</span>
                </div>
                <div style={{ display: 'grid', gap: 8 }}>
                  {tripsLoaded && recentTrips.length === 0 ? (
                    <div
                      style={{
                        borderRadius: 8,
                        border: `1px solid ${TILE_BORDER}`,
                        backgroundColor: TILE_CONTROL_BG,
                        padding: '10px 12px',
                        fontSize: 13,
                        color: '#94A3B8',
                      }}
                    >
                      No trips logged for this vehicle.
                    </div>
                  ) : null}
                  {recentTrips.map((trip) => (
                    <div
                      key={trip.trip_id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderRadius: 8,
                        border: `1px solid ${TILE_BORDER}`,
                        backgroundColor: TILE_CONTROL_BG,
                        padding: '10px 12px',
                      }}
                      onClick={(e) => onViewTrip(trip)}
                    >
                      <span style={{ fontSize: 13, color: '#F1F5F9' }}>{trip.trip_date}</span>
                      {/*
                      <div style={{ display: 'flex', gap: 12, fontSize: 12, color: '#94A3B8' }}>
                        /*<span>{trip.distance}</span>
                        <span>{trip.duration}</span>
                      </div>
                      */}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ marginTop: 12, display: 'grid', gap: 8 }}>
              <button
                type="button"
                onClick={onRecentTrip}
                aria-label={`View most recent trip for ${vehicle.name}`}
                className="flex w-full items-center justify-center gap-2 text-sm"
                style={primaryButtonStyle}
              >
                <Route style={{ width: 16, height: 16 }} aria-hidden="true" />
                View Most Recent Trip
              </button>
              {onViewHistory && (
                <button
                  type="button"
                  onClick={() => onViewHistory(vehicle)}
                  aria-label={`View history for ${vehicle.name}`}
                  className="flex w-full items-center justify-center gap-2 text-sm"
                  style={secondaryButtonStyle}
                >
                  <FileText style={{ width: 16, height: 16 }} aria-hidden="true" />
                  View History
                </button>
              )}
              <button
                type="button"
                onClick={() => setMode('summary')}
                aria-label="Back to vehicle summary"
                className="flex w-full items-center justify-center gap-2 text-sm"
                style={{
                  ...secondaryButtonStyle,
                  backgroundColor: 'transparent',
                }}
              >
                <ArrowLeft style={{ width: 16, height: 16 }} aria-hidden="true" />
                Back
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );

  return usePortal ? createPortal(overlay, document.body) : overlay;
}
