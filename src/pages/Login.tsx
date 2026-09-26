import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { Lock, Mail, Phone, Hospital, AlertCircle, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { loginWithEmail, loginWithPhone, loginWithGoogle } = useAuthStore();
  const { addToast } = useUIStore();

  const [authMode, setAuthMode] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMsg('Please enter your email and password.');
      return;
    }
    try {
      setLoading(true);
      setErrorMsg(null);
      await loginWithEmail(email.trim(), password);
      addToast('success', 'Logged in successfully.');
      navigate('/dashboard');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Invalid login credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) {
      setErrorMsg('Please enter your registered phone number.');
      return;
    }
    try {
      setLoading(true);
      setErrorMsg(null);
      const res = await loginWithPhone(phone.trim());
      if (res.challengeId) {
        addToast('info', 'Verification code dispatched to phone. (Mock code: 123456)');
        navigate(`/verify?challenge=${res.challengeId}&type=phone`);
      } else {
        addToast('success', 'Authenticated successfully.');
        navigate('/dashboard');
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Phone authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      await loginWithGoogle('mock_google_token_123');
      addToast('success', 'Authenticated with Google Identity.');
      navigate('/dashboard');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Google authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  // Demo accounts helper
  const fillDemoAccount = (role: 'admin' | 'staff' | 'user') => {
    setAuthMode('email');
    if (role === 'admin') {
      setEmail('admin@charitas.org');
      setPassword('admin123');
    } else if (role === 'staff') {
      setEmail('staff@charitas.org');
      setPassword('staff123');
    } else {
      setEmail('user@charitas.org');
      setPassword('user123');
    }
  };

  return (
    <div className="max-w-md mx-auto py-6 sm:py-10 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-sky-600 text-white flex items-center justify-center font-bold text-xl shadow-xs mx-auto">
          <Hospital className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Hospital Staff Sign In</h1>
        <p className="text-xs text-slate-500">
          Charitas IT Issue & Knowledge Base Management Portal
        </p>
      </div>

      <Card className="p-6 sm:p-8 space-y-6">
        {/* Method Switcher */}
        <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setAuthMode('email');
              setErrorMsg(null);
            }}
            className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              authMode === 'email' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Email</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode('phone');
              setErrorMsg(null);
            }}
            className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              authMode === 'phone' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Phone OTP</span>
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Email Login Form */}
        {authMode === 'email' ? (
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <Input
              label="Hospital Email Address"
              type="email"
              placeholder="e.g. staff@charitas.org"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4" />}
              required
            />

            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="block text-xs font-semibold text-slate-700 tracking-wide">Password</span>
                <Link to="/forgot-password" className="text-2xs font-semibold text-sky-600 hover:text-sky-700">
                  Forgot Password?
                </Link>
              </div>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={<Lock className="w-4 h-4" />}
                required
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={loading}
              className="w-full"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In
            </Button>
          </form>
        ) : (
          /* Phone Login Form */
          <form onSubmit={handlePhoneLogin} className="space-y-4">
            <Input
              label="Registered Mobile Phone Number"
              placeholder="+62 8..."
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              leftIcon={<Phone className="w-4 h-4" />}
              helperText="We'll send a 6-digit verification code to your SMS / WhatsApp."
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={loading}
              className="w-full"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Send 6-Digit Code
            </Button>
          </form>
        )}

        {/* Google Single Sign-On */}
        <div className="relative border-t border-slate-100 pt-5">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-2xs text-slate-400 uppercase tracking-wider">
            Or continue with
          </div>

          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={handleGoogleLogin}
            isLoading={loading}
            className="w-full"
          >
            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
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
            <span>Sign In with Hospital Google Account</span>
          </Button>
        </div>

        {/* Development Demo Quick-Fill Buttons */}
        <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-3 space-y-2 text-2xs">
          <div className="flex items-center justify-between text-slate-500 font-semibold uppercase tracking-wider">
            <span>Development Quick-Login</span>
            <Badge variant="neutral" size="sm">Mock</Badge>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => fillDemoAccount('admin')}
              className="py-1.5 px-2 bg-white rounded border border-slate-200 hover:border-purple-300 hover:bg-purple-50/50 text-slate-700 font-medium transition-colors"
            >
              👑 Admin
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount('staff')}
              className="py-1.5 px-2 bg-white rounded border border-slate-200 hover:border-amber-300 hover:bg-amber-50/50 text-slate-700 font-medium transition-colors"
            >
              🔧 IT Staff
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount('user')}
              className="py-1.5 px-2 bg-white rounded border border-slate-200 hover:border-sky-300 hover:bg-sky-50/50 text-slate-700 font-medium transition-colors"
            >
              👤 Staff User
            </button>
          </div>
        </div>

        {/* Registration Link */}
        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>Don't have an account yet? </span>
          <Link to="/register" className="font-semibold text-sky-600 hover:text-sky-700">
            Create an Account
          </Link>
        </div>
      </Card>
    </div>
  );
};
