import { useState, useEffect, type FormEvent } from 'react';
import { ArrowLeft, CheckCircle2, Trash2 } from 'lucide-react';
import { api } from '../../../services/api';
// import { useFleet } from '../../../context/FleetContext';

type RemoveVehicleProps = {
  onBack: () => void;
};

export function RemoveVehicle({ onBack }: RemoveVehicleProps) {
  const [vehicles, setVehicles] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [responseMessage, setResponseMessage] = useState<string | null>(null);
  const [isBackHovered, setIsBackHovered] = useState(false);
  const [isSubmitHovered, setIsSubmitHovered] = useState(false);

  useEffect(() => {
    async function fetchVehicles() {
      const fetchedVehicles = await api.getGroupVehicles();
      setVehicles(Array.isArray(fetchedVehicles) ? fetchedVehicles : []);
    }
    fetchVehicles();
  }, [responseMessage]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setResponseMessage(null);
    setError(null);

    if (!selectedId) {
      setError('Select a vehicle to remove');
      return;
    }

    const deleteResponse = await api.deleteVehicle(selectedId);
    if (deleteResponse == "SUCCESS") {
      setResponseMessage(`Removal Succsessful`);
    } else {
      setResponseMessage("An Error Occurred");
    }
    /*
    const removed = removeVehicle(selectedId);
    if (!removed) {
      setError('Vehicle could not be found');
      return;
    }
    setResponseMessage(
      `${removed.name} (${removed.id}) was removed from Vehicles and Vehicle History.`,
    );
    */
    setSelectedId("");
  };

  return (
    <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
      <div>
        <button
          type="button"
          onClick={onBack}
          className="back-to-settings-btn"
          onMouseEnter={() => setIsBackHovered(true)}
          onMouseLeave={() => setIsBackHovered(false)}
          style={{
            backgroundColor: isBackHovered ? '#aeb6c4' : 'transparent',
            color: isBackHovered ? '#111827' : '#374151',
          }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Settings
        </button>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Remove Vehicle</h1>
        <p className="text-gray-600">
          Permanently remove a vehicle from Vehicles and Vehicle History.
        </p>
      </div>

      <section className="bg-card rounded-lg border border-gray-200 p-4 lg:p-6 max-w-xl">
        {responseMessage && (
          <div className="mb-5 flex items-start gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2.5 text-sm text-green-800">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{responseMessage}</span>
          </div>
        )}

        {vehicles.length === 0 ? (
          <p className="text-sm text-gray-600">
            There are no vehicles in the fleet to remove.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="remove-vehicle" className="mb-1.5 block text-sm text-gray-700">
                Vehicle
              </label>
              <select
                id="remove-vehicle"
                value={selectedId}
                onChange={(e) => {
                  setSelectedId(e.target.value);
                  setError(null);
                }}
                className="w-full rounded-lg border border-gray-700 px-3 py-2 text-sm lg:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a vehicle…</option>
                {vehicles.map((vehicle) => (
                  <option key={vehicle.name} value={vehicle.vehicle_id}>
                    {vehicle.name}{/* — {vehicle.driver}*/}
                  </option>
                ))}
              </select>
              {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
            </div>

            <button
              type="submit"
              className="flex items-center gap-2 rounded-lg px-4 text-sm font-medium text-white transition-colors"
              onMouseEnter={() => setIsSubmitHovered(true)}
              onMouseLeave={() => setIsSubmitHovered(false)}
              style={{
                paddingTop: '0.875rem',
                paddingBottom: '0.875rem',
                backgroundColor: isSubmitHovered ? '#991b1b' : '#b91c1c',
              }}
            >
              <Trash2 className="w-4 h-4 shrink-0" />
              Remove vehicle
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
