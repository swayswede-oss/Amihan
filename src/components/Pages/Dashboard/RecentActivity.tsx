import { Clock, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

type RecentActivityProps = {
  onViewAllActivity?: () => void;
};

export function RecentActivity({ onViewAllActivity }: RecentActivityProps) {
  const activities = [
    {
      id: 1,
      type: 'status',
      message: 'Vehicle V-001 completed delivery',
      time: '5 min ago',
      icon: CheckCircle,
      color: 'text-green-600',
    },
    {
      id: 2,
      type: 'alert',
      message: 'Vehicle V-005 - low fuel detected',
      time: '15 min ago',
      icon: AlertCircle,
      color: 'text-red-600',
    },
    {
      id: 3,
      type: 'status',
      message: 'Vehicle V-003 route optimized',
      time: '23 min ago',
      icon: TrendingUp,
      color: 'text-blue-600',
    },
    {
      id: 4,
      type: 'status',
      message: 'Vehicle V-007 started trip',
      time: '1 hour ago',
      icon: CheckCircle,
      color: 'text-green-600',
    },
    {
      id: 5,
      type: 'alert',
      message: 'Vehicle V-002 scheduled maintenance',
      time: '2 hours ago',
      icon: AlertCircle,
      color: 'text-yellow-600',
    },
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-gray-900">Recent Activity</h3>
        <p className="text-xs lg:text-sm text-gray-600">Latest fleet updates</p>
      </div>

      <div className="divide-y divide-gray-200">
        {activities.map((activity) => {
          const Icon = activity.icon;
          return (
            <div key={activity.id} className="p-3 lg:p-4 hover:bg-gray-50 transition-colors">
              <div className="flex gap-2 lg:gap-3">
                <div className={`${activity.color} mt-1`}>
                  <Icon className="w-4 h-4 lg:w-5 lg:h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs lg:text-sm text-gray-900">{activity.message}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Clock className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-500">{activity.time}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-3 lg:p-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onViewAllActivity}
          className="w-full text-center text-xs lg:text-sm text-blue-600 hover:text-blue-700"
        >
          View all activity
        </button>
      </div>
    </div>
  );
}