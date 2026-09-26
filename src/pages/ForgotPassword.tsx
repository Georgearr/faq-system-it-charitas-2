import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '@/services/authService';
import { useUIStore } from '@/store/uiStore';
import { KeyRound, ArrowRight, ArrowLeft, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';

export const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useUIStore();

  const [step, setStep] = useState<1 | 2>(1);
  const [identifier, setIdentifier] = useState('');
  const [challengeId, setChallengeId] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleRequestChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setErrorMsg('Please enter your email or registered phone.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg(null);
      const res = await authService.requestPasswordReset(identifier.trim());
      setChallengeId(res.challengeId);
      setStep(2);
      addToast('info', res.message);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Request failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !newPassword) {
      setErrorMsg('Please complete all fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg(null);
      await authService.resetPassword(challengeId, code.trim(), newPassword);
      addToast('success', 'Password reset successfully. You may now log in.');
      navigate('/login');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Password reset failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-8 sm:py-12 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xl shadow-xs mx-auto">
          <KeyRound className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Account Recovery</h1>
        <p className="text-xs text-slate-500">
          Reset your password using your registered hospital email or phone number.
        </p>
      </div>

      <Card className="p-6 sm:p-8 space-y-6">
        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleRequestChallenge} className="space-y-4">
            <Input
              label="Hospital Email or Phone Number"
              placeholder="e.g. staff@charitas.org"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              helperText="A recovery code will be dispatched if the account is recognized."
            />

            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={loading}
              className="w-full"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Request Recovery Code
            </Button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="bg-sky-50 border border-sky-200 rounded-xl p-3 text-xs text-sky-800 flex items-center justify-between">
              <span className="font-medium">Development test code:</span>
              <Badge variant="primary" className="font-mono text-xs">123456</Badge>
            </div>

            <Input
              label="6-Digit Recovery Code"
              placeholder="123456"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              className="text-center font-mono font-bold tracking-widest text-lg"
            />

            <Input
              label="New Password"
              type="password"
              placeholder="At least 6 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />

            <Input
              label="Confirm New Password"
              type="password"
              placeholder="Repeat new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={loading}
              className="w-full"
              leftIcon={<CheckCircle2 className="w-4 h-4" />}
            >
              Save New Password
            </Button>
          </form>
        )}

        <div className="text-center text-xs text-slate-500 pt-3 border-t border-slate-100">
          <Link to="/login" className="inline-flex items-center gap-1 font-semibold text-slate-600 hover:text-slate-900">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Sign In</span>
          </Link>
        </div>
      </Card>
    </div>
  );
};
