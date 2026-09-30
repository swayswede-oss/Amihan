import { BarChart3, Bell, ChevronRight, Clock, LayoutDashboard, Trash2, Truck, User } from 'lucide-react';
import {
  TOGGLEABLE_MENU_ITEMS,
  type MenuVisibility,
  type ToggleableMenuItemId,
} from '../../Layout/menuVisibility';

type SettingsProps = {
  onNavigate: (view: 'add-vehicle' | 'remove-vehicle' | 'profile-settings') => void;
  menuVisibility: MenuVisibility;
  onMenuVisibilityChange: (id: ToggleableMenuItemId, visible: boolean) => void;
};

const MENU_TOGGLE_CONFIG: Record<ToggleableMenuItemId, { label: string; icon: typeof Truck }> = {
  dashboard: { label: 'Dashboard', icon: LayoutDashboard },
  vehicles: { label: 'Vehicles', icon: Truck },
  'vehicle-history': { label: 'Vehicle History', icon: Clock },
  analytics: { label: 'Analytics', icon: BarChart3 },
  alerts: { label: 'Alerts', icon: Bell },
};

export function Settings({ onNavigate, menuVisibility, onMenuVisibilityChange }: SettingsProps) {
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
        <nav className="bg-card rounded-lg overflow-hidden">
          {TOGGLEABLE_MENU_ITEMS.map((id) => {
            const item = MENU_TOGGLE_CONFIG[id];
            const Icon = item.icon;
            const visible = menuVisibility[id];
            return (
              <div
                key={id}
                className="settings-menu-item flex w-full items-center gap-3 px-4"
              >
                <div className="rounded-lg bg-gray-900 p-2 text-white">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-gray-900 text-sm lg:text-base">{item.label}</p>
                  <p className="text-xs lg:text-sm text-gray-600">
                    {visible ? 'Shown in the side menu' : 'Hidden from the side menu'}
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={visible}
                  aria-label={`${visible ? 'Hide' : 'Show'} ${item.label}`}
                  onClick={() => onMenuVisibilityChange(id, !visible)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 44,
                    height: 24,
                    padding: 0,
                    flexShrink: 0,
                    backgroundColor: 'transparent',
                    border: 'none',
                  }}
                >
                  <span
                    style={{
                      position: 'relative',
                      display: 'block',
                      width: 40,
                      height: 22,
                      borderRadius: 9999,
                      border: `1px solid ${visible ? '#8fa6c0' : '#c5ced9'}`,
                      backgroundColor: visible ? '#9aabbf' : '#d0d7e2',
                      transition: 'background-color 0.2s ease, border-color 0.2s ease',
                    }}
                  >
                    <span
                      style={{
                        position: 'absolute',
                        top: 2,
                        left: visible ? 20 : 2,
                        width: 16,
                        height: 16,
                        borderRadius: 9999,
                        backgroundColor: visible ? '#4A5364' : '#f4f6f8',
                        transition: 'left 0.2s ease, background-color 0.2s ease',
                      }}
                    />
                  </span>
                </button>
              </div>
            );
          })}
        </nav>
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
      </div>
    </div>
  );
}
