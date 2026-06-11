import { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Vehicle } from '../App';
import { MapView } from './MapView';
import { StatsCards } from './StatsCards';
import { RecentActivity } from './RecentActivity';
import { mockVehicles } from '../data/mockData';

type DashboardProps = {
  onSelectVehicle: (vehicle: Vehicle) => void;
};

type DashboardItem = {
  id: string;
  type: 'stats' | 'activity';
};

export function Dashboard({ onSelectVehicle }: DashboardProps) {
  const [items, setItems] = useState<DashboardItem[]>([
    { id: 'activity', type: 'activity' },
    { id: 'stats', type: 'stats' },
  ]);

  const handleDragEnd = (result: DropResult) => {
    const { source, destination } = result;

    if (!destination) return;

    if (source.index === destination.index) return;

    const newItems = Array.from(items);
    const [reorderedItem] = newItems.splice(source.index, 1);
    newItems.splice(destination.index, 0, reorderedItem);

    setItems(newItems);
  };

  return (
    <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
      <div>
        <h2 className="text-gray-900 mb-1">Dashboard</h2>
        <p className="text-sm lg:text-base text-gray-600">Overview of your fleet operations</p>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="dashboard" direction="horizontal">
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6"
            >
              {items.map((item, index) => (
                <Draggable key={item.id} draggableId={item.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`${
                        item.type === 'stats' ? 'lg:col-span-2' : ''
                      } ${snapshot.isDragging ? 'opacity-50' : ''}`}
                    >
                      {item.type === 'activity' && <RecentActivity />}
                      {item.type === 'stats' && (
                        <div className="flex flex-col space-y-3 lg:space-y-6">
                          <StatsCards vehicles={mockVehicles} />
                        </div>
                      )}
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}
