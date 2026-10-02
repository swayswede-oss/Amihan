import { ArrowLeft, MapPin } from 'lucide-react';

type VehicleNoDataProps = {
  vehicleName?: string | null;
  onBack: () => void;
};

export function VehicleNoData({ vehicleName, onBack }: VehicleNoDataProps) {
  const name = vehicleName?.trim() || 'This vehicle';

  return (
    <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
      <div>
        <button
          type="button"
          onClick={onBack}
          className="back-to-settings-btn hover:bg-[#aeb6c4]"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Vehicles
        </button>
        <h2 className="text-gray-900 mb-1">{name}</h2>
        <p className="text-sm lg:text-base text-gray-600">
          No location or trip data has been logged for this vehicle
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-8 lg:p-12 text-center">
        <div
          className="flex items-center justify-center"
          style={{
            width: 48,
            height: 48,
            margin: '0 auto 16px',
            borderRadius: 9999,
            backgroundColor: '#4A5364',
          }}
        >
          <MapPin className="w-5 h-5" style={{ color: '#F1F5F9' }} aria-hidden="true" />
        </div>
        <p className="text-sm lg:text-base text-gray-900 font-medium mb-1">
          No data logged
        </p>
        <p className="text-sm text-gray-600" style={{ maxWidth: 448, margin: '0 auto' }}>
          {name} is on the fleet list, but it has not reported a location or a trip yet.
          The trip map and location history will show up after the first check-in.
        </p>
      </div>
    </div>
  );
}
