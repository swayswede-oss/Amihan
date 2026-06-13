import { LayoutDashboard, Truck, BarChart3, Bell, X, Map, Settings, Clock, LogOut } from 'lucide-react';
import logo from 'figma:asset/d766fe78c0990450ebe81dfc9bafb7412cf8f61d.png';

type SidebarProps = {
  currentView: 'map' | 'dashboard' | 'vehicles' | 'vehicle-history' | 'analytics' | 'alerts' | 'notifications' | 'settings';
  onViewChange: (view: 'map' | 'dashboard' | 'vehicles' | 'vehicle-history' | 'analytics' | 'alerts' | 'notifications' | 'settings') => void;
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
};

export function Sidebar({ currentView, onViewChange, isOpen, onClose, onLogout }: SidebarProps) {
  const menuItems = [
    { id: 'map' as const, label: 'Live Vehicle Map', icon: Map },
    { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'vehicles' as const, label: 'Vehicles', icon: Truck },
    { id: 'vehicle-history' as const, label: 'Vehicle History', icon: Clock },
    { id: 'analytics' as const, label: 'Analytics', icon: BarChart3 },
    { id: 'alerts' as const, label: 'Alerts', icon: Bell },
  ];

  const settingsItems = [
    { id: 'notifications' as const, label: 'Notifications', icon: Bell },
    { id: 'settings' as const, label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 flex flex-col
        transform transition-transform duration-200 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}
      style={{ backgroundColor: '#abbed4', borderRight: '1px solid #9da8c4' }}>
        {/* Mobile close button */}
        <button
          onClick={onClose}
          className="lg:hidden absolute top-4 right-4 p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6" style={{ borderBottom: '1px solid #9da8c4' }}>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Truck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-gray-900">Amihan</h1>
              <p className="text-xs text-gray-500">Fleet Management</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;

              return (
                <li key={item.id}>
                  <button
                    onClick={() => onViewChange(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <nav className="px-4 pb-4">
          <ul className="space-y-2">
            {settingsItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;

              return (
                <li key={item.id}>
                  <button
                    onClick={() => onViewChange(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4" style={{ borderTop: '1px solid #9da8c4' }}>
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-gray-600">JD</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900">John Doe</p>
              <p className="text-xs text-gray-500">Fleet Manager</p>
            </div>
            <button
              onClick={onLogout}
              className="flex-shrink-0 p-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              style={{ backgroundColor: 'transparent' }}
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
