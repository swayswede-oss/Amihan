import { useMemo, useState } from 'react';
import { VehicleHistoryFilters } from './VehicleHistoryFilters';
import { VehicleHistorySummaryCards } from './VehicleHistorySummaryCards';
import { VehicleHistoryTable } from './VehicleHistoryTable';
import {
  DateRangeFilter,
  clearVehicleHistoryTimeRangeQuery,
  formatHistoryTimestamp,
  getInitialDateRangeFromQuery,
  isWithinDateRange,
  vehicleHistoryRecords,
} from '../data/vehicleHistoryData';

const DEFAULT_DATE_RANGE: DateRangeFilter = 'all';

type VehicleHistoryProps = {
  focusedVehicleId?: string | null;
  onFocusHandled?: () => void;
};

export function VehicleHistory({
  focusedVehicleId = null,
  onFocusHandled,
}: VehicleHistoryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [eventTypeFilter, setEventTypeFilter] = useState('all');
  const [dateRangeFilter, setDateRangeFilter] = useState<DateRangeFilter>(
    getInitialDateRangeFromQuery,
  );

  const filteredRecords = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    return vehicleHistoryRecords.filter((record) => {
      const matchesSearch =
        !query ||
        record.vehicleName.toLowerCase().includes(query) ||
        record.driverName.toLowerCase().includes(query) ||
        record.location.toLowerCase().includes(query) ||
        record.eventType.toLowerCase().includes(query) ||
        record.eventDescription.toLowerCase().includes(query);

      const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
      const matchesEventType =
        eventTypeFilter === 'all' || record.eventType === eventTypeFilter;
      const matchesDateRange = isWithinDateRange(record.timestamp, dateRangeFilter);

      return matchesSearch && matchesStatus && matchesEventType && matchesDateRange;
    });
  }, [searchQuery, statusFilter, eventTypeFilter, dateRangeFilter]);

  const summary = useMemo(
    () => ({
      totalEvents: filteredRecords.length,
      activeUpdates: filteredRecords.filter((r) => r.status === 'active').length,
      idleEvents: filteredRecords.filter((r) => r.status === 'idle').length,
      maintenanceEvents: filteredRecords.filter((r) => r.status === 'maintenance').length,
    }),
    [filteredRecords],
  );

  const scrollTargetRecordId = useMemo(() => {
    if (!focusedVehicleId) return undefined;
    return filteredRecords.find((record) => record.vehicleId === focusedVehicleId)?.id;
  }, [focusedVehicleId, filteredRecords]);

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    statusFilter !== 'all' ||
    eventTypeFilter !== 'all' ||
    dateRangeFilter !== DEFAULT_DATE_RANGE;

  const handleClearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setEventTypeFilter('all');
    setDateRangeFilter(DEFAULT_DATE_RANGE);
    clearVehicleHistoryTimeRangeQuery();
  };

  const handleDateRangeChange = (value: DateRangeFilter) => {
    setDateRangeFilter(value);
    if (value !== '24h') {
      clearVehicleHistoryTimeRangeQuery();
    }
  };

  const handleExportCsv = () => {
    if (filteredRecords.length === 0) return;

    const headers = [
      'Date / Time',
      'Vehicle',
      'Driver',
      'Event Type',
      'Event Description',
      'Location',
      'Speed (mph)',
      'Fuel (%)',
      'Status',
    ];

    const rows = filteredRecords.map((record) => [
      formatHistoryTimestamp(record.timestamp),
      record.vehicleName,
      record.driverName,
      record.eventType,
      record.eventDescription,
      record.location,
      record.speed.toString(),
      record.fuel.toString(),
      record.status,
    ]);

    const escapeCsv = (value: string) => `"${value.replace(/"/g, '""')}"`;
    const csvContent = [headers, ...rows]
      .map((row) => row.map(escapeCsv).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `vehicle-history-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
      <div>
        <h2 className="text-gray-900 mb-1">Vehicle History</h2>
        <p className="text-sm lg:text-base text-gray-600">
          View historical data and past activity for all vehicles
        </p>
      </div>

      <VehicleHistoryFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        eventTypeFilter={eventTypeFilter}
        onEventTypeChange={setEventTypeFilter}
        dateRangeFilter={dateRangeFilter}
        onDateRangeChange={handleDateRangeChange}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={handleClearFilters}
        onExportCsv={handleExportCsv}
        filteredCount={filteredRecords.length}
      />

      <VehicleHistorySummaryCards
        totalEvents={summary.totalEvents}
        activeUpdates={summary.activeUpdates}
        idleEvents={summary.idleEvents}
        maintenanceEvents={summary.maintenanceEvents}
      />

      <VehicleHistoryTable
        records={filteredRecords}
        focusedVehicleId={focusedVehicleId}
        scrollTargetRecordId={scrollTargetRecordId}
        onFocusHandled={onFocusHandled}
      />
    </div>
  );
}
