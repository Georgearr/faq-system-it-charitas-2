import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { faqService } from '@/services/faqService';
import { issueService } from '@/services/issueService';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { FAQCategory, IssuePriority, Issue } from '@/types';
import { ShieldAlert, CheckCircle2, Copy, ArrowRight, Info, AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';

import { Spinner } from '@/components/ui/Spinner';

export const CreateIssue: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { addToast } = useUIStore();

  const [categories, setCategories] = useState<FAQCategory[]>([]);
  const [loadingCats, setLoadingCats] = useState(true);

  // Form State
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [priority, setPriority] = useState<IssuePriority>('medium');
  const [description, setDescription] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Success result for guest tracking token display
  const [createdIssue, setCreatedIssue] = useState<Issue | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadCats() {
      try {
        const list = await faqService.getCategories();
        setCategories(list);
        if (list.length > 0 && list[0]) {
          setCategoryId(list[0].categoryId);
        }
      } finally {
        setLoadingCats(false);
      }
    }
    void loadCats();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !categoryId) {
      addToast('error', 'Please fill in all required fields.');
      return;
    }

    if (!user && !guestName.trim()) {
      addToast('error', 'Please provide your name or employee identification.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await issueService.createIssue({
        title: title.trim(),
        description: description.trim(),
        categoryId,
        priority,
        guestName: user ? user.fullName : guestName.trim(),
        guestEmail: user ? user.email : guestEmail.trim(),
        guestPhone: user ? (user.phoneNumber || undefined) : guestPhone.trim(),
      });

      addToast('success', 'Ticket successfully submitted to Charitas IT Service Desk!');
      if (user) {
        navigate(`/issues/${res.issueId}`);
      } else {
        setCreatedIssue(res);
      }
    } catch (err) {
      addToast('error', err instanceof Error ? err.message : 'Failed to submit issue');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyGuestToken = () => {
    if (createdIssue?.guestToken) {
      navigator.clipboard.writeText(createdIssue.guestToken);
      setCopied(true);
      addToast('info', 'Private tracking token copied to clipboard.');
      setTimeout(() => setCopied(false), 3000);
    }
  };

  if (createdIssue) {
    return (
      <div className="max-w-2xl mx-auto py-6">
        <Card className="p-8 text-center space-y-6">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-slate-900">Incident Ticket Created!</h2>
            <p className="text-xs text-slate-500">
              Ticket reference: <span className="font-mono font-bold text-slate-800">#{createdIssue.issueId}</span>
            </p>
          </div>

          {/* Guest tracking security card */}
          {createdIssue.guestToken && (
            <div className="bg-sky-50 border border-sky-200 rounded-xl p-5 text-left space-y-3">
              <div className="flex items-center gap-2 text-sky-800 text-xs font-bold uppercase tracking-wider">
                <Info className="w-4 h-4" />
                <span>Your Private Guest Tracking Token</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Save this token to check ticket progress, receive IT technician replies, or submit additional comments without an account.
              </p>
              <div className="flex items-center gap-2 bg-white rounded-lg p-2.5 border border-sky-300">
                <span className="font-mono font-semibold text-xs text-slate-800 flex-1 truncate select-all">
                  {createdIssue.guestToken}
                </span>
                <Button variant="outline" size="sm" onClick={copyGuestToken} leftIcon={<Copy className="w-3.5 h-3.5" />}>
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
            <Link to={`/issues/track?id=${createdIssue.issueId}&token=${createdIssue.guestToken || ''}`}>
              <Button variant="primary" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
                View Ticket Status Now
              </Button>
            </Link>
            <Link to="/">
              <Button variant="secondary" size="md">
                Return to Home
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-600 mb-1">
          <ShieldAlert className="w-4 h-4" />
          <span>Charitas IT Service Desk</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Submit an IT Service Request</h1>
        <p className="text-xs text-slate-500 mt-1">
          {user
            ? `Submitting as authenticated staff member: ${user.fullName} (${user.department})`
            : 'Submitting as guest. You will receive a private tracking token to follow up on your ticket.'}
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="p-6 sm:p-8 space-y-6">
          {/* Clinical emergency alert */}
          <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Life-Critical or Emergency Clinical Systems:</span> For immediate outages in Operating Rooms, Intensive Care, or Emergency admissions, please telephone the IT Emergency Hotline directly at <span className="font-bold underline">Ext 1100</span> in addition to submitting this ticket.
            </div>
          </div>

          {/* Guest Contact Information */}
          {!user && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-b border-slate-100 pb-6">
              <Input
                label="Your Full Name / Title *"
                placeholder="e.g. Nurse Maria / Dr. Robert"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                required
              />
              <Input
                label="Hospital Email (Optional)"
                type="email"
                placeholder="name@charitas.org"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
              />
              <Input
                label="Contact Phone / WhatsApp"
                placeholder="+62 8..."
                value={guestPhone}
                onChange={(e) => setGuestPhone(e.target.value)}
              />
            </div>
          )}

          {/* Category & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {loadingCats ? (
              <div className="py-4"><Spinner size="sm" /></div>
            ) : (
              <Select
                label="System Category *"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                required
              >
                {categories.map((c) => (
                  <option key={c.categoryId} value={c.categoryId}>
                    {c.name}
                  </option>
                ))}
              </Select>
            )}

            <Select
              label="Urgency Level / Priority *"
              value={priority}
              onChange={(e) => setPriority(e.target.value as IssuePriority)}
              required
            >
              <option value="low">Low — Routine inquiry, non-urgent setup</option>
              <option value="medium">Medium — Single workstation issue, workaround available</option>
              <option value="high">High — Clinical department impediment, polyclinic delay</option>
              <option value="urgent">Urgent — Critical system down (ER, ICU, Pharmacy)</option>
            </Select>
          </div>

          {/* Title */}
          <Input
            label="Issue Summary / Subject *"
            placeholder="e.g. Label printer paper jam at Nurse Station 3B"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          {/* Description */}
          <Textarea
            label="Detailed Description *"
            rows={5}
            placeholder="Please detail: 1) Physical location / Ward / Room; 2) Device name or IP if visible; 3) Exact error message displayed; 4) Steps already attempted..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            helperText="Include workstation ID or room numbers for faster on-site dispatch."
          />

          {/* Submit buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <Link to="/">
              <Button type="button" variant="ghost" size="md">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSubmitting}
              leftIcon={<ShieldAlert className="w-4 h-4" />}
            >
              Submit Ticket
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
};
