import { X, MapPin, User, Clock, Fuel, Gauge, Calendar } from 'lucide-react';
import { Vehicle } from '../App';

type VehicleDetailsProps = {
  vehicle: Vehicle;
  onClose: () => void;
};

export function VehicleDetails({ vehicle, onClose }: VehicleDetailsProps) {
  const statusColors = {
    active: 'bg-green-100 text-green-700',
    idle: 'bg-yellow-100 text-yellow-700',
    maintenance: 'bg-red-100 text-red-700',
    offline: 'bg-gray-100 text-gray-700',
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50">
      <div className="bg-white rounded-t-2xl sm:rounded-lg shadow-xl w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 lg:p-6 flex items-start justify-between">
          <div>
            <h2 className="text-gray-900 mb-1">{vehicle.name}</h2>
            <p className="text-sm lg:text-base text-gray-600">{vehicle.driver}</p>
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
          <div>
            <label className="text-xs lg:text-sm text-gray-600 mb-2 block">Status</label>
            <span className={`inline-block px-3 lg:px-4 py-1 lg:py-2 text-sm rounded-lg capitalize ${statusColors[vehicle.status]}`}>
              {vehicle.status}
            </span>
          </div>

          {/* Location */}
          <div>
            <label className="text-xs lg:text-sm text-gray-600 mb-2 flex items-center gap-2">
              <MapPin className="w-3 h-3 lg:w-4 lg:h-4" />
              Current Location
            </label>
            <p className="text-sm lg:text-base text-gray-900">{vehicle.location.address}</p>
            <p className="text-xs lg:text-sm text-gray-500 mt-1">
              Coordinates: {vehicle.location.lat}, {vehicle.location.lng}
            </p>
          </div>

          {/* Metrics Grid */}
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

          {/* Driver Info */}
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

          {/* Last Update */}
          <div>
            <label className="text-xs lg:text-sm text-gray-600 mb-2 flex items-center gap-2">
              <Clock className="w-3 h-3 lg:w-4 lg:h-4" />
              Last Update
            </label>
            <p className="text-sm lg:text-base text-gray-900">{vehicle.lastUpdate}</p>
          </div>

          {/* Trip History */}
          <div>
            <label className="text-xs lg:text-sm text-gray-600 mb-3 flex items-center gap-2">
              <Calendar className="w-3 h-3 lg:w-4 lg:h-4" />
              Recent Trips
            </label>
            <div className="space-y-2 lg:space-y-3">
              {[
                { date: 'Dec 25, 2024', distance: '97 mi', duration: '3h 20m' },
                { date: 'Dec 24, 2024', distance: '126 mi', duration: '4h 15m' },
                { date: 'Dec 23, 2024', distance: '61 mi', duration: '2h 05m' },
              ].map((trip, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-xs lg:text-sm text-gray-900">{trip.date}</span>
                  <div className="flex gap-3 lg:gap-4 text-xs lg:text-sm text-gray-600">
                    <span>{trip.distance}</span>
                    <span>{trip.duration}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button className="flex-1 px-4 py-2 lg:py-3 text-sm lg:text-base bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Track Vehicle
            </button>
            <button className="flex-1 px-4 py-2 lg:py-3 text-sm lg:text-base border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              View History
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}