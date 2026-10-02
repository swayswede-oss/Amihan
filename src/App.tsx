import { useState } from 'react';
import { Sidebar } from './components/Layout/Sidebar';
import { Header } from './components/Layout/Header';
import { Dashboard } from './components/Pages/Dashboard/Dashboard';
import { VehicleList } from './components/Pages/Vehicles/VehicleList';
// import { VehicleDetails } from './components/Pages/Vehicles/VehicleDetails';
import { Analytics } from './components/Pages/Analytics/Analytics';
import { Alerts } from './components/Pages/Alerts/Alerts';
import { Login } from './components/Authentication/Login';
import { ForgotPassword } from './components/Authentication/ForgotPassword';
import { RecentLocationsMap, /*VehicleHistoryMap*/ } from './components/Map/MapView.tsx';
import { VehicleHistory } from './components/Pages/VehicleHistory/VehicleHistory';
import { VehicleTripHistory } from './components/Pages/Vehicles/VehicleTripHistory';
import { VehicleNoData } from './components/Pages/Vehicles/VehicleNoData';
import { VehicleDetailTile} from './components/Pages/Vehicles/VehicleDetailTile.tsx';
import { api } from './services/api';
import { Settings } from './components/Pages/Settings/Settings';
import { AddVehicle } from './components/Pages/Settings/AddVehicle';
import { RemoveVehicle } from './components/Pages/Settings/RemoveVehicle';
import { ProfileSettings } from './components/Pages/Settings/ProfileSettings';
import {
  loadMenuVisibility,
  saveMenuVisibility,
  type MenuVisibility,
  type ToggleableMenuItemId,
} from './components/Layout/menuVisibility';


export type Vehicle = {
  id: string;
  name: string;
  driver: string;
  status: 'active' | 'idle' | 'maintenance' | 'offline';
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  speed: number;
  fuel: number;
  lastUpdate: string;
};

export type UserProfile = {
  name: string;
  position: string;
  email: string;
  phone: string;
  createdAt: string;
};

