import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Search, Maximize, Minimize2, Menu } from 'lucide-react';
import { Vehicle } from '../../App';
import { VehicleDetailTile } from '../Pages/Vehicles/VehicleDetailTile';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'maplibre-gl/dist/maplibre-gl.css';
import '@maplibre/maplibre-gl-leaflet';
import { api } from '../../services/api';
import { formatDate } from '../Pages/Vehicles/VehicleDetails.tsx';
import { decode } from '@mapbox/polyline';
type MapViewProps = {
  mapType: string;
}

// Header palette matched to design reference (cool dark slate-gray)
const MAP_HEADER_BG = '#4A5364';
const MAP_HEADER_CONTROL_BG = '#3F4756';
const MAP_HEADER_BORDER = '#454E5E';
const MAP_HEADER_MUTED_TEXT = '#A0AEC0';
const MAP_HEADER_CONTROL_HEIGHT = 36;

const mapHeaderControlStyle: React.CSSProperties = {
  height: `${MAP_HEADER_CONTROL_HEIGHT}px`,
  color: '#E2E8F0',
  backgroundColor: MAP_HEADER_CONTROL_BG,
  border: `1px solid ${MAP_HEADER_BORDER}`,
  lineHeight: 1,
  fontSize: '14px',
  boxSizing: 'border-box',
};

const MAP_ATTRIBUTION =
  '&copy; <a href="https://openfreemap.org">OpenFreeMap</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

const MAP_STYLE_URLS = {
  light: 'https://tiles.openfreemap.org/styles/positron',
  dark: 'https://tiles.openfreemap.org/styles/dark',
} as const;

const MAP_FOCUS_ZOOM = 15;
const ROUTE_TOGGLE_ON = '#E15B5B';
const ROUTE_TOGGLE_ON_BORDER = '#C44545';
const ROUTE_TOGGLE_OFF = '#7A3A3E';
const ROUTE_TOGGLE_OFF_BORDER = '#5C2A2E';

async function loadTripPathPoints(tripId) {
  const points = await api.getFilteredTripLocs(tripId);
  return Array.isArray(points) ? points : [];
}

function tripPointLatLng(point): [number, number] | null {
  if (Array.isArray(point) && point.length >= 2) {
    const lat = Number(point[0]);
    const lng = Number(point[1]);
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      return [lat, lng];
    }
    return null;
  }

  const lat = Number(point?.lat);
  const lng = Number(point?.lon ?? point?.lng);
  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    return [lat, lng];
  }
  return null;
}

function tripLatLngs(points: unknown[]): L.LatLngExpression[] {
  return points.flatMap((point) => {
    const latLng = tripPointLatLng(point);
    return latLng ? [latLng] : [];
  });
}

function plotTripMarkers(map: L.Map, latLngs: L.LatLngExpression[]) {
  const markers = latLngs.map((latLng) =>
    L.circleMarker(latLng, {
      radius: 2,
      color: '#FF0000',
      weight: 1,
      fillColor: '#FF0000',
      fillOpacity: 1,
    }),
  );

  const group = L.featureGroup(markers).addTo(map);
  if (latLngs.length === 1) {
    map.setView(latLngs[0] as L.LatLngExpression, 17);
  } else {
    map.fitBounds(group.getBounds().pad(0.15));
  }
  return group;
}

function plotTripLine(map: L.Map, latLngs: L.LatLngExpression[]) {
  if (latLngs.length < 2) {
    return null;
  }

  return L.polyline(latLngs, {
    color: '#FF0000',
    weight: 1,
    opacity: 1,
    lineJoin: 'miter',
    lineCap: 'butt',
    smoothFactor: 0,
  }).addTo(map);
}

function elevateLeafletOverlayPanes(map: L.Map) {
  const paneZIndexes: Record<string, string> = {
    overlayPane: '450',
    markerPane: '600',
    tooltipPane: '650',
    popupPane: '700',
  };

  Object.entries(paneZIndexes).forEach(
    ([paneName, zIndex]) => {
      const pane = map.getPane(paneName);
      if (pane) {
        pane.style.zIndex = zIndex;
      }
    },
  );
}

