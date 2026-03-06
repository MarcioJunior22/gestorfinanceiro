import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { FinanceProvider } from './contexts/FinanceContext';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import './styles/global.css';

const AppContent: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="w-full" style={{ minHeight: '100vh', padding: '1rem' }}>
      {user ? (
        <FinanceProvider>
          <Dashboard />
        </FinanceProvider>
      ) : (
        <Login />
      )}
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
