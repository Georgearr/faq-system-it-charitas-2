import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Users,
  FolderTree,
  HelpCircle,
  History,
  Settings,
  ArrowLeft,
  LogOut,
  LayoutDashboard,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { useAuthStore } from '@/store/authStore';

export const AdminLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const adminNav = [
    { to: '/admin', label: 'Admin Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { to: '/admin/users', label: 'User & Role Access', icon: <Users className="w-4 h-4" /> },
    { to: '/admin/categories', label: 'Issue & FAQ Categories', icon: <FolderTree className="w-4 h-4" /> },
    { to: '/admin/faqs', label: 'Knowledge Base Admin', icon: <HelpCircle className="w-4 h-4" /> },
    { to: '/admin/audit', label: 'Security & Audit Logs', icon: <History className="w-4 h-4" /> },
    { to: '/admin/settings', label: 'System Configuration', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-900 font-sans">
      {/* Admin Topbar */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Admin Brand */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold shadow-xs">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-sm font-bold tracking-tight block">
                  Charitas IT System Administration
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-2xs text-slate-400 font-medium">Enterprise Governance</span>
                  <Badge variant="purple" size="sm">Admin Role</Badge>
                </div>
              </div>
            </div>

            {/* Quick Portals */}
            <div className="flex items-center gap-2">
              <Link
                to="/it"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700 transition-colors"
              >
                <span>IT Workspace</span>
              </Link>
              <Link
                to="/dashboard"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Standard Portal</span>
              </Link>

              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-rose-600/20 text-rose-300 hover:bg-rose-600 hover:text-white border border-rose-500/30 transition-colors cursor-pointer ml-2"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Admin Body with responsive nav */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row gap-6">
        {/* Left Navigation Sidebar */}
        <aside className="w-full md:w-64 shrink-0">
          <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-2xs space-y-1">
            <div className="px-3 py-2 text-2xs font-bold text-slate-400 uppercase tracking-wider">
              Administration
            </div>
            {adminNav.map((item) => {
              const isActive =
                item.to === '/admin'
                  ? location.pathname === '/admin'
                  : location.pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
                    isActive
                      ? 'bg-purple-50 text-purple-700 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <span className={isActive ? 'text-purple-600' : 'text-slate-400'}>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}

            <div className="pt-3 mt-3 border-t border-slate-100 px-3">
              <div className="text-2xs text-slate-400">Logged in as:</div>
              <div className="text-xs font-semibold text-slate-800 truncate mt-0.5">{user?.fullName}</div>
              <div className="text-3xs text-slate-500 truncate">{user?.email}</div>
            </div>
          </div>
        </aside>

        {/* Right Content Area */}
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
