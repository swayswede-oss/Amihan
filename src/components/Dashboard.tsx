import { Vehicle } from '../App';
import { MapView } from './MapView';
import { StatsCards } from './StatsCards';
import { RecentActivity } from './RecentActivity';
import { mockVehicles } from '../data/mockData';

type DashboardProps = {
  onSelectVehicle: (vehicle: Vehicle) => void;
};

export function Dashboard({ onSelectVehicle }: DashboardProps) {
  return (
    <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
      <div>
        <h2 className="text-gray-900 mb-1">Dashboard</h2>
        <p className="text-sm lg:text-base text-gray-600">Overview of your fleet operations</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        <div>
          <RecentActivity />
        </div>
        <div className="lg:col-span-2 flex flex-col space-y-3 lg:space-y-6">
          <StatsCards vehicles={mockVehicles} />
        </div>
      </div>
    </div>
  );
}
