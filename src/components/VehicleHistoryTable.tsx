import { useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  ArrowRightLeft,
  Fuel,
  Gauge,
  MapPin,
  Wrench,
} from 'lucide-react';
import {
  VehicleHistoryRecord,
  VehicleHistoryEventType,
  formatHistoryTimestamp,
} from '../data/vehicleHistoryData';

type VehicleHistoryTableProps = {
  records: VehicleHistoryRecord[];
  focusedVehicleId?: string | null;
  scrollTargetRecordId?: string;
  onFocusHandled?: () => void;
};

const statusColors = {
  active: 'bg-green-100 text-green-700',
  idle: 'bg-yellow-100 text-yellow-700',
  maintenance: 'bg-red-100 text-red-700',
};

const eventTypeIcons: Record<VehicleHistoryEventType, typeof MapPin> = {
  'Location Update': MapPin,
  'Speed Update': Gauge,
  'Fuel Update': Fuel,
  'Status Change': ArrowRightLeft,
  Maintenance: Wrench,
  Alert: AlertCircle,
};

const eventTypeColors: Record<VehicleHistoryEventType, string> = {
  'Location Update': 'text-blue-600',
  'Speed Update': 'text-gray-600',
  'Fuel Update': 'text-orange-600',
  'Status Change': 'text-purple-600',
  Maintenance: 'text-red-600',
  Alert: 'text-red-600',
};

export function VehicleHistoryTable({
  records,
  focusedVehicleId = null,
  scrollTargetRecordId,
  onFocusHandled,
}: VehicleHistoryTableProps) {
  const rowRefs = useRef<Map<string, HTMLTableRowElement>>(new Map());
  const [highlightedVehicleId, setHighlightedVehicleId] = useState<string | null>(null);
  const focusHandledRef = useRef<string | null>(null);

  useEffect(() => {
    if (!focusedVehicleId) {
      focusHandledRef.current = null;
      return;
    }

    if (focusHandledRef.current === focusedVehicleId) return;

    const scrollToTarget = () => {
      if (scrollTargetRecordId) {
        const row = rowRefs.current.get(scrollTargetRecordId);
        if (row) {
          row.scrollIntoView({ behavior: 'smooth', block: 'center' });
          setHighlightedVehicleId(focusedVehicleId);
        }
      }

      focusHandledRef.current = focusedVehicleId;
      onFocusHandled?.();
    };

    const frameId = requestAnimationFrame(scrollToTarget);
    return () => cancelAnimationFrame(frameId);
  }, [focusedVehicleId, scrollTargetRecordId, onFocusHandled]);

  useEffect(() => {
    if (!highlightedVehicleId) return;

    const timer = window.setTimeout(() => {
      setHighlightedVehicleId(null);
    }, 3000);

    return () => window.clearTimeout(timer);
  }, [highlightedVehicleId]);

  if (records.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 lg:p-12 text-center">
        <p className="text-sm lg:text-base text-gray-900 font-medium mb-1">
          No vehicle history found
        </p>
        <p className="text-sm text-gray-600">Try adjusting your search or filters.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-gray-900">Activity History</h3>
        <p className="text-xs lg:text-sm text-gray-600">
          {records.length} record{records.length !== 1 ? 's' : ''} found
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left px-4 py-3 text-xs lg:text-sm font-medium text-gray-600 whitespace-nowrap">
                Date / Time
              </th>
              <th className="text-left px-4 py-3 text-xs lg:text-sm font-medium text-gray-600 whitespace-nowrap">
                Vehicle
              </th>
              <th className="text-left px-4 py-3 text-xs lg:text-sm font-medium text-gray-600 whitespace-nowrap hidden sm:table-cell">
                Driver
              </th>
              <th className="text-left px-4 py-3 text-xs lg:text-sm font-medium text-gray-600 whitespace-nowrap">
                Event
              </th>
              <th className="text-left px-4 py-3 text-xs lg:text-sm font-medium text-gray-600 whitespace-nowrap hidden md:table-cell">
                Location
              </th>
              <th className="text-left px-4 py-3 text-xs lg:text-sm font-medium text-gray-600 whitespace-nowrap hidden lg:table-cell">
                Speed
              </th>
              <th className="text-left px-4 py-3 text-xs lg:text-sm font-medium text-gray-600 whitespace-nowrap hidden lg:table-cell">
                Fuel
              </th>
              <th className="text-left px-4 py-3 text-xs lg:text-sm font-medium text-gray-600 whitespace-nowrap">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {records.map((record) => {
              const EventIcon = eventTypeIcons[record.eventType];
              const isVehicleHighlighted =
                highlightedVehicleId !== null && record.vehicleId === highlightedVehicleId;
              const isPrimaryTarget =
                isVehicleHighlighted && record.id === scrollTargetRecordId;

              return (
                <tr
                  key={record.id}
                  ref={(element) => {
                    if (element) {
                      rowRefs.current.set(record.id, element);
                    } else {
                      rowRefs.current.delete(record.id);
                    }
                  }}
                  className={`transition-colors ${
                    isPrimaryTarget
                      ? 'bg-blue-100 ring-2 ring-inset ring-blue-400'
                      : isVehicleHighlighted
                        ? 'bg-blue-50'
                        : 'hover:bg-gray-50'
                  }`}
                >
                  <td className="px-4 py-3 text-xs lg:text-sm text-gray-600 whitespace-nowrap">
                    {formatHistoryTimestamp(record.timestamp)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <p className="text-xs lg:text-sm text-gray-900">{record.vehicleName}</p>
                    <p className="text-xs text-gray-500 sm:hidden">{record.driverName}</p>
                  </td>
                  <td className="px-4 py-3 text-xs lg:text-sm text-gray-600 whitespace-nowrap hidden sm:table-cell">
                    {record.driverName}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-start gap-2 min-w-[160px]">
                      <EventIcon
                        className={`w-4 h-4 flex-shrink-0 mt-0.5 ${eventTypeColors[record.eventType]}`}
                      />
                      <div className="min-w-0">
                        <p className="text-xs lg:text-sm text-gray-900">{record.eventType}</p>
                        <p className="text-xs text-gray-500 truncate max-w-[200px] lg:max-w-[280px]">
                          {record.eventDescription}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs lg:text-sm text-gray-600 hidden md:table-cell">
                    <div className="flex items-center gap-1.5 max-w-[200px]">
                      <MapPin className="w-3 h-3 flex-shrink-0 text-gray-400" />
                      <span className="truncate">{record.location}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs lg:text-sm text-gray-600 whitespace-nowrap hidden lg:table-cell">
                    {record.speed} mph
                  </td>
                  <td className="px-4 py-3 text-xs lg:text-sm text-gray-600 whitespace-nowrap hidden lg:table-cell">
                    {record.fuel}%
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className={`px-2 lg:px-3 py-1 rounded-full text-xs capitalize ${statusColors[record.status]}`}
                    >
                      {record.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
