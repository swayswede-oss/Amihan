import { Download, Filter, Search, X } from 'lucide-react';
import {
  DATE_RANGE_OPTIONS,
  EVENT_TYPE_OPTIONS,
  DateRangeFilter,
} from '../../../data/vehicleHistoryData';

type VehicleHistoryFiltersProps = {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  eventTypeFilter: string;
  onEventTypeChange: (value: string) => void;
  dateRangeFilter: DateRangeFilter;
  onDateRangeChange: (value: DateRangeFilter) => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  onExportCsv: () => void;
  filteredCount: number;
};

export function VehicleHistoryFilters({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  eventTypeFilter,
  onEventTypeChange,
  dateRangeFilter,
  onDateRangeChange,
  hasActiveFilters,
  onClearFilters,
  onExportCsv,
  filteredCount,
}: VehicleHistoryFiltersProps) {
  const selectClassName =
    'w-full px-3 lg:px-4 py-2 text-sm lg:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white';

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 lg:w-5 lg:h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by vehicle, driver, location, or event..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 lg:pl-10 pr-4 py-2 text-sm lg:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onClearFilters}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <X className="w-4 h-4" />
              Clear Filters
            </button>
          )}
          <button
            type="button"
            onClick={onExportCsv}
            disabled={filteredCount === 0}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 lg:gap-4">
        <div className="flex items-center gap-2 flex-1">
          <Filter className="w-4 h-4 lg:w-5 lg:h-5 text-gray-400 flex-shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
            className={selectClassName}
            aria-label="Filter by status"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="idle">Idle</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>

        <select
          value={eventTypeFilter}
          onChange={(e) => onEventTypeChange(e.target.value)}
          className={`${selectClassName} sm:flex-1`}
          aria-label="Filter by event type"
        >
          {EVENT_TYPE_OPTIONS.map((option) => (
            <option key={option} value={option === 'All Events' ? 'all' : option}>
              {option}
            </option>
          ))}
        </select>

        <select
          value={dateRangeFilter}
          onChange={(e) => onDateRangeChange(e.target.value as DateRangeFilter)}
          className={`${selectClassName} sm:flex-1`}
          aria-label="Filter by date range"
        >
          {DATE_RANGE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