const defaultUser: UserProfile = {
  name: 'John Doe',
  position: 'Fleet Manager',
  email: 'john.doe@amihan.com',
  phone: '+1 (555) 123-4567',
  createdAt: '2024-03-15T00:00:00.000Z',
};

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authView, setAuthView] = useState<'login' | 'forgot-password'>('login');
  const [currentView, setCurrentView] = useState<'map' | 'dashboard' | 'vehicles' | 'vehicle-history' | 'analytics' | 'alerts' | 'settings' | 'trip-history' | 'no-vehicle-data'>('dashboard');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [focusedVehicleId, setFocusedVehicleId] = useState<string | null>(null);
  const [selectedTrip, setSelectedTrip] = useState<any | null >(null);
  const [noDataVehicleName, setNoDataVehicleName] = useState<string | null>(null);
  const [historyFocusedVehicleId, setHistoryFocusedVehicleId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState<UserProfile>(defaultUser);
  const [menuVisibility, setMenuVisibility] = useState<MenuVisibility>(loadMenuVisibility);

  const handleMenuVisibilityChange = (id: ToggleableMenuItemId, visible: boolean) => {
    setMenuVisibility((current) => {
      const next = { ...current, [id]: visible };
      saveMenuVisibility(next);
      return next;
    });
    if (!visible && currentView === id) {
      setCurrentView('map');
    }
  };

  const handleLogin = async (username: string, password: string) => {
    try {
      const response = await api.login(username, password);
      setUser((prev) => ({
          ...prev,
          name: response.username
      }));
      setIsAuthenticated(true);
      console.log('Login successful:', username);
    } catch (error) {
      console.error("Error:", error);
      alert("Incorrect Credentials. Please Try Again.")
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setAuthView('login');
    setCurrentView('dashboard');
    setFocusedVehicleId(null);
    setHistoryFocusedVehicleId(null);
  };

  const handleZoomIn = (vehicle: Vehicle) => {
    setFocusedVehicleId(vehicle.id);
    setCurrentView('map');
    setSelectedVehicle(null);
    setIsSidebarOpen(false);
  };

  const handleViewHistory = (vehicle: Vehicle) => {
    window.history.replaceState(null, '', '/vehicle-history');
    setHistoryFocusedVehicleId(vehicle.id);
    setCurrentView('vehicle-history');
    setSelectedVehicle(null);
    setIsSidebarOpen(false);
    console.log(vehicle);
  };

  const handleViewAllActivity = () => {
    window.history.pushState(null, '', '/vehicle-history?timeRange=24h');
    setHistoryFocusedVehicleId(null);
    setCurrentView('vehicle-history');
    setIsSidebarOpen(false);
  };

  const showNoVehicleData = (vehicleName?: string | null) => {
    setNoDataVehicleName(vehicleName ?? selectedVehicle?.name ?? null);
    setSelectedTrip(null);
    setSelectedVehicle(null);
    setCurrentView('no-vehicle-data');
    setIsSidebarOpen(false);
  };

  const handleTripSelect = (trip) => {
    if (!trip?.trip_id) {
      showNoVehicleData();
      return;
    }
    setSelectedVehicle(null);
    setCurrentView('trip-history');
    setSelectedTrip(trip);
    console.log(trip);
  }

  /*
  const handleMostRecentTrip = async () => {
    const recentLocs = await api.getRecentVehicleLocations(selectedVehicle.id);
    const recentId = recentLocs[0].trip_id;
    const allTrips = await api.getVehicleTrips(selectedVehicle.id);
    // const mostRecentTrip = await api.getTrip(recentId);
    console.log(allTrips);
  }
  */
  // Show authentication screens if not logged in
  if (!isAuthenticated) {
    if (authView === 'forgot-password') {
      return <ForgotPassword onSwitchToLogin={() => setAuthView('login')} />;
    }
    return (
      <Login
        onLogin={handleLogin}
        onForgotPassword={() => setAuthView('forgot-password')}
      />
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar
        currentView={currentView}
        onViewChange={(view) => {
          setCurrentView(view);
          if (view !== 'map') {
            setFocusedVehicleId(null);
          }
          setHistoryFocusedVehicleId(null);
          if (view === 'vehicle-history') {
            window.history.replaceState(null, '', '/vehicle-history');
          } else {
            window.history.replaceState(null, '', '/');
          }
          setIsSidebarOpen(false);
          setSelectedVehicle(null);
        }}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onLogout={handleLogout}
        user={user}
        menuVisibility={menuVisibility}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {currentView !== 'map' && currentView !== 'trip-history' && (
          <Header onMenuClick={() => setIsSidebarOpen(true)} />
        )}

        {currentView === 'map' && (
          <div className="flex-1 min-h-0 overflow-hidden">
            <RecentLocationsMap
              onViewTripHistory={handleTripSelect}
              onMenuClick={() => setIsSidebarOpen(true)}
            />
          </div>
        )}
        {currentView === 'trip-history' && (
          <div className="flex-1 min-h-0 overflow-hidden">
            <VehicleTripHistory
              trip={selectedTrip}
              onMenuClick={() => setIsSidebarOpen(true)}
            />
          </div>
        )}
        {currentView !== 'map' && currentView !== 'trip-history' && (
          <main className="flex-1 flex flex-col overflow-y-auto">
            {currentView === 'dashboard' && (
              <Dashboard
                onSelectVehicle={setSelectedVehicle}
                onViewAllActivity={handleViewAllActivity}
              />
            )}
            {currentView === 'vehicles' && (
              <VehicleList onSelectVehicle={setSelectedVehicle} />
            )}
            {currentView === 'no-vehicle-data' && (
              <VehicleNoData
                vehicleName={noDataVehicleName}
                onBack={() => {
                  setNoDataVehicleName(null);
                  setCurrentView('vehicles');
                }}
              />
            )}
            {currentView === 'vehicle-history' && (
              <VehicleHistory
                focusedVehicleId={historyFocusedVehicleId}
                onFocusHandled={() => setHistoryFocusedVehicleId(null)}
              />
            )}
            {currentView === 'analytics' && <Analytics />}
            {currentView === 'alerts' && <Alerts />}
            {currentView === 'settings' && (
              <Settings
                onNavigate={(view) => setCurrentView(view)}
                menuVisibility={menuVisibility}
                onMenuVisibilityChange={handleMenuVisibilityChange}
              />
            )}
            {currentView === 'add-vehicle' && (
              <AddVehicle onBack={() => setCurrentView('settings')} currentUser={user.name} />
            )}
            {currentView === 'remove-vehicle' && (
              <RemoveVehicle onBack={() => setCurrentView('settings')} />
            )}
            {currentView === 'profile-settings' && (
              <ProfileSettings
                user={user}
                onSave={setUser}
                onBack={() => setCurrentView('settings')}
              />
            )}
          </main>
        )}
      </div>
      {selectedVehicle && (
        <VehicleDetailTile
          vehicle={selectedVehicle}
          onClose={() => setSelectedVehicle(null)}
          onViewTrip ={handleTripSelect}
          onViewHistory={handleViewHistory}
          onRecentTrip={async () => {
            const vehicleName = selectedVehicle.name;
            const allTrips = await api.getVehicleTrips(selectedVehicle.id);
            if (!Array.isArray(allTrips) || allTrips.length === 0) {
              showNoVehicleData(vehicleName);
              return;
            }
            const sorted = [...allTrips].sort((a, b) => a.idx - b.idx);
            const mostRecentTrip = sorted[sorted.length - 1];
            if (!mostRecentTrip?.trip_id) {
              showNoVehicleData(vehicleName);
              return;
            }
            handleTripSelect(mostRecentTrip);
          }}
        />
      )}
      
    </div>
  );
}
