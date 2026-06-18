import { Activity, Clock, Truck, Wrench } from 'lucide-react';

type VehicleHistorySummaryCardsProps = {
  totalEvents: number;
  activeUpdates: number;
  idleEvents: number;
  maintenanceEvents: number;
};

export function VehicleHistorySummaryCards({
  totalEvents,
  activeUpdates,
  idleEvents,
  maintenanceEvents,
}: VehicleHistorySummaryCardsProps) {
  const cards = [
    {
      label: 'Total Events',
      value: totalEvents,
      icon: Activity,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      label: 'Active Updates',
      value: activeUpdates,
      icon: Truck,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
    },
    {
      label: 'Idle Events',
      value: idleEvents,
      icon: Clock,
      iconBg: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
    },
    {
      label: 'Maintenance Events',
      value: maintenanceEvents,
      icon: Wrench,
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="bg-white rounded-lg border border-gray-200 p-4 lg:p-5"
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 lg:w-10 lg:h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${card.iconBg}`}
              >
                <Icon className={`w-4 h-4 lg:w-5 lg:h-5 ${card.iconColor}`} />
              </div>
              <div className="min-w-0">
                <p className="text-gray-600 text-xs lg:text-sm truncate">{card.label}</p>
                <p className="text-gray-900 text-xl lg:text-2xl font-medium">{card.value}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
