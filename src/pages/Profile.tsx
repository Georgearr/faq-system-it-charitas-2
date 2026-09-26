import React from 'react';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import {
  Mail,
  Phone,
  Building,
  ShieldCheck,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export const Profile: React.FC = () => {
  const { user } = useAuthStore();
  const { addToast } = useUIStore();

  const handleToggle2FA = () => {
    addToast('info', 'Two-Factor Authentication configuration will be gated by SMS/Authenticator setup.');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Staff Profile & Credentials</h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage your hospital user information, department, and authentication security methods.
        </p>
      </div>

      {/* Main Profile Info */}
      <Card className="p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-sky-600 text-white flex items-center justify-center font-bold text-2xl shadow-xs">
            {user?.fullName?.charAt(0) || 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">{user?.fullName}</h2>
              <Badge variant={user?.role === 'admin' ? 'purple' : user?.role === 'it_staff' ? 'warning' : 'primary'}>
                {user?.role.toUpperCase()}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{user?.department}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 text-xs">
          <div className="space-y-1">
            <span className="font-semibold text-slate-500 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>Email Address</span>
            </span>
            <div className="flex items-center gap-2">
              <span className="text-slate-800 font-medium">{user?.email}</span>
              {user?.emailVerifiedAt ? (
                <Badge variant="success" size="sm" className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Verified</span>
                </Badge>
              ) : (
                <Badge variant="warning" size="sm">Unverified</Badge>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <span className="font-semibold text-slate-500 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>Mobile Phone</span>
            </span>
            <div className="flex items-center gap-2">
              <span className="text-slate-800 font-medium">{user?.phoneNumber || 'None registered'}</span>
              {user?.phoneVerifiedAt && (
                <Badge variant="success" size="sm" className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Verified</span>
                </Badge>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <span className="font-semibold text-slate-500 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-slate-400" />
              <span>Hospital Department</span>
            </span>
            <div className="text-slate-800 font-medium">{user?.department}</div>
          </div>

          <div className="space-y-1">
            <span className="font-semibold text-slate-500 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Account Created</span>
            </span>
            <div className="text-slate-800 font-medium">
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
            </div>
          </div>
        </div>
      </Card>

      {/* Security Methods */}
      <Card
        title="Authentication & Security Methods"
        subtitle="Configured sign-in providers and second-factor authentication"
        className="p-6 sm:p-8 space-y-4"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center">
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              </div>
              <div>
                <h4 className="text-xs font-semibold text-slate-900">Google Workspace Identity</h4>
                <p className="text-2xs text-slate-500">Sign in using hospital domain Google single-sign-on.</p>
              </div>
            </div>
            <Badge variant={user?.googleLinkedAt ? 'success' : 'neutral'} size="sm">
              {user?.googleLinkedAt ? 'Linked' : 'Not Linked'}
            </Badge>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-slate-900">Two-Factor Authentication (2FA)</h4>
                <p className="text-2xs text-slate-500">Requires verification code confirmation upon login.</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleToggle2FA}>
              {user?.twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
