import { useState, useEffect } from 'react';
import { VehicleHistoryMap } from '../../Map/MapView.tsx';
import { formatDate } from './VehicleDetails.tsx';
import { api } from '../../../services/api';

export function VehicleTripHistory({ trip }) {
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    async function fetchLocations() {
      const fetchedLocs = await api.getTripLocations(trip.trip_id);
      setLocations(fetchedLocs);
    }
    fetchLocations();
  }, []);
  
  return (
    <div className="h-full min-h-flex flex flex-col">
      <VehicleHistoryMap selectedTrip={trip.trip_id} />
      <div style={{
        maxHeight: '200px',
        overflowY: 'auto',
      }}> 
        <h3 style={{ padding: 5 }}>Trip Locations</h3>
        <table style={{ textAlign: 'left', borderCollapse: 'collapse', fontSize: '12px'}}>
          <thead>
            <tr style={{ position: 'sticky', top: 0, zIndex: 1, borderBottom: '1px solid #eee', borderTop: '1px solid #eee', backgroundColor: "#ffffff"}}>
              <th style={{ padding: '12px' }}>Address</th>
              <th style={{ padding: '12px' }}>Latitude</th>
              <th style={{ padding: '12px' }}>Longitude</th>
              <th style={{ padding: '12px' }}>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {locations.map((loc, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid #eee'}}>
                <td style={{ padding: '12px', backgroundColor: idx % 2 == 0 ? "#dbe3ed" : "ffffff" }}>{loc.address}</td>
                <td style={{ padding: '12px', backgroundColor: idx % 2 == 0 ? "#dbe3ed" : "ffffff" }}>{loc.lat}</td>
                <td style={{ padding: '12px', backgroundColor: idx % 2 == 0 ? "#dbe3ed" : "ffffff" }}>{loc.lon}</td>
                <td style={{ padding: '12px', backgroundColor: idx % 2 == 0 ? "#dbe3ed" : "ffffff" }}>{formatDate(loc.timestamp, false)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>

  )
}
