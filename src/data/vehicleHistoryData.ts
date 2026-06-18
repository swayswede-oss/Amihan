import { mockVehicles } from './mockData';

export type VehicleHistoryStatus = 'active' | 'idle' | 'maintenance';

export type VehicleHistoryEventType =
  | 'Location Update'
  | 'Speed Update'
  | 'Fuel Update'
  | 'Status Change'
  | 'Maintenance'
  | 'Alert';

export type VehicleHistoryRecord = {
  id: string;
  vehicleId: string;
  timestamp: string;
  vehicleName: string;
  driverName: string;
  eventType: VehicleHistoryEventType;
  eventDescription: string;
  location: string;
  speed: number;
  fuel: number;
  status: VehicleHistoryStatus;
};

function daysAgo(days: number, hours = 12, minutes = 0): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(hours, minutes, 0, 0);
  return date.toISOString();
}

const rawVehicleHistoryRecords: Omit<VehicleHistoryRecord, 'vehicleId'>[] = [
  {
    id: 'H-001',
    timestamp: daysAgo(0, 9, 15),
    vehicleName: 'Fleet Van 005',
    driverName: 'David Lee',
    eventType: 'Alert',
    eventDescription: 'Low fuel alert triggered',
    location: '555 Lexington Ave, New York, NY',
    speed: 55,
    fuel: 12,
    status: 'active',
  },
  {
    id: 'H-002',
    timestamp: daysAgo(0, 8, 42),
    vehicleName: 'Fleet Truck 001',
    driverName: 'John Smith',
    eventType: 'Speed Update',
    eventDescription: 'Speed changed to 65 mph',
    location: '123 Main St, New York, NY',
    speed: 65,
    fuel: 78,
    status: 'active',
  },
  {
    id: 'H-003',
    timestamp: daysAgo(0, 8, 10),
    vehicleName: 'Fleet Van 003',
    driverName: 'Mike Wilson',
    eventType: 'Location Update',
    eventDescription: 'Vehicle location updated',
    location: '789 Broadway, New York, NY',
    speed: 42,
    fuel: 92,
    status: 'active',
  },
  {
    id: 'H-004',
    timestamp: daysAgo(0, 7, 30),
    vehicleName: 'Fleet Truck 008',
    driverName: 'Maria Garcia',
    eventType: 'Fuel Update',
    eventDescription: 'Fuel level reported at 71%',
    location: '180 Broadway, New York, NY',
    speed: 48,
    fuel: 71,
    status: 'active',
  },
  {
    id: 'H-005',
    timestamp: daysAgo(0, 6, 55),
    vehicleName: 'Fleet Van 007',
    driverName: 'James Anderson',
    eventType: 'Speed Update',
    eventDescription: 'Speed changed to 38 mph',
    location: '250 Lafayette St, New York, NY',
    speed: 38,
    fuel: 56,
    status: 'active',
  },
  {
    id: 'H-006',
    timestamp: daysAgo(0, 5, 20),
    vehicleName: 'Fleet Truck 004',
    driverName: 'Emily Brown',
    eventType: 'Status Change',
    eventDescription: 'Vehicle changed from Active to Idle',
    location: '321 5th Ave, New York, NY',
    speed: 0,
    fuel: 65,
    status: 'idle',
  },
  {
    id: 'H-007',
    timestamp: daysAgo(0, 4, 10),
    vehicleName: 'Fleet Truck 002',
    driverName: 'Sarah Johnson',
    eventType: 'Maintenance',
    eventDescription: 'Vehicle entered maintenance',
    location: '456 Park Ave, New York, NY',
    speed: 0,
    fuel: 45,
    status: 'maintenance',
  },
  {
    id: 'H-008',
    timestamp: daysAgo(0, 3, 45),
    vehicleName: 'Fleet Van 009',
    driverName: 'Robert Taylor',
    eventType: 'Location Update',
    eventDescription: 'Vehicle location updated',
    location: '350 Madison Ave, New York, NY',
    speed: 0,
    fuel: 34,
    status: 'idle',
  },
  {
    id: 'H-009',
    timestamp: daysAgo(0, 2, 30),
    vehicleName: 'Fleet Truck 006',
    driverName: 'Lisa Martinez',
    eventType: 'Alert',
    eventDescription: 'Extended idle time detected',
    location: '100 W 42nd St, New York, NY',
    speed: 0,
    fuel: 88,
    status: 'idle',
  },
  {
    id: 'H-010',
    timestamp: daysAgo(1, 16, 0),
    vehicleName: 'Fleet Truck 001',
    driverName: 'John Smith',
    eventType: 'Location Update',
    eventDescription: 'Vehicle location updated',
    location: '200 Hudson St, New York, NY',
    speed: 58,
    fuel: 80,
    status: 'active',
  },
  {
    id: 'H-011',
    timestamp: daysAgo(1, 14, 20),
    vehicleName: 'Fleet Van 005',
    driverName: 'David Lee',
    eventType: 'Fuel Update',
    eventDescription: 'Fuel level reported at 18%',
    location: '600 Lexington Ave, New York, NY',
    speed: 50,
    fuel: 18,
    status: 'active',
  },
  {
    id: 'H-012',
    timestamp: daysAgo(1, 11, 5),
    vehicleName: 'Fleet Van 003',
    driverName: 'Mike Wilson',
    eventType: 'Speed Update',
    eventDescription: 'Speed changed to 45 mph',
    location: '450 Broadway, New York, NY',
    speed: 45,
    fuel: 88,
    status: 'active',
  },
  {
    id: 'H-013',
    timestamp: daysAgo(1, 9, 40),
    vehicleName: 'Fleet Truck 008',
    driverName: 'Maria Garcia',
    eventType: 'Location Update',
    eventDescription: 'Vehicle location updated',
    location: '90 Church St, New York, NY',
    speed: 52,
    fuel: 74,
    status: 'active',
  },
  {
    id: 'H-014',
    timestamp: daysAgo(2, 15, 30),
    vehicleName: 'Fleet Truck 002',
    driverName: 'Sarah Johnson',
    eventType: 'Status Change',
    eventDescription: 'Vehicle changed from Active to Maintenance',
    location: '456 Park Ave, New York, NY',
    speed: 0,
    fuel: 48,
    status: 'maintenance',
  },
  {
    id: 'H-015',
    timestamp: daysAgo(2, 13, 10),
    vehicleName: 'Fleet Van 007',
    driverName: 'James Anderson',
    eventType: 'Fuel Update',
    eventDescription: 'Fuel level reported at 62%',
    location: '120 Lafayette St, New York, NY',
    speed: 35,
    fuel: 62,
    status: 'active',
  },
  {
    id: 'H-016',
    timestamp: daysAgo(2, 10, 0),
    vehicleName: 'Fleet Truck 004',
    driverName: 'Emily Brown',
    eventType: 'Speed Update',
    eventDescription: 'Speed changed to 0 mph',
    location: '321 5th Ave, New York, NY',
    speed: 0,
    fuel: 67,
    status: 'idle',
  },
  {
    id: 'H-017',
    timestamp: daysAgo(3, 17, 45),
    vehicleName: 'Fleet Van 009',
    driverName: 'Robert Taylor',
    eventType: 'Status Change',
    eventDescription: 'Vehicle changed from Active to Idle',
    location: '280 Madison Ave, New York, NY',
    speed: 0,
    fuel: 40,
    status: 'idle',
  },
  {
    id: 'H-018',
    timestamp: daysAgo(3, 14, 20),
    vehicleName: 'Fleet Truck 006',
    driverName: 'Lisa Martinez',
    eventType: 'Location Update',
    eventDescription: 'Vehicle location updated',
    location: '100 W 42nd St, New York, NY',
    speed: 0,
    fuel: 90,
    status: 'idle',
  },
  {
    id: 'H-019',
    timestamp: daysAgo(4, 16, 0),
    vehicleName: 'Fleet Truck 001',
    driverName: 'John Smith',
    eventType: 'Alert',
    eventDescription: 'Route deviation detected',
    location: '150 West St, New York, NY',
    speed: 62,
    fuel: 75,
    status: 'active',
  },
  {
    id: 'H-020',
    timestamp: daysAgo(4, 12, 30),
    vehicleName: 'Fleet Van 005',
    driverName: 'David Lee',
    eventType: 'Speed Update',
    eventDescription: 'Speed changed to 60 mph',
    location: '700 Park Ave, New York, NY',
    speed: 60,
    fuel: 25,
    status: 'active',
  },
  {
    id: 'H-021',
    timestamp: daysAgo(5, 11, 15),
    vehicleName: 'Fleet Van 003',
    driverName: 'Mike Wilson',
    eventType: 'Maintenance',
    eventDescription: 'Scheduled service completed',
    location: '789 Broadway, New York, NY',
    speed: 0,
    fuel: 95,
    status: 'active',
  },
  {
    id: 'H-022',
    timestamp: daysAgo(5, 9, 0),
    vehicleName: 'Fleet Truck 008',
    driverName: 'Maria Garcia',
    eventType: 'Speed Update',
    eventDescription: 'Speed changed to 55 mph',
    location: '180 Broadway, New York, NY',
    speed: 55,
    fuel: 68,
    status: 'active',
  },
  {
    id: 'H-023',
    timestamp: daysAgo(6, 18, 30),
    vehicleName: 'Fleet Van 007',
    driverName: 'James Anderson',
    eventType: 'Location Update',
    eventDescription: 'Vehicle location updated',
    location: '250 Lafayette St, New York, NY',
    speed: 40,
    fuel: 58,
    status: 'active',
  },
  {
    id: 'H-024',
    timestamp: daysAgo(6, 15, 0),
    vehicleName: 'Fleet Truck 004',
    driverName: 'Emily Brown',
    eventType: 'Fuel Update',
    eventDescription: 'Fuel level reported at 70%',
    location: '400 5th Ave, New York, NY',
    speed: 35,
    fuel: 70,
    status: 'active',
  },
  {
    id: 'H-025',
    timestamp: daysAgo(7, 14, 45),
    vehicleName: 'Fleet Truck 002',
    driverName: 'Sarah Johnson',
    eventType: 'Alert',
    eventDescription: 'Maintenance due in 2 days',
    location: '456 Park Ave, New York, NY',
    speed: 48,
    fuel: 52,
    status: 'active',
  },
  {
    id: 'H-026',
    timestamp: daysAgo(8, 10, 20),
    vehicleName: 'Fleet Van 009',
    driverName: 'Robert Taylor',
    eventType: 'Fuel Update',
    eventDescription: 'Fuel level reported at 38%',
    location: '350 Madison Ave, New York, NY',
    speed: 42,
    fuel: 38,
    status: 'active',
  },
  {
    id: 'H-027',
    timestamp: daysAgo(9, 16, 10),
    vehicleName: 'Fleet Truck 006',
    driverName: 'Lisa Martinez',
    eventType: 'Speed Update',
    eventDescription: 'Speed changed to 0 mph',
    location: 'Times Square, New York, NY',
    speed: 0,
    fuel: 85,
    status: 'idle',
  },
  {
    id: 'H-028',
    timestamp: daysAgo(10, 13, 0),
    vehicleName: 'Fleet Truck 001',
    driverName: 'John Smith',
    eventType: 'Location Update',
    eventDescription: 'Vehicle location updated',
    location: '123 Main St, New York, NY',
    speed: 0,
    fuel: 82,
    status: 'idle',
  },
  {
    id: 'H-029',
    timestamp: daysAgo(11, 11, 30),
    vehicleName: 'Fleet Van 005',
    driverName: 'David Lee',
    eventType: 'Status Change',
    eventDescription: 'Vehicle changed from Idle to Active',
    location: '555 Lexington Ave, New York, NY',
    speed: 45,
    fuel: 30,
    status: 'active',
  },
  {
    id: 'H-030',
    timestamp: daysAgo(12, 9, 45),
    vehicleName: 'Fleet Van 003',
    driverName: 'Mike Wilson',
    eventType: 'Speed Update',
    eventDescription: 'Speed changed to 50 mph',
    location: '789 Broadway, New York, NY',
    speed: 50,
    fuel: 85,
    status: 'active',
  },
  {
    id: 'H-031',
    timestamp: daysAgo(14, 15, 20),
    vehicleName: 'Fleet Truck 008',
    driverName: 'Maria Garcia',
    eventType: 'Alert',
    eventDescription: 'Speed limit exceeded by 8 mph',
    location: '180 Broadway, New York, NY',
    speed: 68,
    fuel: 65,
    status: 'active',
  },
  {
    id: 'H-032',
    timestamp: daysAgo(15, 12, 0),
    vehicleName: 'Fleet Van 007',
    driverName: 'James Anderson',
    eventType: 'Maintenance',
    eventDescription: 'Tire pressure check completed',
    location: '250 Lafayette St, New York, NY',
    speed: 0,
    fuel: 54,
    status: 'maintenance',
  },
  {
    id: 'H-033',
    timestamp: daysAgo(16, 10, 30),
    vehicleName: 'Fleet Truck 004',
    driverName: 'Emily Brown',
    eventType: 'Location Update',
    eventDescription: 'Vehicle location updated',
    location: '321 5th Ave, New York, NY',
    speed: 28,
    fuel: 72,
    status: 'active',
  },
  {
    id: 'H-034',
    timestamp: daysAgo(18, 14, 15),
    vehicleName: 'Fleet Truck 002',
    driverName: 'Sarah Johnson',
    eventType: 'Fuel Update',
    eventDescription: 'Fuel level reported at 55%',
    location: '456 Park Ave, New York, NY',
    speed: 52,
    fuel: 55,
    status: 'active',
  },
  {
    id: 'H-035',
    timestamp: daysAgo(20, 11, 0),
    vehicleName: 'Fleet Van 009',
    driverName: 'Robert Taylor',
    eventType: 'Speed Update',
    eventDescription: 'Speed changed to 35 mph',
    location: '350 Madison Ave, New York, NY',
    speed: 35,
    fuel: 42,
    status: 'active',
  },
  {
    id: 'H-036',
    timestamp: daysAgo(22, 16, 40),
    vehicleName: 'Fleet Truck 006',
    driverName: 'Lisa Martinez',
    eventType: 'Location Update',
    eventDescription: 'Vehicle location updated',
    location: '100 W 42nd St, New York, NY',
    speed: 0,
    fuel: 80,
    status: 'idle',
  },
  {
    id: 'H-037',
    timestamp: daysAgo(24, 13, 25),
    vehicleName: 'Fleet Truck 001',
    driverName: 'John Smith',
    eventType: 'Fuel Update',
    eventDescription: 'Fuel level reported at 85%',
    location: '123 Main St, New York, NY',
    speed: 60,
    fuel: 85,
    status: 'active',
  },
  {
    id: 'H-038',
    timestamp: daysAgo(26, 9, 50),
    vehicleName: 'Fleet Van 005',
    driverName: 'David Lee',
    eventType: 'Alert',
    eventDescription: 'Low fuel alert triggered',
    location: '555 Lexington Ave, New York, NY',
    speed: 40,
    fuel: 15,
    status: 'active',
  },
  {
    id: 'H-039',
    timestamp: daysAgo(28, 15, 10),
    vehicleName: 'Fleet Van 003',
    driverName: 'Mike Wilson',
    eventType: 'Status Change',
    eventDescription: 'Vehicle changed from Maintenance to Active',
    location: '789 Broadway, New York, NY',
    speed: 38,
    fuel: 90,
    status: 'active',
  },
  {
    id: 'H-040',
    timestamp: daysAgo(29, 11, 35),
    vehicleName: 'Fleet Truck 008',
    driverName: 'Maria Garcia',
    eventType: 'Location Update',
    eventDescription: 'Vehicle location updated',
    location: '180 Broadway, New York, NY',
    speed: 44,
    fuel: 70,
    status: 'active',
  },
];