function VehiclePopupCard({ id, data, changeType, popupType }) {
  const rawDate = new Date(data[1]);
  const formattedDate = new Intl.DateTimeFormat('en-US').format(rawDate);
  return (
    <div
      style={{
        maxWidth: 300,
        borderRadius: 12,
        border: 'none !important',
        color: '#4A5364',
      }}
    >
      <h3><strong>{id}</strong></h3>
      <hr />
      <p style={{ marginBottom: 0 }}><strong>Trip ID</strong></p>
      <p style={{ marginTop: 0 }}>{data[0]}</p>
      <hr />
      <p style={{ marginBottom: 0 }}><strong>Trip Date</strong></p>
      <p style={{ marginTop: 0 }}>{formattedDate}</p>
      <button
        onClick={() => changeType()}
        style={{
          cursor: 'pointer',
          borderRadius: 8,
          backgroundColor: '#3B82F6',
          color: '#FFFFFF',
          padding: '10px 12px',
          fontWeight: 500,
        }}
      >
        Back
      </button>
    </div>
  )
}

export function VehicleHistoryMap({ selectedTrip, onMenuClick }) {
  // map container and instance references
  const mapModuleRef = useRef<HTMLDivElement | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const vehicleMarkersRef = useRef<Map<string, L.Marker>>(
    new Map(),
  );
  const markersLayerRef = useRef<L.FeatureGroup | null>(null);
  const [mapReady, setMapReady] = useState<boolean>(false);

  // display data layers  
  const [rawCoords, setRawCoords] = useState<unknown[] | null>(null);
  const [selectedPolyline, setSelectedPolyline] = useState<string | null>(null);

  // set map tile layer
  const [mapStyleLayer, setMapStyleLayer] = useState<any>(null);
  const [mapColor, setMapColor] = useState<boolean>(false);
  const [showRouteLine, setShowRouteLine] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  useEffect(() => {
    // only init map if the DOM element exists but the map hasn't been built yet
    if (mapContainerRef.current && !mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current)
      mapInstanceRef.current = map;
      const newMapStyle = (L as any).maplibreGL({
        style: MAP_STYLE_URLS.light,
        attribution: MAP_ATTRIBUTION,
      }).addTo(map);
      setMapStyleLayer(newMapStyle);
      map.setView([37.75454, -122.44254], 13);
      setMapReady(true);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        setMapReady(false);
      }
    };
  }, []);

  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;

    const resizeMap = () => {
      mapInstanceRef.current?.invalidateSize();
    };

    const observer = new ResizeObserver(resizeMap);
    observer.observe(container);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isActive =
        document.fullscreenElement === mapModuleRef.current;

      setIsFullscreen(isActive);
      mapInstanceRef.current?.invalidateSize();
    };

    document.addEventListener(
      'fullscreenchange',
      handleFullscreenChange,
    );

    return () => {
      document.removeEventListener(
        'fullscreenchange',
        handleFullscreenChange,
      );
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadTripPoints() {
      const points = await loadTripPathPoints(selectedTrip);
      if (cancelled) {
        return;
      }
      setRawCoords(points);
    }

    loadTripPoints();

    return () => {
      cancelled = true;
    };
  }, [selectedTrip]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !rawCoords || rawCoords.length === 0) {
      return;
    }

    const latLngs = tripLatLngs(rawCoords);
    if (latLngs.length === 0) {
      return;
    }

    const group = plotTripMarkers(map, latLngs);

    return () => {
      map.removeLayer(group);
    };
  }, [rawCoords]);

  useEffect(() => {
    async function fetchPolyline(): Promise<any> {
      const fetchedLine = await api.getPolyline(selectedTrip);
      setSelectedPolyline(fetchedLine);
    }
    fetchPolyline();
  }, [selectedTrip]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !showRouteLine || !rawCoords || rawCoords.length === 0) {
      return;
    }

    if (!selectedPolyline) return;
    const polylineCoords = decode(selectedPolyline);

    const line = plotTripLine(map, tripLatLngs(polylineCoords));
    if (!line) {
      return;
    }

    return () => {
      map.removeLayer(line);
    }
  }, [selectedPolyline])

  function setMapStyle(useDark: boolean) {
    const map = mapInstanceRef.current;
    const currentStyleLayer = mapStyleLayer;

    if (!map || !currentStyleLayer || mapColor === useDark) {
      return;
    }

    const maplibreMap =
      currentStyleLayer.getMaplibreMap?.();

    if (!maplibreMap) {
      return;
    }

    const nextStyleUrl = useDark
      ? MAP_STYLE_URLS.dark
      : MAP_STYLE_URLS.light;

    const restoreMapView = () => {
      if (!mapInstanceRef.current) {
        return;
      }

      const mapCanvas = maplibreMap.getCanvas?.();

      if (mapCanvas?.parentElement) {
        mapCanvas.parentElement.style.zIndex = '1';
      }

      map.invalidateSize();
      elevateLeafletOverlayPanes(map);
    };

    maplibreMap.once('idle', restoreMapView);
    maplibreMap.setStyle(nextStyleUrl);
    setMapColor(useDark);
  }

  function toggleVlmMode() {
    setIsVlmToggleActive((prev) => !prev);
  }

  async function toggleFullscreen() {
    const mapModule = mapModuleRef.current;
    if (!mapModule) {
      return;
    }

    try {
      if (document.fullscreenElement === mapModule) {
        await document.exitFullscreen();
      } else {
        await mapModule.requestFullscreen();
      }
    } catch (error) {
      console.error('Unable to toggle fullscreen:', error);
    }
  }

  return (
    <div
      ref={mapModuleRef}
      className="flex flex-col h-full min-h-0 overflow-hidden"
      style={{ backgroundColor: MAP_HEADER_BG }}
    >
      <header
        className="map-view-header flex flex-shrink-0 items-center gap-4 px-4 lg:px-6"
        style={{
          height: '72px',
          backgroundColor: MAP_HEADER_BG,
          borderBottom: `1px solid ${MAP_HEADER_BORDER}`,
        }}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Open menu"
            className="lg:hidden flex-shrink-0 p-2 text-gray-300 hover:text-white rounded-lg"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <h1
              className="text-base lg:text-lg truncate"
              style={{
                color: '#ffffff',
                fontWeight: 600,
                lineHeight: 1.2,
                margin: 0,
              }}
            >
              Vehicle Line Map
            </h1>
            <p
              className="text-xs truncate"
              style={{
                color: '#C5CEDB',
                marginTop: '4px',
                marginBottom: 0,
                lineHeight: 1.2,
              }}
            >
              {""}
            </p>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={showRouteLine}
            aria-label="Toggle the line connecting trip points"
            onClick={() => setShowRouteLine((visible) => !visible)}
            className="rounded-lg transition-colors"
            style={{
              ...mapHeaderControlStyle,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '56px',
              padding: 0,
            }}
          >
            <span
              style={{
                position: 'relative',
                display: 'block',
                width: '40px',
                height: '18px',
                borderRadius: '9999px',
                border: `1px solid ${showRouteLine ? ROUTE_TOGGLE_ON_BORDER : ROUTE_TOGGLE_OFF_BORDER
                  }`,
                backgroundColor: showRouteLine ? ROUTE_TOGGLE_ON : ROUTE_TOGGLE_OFF,
                transition: 'background-color 0.2s ease, border-color 0.2s ease',
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  top: '1px',
                  left: showRouteLine ? '25px' : '1px',
                  width: '14px',
                  height: '14px',
                  borderRadius: '9999px',
                  backgroundColor: '#FFFFFF',
                  transition: 'left 0.2s ease',
                }}
              />
            </span>
          </button>

          <button
            type="button"
            role="switch"
            aria-checked={mapColor}
            aria-label="Toggle between light and dark map style"
            onClick={() => setMapStyle(!mapColor)}
            className="rounded-lg transition-colors"
            style={{
              ...mapHeaderControlStyle,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '56px',
              padding: 0,
            }}
          >
            <span
              style={{
                position: 'relative',
                display: 'block',
                width: '40px',
                height: '18px',
                borderRadius: '9999px',
                border: `1px solid ${MAP_HEADER_BORDER}`,
                backgroundColor: '#2F3642',
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  top: '1px',
                  left: mapColor ? '25px' : '1px',
                  width: '14px',
                  height: '14px',
                  borderRadius: '9999px',
                  backgroundColor: '#FFFFFF',
                  transition: 'left 0.2s ease',
                }}
              />
            </span>
          </button>

          {isFullscreen ? (
            <button
              type="button"
              aria-label="Exit fullscreen"
              onClick={toggleFullscreen}
              className="rounded-lg transition-colors"
              style={{
                ...mapHeaderControlStyle,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '0 12px',
                whiteSpace: 'nowrap',
              }}
            >
              <Minimize2 className="w-4 h-4 block" aria-hidden="true" />
              Exit fullscreen
            </button>
          ) : (
            <button
              type="button"
              aria-label="Enter fullscreen"
              onClick={toggleFullscreen}
              className="rounded-lg transition-colors"
              style={{
                ...mapHeaderControlStyle,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: `${MAP_HEADER_CONTROL_HEIGHT}px`,
                padding: 0,
              }}
            >
              <Maximize className="w-4 h-4 block" aria-hidden="true" />
            </button>
          )}
        </div>
      </header>

      <div
        className={`map-view-map-area relative flex-1 min-h-0 w-full${mapColor ? ' map-zoom-dark-mode' : ''
          }`}
      >
        <div
          ref={mapContainerRef}
          className="h-full w-full map-view-container"
        />
      </div>
    </div>
  );
}


