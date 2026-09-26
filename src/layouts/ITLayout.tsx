import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Layers,
  HelpCircle,
  Wrench,
  ArrowLeft,
  LogOut,
  User as UserIcon,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { useAuthStore } from '@/store/authStore';

export const ITLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const itNavItems = [
    { to: '/it', label: 'IT Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { to: '/it/issues', label: 'Ticket Queue', icon: <Layers className="w-4 h-4" /> },
    { to: '/it/faqs', label: 'Manage FAQs', icon: <HelpCircle className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-900 font-sans">
      {/* IT Topbar */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* IT Title */}
            <div className="flex items-center gap-6">
              <Link to="/it" className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-900 flex items-center justify-center font-bold shadow-xs">
                  <Wrench className="w-5 h-5 text-slate-950" />
                </div>
                <div>
                  <span className="text-sm font-bold tracking-tight block">
                    Charitas IT Service Desk
                  </span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-2xs text-slate-400 font-medium">Technician Workspace</span>
                    <Badge variant="warning" size="sm">Staff Level</Badge>
                  </div>
                </div>
              </Link>

              {/* Navigation */}
              <nav className="hidden md:flex items-center gap-1">
                {itNavItems.map((item) => {
                  const isActive =
                    item.to === '/it'
                      ? location.pathname === '/it'
                      : location.pathname.startsWith(item.to);
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                        isActive
                          ? 'bg-slate-800 text-amber-400 font-bold'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                      }`}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <Link
                to="/dashboard"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Standard Portal</span>
              </Link>

              {user?.role === 'admin' && (
                <Link
                  to="/admin"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition-colors"
                >
                  <span>Admin Panel</span>
                </Link>
              )}

              {/* User badge */}
              <div className="flex items-center gap-2 pl-3 border-l border-slate-700">
                <div className="w-8 h-8 rounded-full bg-slate-800 text-amber-400 flex items-center justify-center font-bold text-xs border border-slate-700">
                  <UserIcon className="w-4 h-4" />
                </div>
                <div className="hidden sm:block text-xs">
                  <div className="font-semibold text-slate-200">{user?.displayName || 'Technician'}</div>
                  <div className="text-3xs text-slate-400 capitalize">{user?.role}</div>
                </div>
                <button
                  onClick={handleLogout}
                  title="Sign out"
                  className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
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
