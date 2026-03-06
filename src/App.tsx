import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { FinanceProvider } from './contexts/FinanceContext';
import { Login } from './components/Login';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Transactions } from './pages/Transactions';
import { CategoriesPage } from './pages/Categories';
import { CreditCardsPage } from './pages/CreditCards';
import { Reports } from './pages/Reports';
import './styles/global.css';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <FinanceProvider>{children}</FinanceProvider>;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter basename="/gestorfinanceiro">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="transactions" element={<Transactions />} />
            <Route path="credit-cards" element={<CreditCardsPage />} />
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={
              <div className="p-10 animate-fade-in"><h1 className="text-2xl font-bold mb-4">Configurações Avançadas</h1><p className="text-muted">Opções de Exportação em Breve. O tema já pode ser controlado no menu lateral.</p></div>
            } />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
