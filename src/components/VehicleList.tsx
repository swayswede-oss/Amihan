import { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Search, Filter, MapPin, Fuel, Gauge } from 'lucide-react';
import { Vehicle } from '../App';
import { mockVehicles } from '../data/mockData';

type VehicleListProps = {
  onSelectVehicle: (vehicle: Vehicle) => void;
};

export function VehicleList({ onSelectVehicle }: VehicleListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [vehicles, setVehicles] = useState<Vehicle[]>(mockVehicles);

  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = vehicle.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         vehicle.driver.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || vehicle.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDragEnd = (result: DropResult) => {
    const { source, destination } = result;

    if (!destination) return;

    if (source.index === destination.index) return;

    const newVehicles = Array.from(filteredVehicles);
    const [reorderedVehicle] = newVehicles.splice(source.index, 1);
    newVehicles.splice(destination.index, 0, reorderedVehicle);

    const updatedAllVehicles = vehicles.map(v => {
      const newIndex = newVehicles.findIndex(nv => nv.id === v.id);
      return newVehicles[newIndex] || v;
    });

    setVehicles(updatedAllVehicles);
  }

  const statusColors = {
    active: 'bg-green-100 text-green-700',
    idle: 'bg-yellow-100 text-yellow-700',
    maintenance: 'bg-red-100 text-red-700',
    offline: 'bg-gray-100 text-gray-700',
  };

  return (
    <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
      <div>
        <h2 className="text-gray-900 mb-1">Vehicles</h2>
        <p className="text-sm lg:text-base text-gray-600">Manage and monitor all fleet vehicles</p>
      </div>

      {/* Filters */}
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

      {/* Vehicle Grid */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="vehicles" type="VEHICLE">
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6"
            >
              {filteredVehicles.map((vehicle, index) => (
                <Draggable key={vehicle.id} draggableId={vehicle.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      onClick={() => onSelectVehicle(vehicle)}
                      className={`bg-white rounded-lg border border-gray-200 p-4 lg:p-6 hover:shadow-lg transition-shadow cursor-pointer ${
                        snapshot.isDragging ? 'shadow-lg opacity-75' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3 lg:mb-4">
                        <div>
                          <h3 className="text-gray-900 mb-1 text-sm lg:text-base">{vehicle.name}</h3>
                          <p className="text-xs lg:text-sm text-gray-600">{vehicle.driver}</p>
                        </div>
                        <span className={`px-2 lg:px-3 py-1 rounded-full text-xs capitalize ${statusColors[vehicle.status]}`}>
                          {vehicle.status}
                        </span>
                      </div>

                      <div className="space-y-2 lg:space-y-3">
                        <div className="flex items-center gap-2 text-xs lg:text-sm text-gray-600">
                          <MapPin className="w-3 h-3 lg:w-4 lg:h-4 flex-shrink-0" />
                          <span className="truncate">{vehicle.location.address}</span>
                        </div>

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

                        <div className="pt-2 lg:pt-3 border-t border-gray-200">
                          <p className="text-xs text-gray-500">Last update: {vehicle.lastUpdate}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {filteredVehicles.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-8 lg:p-12 text-center">
          <p className="text-sm lg:text-base text-gray-600">No vehicles found matching your criteria</p>
        </div>
      )}
    </div>
  );
}
