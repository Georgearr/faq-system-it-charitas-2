import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '@/services/authService';
import { useUIStore } from '@/store/uiStore';
import { Hospital, AlertCircle, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useUIStore();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('Inpatient Care');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !password) {
      setErrorMsg('Please complete all mandatory fields.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg(null);
      const res = await authService.registerWithEmail(
        fullName.trim(),
        email.trim(),
        password,
        department
      );
      addToast('success', 'Account created! Please verify your email with the 6-digit code. (Mock: 123456)');
      navigate(`/verify?challenge=${res.challengeId}&type=email`);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-6 sm:py-8 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-sky-600 text-white flex items-center justify-center font-bold text-xl shadow-xs mx-auto">
          <Hospital className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Staff Account Registration</h1>
        <p className="text-xs text-slate-500">
          Create an account to manage tickets and receive IT notifications.
        </p>
      </div>

      <Card className="p-6 sm:p-8 space-y-5">
        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <Input
            label="Full Name *"
            placeholder="e.g. Maria Fransiska"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />

          <Input
            label="Hospital Email *"
            type="email"
            placeholder="e.g. maria@charitas.org"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            label="Phone / WhatsApp Number"
            placeholder="+62 8..."
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <Select
            label="Clinical / Hospital Department *"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            required
          >
            <option value="Inpatient Care">Inpatient Care (Rawat Inap)</option>
            <option value="Outpatient Polyclinic">Outpatient Polyclinic (Rawat Jalan)</option>
            <option value="Emergency Department">Emergency Department (IGD)</option>
            <option value="Intensive Care (ICU/ICCU)">Intensive Care (ICU / ICCU)</option>
            <option value="Pharmacy">Hospital Pharmacy</option>
            <option value="Laboratory & Pathology">Clinical Laboratory</option>
            <option value="Radiology & Imaging">Radiology & PACS</option>
            <option value="Administration & Billing">Administration & Finance</option>
          </Select>

          <Input
            label="Create Password *"
            type="password"
            placeholder="At least 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Input
            label="Confirm Password *"
            type="password"
            placeholder="Repeat password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={loading}
            className="w-full mt-2"
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Create Account & Verify
          </Button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-3 border-t border-slate-100">
          <span>Already registered? </span>
          <Link to="/login" className="font-semibold text-sky-600 hover:text-sky-700">
            Sign In here
          </Link>
        </div>
      </Card>
    </div>
  );
};
