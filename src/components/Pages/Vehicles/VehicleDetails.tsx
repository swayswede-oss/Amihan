import { useState, useEffect } from 'react';
import { X, MapPin, User, Clock, Fuel, Gauge, Calendar } from 'lucide-react';
import { Vehicle } from '../../../App';
import { api } from '../../../services/api';

type VehicleDetailsProps = {
  vehicle: Vehicle;
  onClose: () => void;
  onZoomIn: (vehicle: Vehicle) => void;
  onViewHistory: (vehicle: Vehicle) => void;
};

export function formatCoordinate(value: unknown): string {
  const coordinate = Number(value);
  if (!Number.isFinite(coordinate)) {
    return '';
  }
  return coordinate.toFixed(5);
}

export function formatDate(dateStr, dateOnly): string {
  const rawDate = new Date(dateStr);
  if (dateOnly == false) {
    const formatter = new Intl.DateTimeFormat('en-US', {
      dateStyle: 'short',
      timeStyle: 'long'
    });
    return formatter.format(rawDate);    
  } else {
    const formattedDate = new Intl.DateTimeFormat('en-US').format(rawDate)
    return formattedDate;
  }
  
}

export function VehicleDetails({ vehicle, onClose, onZoomIn, onTripSelect, onViewHistory }: VehicleDetailsProps) {
  // const [vehicleData, setVehicleData] = useState<any>(null);
  const [recentAddress, setRecentAddress] = useState<string>("");
  const [recentCoords, setRecentCoords] = useState<[Number, Number]>([0,0]);
  const [vehicleTrips, setVehicleTrips] = useState([]);
  const [lastUpdate, setLastUpdate] = useState<string>("");
  const statusColors = {
    active: 'bg-green-100 text-green-700',
    idle: 'bg-yellow-100 text-yellow-700',
    maintenance: 'bg-red-100 text-red-700',
    offline: 'bg-gray-100 text-gray-700',
  };

  useEffect(() => {
    async function fetchRecentLocations() {
      const fetchedLocs = await api.getRecentVehicleLocations(vehicle.vehicle_id);
      if (fetchedLocs.length > 0) {
        const mostRecentLoc = fetchedLocs[0];
        // set location
        setRecentAddress(mostRecentLoc.address);
        setRecentCoords([mostRecentLoc.lat, mostRecentLoc.lon]);

        // set last update
        setLastUpdate(formatDate(mostRecentLoc.timestamp, false));
      }
    }

    // fetch all the vehicle's trips
    async function fetchTrips() {
      const fetchedTrips = await api.getVehicleTrips(vehicle.vehicle_id);
      if (fetchedTrips.length > 0) {
        setVehicleTrips(fetchedTrips);
      }
    }
    fetchRecentLocations();
    fetchTrips();
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50">
      <div className="bg-white rounded-t-2xl sm:rounded-lg shadow-xl w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 lg:p-6 flex items-start justify-between">
          <div>
            <h2 className="text-gray-900 mb-1">{vehicle.name}</h2>
            {/*<p className="text-sm lg:text-base text-gray-600">{vehicle.driver}</p>*/}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
          {/* Status */}
          {/*
          <div>
            <label className="text-xs lg:text-sm text-gray-600 mb-2 block">Status</label>
            <span className={`inline-block px-3 lg:px-4 py-1 lg:py-2 text-sm rounded-lg capitalize ${statusColors[vehicle.status]}`}>
              {vehicle.status}
            </span>
          </div>
          */}
          {/* Location */}
          <div>
            <label className="text-xs lg:text-sm text-gray-600 mb-2 flex items-center gap-2">
              <MapPin className="w-3 h-3 lg:w-4 lg:h-4" />
              Current Location
            </label>
            <p className="text-sm lg:text-base text-gray-900">{recentAddress}</p>
            <p className="text-xs lg:text-sm text-gray-500 mt-1">
              Coordinates: {formatCoordinate(recentCoords[0])}, {formatCoordinate(recentCoords[1])}
            </p>
          </div>
          {/* Metrics Grid */}
          {/*
          <div className="grid grid-cols-2 gap-3 lg:gap-4">
            <div className="bg-gray-50 rounded-lg p-3 lg:p-4">
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <Gauge className="w-3 h-3 lg:w-4 lg:h-4" />
                <label className="text-xs lg:text-sm">Speed</label>
              </div>
              <p className="text-xl lg:text-2xl text-gray-900">{vehicle.speed} mph</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-3 lg:p-4">
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <Fuel className="w-3 h-3 lg:w-4 lg:h-4" />
                <label className="text-xs lg:text-sm">Fuel Level</label>
              </div>
              <p className="text-xl lg:text-2xl text-gray-900">{vehicle.fuel}%</p>
              <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${vehicle.fuel > 30 ? 'bg-green-500' : 'bg-red-500'}`}
                  style={{ width: `${vehicle.fuel}%` }}
                ></div>
              </div>
            </div>
          </div>
          */}
          {/* Driver Info */}
          {/*
          <div>
            <label className="text-xs lg:text-sm text-gray-600 mb-2 flex items-center gap-2">
              <User className="w-3 h-3 lg:w-4 lg:h-4" />
              Driver Information
            </label>
            <div className="bg-gray-50 rounded-lg p-3 lg:p-4">
              <p className="text-sm lg:text-base text-gray-900">{vehicle.driver}</p>
              <p className="text-xs lg:text-sm text-gray-600 mt-1">License: DL-{vehicle.id.slice(-6)}</p>
            </div>
          </div>
          */}
          {/* Last Update */}
          <div>
            <label className="text-xs lg:text-sm text-gray-600 mb-2 flex items-center gap-2">
              <Clock className="w-3 h-3 lg:w-4 lg:h-4" />
              Last Update: {lastUpdate}
            </label>
            <p className="text-sm lg:text-base text-gray-900">{}</p>
          </div>
          {/* Trip History */}
          <div>
            <label className="text-xs lg:text-sm text-gray-600 mb-3 flex items-center gap-2">
              <Calendar className="w-3 h-3 lg:w-4 lg:h-4" />
              Vehicle Trips
            </label>
            <div className="space-y-2 lg:space-y-3">
              {vehicleTrips.map((trip) => (
                <div key={trip.trip_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg" onClick={(e) => onTripSelect(trip)}>
                  <div className="flex gap-3 lg:gap-4 text-xs lg:text-sm text-gray-600">
                    <span>ID: {trip.trip_id}</span>
                    <span>Date:{formatDate(trip.trip_date)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Actions */}
          {/*
          <div className="flex gap-3 pt-4">
            <button
              onClick={() => onZoomIn(vehicle)}
              className="flex-1 px-4 py-2 lg:py-3 text-sm lg:text-base bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Zoom In
            </button>
            <button
              onClick={() => onViewHistory(vehicle)}
              className="flex-1 px-4 py-2 lg:py-3 text-sm lg:text-base border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              View History
            </button>
          </div>
          */}
        </div>
      </div>
    </div>
  );
}
