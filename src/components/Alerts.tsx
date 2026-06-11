import { AlertTriangle, AlertCircle, Info, CheckCircle, Clock } from 'lucide-react';

export function Alerts() {
  const alerts = [
    {
      id: 1,
      type: 'critical',
      title: 'Low Fuel Alert',
      message: 'Vehicle V-005 has fuel level below 15%',
      vehicle: 'V-005',
      time: '5 minutes ago',
      status: 'active',
    },
    {
      id: 2,
      type: 'warning',
      title: 'Maintenance Due',
      message: 'Vehicle V-002 scheduled maintenance is due in 2 days',
      vehicle: 'V-002',
      time: '1 hour ago',
      status: 'active',
    },
    {
      id: 3,
      type: 'info',
      title: 'Route Deviation',
      message: 'Vehicle V-008 has deviated from planned route',
      vehicle: 'V-008',
      time: '2 hours ago',
      status: 'active',
    },
    {
      id: 4,
      type: 'critical',
      title: 'Speed Limit Exceeded',
      message: 'Vehicle V-012 exceeded speed limit by 12 mph',
      vehicle: 'V-012',
      time: '3 hours ago',
      status: 'resolved',
    },
    {
      id: 5,
      type: 'warning',
      title: 'Extended Idle Time',
      message: 'Vehicle V-006 has been idle for over 30 minutes',
      vehicle: 'V-006',
      time: '4 hours ago',
      status: 'active',
    },
    {
      id: 6,
      type: 'info',
      title: 'Battery Voltage Low',
      message: 'Vehicle V-015 battery voltage is below optimal level',
      vehicle: 'V-015',
      time: '5 hours ago',
      status: 'resolved',
    },
  ];

  const alertConfig = {
    critical: {
      icon: AlertTriangle,
      bgColor: 'bg-red-50',
      iconColor: 'text-red-600',
      borderColor: 'border-red-200',
    },
    warning: {
      icon: AlertCircle,
      bgColor: 'bg-yellow-50',
      iconColor: 'text-yellow-600',
      borderColor: 'border-yellow-200',
    },
    info: {
      icon: Info,
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      borderColor: 'border-blue-200',
    },
  };

  const activeAlerts = alerts.filter(a => a.status === 'active');
  const resolvedAlerts = alerts.filter(a => a.status === 'resolved');

  return (
    <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
      <div>
        <h2 className="text-gray-900 mb-1">Alerts & Notifications</h2>
        <p className="text-sm lg:text-base text-gray-600">Monitor important fleet events and warnings</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4 lg:p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 lg:w-6 lg:h-6 text-red-600" />
            </div>
            <div>
              <p className="text-gray-600 text-xs lg:text-sm">Critical Alerts</p>
              <p className="text-gray-900 text-xl lg:text-2xl">1</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4 lg:p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-5 h-5 lg:w-6 lg:h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-gray-600 text-xs lg:text-sm">Warnings</p>
              <p className="text-gray-900 text-xl lg:text-2xl">2</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4 lg:p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 lg:w-6 lg:h-6 text-green-600" />
            </div>
            <div>
              <p className="text-gray-600 text-xs lg:text-sm">Resolved Today</p>
              <p className="text-gray-900 text-xl lg:text-2xl">2</p>
            </div>
          </div>
        </div>
      </div>

      {/* Active Alerts */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-gray-900">Active Alerts</h3>
          <p className="text-xs lg:text-sm text-gray-600">Requires attention</p>
        </div>
        <div className="divide-y divide-gray-200">
          {activeAlerts.map((alert) => {
            const config = alertConfig[alert.type as keyof typeof alertConfig];
            const Icon = config.icon;
            
            return (
              <div key={alert.id} className={`p-4 ${config.bgColor} border-l-4 ${config.borderColor}`}>
                <div className="flex gap-3 lg:gap-4">
                  <div className={config.iconColor}>
                    <Icon className="w-4 h-4 lg:w-5 lg:h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1 gap-2">
                      <h4 className="text-sm lg:text-base text-gray-900">{alert.title}</h4>
                      <span className="text-xs text-gray-500 px-2 py-1 bg-white rounded flex-shrink-0">
                        {alert.vehicle}
                      </span>
                    </div>
                    <p className="text-xs lg:text-sm text-gray-700 mb-2">{alert.message}</p>
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-1 text-xs text-gray-600">
                        <Clock className="w-3 h-3" />
                        <span>{alert.time}</span>
                      </div>
                      <div className="flex gap-2">
                        <button className="text-xs px-2 lg:px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors">
                          View
                        </button>
                        <button className="text-xs px-2 lg:px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                          Resolve
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Resolved Alerts */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-gray-900">Recently Resolved</h3>
          <p className="text-xs lg:text-sm text-gray-600">Past 24 hours</p>
        </div>
        <div className="divide-y divide-gray-200">
          {resolvedAlerts.map((alert) => {
            const config = alertConfig[alert.type as keyof typeof alertConfig];
            const Icon = config.icon;
            
            return (
              <div key={alert.id} className="p-4 opacity-60">
                <div className="flex gap-3 lg:gap-4">
                  <div className={config.iconColor}>
                    <Icon className="w-4 h-4 lg:w-5 lg:h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1 gap-2">
                      <h4 className="text-sm lg:text-base text-gray-900">{alert.title}</h4>
                      <span className="text-xs text-green-700 px-2 py-1 bg-green-100 rounded flex items-center gap-1 flex-shrink-0">
                        <CheckCircle className="w-3 h-3" />
                        Resolved
                      </span>
                    </div>
                    <p className="text-xs lg:text-sm text-gray-700 mb-2">{alert.message}</p>
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <Clock className="w-3 h-3" />
                      <span>{alert.time}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}