import { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import {
  LayoutDashboard,
  Truck,
  BarChart3,
  Bell,
  X,
  Map,
  Settings,
  Clock,
  LogOut,
  GripVertical,
  type LucideIcon,
} from 'lucide-react';
import { UserProfile } from '../App';
import { ProfileMenu } from './ProfileMenu';

type MenuItemId = 'map' | 'dashboard' | 'vehicles' | 'vehicle-history' | 'analytics' | 'alerts' | 'settings';

type SidebarProps = {
  currentView: MenuItemId;
  onViewChange: (view: MenuItemId) => void;
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  user: UserProfile;
};

const DEFAULT_MENU_ORDER: MenuItemId[] = [
  'map',
  'dashboard',
  'vehicles',
  'vehicle-history',
  'analytics',
  'alerts',
  'settings',
];

const MENU_ITEM_CONFIG: Record<MenuItemId, { label: string; icon: LucideIcon }> = {
  map: { label: 'Live Vehicle Map', icon: Map },
  dashboard: { label: 'Dashboard', icon: LayoutDashboard },
  vehicles: { label: 'Vehicles', icon: Truck },
  'vehicle-history': { label: 'Vehicle History', icon: Clock },
  analytics: { label: 'Analytics', icon: BarChart3 },
  alerts: { label: 'Alerts', icon: Bell },
  settings: { label: 'Settings', icon: Settings },
};

const SIDEBAR_MENU_ORDER_KEY = 'sidebarMenuOrder';

function loadMenuOrder(): MenuItemId[] {
  try {
    const saved = localStorage.getItem(SIDEBAR_MENU_ORDER_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as MenuItemId[];
      const valid = parsed.filter((id) => DEFAULT_MENU_ORDER.includes(id));
      const missing = DEFAULT_MENU_ORDER.filter((id) => !valid.includes(id));
      return [...valid, ...missing];
    }
  } catch {
    // ignore invalid saved order
  }
  return [...DEFAULT_MENU_ORDER];
}

export function Sidebar({ currentView, onViewChange, isOpen, onClose, onLogout, user }: SidebarProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [menuOrder, setMenuOrder] = useState<MenuItemId[]>(loadMenuOrder);

  const handleDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    if (!destination || source.index === destination.index) return;

    const newOrder = Array.from(menuOrder);
    const [reorderedItem] = newOrder.splice(source.index, 1);
    newOrder.splice(destination.index, 0, reorderedItem);

    setMenuOrder(newOrder);
    localStorage.setItem(SIDEBAR_MENU_ORDER_KEY, JSON.stringify(newOrder));
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <div
        className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 flex flex-col
        transform transition-transform duration-200 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}
        style={{ backgroundColor: '#abbed4', borderRight: '1px solid #9da8c4' }}
      >
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
              <p className="text-xs text-gray-600">Fleet Management</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="sidebar-menu">
              {(provided) => (
                <ul
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="space-y-2"
                >
                  {menuOrder.map((id, index) => {
                    const item = MENU_ITEM_CONFIG[id];
                    const Icon = item.icon;
                    const isActive = currentView === id;

                    return (
                      <Draggable key={id} draggableId={id} index={index}>
                        {(provided, snapshot) => (
                          <li
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`flex items-center rounded-lg transition-colors ${
                              snapshot.isDragging
                                ? 'shadow-md ring-2 ring-blue-200 bg-white'
                                : isActive
                                  ? 'bg-blue-50 text-blue-600'
                                  : 'text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            <button
                              onClick={() => onViewChange(id)}
                              className={`flex-1 flex items-center gap-3 px-4 py-3 min-w-0 text-left ${
                                isActive ? 'text-blue-600' : 'text-gray-700'
                              }`}
                            >
                              <Icon className="w-5 h-5 flex-shrink-0" />
                              <span className="truncate">{item.label}</span>
                            </button>
                            <div
                              {...provided.dragHandleProps}
                              className={`flex-shrink-0 px-2 py-3 cursor-grab active:cursor-grabbing ${
                                isActive ? 'text-blue-400' : 'text-gray-400 hover:text-gray-600'
                              }`}
                              aria-label={`Drag to reorder ${item.label}`}
                            >
                              <GripVertical className="w-4 h-4" />
                            </div>
                          </li>
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                </ul>
              )}
            </Droppable>
          </DragDropContext>
        </nav>

        <div className="p-4" style={{ borderTop: '1px solid #9da8c4' }}>
          <div className="flex items-center gap-2">
            <ProfileMenu
              open={isProfileOpen}
              onOpenChange={setIsProfileOpen}
              user={user}
              onProfileSettings={() => {
                setIsProfileOpen(false);
                onViewChange('settings');
              }}
            />
            <button
              onClick={onLogout}
              className="flex-shrink-0 p-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
