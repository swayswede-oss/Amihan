import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { VehicleList } from './components/VehicleList';
import { VehicleDetails } from './components/VehicleDetails';
import { Analytics } from './components/Analytics';
import { Alerts } from './components/Alerts';
import { SignUp } from './components/SignUp';
import { Login } from './components/Login';
import { ForgotPassword } from './components/ForgotPassword';
import { MapView } from './components/MapView';
import { VehicleHistory } from './components/VehicleHistory';
import { api } from './services/api';
import { mockVehicles } from './data/mockData';

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
  const [authView, setAuthView] = useState<'login' | 'signup' | 'forgot-password'>('login');
  const [currentView, setCurrentView] = useState<'map' | 'dashboard' | 'vehicles' | 'vehicle-history' | 'analytics' | 'alerts' | 'settings'>('dashboard');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [focusedVehicleId, setFocusedVehicleId] = useState<string | null>(null);
  const [historyFocusedVehicleId, setHistoryFocusedVehicleId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState<UserProfile>(defaultUser);

  const handleLogin = async (username: string, password: string) => {
    setUser((prev) => ({
      ...prev,
      name: username,
      email: `${username}@amihan.com`,
    }));
    setIsAuthenticated(true);
    console.log('Login successful:', username);
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
  };

  const handleViewAllActivity = () => {
    window.history.pushState(null, '', '/vehicle-history?timeRange=24h');
    setHistoryFocusedVehicleId(null);
    setCurrentView('vehicle-history');
    setIsSidebarOpen(false);
  };

  const handleSignUp = async (username: string, password: string, email: string) => {
    try {
      // Call your backend API
      const response = await api.signUp(username, password, email);
      
      if (response.success) {
        setUser((prev) => ({
          ...prev,
          name: username,
          email,
          createdAt: new Date().toISOString(),
        }));
        setIsAuthenticated(true);
        console.log('Sign up successful:', response.user);
      }
    } catch (error) {
      console.error('Sign up failed:', error);
      // You can show an error message to the user here
      alert('Sign up failed. Please try again.');
    }
  };

  // Show authentication screens if not logged in
  if (!isAuthenticated) {
    if (authView === 'login') {
      return (
        <Login
          onLogin={handleLogin}
          onSwitchToSignUp={() => setAuthView('signup')}
          onForgotPassword={() => setAuthView('forgot-password')}
        />
      );
    }
    if (authView === 'forgot-password') {
      return <ForgotPassword onSwitchToLogin={() => setAuthView('login')} />;
    }
    return <SignUp onSignUp={handleSignUp} onSwitchToLogin={() => setAuthView('login')} />;
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
        }}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onLogout={handleLogout}
        user={user}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setIsSidebarOpen(true)} />

        {currentView === 'map' && (
          <div style={{ height: 'calc(100vh - 64px - 104px)' }} className="overflow-hidden">
            <MapView
              vehicles={mockVehicles}
              onSelectVehicle={setSelectedVehicle}
              focusedVehicleId={focusedVehicleId}
            />
          </div>
        )}
        {currentView !== 'map' && (
          <main className="flex-1 overflow-y-auto">
            {currentView === 'dashboard' && (
              <Dashboard
                onSelectVehicle={setSelectedVehicle}
                onViewAllActivity={handleViewAllActivity}
              />
            )}
            {currentView === 'vehicles' && (
              <VehicleList onSelectVehicle={setSelectedVehicle} />
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
              <div className="p-4 lg:p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Settings</h1>
                <p className="text-gray-600">Application settings and preferences</p>
              </div>
            )}
          </main>
        )}
      </div>

      {selectedVehicle && (
        <VehicleDetails
          vehicle={selectedVehicle}
          onClose={() => setSelectedVehicle(null)}
          onZoomIn={handleZoomIn}
          onViewHistory={handleViewHistory}
        />
      )}
    </div>
  );
}
