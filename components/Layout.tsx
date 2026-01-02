
import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  HeartHandshake, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Church,
  Home,
  Megaphone,
  ClipboardCheck
} from 'lucide-react';
import { User, ChurchSettings } from '../types';
import { storage } from '../services/storageService';

interface LayoutProps {
  children: React.ReactNode;
  user: User;
  onLogout: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, user, onLogout }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [settings, setSettings] = useState<ChurchSettings | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let isMounted = true;
    const fetchSettings = async () => {
      try {
        const data = await storage.getSettings();
        if (isMounted) {
          setSettings(data);
        }
      } catch (error) {
        console.error("Failed to fetch settings", error);
      }
    };
    fetchSettings();
    return () => { isMounted = false; };
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await storage.logout();
      onLogout();
      navigate('/');
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Users, label: 'Members', path: '/members' },
    { icon: Home, label: 'Families', path: '/families' },
    { icon: Calendar, label: 'Events', path: '/events' },
    { icon: ClipboardCheck, label: 'Attendance', path: '/attendance' },
    { icon: Megaphone, label: 'Announcements', path: '/announcements' },
    { icon: HeartHandshake, label: 'Giving', path: '/giving' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  const churchName = settings?.name || 'Meetcross CRM';

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside 
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center h-16 px-6 border-b border-slate-100 justify-between">
          <div className="flex items-center space-x-3 text-indigo-600 overflow-hidden">
            {settings?.logoUrl ? (
                <img src={settings.logoUrl} alt="Church Logo" className="w-8 h-8 object-contain" />
            ) : (
                <Church size={28} className="flex-shrink-0" />
            )}
            <span className="text-lg font-bold tracking-tight truncate" title={churchName}>
                {churchName}
            </span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-500">
            <X size={24} />
          </button>
        </div>

        <div className="flex flex-col justify-between h-[calc(100%-4rem)] p-4">
          <nav className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-indigo-50 text-indigo-700' 
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                <item.icon size={20} className="mr-3" />
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="border-t border-slate-100 pt-4">
            <div className="flex items-center px-4 mb-4">
              <img 
                src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`} 
                alt="Profile" 
                className="w-10 h-10 rounded-full object-cover border border-slate-200"
              />
              <div className="ml-3 overflow-hidden">
                <p className="text-sm font-medium text-slate-900 truncate">{user.name}</p>
                <p className="text-xs text-slate-500 truncate">{user.role}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut size={20} className="mr-3" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between h-16 px-6 bg-white border-b border-slate-200 lg:hidden">
          <button onClick={() => setSidebarOpen(true)} className="text-slate-600">
            <Menu size={24} />
          </button>
          <span className="font-semibold text-slate-900">
             {navItems.find(i => i.path === location.pathname)?.label || 'Dashboard'}
          </span>
          <div className="w-6" />
        </header>

        <main className="flex-1 overflow-auto p-4 lg:p-8">
          <div className="max-w-7xl mx-auto flex flex-col min-h-full">
            <div className="flex-grow">
              {children}
            </div>
            <footer className="mt-12 py-6 border-t border-slate-200 text-center text-sm text-slate-400">
              Provided by <a href="https://meetcross.com/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-700 font-medium hover:underline">Meetcross CRM</a>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
};

