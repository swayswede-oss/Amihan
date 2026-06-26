import { X, Clock, Truck, AlertTriangle, AlertCircle, Info, CheckCircle } from 'lucide-react';

export type AlertType = 'critical' | 'warning' | 'info';
export type AlertStatus = 'active' | 'resolved';

export type Alert = {
  id: number;
  type: AlertType;
  title: string;
  message: string;
  vehicle: string;
  time: string;
  reportedAt: string;
  status: AlertStatus;
  resolvedAt?: string;
};

type AlertDetailsProps = {
  alert: Alert;
  onClose: () => void;
  onResolve?: (alertId: number) => void;
};

const alertConfig = {
  critical: {
    icon: AlertTriangle,
    label: 'Critical',
    bgColor: 'bg-red-50',
    textColor: 'text-red-700',
    badgeColor: 'bg-red-100 text-red-700',
    iconColor: 'text-red-600',
  },
  warning: {
    icon: AlertCircle,
    label: 'Warning',
    bgColor: 'bg-yellow-50',
    textColor: 'text-yellow-700',
    badgeColor: 'bg-yellow-100 text-yellow-700',
    iconColor: 'text-yellow-600',
  },
  info: {
    icon: Info,
    label: 'Info',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    badgeColor: 'bg-blue-100 text-blue-700',
    iconColor: 'text-blue-600',
  },
};

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function AlertDetails({ alert, onClose, onResolve }: AlertDetailsProps) {
  const config = alertConfig[alert.type];
  const Icon = config.icon;
  const isActive = alert.status === 'active';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50">
      <div className="bg-white rounded-t-2xl sm:rounded-lg shadow-xl w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 lg:p-6 flex items-start justify-between">
          <div className="flex items-start gap-3 min-w-0">
            <div className={`p-2 rounded-lg ${config.bgColor} flex-shrink-0`}>
              <Icon className={`w-5 h-5 ${config.iconColor}`} />
            </div>
            <div className="min-w-0">
              <h2 className="text-gray-900 mb-1">{alert.title}</h2>
              <p className="text-sm lg:text-base text-gray-600">{alert.vehicle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
          <div>
            <label className="text-xs lg:text-sm text-gray-600 mb-2 block">Status</label>
            {isActive ? (
              <span className="inline-block px-3 lg:px-4 py-1 lg:py-2 text-sm rounded-lg bg-red-100 text-red-700">
                Active
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 lg:px-4 py-1 lg:py-2 text-sm rounded-lg bg-green-100 text-green-700">
                <CheckCircle className="w-4 h-4" />
                Resolved
              </span>
            )}
          </div>

          <div>
            <label className="text-xs lg:text-sm text-gray-600 mb-2 block">Severity</label>
            <span className={`inline-block px-3 lg:px-4 py-1 lg:py-2 text-sm rounded-lg ${config.badgeColor}`}>
              {config.label}
            </span>
          </div>

          <div>
            <label className="text-xs lg:text-sm text-gray-600 mb-2 flex items-center gap-2">
              <Truck className="w-3 h-3 lg:w-4 lg:h-4" />
              Vehicle ID
            </label>
            <p className="text-sm lg:text-base text-gray-900">{alert.vehicle}</p>
          </div>

          <div>
            <label className="text-xs lg:text-sm text-gray-600 mb-2 block">Description</label>
            <div className="bg-gray-50 rounded-lg p-3 lg:p-4">
              <p className="text-sm lg:text-base text-gray-900">{alert.message}</p>
            </div>
          </div>

          <div>
            <label className="text-xs lg:text-sm text-gray-600 mb-2 flex items-center gap-2">
              <Clock className="w-3 h-3 lg:w-4 lg:h-4" />
              Time Reported
            </label>
            <p className="text-sm lg:text-base text-gray-900">{alert.time}</p>
            <p className="text-xs lg:text-sm text-gray-500 mt-1">
              {formatTimestamp(alert.reportedAt)}
            </p>
          </div>

          {!isActive && alert.resolvedAt && (
            <div>
              <label className="text-xs lg:text-sm text-gray-600 mb-2 flex items-center gap-2">
                <CheckCircle className="w-3 h-3 lg:w-4 lg:h-4" />
                Resolved At
              </label>
              <p className="text-sm lg:text-base text-gray-900">
                {formatTimestamp(alert.resolvedAt)}
              </p>
            </div>
          )}

          {isActive && onResolve && (
            <div className="flex gap-3 pt-4">
              <button
                onClick={() => onResolve(alert.id)}
                className="flex-1 px-4 py-2 lg:py-3 text-sm lg:text-base bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Resolve
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
