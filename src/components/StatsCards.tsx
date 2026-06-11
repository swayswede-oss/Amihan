import { Truck, TrendingUp, AlertTriangle, Activity } from 'lucide-react';
import { Vehicle } from '../App';

type StatsCardsProps = {
  vehicles: Vehicle[];
};

export function StatsCards({ vehicles }: StatsCardsProps) {
  const activeVehicles = vehicles.filter(v => v.status === 'active').length;
  const idleVehicles = vehicles.filter(v => v.status === 'idle').length;
  const maintenanceVehicles = vehicles.filter(v => v.status === 'maintenance').length;
  const avgSpeed = Math.round(vehicles.reduce((acc, v) => acc + v.speed, 0) / vehicles.length);

  const stats = [
    {
      label: 'Active Vehicles',
      value: activeVehicles,
      total: vehicles.length,
      icon: Truck,
      color: 'blue',
      trend: '+12%'
    },
    {
      label: 'Avg Speed',
      value: `${avgSpeed} mph`,
      icon: TrendingUp,
      color: 'green',
      trend: '+5%'
    },
    {
      label: 'Idle Vehicles',
      value: idleVehicles,
      icon: Activity,
      color: 'yellow',
      trend: '-3%'
    },
    {
      label: 'Maintenance',
      value: maintenanceVehicles,
      icon: AlertTriangle,
      color: 'red',
      trend: '+2'
    },
  ];

  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    red: 'bg-red-100 text-red-600',
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div key={stat.label} className="bg-white rounded-lg border border-gray-200 p-4 lg:p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-600 text-xs lg:text-sm mb-1">{stat.label}</p>
                <p className="text-gray-900 text-xl lg:text-2xl">
                  {stat.value}
                  {stat.total && <span className="text-gray-400 text-base lg:text-lg">/{stat.total}</span>}
                </p>
                <p className="text-green-600 text-xs mt-1">{stat.trend} from last week</p>
              </div>
              <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-lg flex items-center justify-center ${colorClasses[stat.color]}`}>
                <Icon className="w-5 h-5 lg:w-6 lg:h-6" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}