import React, { useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Ticket,
  HelpCircle,
  Bell,
  User as UserIcon,
  LogOut,
  Hospital,
  ShieldAlert,
  Shield,
  Wrench,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { useAuthStore } from '@/store/authStore';
import { useNotificationStore } from '@/store/notificationStore';

export const AppLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { unreadCount, fetchNotifications } = useNotificationStore();

  useEffect(() => {
    void fetchNotifications();
  }, [fetchNotifications]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { to: '/issues', label: 'My Issues', icon: <Ticket className="w-4 h-4" /> },
    { to: '/faq', label: 'FAQ', icon: <HelpCircle className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo */}
            <div className="flex items-center gap-6">
              <Link to="/dashboard" className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-sky-600 text-white flex items-center justify-center font-bold shadow-xs">
                  <Hospital className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-sm font-bold text-slate-900 tracking-tight leading-none block">
                    Charitas IT Portal
                  </span>
                  <span className="text-xs text-slate-500 font-medium">Internal Hospital Service</span>
                </div>
              </Link>

              {/* Navigation */}
              <nav className="hidden md:flex items-center gap-1">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.to;
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
                        isActive
                          ? 'bg-sky-50 text-sky-700 font-bold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Right section */}
            <div className="flex items-center gap-3">
              <Link
                to="/issues/new"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-sky-600 text-white hover:bg-sky-700 transition-colors shadow-2xs"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>New Ticket</span>
              </Link>

              {/* Staff / Admin Switcher Shortcut */}
              {user && (user.role === 'it_staff' || user.role === 'admin') && (
                <Link
                  to="/it"
                  className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition-colors"
                >
                  <Wrench className="w-3.5 h-3.5 text-amber-600" />
                  <span>IT Staff Queue</span>
                </Link>
              )}
              {user && user.role === 'admin' && (
                <Link
                  to="/admin"
                  className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg bg-purple-50 text-purple-800 border border-purple-200 hover:bg-purple-100 transition-colors"
                >
                  <Shield className="w-3.5 h-3.5 text-purple-600" />
                  <span>Admin Panel</span>
                </Link>
              )}

              {/* Notification icon */}
              <Link
                to="/notifications"
                className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                aria-label="View notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-3xs font-bold rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>

              {/* User Profile & Logout */}
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-left"
                >
                  <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs">
                    <UserIcon className="w-4 h-4 text-slate-600" />
                  </div>
                  <div className="hidden sm:block text-xs">
                    <div className="font-semibold text-slate-900 leading-tight">{user?.displayName || 'User'}</div>
                    <Badge variant={user?.role === 'admin' ? 'purple' : user?.role === 'it_staff' ? 'warning' : 'primary'} size="sm" className="mt-0.5">
                      {user?.role}
                    </Badge>
                  </div>
                </Link>

                <button
                  onClick={handleLogout}
                  title="Sign out"
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>
    </div>
  );
};
