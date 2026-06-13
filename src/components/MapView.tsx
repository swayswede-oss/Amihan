import { MapPin } from 'lucide-react';
import { Vehicle } from '../App';

type MapViewProps = {
  vehicles: Vehicle[];
  onSelectVehicle: (vehicle: Vehicle) => void;
};

export function MapView({ vehicles, onSelectVehicle }: MapViewProps) {
  const statusColors = {
    active: 'bg-green-500',
    idle: 'bg-yellow-500',
    maintenance: 'bg-red-500',
    offline: 'bg-gray-400',
  };
  // below line 19, figure leaflet library
  return (
    <div className="relative bg-gray-100 w-full h-full overflow-hidden">
      <div className="absolute top-4 left-4 z-10">
        <h3 className="text-gray-900 text-xl font-semibold">Live Vehicle Map</h3>
        <p className="text-xs lg:text-sm text-gray-600">Real-time tracking of all vehicles</p>
      </div>

      <div className="relative bg-gray-100 w-full h-full">
        {/* Map background with grid */}
        <div className="absolute inset-0 opacity-10">
          <div className="grid grid-cols-8 grid-rows-8 h-full">
            {Array.from({ length: 64 }).map((_, i) => (
              <div key={i} className="border border-gray-300"></div>
            ))}
          </div>
        </div>

        {/* Vehicle markers */}
        {vehicles.map((vehicle, index) => (
          <button
            key={vehicle.id}
            onClick={() => onSelectVehicle(vehicle)}
            className="absolute group"
            style={{
              left: `${15 + (index % 4) * 20}%`,
              top: `${20 + Math.floor(index / 4) * 25}%`,
            }}
          >
            <div className="relative">
              <div className={`w-8 h-8 lg:w-10 lg:h-10 rounded-full ${statusColors[vehicle.status]} flex items-center justify-center shadow-lg border-2 border-white transition-transform group-hover:scale-110`}>
                <MapPin className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
              </div>
              
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 whitespace-nowrap">
                  <div>{vehicle.name}</div>
                  <div className="text-gray-400">{vehicle.driver}</div>
                  <div className="text-gray-400">{vehicle.speed} mph</div>
                </div>
                <div className="w-2 h-2 bg-gray-900 absolute left-1/2 -translate-x-1/2 -bottom-1 rotate-45"></div>
              </div>
            </div>
          </button>
        ))}

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-2 lg:p-3 space-y-1 lg:space-y-2">
          <p className="text-xs text-gray-900">Status</p>
          {Object.entries(statusColors).map(([status, color]) => (
            <div key={status} className="flex items-center gap-2">
              <div className={`w-2 h-2 lg:w-3 lg:h-3 rounded-full ${color}`}></div>
              <span className="text-xs text-gray-700 capitalize">{status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
