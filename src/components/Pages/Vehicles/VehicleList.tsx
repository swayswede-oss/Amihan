import { useState, useEffect } from 'react';
import { Search, Filter, MapPin, Fuel, Gauge } from 'lucide-react';
import { Vehicle } from '../../../App';
import { mockVehicles } from '../../../data/mockData';
import { api } from '../../../services/api';
import { formatDate } from './VehicleDetails.tsx';

type VehicleListProps = {
  onSelectVehicle: (vehicle: Vehicle) => void;
};

export function VehicleList({ onSelectVehicle }: VehicleListProps) {
  {/*
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredVehicles = mockVehicles.filter(vehicle => {
    const matchesSearch = vehicle.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         vehicle.driver.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || vehicle.status === statusFilter;
    return matchesSearch && matchesStatus;
  });
  */}
  const [vehicleList, setVehicleList] = useState([]);

  useEffect(() => {
    // fetch user's vehicles
    async function fetchVehicles() {
      const fetched = await api.getUserVehicles();
      const vehicles = [];
      for (const v of fetched) {
        const fetchedLocs = await api.getRecentVehicleLocations(v.vehicle_id);
        const vehicleObj = {
            id: v.vehicle_id,
            name: v.name,
            address: "",
            location: { lat: 0, lng: 0 },
            status: v.status,
            lastUpdate: ""
        };
        if (fetchedLocs.length > 0) {
          const mostRecentLoc = fetchedLocs[0];
          vehicleObj.address = mostRecentLoc.address;
          vehicleObj.location = { lat: mostRecentLoc.lat, lng: mostRecentLoc.lon };
          vehicleObj.lastUpdate = formatDate(mostRecentLoc.timestamp, false);
        }
        vehicles.push(vehicleObj);
      }
      setVehicleList(vehicles);
    }
    fetchVehicles();
  }, []);

  const statusText = {
    1: "active",
    0: "off"
  }
    
  const statusColors = {
    1: 'bg-green-100 text-green-700',
    // idle: 'bg-yellow-100 text-yellow-700',
    // maintenance: 'bg-red-100 text-red-700',
    0: 'bg-gray-100 text-gray-700',
  };

  return (
    <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
      <div>
        <h2 className="text-gray-900 mb-1">Vehicles</h2>
        <p className="text-sm lg:text-base text-gray-600">Manage and monitor all fleet vehicles</p>
      </div>

      {/* Filters */}
      {/*
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-3 lg:gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 lg:w-5 lg:h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by vehicle or driver..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 lg:pl-10 pr-4 py-2 text-sm lg:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 lg:w-5 lg:h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex-1 sm:flex-none px-3 lg:px-4 py-2 text-sm lg:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="idle">Idle</option>
              <option value="maintenance">Maintenance</option>
              <option value="offline">Offline</option>
            </select>
          </div>
        </div>
      </div>
      */}

      {/* Vehicle Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {vehicleList.map((vehicle) => (
          <div
            key={vehicle.vehicle_id}
            onClick={(e) => onSelectVehicle(vehicle)}
            className="bg-white rounded-lg border border-gray-200 p-4 lg:p-6 hover:shadow-lg transition-shadow cursor-pointer"
          >
            <div className="flex items-start justify-between mb-3 lg:mb-4">
              <div>
                <h3 className="text-gray-900 mb-1 text-sm lg:text-base">{vehicle.name}</h3>
                {/* <p className="text-xs lg:text-sm text-gray-600">{vehicle.driver}</p> */}
              </div>
              <span className={`px-2 lg:px-3 py-1 rounded-full text-xs capitalize ${statusColors[vehicle.status]}`}>
                {statusText[vehicle.status]}
              </span>
            </div>
            
            <div className="space-y-2 lg:space-y-3">
              <div className="flex items-center gap-2 text-xs lg:text-sm text-gray-600">
                <MapPin className="w-3 h-3 lg:w-4 lg:h-4 flex-shrink-0" />
                <span className="truncate">{vehicle.address}</span>
              </div>
              {/*
              <div className="grid grid-cols-2 gap-3 lg:gap-4">
                <div className="flex items-center gap-2 text-xs lg:text-sm text-gray-600">
                  <Gauge className="w-3 h-3 lg:w-4 lg:h-4" />
                  <span>{vehicle.speed} mph</span>
                </div>
                <div className="flex items-center gap-2 text-xs lg:text-sm text-gray-600">
                  <Fuel className="w-3 h-3 lg:w-4 lg:h-4" />
                  <span>{vehicle.fuel}%</span>
                </div>
              </div>
              */}
              <div className="pt-2 lg:pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-500">Last update: {vehicle.lastUpdate}</p>
              </div>
            </div>

          </div>
        ))}
      </div>

      {vehicleList.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-8 lg:p-12 text-center">
          <p className="text-sm lg:text-base text-gray-600">No vehicles found matching your criteria</p>
        </div>
      )}
    </div>
  );
}
