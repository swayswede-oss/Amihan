import { ChevronRight, Trash2, Truck, User } from 'lucide-react';

type SettingsProps = {
  onNavigate: (view: 'add-vehicle' | 'remove-vehicle' | 'profile-settings') => void;
};

export function Settings({ onNavigate }: SettingsProps) {
  return (
    <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
      <div>
        <h2 className="text-gray-900 mb-1">Settings</h2>
        <p className="text-sm lg:text-base text-gray-600">
          Application settings and preferences
        </p>
      </div>

      <div className="flex flex-col max-w-xl" style={{ gap: '1.5rem' }}>
        <nav className="bg-card rounded-lg overflow-hidden">
          <button
            type="button"
            onClick={() => onNavigate('add-vehicle')}
            className="settings-menu-item flex w-full items-center gap-3 px-4 text-left hover:bg-gray-50 transition-colors"
          >
            <div className="rounded-lg bg-gray-900 p-2 text-white">
              <Truck className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-gray-900 text-sm lg:text-base">Add Vehicle</p>
              <p className="text-xs lg:text-sm text-gray-600">
                Create a new vehicle for Vehicles and Vehicle History
              </p>
            </div>
            <ChevronRight className="w-5 h-5 shrink-0 text-gray-400" />
          </button>

          <button
            type="button"
            onClick={() => onNavigate('remove-vehicle')}
            className="settings-menu-item flex w-full items-center gap-3 px-4 text-left hover:bg-gray-50 transition-colors"
          >
            <div className="rounded-lg bg-gray-900 p-2 text-white">
              <Trash2 className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-gray-900 text-sm lg:text-base">Remove Vehicle</p>
              <p className="text-xs lg:text-sm text-gray-600">
                Delete a vehicle from Vehicles and Vehicle History
              </p>
            </div>
            <ChevronRight className="w-5 h-5 shrink-0 text-gray-400" />
          </button>
        </nav>
        {/*
        <nav className="bg-card rounded-lg overflow-hidden">
          <button
            type="button"
            onClick={() => onNavigate('profile-settings')}
            className="settings-menu-item flex w-full items-center gap-3 px-4 text-left hover:bg-gray-50 transition-colors"
          >
            <div className="rounded-lg bg-gray-900 p-2 text-white">
              <User className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-gray-900 text-sm lg:text-base">Profile Settings</p>
              <p className="text-xs lg:text-sm text-gray-600">
                Update your name, role, email, and phone number
              </p>
            </div>
            <ChevronRight className="w-5 h-5 shrink-0 text-gray-400" />
          </button>
        </nav>
        */}
      </div>
    </div>
  );
}