const vehicleIdByName = Object.fromEntries(mockVehicles.map((vehicle) => [vehicle.name, vehicle.id]));

export const vehicleHistoryRecords: VehicleHistoryRecord[] = rawVehicleHistoryRecords
  .map((record) => ({
    ...record,
    vehicleId: vehicleIdByName[record.vehicleName] ?? '',
  }))
  .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

export function getNewestHistoryRecordIdForVehicle(vehicleId: string): string | undefined {
  return vehicleHistoryRecords.find((record) => record.vehicleId === vehicleId)?.id;
}

export const EVENT_TYPE_OPTIONS = [
  'All Events',
  'Location Update',
  'Speed Update',
  'Fuel Update',
  'Status Change',
  'Maintenance',
  'Alert',
] as const;

export const DATE_RANGE_OPTIONS = [
  { value: '24h', label: 'Last 24 Hours' },
  { value: 'today', label: 'Today' },
  { value: '7days', label: 'Last 7 Days' },
  { value: '30days', label: 'Last 30 Days' },
  { value: 'all', label: 'All Time' },
] as const;

export type DateRangeFilter = (typeof DATE_RANGE_OPTIONS)[number]['value'];

export function isWithinDateRange(timestamp: string, range: DateRangeFilter): boolean {
  if (range === 'all') return true;

  const recordDate = new Date(timestamp);
  const now = new Date();

  if (range === '24h') {
    const cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    return recordDate >= cutoff;
  }

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (range === 'today') {
    return recordDate >= startOfToday;
  }

  const daysBack = range === '7days' ? 7 : 30;
  const cutoff = new Date(startOfToday);
  cutoff.setDate(cutoff.getDate() - daysBack);
  return recordDate >= cutoff;
}

export function getInitialDateRangeFromQuery(): DateRangeFilter {
  const timeRange = new URLSearchParams(window.location.search).get('timeRange');
  if (timeRange === '24h') return '24h';
  return 'all';
}

export function clearVehicleHistoryTimeRangeQuery(): void {
  const url = new URL(window.location.href);
  url.searchParams.delete('timeRange');
  const nextUrl = `${url.pathname}${url.search}${url.hash}`;
  window.history.replaceState(null, '', nextUrl || '/vehicle-history');
}

export function formatHistoryTimestamp(timestamp: string): string {
  return new Date(timestamp).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}
