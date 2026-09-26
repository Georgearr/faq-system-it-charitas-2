import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { HelpCircle, ShieldAlert, FileSearch, LogIn, Hospital } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { useAuthStore } from '@/store/authStore';

export const PublicLayout: React.FC = () => {
  const location = useLocation();
  const { user } = useAuthStore();

  const navLinks = [
    { to: '/faq', label: 'FAQ Knowledge Base', icon: <HelpCircle className="w-4 h-4" /> },
    { to: '/issues/new', label: 'Submit Ticket', icon: <ShieldAlert className="w-4 h-4" /> },
    { to: '/issues/track', label: 'Track Ticket', icon: <FileSearch className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Brand Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center font-bold text-lg shadow-xs group-hover:bg-sky-700 transition-colors">
                <Hospital className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-base font-bold text-slate-900 tracking-tight leading-none block">
                  Charitas IT System
                </span>
                <span className="text-xs text-slate-500 font-medium mt-0.5 block">
                  Charitas IT Issue & FAQ Portal
                </span>
              </div>
            </Link>

            {/* Navigation links */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.to;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
                      isActive
                        ? 'bg-sky-50 text-sky-700'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    {link.icon}
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Right Action */}
            <div className="flex items-center gap-2">
              {user ? (
                <div className="flex items-center gap-2">
                  <Link
                    to={user.role === 'admin' ? '/admin' : user.role === 'it_staff' ? '/it' : '/dashboard'}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg bg-sky-600 text-white hover:bg-sky-700 transition-colors"
                  >
                    <span>Dashboard ({user.displayName})</span>
                  </Link>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100 transition-colors"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-2">
          <div>
            © {new Date().getFullYear()} Rumah Sakit Charitas — IT Infrastructure & Medical Informatics
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="neutral">GAS-First Production</Badge>
            <span className="text-slate-400">•</span>
            <span>Emergency IT Ext: 1100</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
