import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/authService';
import { useUIStore } from '@/store/uiStore';
import { ShieldCheck, RefreshCw, AlertCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';

export const Verify: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const challengeId = searchParams.get('challenge') || '';
  const type = searchParams.get('type') || 'email';

  const { verifyEmail, verifyPhone } = useAuthStore();
  const { addToast } = useUIStore();

  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(60);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [cooldown]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || code.length < 6) {
      setErrorMsg('Please enter the 6-digit verification code.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg(null);
      if (type === 'phone') {
        await verifyPhone(challengeId, code.trim());
      } else {
        await verifyEmail(challengeId, code.trim());
      }
      addToast('success', 'Account verified successfully!');
      navigate('/dashboard');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || !challengeId) return;
    try {
      setResending(true);
      const res = await authService.resendVerification(challengeId);
      addToast('info', res.message);
      setCooldown(60);
    } catch {
      addToast('error', 'Failed to resend code.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-8 sm:py-12 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-xl shadow-xs mx-auto">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Security Verification</h1>
        <p className="text-xs text-slate-500">
          Enter the 6-digit confirmation code dispatched to your {type === 'phone' ? 'phone' : 'email'}.
        </p>
      </div>

      <Card className="p-6 sm:p-8 space-y-6">
        {/* Mock development code helper */}
        <div className="bg-sky-50 border border-sky-200 rounded-xl p-3 text-xs text-sky-800 flex items-center justify-between">
          <span className="font-medium">Development test code:</span>
          <Badge variant="primary" className="font-mono text-xs">123456</Badge>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-4">
          <Input
            label="6-Digit Verification Code"
            placeholder="123456"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            className="text-center text-xl tracking-widest font-mono font-bold"
            required
            autoFocus
          />

          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={loading}
            className="w-full"
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Verify & Continue
          </Button>
        </form>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
          <button
            type="button"
            disabled={cooldown > 0 || resending}
            onClick={handleResend}
            className="flex items-center gap-1.5 font-medium text-sky-600 hover:text-sky-700 disabled:text-slate-400 disabled:cursor-not-allowed cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
            <span>{cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend Code'}</span>
          </button>

          <Link to="/login" className="flex items-center gap-1 text-slate-500 hover:text-slate-800">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Login</span>
          </Link>
        </div>
      </Card>
    </div>
  );
};
