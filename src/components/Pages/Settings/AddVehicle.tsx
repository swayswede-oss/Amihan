import { useState, useEffect, type FormEvent } from 'react';
import { ArrowLeft, CheckCircle2, Plus } from 'lucide-react';
import type { Vehicle } from '../../../App';
import { api } from '../../../services/api';
import { v4 as uuidv4} from 'uuid';
// import { useFleet, type CreateVehicleInput } from '../../../context/FleetContext';

type FormErrors = {
  name?: string;
  driver?: string;
  fuel?: string;
};

const STATUS_OPTIONS: Vehicle['status'][] = [
  'idle',
  'active',
  'maintenance',
  'offline',
];

type AddVehicleProps = {
  onBack: () => void;
  currentUser: string
};

export function AddVehicle({ onBack, currentUser }: AddVehicleProps) {
  const [vehicles, setVehicles] = useState([]);
  const [name, setName] = useState('');
  // const [driver, setDriver] = useState('');
  // const [status, setStatus] = useState<Vehicle['status']>('idle');
  // const [address, setAddress] = useState('');
  // const [fuel, setFuel] = useState('100');
  const [errors, setErrors] = useState<FormErrors>({});
  const [responseMessage, setResponseMessage] = useState<string | null>(null);
  const [isBackHovered, setIsBackHovered] = useState(false);
  const [isSubmitHovered, setIsSubmitHovered] = useState(false);

  useEffect(() => {
    async function fetchVehicles() {
      const fetchedVehicles = await api.getUserVehicles();
      const fetchedNames = [];
      for (const v of fetchedVehicles) {
        fetchedNames.push(v.name);
      }
      setVehicles(fetchedNames);
    }
    fetchVehicles();
  }, []);
  
  
  const validate = (): boolean => {
    const nextErrors: FormErrors = {};

    if (!name.trim()) {
      nextErrors.name = 'Vehicle name is required';
    } else if (vehicles.includes(name)) {
      nextErrors.name = 'A vehicle with this name already exists';
    }
    /*
    if (!driver.trim()) {
      nextErrors.driver = 'Driver name is required';
    }

    const fuelValue = Number(fuel);
    if (fuel === '' || Number.isNaN(fuelValue)) {
      nextErrors.fuel = 'Fuel level is required';
    } else if (fuelValue < 0 || fuelValue > 100) {
      nextErrors.fuel = 'Fuel must be between 0 and 100';
    }
    */
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const resetForm = () => {
    setName('');
    // setDriver('');
    // setStatus('idle');
    // setAddress('');
    // setFuel('100');
    setErrors({});
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setResponseMessage(null);

    if (!validate()) return;
    /*
    const input: CreateVehicleInput = {
      name: name.trim(),
      driver: driver.trim(),
      status,
      address: address.trim(),
      fuel: Number(fuel),
    };
    */
    const newVehicle = {
      idx: 0,
      vehicle_id: uuidv4(),
      name: name,
      status: 0,
      username: currentUser
    }
    // const vehicle = await addVehicle(input);
    const newVehicleResponse = await api.addVehicle(newVehicle);
    if (newVehicleResponse == "SUCCESS") {
      setResponseMessage(`${name} added`);
    } else {
       setResponseMessage('An Error Occurred');
       console.log(newVehicleResponse);
    }
    resetForm();
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
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Add Vehicle</h1>
        <p className="text-gray-600">
          Create a new fleet vehicle. It will appear in Vehicles and Vehicle History.
        </p>
      </div>

      <section className="bg-card rounded-lg border border-gray-200 p-4 lg:p-6 max-w-xl">
        {responseMessage && (
          <div className="mb-5 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2.5 text-sm text-green-800 whitespace-nowrap overflow-x-auto">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{responseMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="vehicle-name" className="mb-1.5 block text-sm text-gray-700">
              Vehicle name
            </label>
            <input
              id="vehicle-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Fleet Truck 021"
              className="w-full rounded-lg border border-gray-700 px-3 py-2 text-sm lg:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-600">{errors.name}</p>
            )}
          </div>
          {/*
          <div>
            <label htmlFor="driver-name" className="mb-1.5 block text-sm text-gray-700">
              Driver
            </label>
            <input
              id="driver-name"
              type="text"
              value={driver}
              onChange={(e) => setDriver(e.target.value)}
              placeholder="e.g. Alex Rivera"
              className="w-full rounded-lg border border-gray-700 px-3 py-2 text-sm lg:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.driver && (
              <p className="mt-1 text-xs text-red-600">{errors.driver}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="vehicle-status" className="mb-1.5 block text-sm text-gray-700">
                Initial status
              </label>
              <select
                id="vehicle-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as Vehicle['status'])}
                className="w-full rounded-lg border border-gray-700 px-3 py-2 text-sm lg:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="vehicle-fuel" className="mb-1.5 block text-sm text-gray-700">
                Fuel level (%)
              </label>
              <input
                id="vehicle-fuel"
                type="number"
                min={0}
                max={100}
                value={fuel}
                onChange={(e) => setFuel(e.target.value)}
                className="w-full rounded-lg border border-gray-700 px-3 py-2 text-sm lg:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.fuel && (
                <p className="mt-1 text-xs text-red-600">{errors.fuel}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="vehicle-address" className="mb-1.5 block text-sm text-gray-700">
              Starting location
              <span className="text-gray-500 font-normal"> (optional)</span>
            </label>
            <input
              id="vehicle-address"
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. 1 Market St, San Francisco, CA"
              className="w-full rounded-lg border border-gray-700 px-3 py-2 text-sm lg:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          */}
          <button
            type="submit"
            className="flex items-center gap-2 rounded-lg px-4 text-sm font-medium text-white transition-colors"
            onMouseEnter={() => setIsSubmitHovered(true)}
            onMouseLeave={() => setIsSubmitHovered(false)}
            style={{
              paddingTop: '0.875rem',
              paddingBottom: '0.875rem',
              backgroundColor: isSubmitHovered ? '#166534' : '#15803d',
            }}
          >
            <Plus className="w-4 h-4 shrink-0" />
            Add vehicle
          </button>
        </form>
      </section>
    </div>
  );
}
