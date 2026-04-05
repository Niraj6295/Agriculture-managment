import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  LayoutDashboard, Sprout, FlaskConical, Cloud, Droplets, Bell,
  Bot, ScanSearch, Map, FileBarChart2, User,
  ShieldCheck, LogOut, Menu, X, Sun, Moon, Leaf, GraduationCap,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import AlertBadge from './AlertBadge';

const navItems = [
  { to: '/dashboard',      icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/crops',          icon: Sprout,           label: 'My Crops' },
  { to: '/soil',           icon: FlaskConical,      label: 'Soil Data' },
  { to: '/weather',        icon: Cloud,             label: 'Weather' },
  { to: '/irrigation',     icon: Droplets,          label: 'Irrigation' },
  { to: '/alerts',         icon: Bell,              label: 'Alerts',  badge: true },
  { to: '/ai-chat',        icon: Bot,  label: 'AI Chatbot' },
  { to: '/disease-detect', icon: ScanSearch,        label: 'Disease Detect' },
  { to: '/map',            icon: Map,               label: 'Field Map' },
  { to: '/reports',        icon: FileBarChart2,     label: 'Reports' },
  { to: '/profile',        icon: User,              label: 'Profile' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const { dark, toggleDark } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-100 dark:border-gray-700">
        <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center">
          <Leaf className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="font-bold text-gray-900 dark:text-white text-sm">SmartAgri</p>
          <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label, badge }) => {
          if (to === '/admin' && user?.role !== 'admin') return null;
          return (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <Icon className="w-4.5 h-4.5 flex-shrink-0" size={18} />
              <span className="flex-1">{label}</span>
              {badge && <AlertBadge />}
            </NavLink>
          );
        })}
        {user?.role === 'admin' && (
          <NavLink to="/admin" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
            <ShieldCheck size={18} />
            <span>Admin Panel</span>
          </NavLink>
        )}
        {(user?.role === 'expert' || user?.role === 'admin') && (
          <NavLink to="/expert" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
            <GraduationCap size={18} />
            <span>Expert Panel</span>
          </NavLink>
        )}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-gray-100 dark:border-gray-700 space-y-1">
        <button onClick={toggleDark} className="sidebar-link w-full">
          {dark ? <Sun size={18} /> : <Moon size={18} />}
          <span>{dark ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
        <button onClick={handleLogout} className="sidebar-link w-full text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-60 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-700 flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-64 bg-white dark:bg-gray-900 z-10">
            <button className="absolute top-4 right-4" onClick={() => setSidebarOpen(false)}>
              <X size={20} />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-700 px-4 py-3 flex items-center gap-3 lg:px-6">
          <button className="lg:hidden p-1" onClick={() => setSidebarOpen(true)}>
            <Menu size={22} />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{user?.name}</p>
              <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-700 dark:text-primary-300 font-semibold text-sm">
              {user?.name?.[0]?.toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