export function RecentLocationsMap({ onViewHistory, onViewTripHistory, onMenuClick }) {

  // map container and instance references
  const mapModuleRef = useRef<HTMLDivElement | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const vehicleMarkersRef = useRef<Map<string, L.Marker>>(
    new Map(),
  );
  const markersLayerRef = useRef<L.FeatureGroup | null>(null);
  const searchContainerRef = useRef<HTMLDivElement | null>(null);
  const [mapReady, setMapReady] = useState<boolean>(false);

  // VDM vs VLM state toggle
  const [currMapType, setCurrMapType] = useState<string>("vdm");

  // display data layers
  const [rawCoords, setRawCoords] = useState<unknown[] | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<string>("") // User selected Vehicle Name
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>("") // User selected Vehicle ID
  const [selectedVehicleStatus, setSelectedVehicleStatus] = useState<number>(0);
  const [selectedTrip, setSelectedTrip] = useState<string>("")
  const [selectedPolyline, setSelectedPolyline] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [recentLocations, setRecentLocations] = useState<Array<[number, number]> | null>(null); // VDM coordinate array

  // set map tile layer
  const [mapStyleLayer, setMapStyleLayer] = useState<any>(null);
  const [mapColor, setMapColor] = useState<boolean>(false);

  // toggle states
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showSearchResults, setShowSearchResults] = useState<boolean>(false);
  const [highlightedVehicle, setHighlightedVehicle] = useState<string | null>(null);

  const lastMarkerFitLocationsRef = useRef<Array<number, number> | null>(null);

  // popup layers
  const [activePopups, setActivePopups] = useState([]);
  const [selectedTile, setSelectedTile] = useState<any | null>(null);

  // timer
  const [isTimerOn, setIsTimerOn] = useState<boolean>(true);
  const [timerTick, setTimerTick] = useState<number>(0);

  useEffect(() => {
    // only init map if the DOM element exists but the map hasn't been built yet
    if (mapContainerRef.current && !mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current)
      mapInstanceRef.current = map;
      const newMapStyle = (L as any).maplibreGL({
        style: MAP_STYLE_URLS.light,
        attribution: MAP_ATTRIBUTION,
      }).addTo(map);
      setMapStyleLayer(newMapStyle);
      map.setView([37.75454, -122.44254], 13);
      setMapReady(true);
      map.on("mousedown zoomstart", () => setIsTimerOn(false));
      map.on("mouseup zoomend", () => setIsTimerOn(true));

      /*
      map.on("zoomstart", () => console.log("movement started"));
      map.on("zoomend", () => console.log("movement ended"));
      */
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        setMapReady(false);
      }
    };
  }, []);

  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;

    const resizeMap = () => {
      mapInstanceRef.current?.invalidateSize();
    };

    const observer = new ResizeObserver(resizeMap);
    observer.observe(container);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isActive =
        document.fullscreenElement === mapModuleRef.current;

      setIsFullscreen(isActive);
      mapInstanceRef.current?.invalidateSize();
    };

    document.addEventListener(
      'fullscreenchange',
      handleFullscreenChange,
    );

    return () => {
      document.removeEventListener(
        'fullscreenchange',
        handleFullscreenChange,
      );
    };
  }, []);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(
          event.target as Node,
        )
      ) {
        setShowSearchResults(false);
      }
    }

    document.addEventListener(
      'mousedown',
      handlePointerDown,
    );

    return () => {
      document.removeEventListener(
        'mousedown',
        handlePointerDown,
      );
    };
  }, []);

  useEffect(() => {
    if (!highlightedVehicle) {
      return;
    }

    const marker = vehicleMarkersRef.current.get(
      highlightedVehicle,
    );
    const markerElement = marker?.getElement();

    if (markerElement) {
      markerElement.classList.add(
        'map-marker-highlighted',
      );
    }
  }, [highlightedVehicle, recentLocations]);

  useEffect(() => {
    if (isTimerOn == true) {
      const timer = setInterval(() => {
        setTimerTick(prevTick => prevTick + 1);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [isTimerOn]);

  useEffect(() => {
    if (currMapType == "vlm") {
      setRecentLocations(null); // reset state

      async function loadTripPoints() {
        const points = await loadTripPathPoints(selectedTrip);
        setRawCoords(points);
      }
      loadTripPoints();
    }
  }, [currMapType]);

  useEffect(() => {
    if (currMapType == "vdm") {
      // fetch recent location data
      async function loadRecentLocations() {
        setRawCoords(null);
        const data = await api.getMostRecentLocations();
        const formattedLocations = [];
        for (const vehicle of data) {
          const location = vehicle?.location;
          if (location?.lat == null || location?.lon == null) {
            continue;
          }
          formattedLocations.push({
            vehicleId: vehicle.vehicle_id,
            vehicleName: vehicle.vehicle_name,
            vehicleStatus: vehicle.vehicle_status,
            vehicleLocation: location,
          });
        }
        setRecentLocations(formattedLocations);
      }
      loadRecentLocations();
    }
  }, [currMapType, timerTick]);

  useEffect(() => {
    async function fetchPolyline(): Promise<any> {
      const fetchedLine = await api.getPolyline(selectedTrip);
      setSelectedPolyline(fetchedLine);
    }
    fetchPolyline();
  }, [selectedTrip])

  useEffect(() => {
    if (currMapType !== "vlm") {
      return;
    }

    const map = mapInstanceRef.current;
    if (!map || !rawCoords || rawCoords.length === 0) {
      return;
    }

    const latLngs = tripLatLngs(rawCoords);
    if (latLngs.length === 0) {
      return;
    }

    const group = plotTripMarkers(map, latLngs);

    if (!selectedPolyline) return;
    const polylineCoords = decode(selectedPolyline);
    const line = plotTripLine(map, tripLatLngs(polylineCoords));
    if (!group) {
      return;
    }

    const popupDiv = document.createElement('div');
    group.bindPopup(popupDiv, { minWidth: 160 });
    group.on('popupopen', () => {
      setActivePopups((prev) => [
        ...prev,
        { id: selectedVehicle, data: [selectedTrip, selectedDate], container: popupDiv },
      ]);
    });
    group.on('popupclose', () => {
      setActivePopups((prev) => prev.filter((popup) => popup.container !== popupDiv));
    });

    return () => {
      map.removeLayer(group);
      if (line) {
        map.removeLayer(line);
      }
    };
  }, [rawCoords, currMapType, selectedTrip]);

  // build VDM map layer with coordinates
  const renderVehicleMarkers = useCallback(
    (fitToFleet = false) => {
      const map = mapInstanceRef.current;
      const locations = recentLocations;

      if (!map || !mapReady) {
        return;
      }

      if (currMapType !== 'vdm') {
        if (markersLayerRef.current) {
          map.removeLayer(markersLayerRef.current);
          markersLayerRef.current = null;
        }

        vehicleMarkersRef.current.clear();
        return;
      }

      if (markersLayerRef.current) {
        map.removeLayer(markersLayerRef.current);
        markersLayerRef.current = null;
      }

      vehicleMarkersRef.current.clear();

      if (!locations || locations.length === 0) {
        return;
      }
      const markers: L.Marker[] = [];
      const plottable = locations.filter(
        (point) => point.vehicleLocation?.lat != null && point.vehicleLocation?.lon != null,
      );
      if (plottable.length === 0) {
        return;
      }
      const firstPoint = plottable[0].vehicleLocation;
      for (const point of plottable) {
        const marker = L.marker([
          point.vehicleLocation.lat,
          point.vehicleLocation.lon,
        ]);

        vehicleMarkersRef.current.set(
          point.vehicleName,
          marker,
        );

        marker.on('click', () => {
          setIsTimerOn(false);
          setSelectedVehicle(point.vehicleName);
          setSelectedVehicleId(point.vehicleId);
          setSelectedTrip(point.vehicleLocation.trip_id);
          setSelectedDate(point.vehicleLocation.timestamp);
          setSelectedVehicleStatus(point.vehicleStatus);
          setSelectedTile({ name: point.vehicleName, address: point.vehicleLocation.address });
        });
        markers.push(marker);
      }

      markersLayerRef.current = L.featureGroup(markers).addTo(map);
      elevateLeafletOverlayPanes(map);

      const shouldFitBounds =
        fitToFleet ||
        lastMarkerFitLocationsRef.current !== locations;

      if (shouldFitBounds) {
        if (plottable.length > 1) {
          map.fitBounds(
            markersLayerRef.current
              .getBounds()
              .pad(0.12),
          );
        } else {
          map.setView(
            [firstPoint.lat, firstPoint.lon],
            17,
          );
        }
        lastMarkerFitLocationsRef.current = locations;
      }
    }, [currMapType, mapReady, recentLocations]);

  useEffect(() => {
    renderVehicleMarkers(true);
  }, [renderVehicleMarkers]);

  const renderVehicleMarkersRef = useRef(
    renderVehicleMarkers,
  );
  renderVehicleMarkersRef.current = renderVehicleMarkers;

  function getSearchMatches(): Array<[number, number]> {
    const query = searchQuery.trim().toLowerCase();
    if (!query || !recentLocations) {
      return [];
    }
    const matched = recentLocations.filter((location) =>
      location.vehicleName.toLowerCase().includes(query),
    );
    return matched;
  }


  function clearMarkerHighlight() {
    vehicleMarkersRef.current.forEach((marker) => {
      marker
        .getElement()
        ?.classList.remove('map-marker-highlighted');
    });
  }

  function focusVehicle(vehicleName: string) {
    const map = mapInstanceRef.current;
    const marker = vehicleMarkersRef.current.get(
      vehicleName,
    );
    const locationEntry = recentLocations.find(
      (location) => location.vehicleName === vehicleName,
    );

    if (
      !map ||
      !marker ||
      !locationEntry ||
      currMapType !== 'vdm'
    ) {
      return;
    }

    const lat = locationEntry.vehicleLocation.lat;
    const lon = locationEntry.vehicleLocation.lon;

    clearMarkerHighlight();
    setHighlightedVehicle(vehicleName);

    map.setView([lat, lon], MAP_FOCUS_ZOOM, {
      animate: true,
    });

    marker.getElement()?.classList.add(
      'map-marker-highlighted',
    );
    marker.openPopup();
  }

  function selectSearchResult(vehicleName: string) {
    setSearchQuery(vehicleName);
    setShowSearchResults(false);
    focusVehicle(vehicleName);
  }

  const searchMatches = getSearchMatches();

  function setMapStyle(useDark: boolean) {
    const map = mapInstanceRef.current;
    const currentStyleLayer = mapStyleLayer;

    if (!map || !currentStyleLayer || mapColor === useDark) {
      return;
    }

    const maplibreMap =
      currentStyleLayer.getMaplibreMap?.();

    if (!maplibreMap) {
      return;
    }

    const nextStyleUrl = useDark
      ? MAP_STYLE_URLS.dark
      : MAP_STYLE_URLS.light;

    const restoreMapView = () => {
      if (!mapInstanceRef.current) {
        return;
      }

      const mapCanvas = maplibreMap.getCanvas?.();

      if (mapCanvas?.parentElement) {
        mapCanvas.parentElement.style.zIndex = '1';
      }

      map.invalidateSize();
      elevateLeafletOverlayPanes(map);
      renderVehicleMarkersRef.current(false);
    };

    maplibreMap.once('idle', restoreMapView);
    maplibreMap.setStyle(nextStyleUrl);
    setMapColor(useDark);
  }

  function toggleVlmMode() {
    setIsVlmToggleActive((prev) => !prev);
  }

  async function toggleFullscreen() {
    const mapModule = mapModuleRef.current;
    if (!mapModule) {
      return;
    }

    try {
      if (document.fullscreenElement === mapModule) {
        await document.exitFullscreen();
      } else {
        await mapModule.requestFullscreen();
      }
    } catch (error) {
      console.error('Unable to toggle fullscreen:', error);
    }
  }

  function handleMapTypeSwitch() {
    setActivePopups([]);

    if (currMapType == 'vdm') {
      setCurrMapType('vlm');
    } else if (currMapType == 'vlm') {
      setCurrMapType('vdm');
    }
  }

  function closeVehicleTile() {
    setSelectedTile(null);
    setIsTimerOn(true);
    clearMarkerHighlight();
    setHighlightedVehicle(null);
  }

  function handleMapTypeSwitch() {
    setActivePopups([]);
    setSelectedTile(null);
    setIsTimerOn(true);

    if (currMapType == 'vdm') {
      setCurrMapType('vlm');
    } else if (currMapType == 'vlm') {
      setCurrMapType('vdm');
    }
  }

  return (
    <div
      ref={mapModuleRef}
      className="flex flex-col h-full min-h-0 overflow-hidden"
      style={{ backgroundColor: MAP_HEADER_BG }}
    >
      <header
        className="map-view-header flex flex-shrink-0 items-center gap-4 px-4 lg:px-6"
        style={{
          height: '72px',
          backgroundColor: MAP_HEADER_BG,
          borderBottom: `1px solid ${MAP_HEADER_BORDER}`,
        }}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Open menu"
            className="lg:hidden flex-shrink-0 p-2 text-gray-300 hover:text-white rounded-lg"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <h1
              className="text-base lg:text-lg truncate"
              style={{
                color: '#ffffff',
                fontWeight: 600,
                lineHeight: 1.2,
                margin: 0,
              }}
            >
              {currMapType == "vlm"
                ? 'Vehicle Line Map'
                : 'Vehicle Detail Map'}
            </h1>
            <p
              className="text-xs truncate"
              style={{
                color: '#C5CEDB',
                marginTop: '4px',
                marginBottom: 0,
                lineHeight: 1.2,
              }}
            >
              {/* list active vehicles here */}
              {/* 12 vehicles active · Updated just now */}
            </p>
          </div>

        </div>
        <div className="flex items-center gap-2 flex-1 justify-end min-w-0">
          <div
            ref={searchContainerRef}
            style={{
              position: 'relative',
              width: '220px',
              maxWidth: '100%',
            }}
          >
            <label
              className="flex items-center rounded-full"
              style={{
                ...mapHeaderControlStyle,
                width: '100%',
                paddingLeft: '12px',
                paddingRight: '12px',
                gap: '8px',
              }}
            >
              <Search
                className="w-4 h-4 flex-shrink-0 block"
                style={{ color: MAP_HEADER_MUTED_TEXT }}
                aria-hidden="true"
              />
              <input
                type="search"
                placeholder="Search vehicles"
                aria-label="Search vehicles"
                aria-expanded={showSearchResults}
                aria-controls="map-vehicle-search-results"
                aria-autocomplete="list"
                role="combobox"
                value={searchQuery}
                onChange={(event) => {
                  setSearchQuery(event.target.value);
                  setShowSearchResults(true);
                }}
                onFocus={() => {
                  if (searchQuery.trim()) {
                    setShowSearchResults(true);
                  }
                }}
                onKeyDown={() => { }}
                className="map-header-search-input w-full focus:outline-none"
                style={{
                  flex: 1,
                  minWidth: 0,
                  height: '100%',
                  padding: 0,
                  margin: 0,
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: '#ffffff',
                  lineHeight: 1,
                  fontSize: '14px',
                }}
              />
            </label>

            {showSearchResults &&
              searchQuery.trim().length > 0 && (
                <ul
                  id="map-vehicle-search-results"
                  role="listbox"
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 4px)',
                    left: 0,
                    right: 0,
                    margin: 0,
                    padding: '4px 0',
                    listStyle: 'none',
                    backgroundColor: MAP_HEADER_CONTROL_BG,
                    border: `1px solid ${MAP_HEADER_BORDER}`,
                    borderRadius: '8px',
                    zIndex: 1100,
                    maxHeight: '240px',
                    overflowY: 'auto',
                    boxShadow:
                      '0 8px 24px rgba(0, 0, 0, 0.25)',
                  }}
                >
                  {searchMatches.length > 0 ? (
                    searchMatches.map((location) => (
                      <li key={location.vehicleName} role="presentation">
                        <button
                          type="button"
                          role="option"
                          aria-selected={
                            highlightedVehicle === location.vehicleName
                          }
                          onMouseDown={(event) => {
                            event.preventDefault();
                          }}
                          onClick={() =>
                            selectSearchResult(location.vehicleName)
                          }
                          style={{
                            display: 'block',
                            width: '100%',
                            padding: '8px 12px',
                            border: 'none',
                            backgroundColor:
                              highlightedVehicle === location.vehicleName
                                ? '#4A5364'
                                : 'transparent',
                            color: '#FFFFFF',
                            textAlign: 'left',
                            cursor: 'pointer',
                            fontSize: '13px',
                            lineHeight: 1.3,
                          }}
                        >
                          <span
                            style={{
                              display: 'block',
                              fontWeight: 500,
                            }}
                          >
                            {location.vehicleName}
                          </span>
                          <span
                            style={{
                              display: 'block',
                              marginTop: '2px',
                              color: MAP_HEADER_MUTED_TEXT,
                              fontSize: '11px',
                            }}
                          >
                            {location.vehicleLocation.address}
                          </span>
                        </button>
                      </li>
                    ))
                  ) : (
                    <li
                      style={{
                        padding: '8px 12px',
                        color: MAP_HEADER_MUTED_TEXT,
                        fontSize: '13px',
                      }}
                    >
                      No matching vehicles on map
                    </li>
                  )}
                </ul>
              )}
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={mapColor}
            aria-label="Toggle between light and dark map style"
            onClick={() => setMapStyle(!mapColor)}
            className="rounded-lg transition-colors"
            style={{
              ...mapHeaderControlStyle,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '56px',
              padding: 0,
            }}
          >
            <span
              style={{
                position: 'relative',
                display: 'block',
                width: '40px',
                height: '18px',
                borderRadius: '9999px',
                border: `1px solid ${MAP_HEADER_BORDER}`,
                backgroundColor: '#2F3642',
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  top: '1px',
                  left: mapColor ? '25px' : '1px',
                  width: '14px',
                  height: '14px',
                  borderRadius: '9999px',
                  backgroundColor: '#FFFFFF',
                  transition: 'left 0.2s ease',
                }}
              />
            </span>
          </button>

          {isFullscreen ? (
            <button
              type="button"
              aria-label="Exit fullscreen"
              onClick={toggleFullscreen}
              className="rounded-lg transition-colors"
              style={{
                ...mapHeaderControlStyle,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '0 12px',
                whiteSpace: 'nowrap',
              }}
            >
              <Minimize2 className="w-4 h-4 block" aria-hidden="true" />
              Exit fullscreen
            </button>
          ) : (
            <button
              type="button"
              aria-label="Enter fullscreen"
              onClick={toggleFullscreen}
              className="rounded-lg transition-colors"
              style={{
                ...mapHeaderControlStyle,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: `${MAP_HEADER_CONTROL_HEIGHT}px`,
                padding: 0,
              }}
            >
              <Maximize className="w-4 h-4 block" aria-hidden="true" />
            </button>
          )}
        </div>
      </header>

      <div
        className={`map-view-map-area relative flex-1 min-h-0 w-full${mapColor ? ' map-zoom-dark-mode' : ''
          }`}
      >
        <div
          ref={mapContainerRef}
          className="h-full w-full map-view-container"
        />
      </div>

      {currMapType === 'vdm' && selectedTile && (
        <VehicleDetailTile
          key={`${selectedTile.name}-${selectedTile.address ?? ''}`}
          vehicle={
            {
              id: selectedVehicleId,
              name: selectedTile.name,
              address: selectedTile.address,
              location: { lat: recentLocations[0].vehicleLocation.lat, lng: recentLocations[0].vehicleLocation.lon },
              status: selectedVehicleStatus,
              lastUpdate: formatDate(selectedDate, false)
            }
          }
          addressFallback={selectedTile.address}
          usePortal={false}
          onViewTrip={onViewTripHistory}
          onRecentTrip={handleMapTypeSwitch}
          onClose={closeVehicleTile}
          onViewHistory={
            onViewHistory
              ? (vehicle) => {
                closeVehicleTile();
                onViewHistory(vehicle);
              }
              : undefined
          }
        />
      )}

      {activePopups.map(
        ({ id, data, container }) =>
          createPortal(
            <VehiclePopupCard
              key={`${id}-${data}`}
              id={id}
              data={data}
              changeType={
                handleMapTypeSwitch
              }
              popupType={currMapType}
            />,
            container,
          ),
      )}
    </div>
  );
}
