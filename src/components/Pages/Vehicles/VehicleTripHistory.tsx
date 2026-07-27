import { VehicleHistoryMap } from '../../Map/MapView.tsx';

export function VehicleTripHistory({ trip }) {
  return (
    <div className="h-full min-h-flex flex flex-col">
      <VehicleHistoryMap selectedTrip={trip.trip_id} />
    </div>
  )
}
