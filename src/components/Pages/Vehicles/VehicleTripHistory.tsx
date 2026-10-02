import { useState, useEffect, useRef } from 'react';
import { VehicleHistoryMap } from '../../Map/MapView.tsx';
import { formatCoordinate, formatDate } from './VehicleDetails.tsx';
import { api } from '../../../services/api';

const VISIBLE_ROWS = 4;
const ROW_HEIGHT = 41;
const TABLE_SCROLL_MAX_HEIGHT = (VISIBLE_ROWS - 1) * ROW_HEIGHT;
const LOCATION_COLUMNS = 'minmax(0, 1fr) 8.5rem 8.5rem 13.5rem';

export async function getMostRecentTrip(vehicle): Promise<any> {
  
}


export function VehicleTripHistory({ trip, onMenuClick }) {
  const [locations, setLocations] = useState([]);
  const [scrollbarWidth, setScrollbarWidth] = useState(0);
  const locationListRef = useRef(null);

  useEffect(() => {
    const list = locationListRef.current;
    if (!list) {
      return;
    }
    const measureScrollbar = () => {
      setScrollbarWidth(list.offsetWidth - list.clientWidth);
    };
    measureScrollbar();
    const observer = new ResizeObserver(measureScrollbar);
    observer.observe(list);
    return () => observer.disconnect();
  }, [locations]);

  useEffect(() => {
    if (!trip?.trip_id) {
      return;
    }
    let cancelled = false;
    async function fetchLocations() {
      const fetchedLocs = await api.getTripLocations(trip.trip_id);
      if (!cancelled) {
        setLocations(Array.isArray(fetchedLocs) ? fetchedLocs : []);
      }
    }
    fetchLocations();
    return () => {
      cancelled = true;
    };
  }, [trip]);

  if (!trip?.trip_id) {
    return null;
  }
  
  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <div className="min-h-0 flex-1 overflow-hidden">
        <VehicleHistoryMap selectedTrip={trip.trip_id} onMenuClick={onMenuClick} />
      </div>

      <section
        className="w-full shrink-0 bg-[#c5ced9] pb-3 pt-2"
        style={{ fontFamily: 'ui-rounded, "SF Pro Rounded", "Avenir Next", system-ui, sans-serif' }}
      >
        <div
          className="flex w-full flex-col overflow-hidden rounded-2xl border border-[#454E5E]/40 shadow-[0_8px_24px_rgba(74,83,100,0.16)]"
          style={{ backgroundColor: '#e1e5ee' }}
        >
          <div
            className="flex items-center justify-between gap-3 px-4 py-2.5 lg:px-6"
            style={{ backgroundColor: '#4A5364' }}
          >
            <h3 className="m-0 text-sm font-medium text-white">Trip Locations</h3>
            <p className="m-0 text-xs font-normal text-white">
              {locations.length} {locations.length === 1 ? 'location' : 'locations'}
            </p>
          </div>

          <div className="w-full overflow-x-auto">
            <div className="min-w-[720px]">
              <div
                className="border-b border-[#454E5E]/20 bg-[#e1e5ee] text-xs text-[#4A5364]"
                style={{
                  display: 'grid',
                  gridTemplateColumns: LOCATION_COLUMNS,
                  paddingRight: scrollbarWidth,
                  backgroundColor: '#e1e5ee',
                  fontFamily: 'system-ui, sans-serif',
                  fontWeight: 700,
                }}
              >
                <div className="px-4 py-2.5 lg:px-6">Address</div>
                <div className="px-4 py-2.5 whitespace-nowrap">Latitude</div>
                <div className="px-4 py-2.5 whitespace-nowrap">Longitude</div>
                <div className="px-4 py-2.5 whitespace-nowrap lg:pr-6">Timestamp</div>
              </div>
              <div
                ref={locationListRef}
                className="w-full overflow-y-auto"
                style={{ maxHeight: TABLE_SCROLL_MAX_HEIGHT }}
              >
                {locations.length === 0 ? (
                  <div className="px-4 py-6 text-center text-sm text-[#4A5364] lg:px-6">
                    No locations recorded for this trip.
                  </div>
                ) : (
                  locations.map((loc, idx) => (
                    <div
                      key={idx}
                      className="border-b border-[#454E5E]/10 text-xs lg:text-sm"
                      style={{
                        display: 'grid',
                        gridTemplateColumns: LOCATION_COLUMNS,
                        backgroundColor: idx % 2 === 0 ? '#dbe4f2' : '#c5d4ea',
                      }}
                    >
                      <div className="px-4 py-2.5 text-[#1f2937] lg:px-6">{loc.address}</div>
                      <div className="px-4 py-2.5 whitespace-nowrap text-[#4A5364]">{formatCoordinate(loc.lat)}</div>
                      <div className="px-4 py-2.5 whitespace-nowrap text-[#4A5364]">{formatCoordinate(loc.lon)}</div>
                      <div className="px-4 py-2.5 whitespace-nowrap text-[#4A5364] lg:pr-6">{formatDate(loc.timestamp, false)}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
