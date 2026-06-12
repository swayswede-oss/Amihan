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
import { MapView } from './components/MapView';
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

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authView, setAuthView] = useState<'login' | 'signup'>('login');
  const [currentView, setCurrentView] = useState<'map' | 'dashboard' | 'vehicles' | 'analytics' | 'alerts' | 'notifications' | 'settings'>('dashboard');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogin = async (username: string, password: string) => {
    setIsAuthenticated(true);
    console.log('Login successful:', username);
  };

  const handleSignUp = async (username: string, password: string, email: string) => {
    try {
      // Call your backend API
      const response = await api.signUp(username, password, email);
      
      if (response.success) {
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
      return <Login onLogin={handleLogin} onSwitchToSignUp={() => setAuthView('signup')} />;
    } else {
      return <SignUp onSignUp={handleSignUp} onSwitchToLogin={() => setAuthView('login')} />;
    }
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar 
        currentView={currentView} 
        onViewChange={(view) => {
          setCurrentView(view);
          setIsSidebarOpen(false);
        }} 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setIsSidebarOpen(true)} />

        {currentView === 'map' && (
          <div style={{ height: 'calc(100vh - 64px - 104px)' }} className="overflow-hidden">
            <MapView vehicles={mockVehicles} onSelectVehicle={setSelectedVehicle} />
          </div>
        )}
        {currentView !== 'map' && (
          <main className="flex-1 overflow-y-auto">
            {currentView === 'dashboard' && (
              <Dashboard onSelectVehicle={setSelectedVehicle} />
            )}
            {currentView === 'vehicles' && (
              <VehicleList onSelectVehicle={setSelectedVehicle} />
            )}
            {currentView === 'analytics' && <Analytics />}
            {currentView === 'alerts' && <Alerts />}
            {currentView === 'notifications' && (
              <div className="p-4 lg:p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Notifications</h1>
                <p className="text-gray-600">Your notifications will appear here</p>
              </div>
            )}
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
        />
      )}
    </div>
  );
}
