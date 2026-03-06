import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
    LayoutDashboard, Receipt, Tags, Settings as SettingsIcon,
    LogOut, Sun, Moon, CreditCard as CardIcon, BarChart3
} from 'lucide-react';

export const Layout: React.FC = () => {
    const { user, logout, updateTheme } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    if (!user) return null;

    return (
        <div className="layout-container">
            <aside className="sidebar glass-panel">
                <div className="sidebar-header">
                    <div className="logo flex items-center gap-2">
                        <div className="logo-icon bg-primary text-white p-2 rounded-xl shadow-glow">GP</div>
                        <h2 className="font-bold text-xl tracking-tight">GestorPro</h2>
                    </div>
                </div>

                <nav className="sidebar-nav mt-6">
                    <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <LayoutDashboard size={20} /> Dashboard
                    </NavLink>
                    <NavLink to="/transactions" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <Receipt size={20} /> Lançamentos
                    </NavLink>
                    <NavLink to="/credit-cards" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <CardIcon size={20} /> Cartões
                    </NavLink>
                    <NavLink to="/categories" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <Tags size={20} /> Categorias
                    </NavLink>
                    <NavLink to="/reports" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <BarChart3 size={20} /> Relatórios
                    </NavLink>
                    <NavLink to="/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <SettingsIcon size={20} /> Configurações
                    </NavLink>
                </nav>

                <div className="sidebar-footer border-t border-color mt-auto pt-4 flex flex-col gap-2">
                    <div className="user-info flex items-center gap-3 p-3 bg-surface/50 rounded-xl mb-2">
                        <div className="avatar bg-primary text-white w-10 h-10 flex items-center justify-center rounded-full font-bold shadow-sm">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="overflow-hidden">
                            <p className="font-bold text-sm truncate">{user.name}</p>
                            <p className="text-xs text-muted truncate">{user.email}</p>
                        </div>
                    </div>
                    <button onClick={() => updateTheme(user.preferences.theme === 'light' ? 'dark' : 'light')} className="btn btn-secondary w-full justify-start py-2.5">
                        {user.preferences.theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                        <span className="ml-2 font-medium">Trocar Tema</span>
                    </button>
                    <button onClick={handleLogout} className="btn text-danger w-full justify-start btn-logout py-2.5 hover:bg-danger/10">
                        <LogOut size={18} /> <span className="ml-2 font-medium">Sair</span>
                    </button>
                </div>
            </aside>

            <main className="main-content">
                <div className="page-wrapper animate-fade-in px-4 py-2">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};
