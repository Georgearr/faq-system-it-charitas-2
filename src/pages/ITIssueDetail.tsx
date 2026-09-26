import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { issueService } from '@/services/issueService';
import { faqService } from '@/services/faqService';
import { adminService } from '@/services/adminService';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import {
  Issue,
  IssueReply,
  FAQCategory,
  User,
  IssueStatus,
  IssuePriority,
} from '@/types';
import {
  ArrowLeft,
  Shield,
  Send,
  Lock,
  MessageSquare,
  Clock,
  User as UserIcon,
  CheckCircle2,
  Wrench,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Spinner } from '@/components/ui/Spinner';

export const ITIssueDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const { addToast } = useUIStore();

  const [issue, setIssue] = useState<Issue | null>(null);
  const [replies, setReplies] = useState<IssueReply[]>([]);
  const [categories, setCategories] = useState<FAQCategory[]>([]);
  const [staffUsers, setStaffUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Workbench Reply State
  const [replyMode, setReplyMode] = useState<'public' | 'internal'>('public');
  const [messageText, setMessageText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const [issueData, replyList, catList, staffList] = await Promise.all([
        issueService.getIssue(id),
        issueService.getIssueReplies(id),
        faqService.getCategories(),
        adminService.getUsers({ role: 'it_staff' }),
      ]);
      setIssue(issueData);
      setReplies(replyList);
      setCategories(catList);
      setStaffUsers(staffList);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [id]);

  const handleStatusChange = async (newStatus: IssueStatus) => {
    if (!id || !issue) return;
    try {
      const updated = await issueService.updateIssueStatus(id, newStatus);
      setIssue(updated);
      addToast('success', `Status updated to ${newStatus.replace(/_/g, ' ').toUpperCase()}`);
    } catch {
      addToast('error', 'Failed to update status.');
    }
  };

  const handlePriorityChange = async (newPriority: IssuePriority) => {
    if (!id || !issue) return;
    try {
      const updated = await issueService.updateIssuePriority(id, newPriority);
      setIssue(updated);
      addToast('success', `Priority changed to ${newPriority.toUpperCase()}`);
    } catch {
      addToast('error', 'Failed to update priority.');
    }
  };

  const handleAssigneeChange = async (staffId: string) => {
    if (!id || !issue) return;
    try {
      const target = staffId === 'unassigned' ? null : staffId;
      const updated = await issueService.assignIssue(id, target);
      setIssue(updated);
      addToast('success', 'Assignee updated successfully.');
    } catch {
      addToast('error', 'Failed to assign staff.');
    }
  };

  const handleCategoryChange = async (newCatId: string) => {
    if (!id || !issue) return;
    try {
      const updated = await issueService.updateIssueCategory(id, newCatId);
      setIssue(updated);
      addToast('success', 'Category updated.');
    } catch {
      addToast('error', 'Failed to update category.');
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !id) return;

    try {
      setIsSubmitting(true);
      if (replyMode === 'internal') {
        const note = await issueService.addInternalNote(id, messageText.trim());
        setReplies((prev) => [...prev, note]);
        addToast('info', 'Internal note recorded.');
      } else {
        const reply = await issueService.replyToIssue({
          issueId: id,
          message: messageText.trim(),
        });
        setReplies((prev) => [...prev, reply]);
        addToast('success', 'Public reply posted to ticket submitter.');
      }
      setMessageText('');
    } catch (err) {
      addToast('error', err instanceof Error ? err.message : 'Message post failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="text-center py-16 space-y-4">
        <h2 className="text-lg font-bold text-slate-800">Ticket Not Found</h2>
        <Link to="/it/issues">
          <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back to Queue
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Back button */}
      <div>
        <Link
          to="/it/issues"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Ticket Queue</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Details & Conversation (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="space-y-1">
                <span className="text-2xs font-mono text-slate-400">TICKET #{issue.issueId}</span>
                <h1 className="text-xl font-bold text-slate-900 leading-snug">{issue.title}</h1>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Reported Incident</h4>
              <div className="bg-slate-50 rounded-xl p-4 text-xs sm:text-sm text-slate-700 leading-relaxed border border-slate-200 whitespace-pre-line">
                {issue.description}
              </div>
            </div>

            {/* Submitter details */}
            <div className="p-4 bg-slate-50/70 rounded-xl border border-slate-200/60 text-xs grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <span className="text-slate-400 block text-2xs">Reported By:</span>
                <span className="font-semibold text-slate-800">{issue.guestName || 'Hospital User'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-2xs">Contact Email:</span>
                <span className="text-slate-700">{issue.guestEmail || 'None provided'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-2xs">Phone / Ext:</span>
                <span className="text-slate-700">{issue.guestPhone || 'None provided'}</span>
              </div>
            </div>
          </Card>

          {/* Conversation Stream */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-sky-600" />
              <span>Ticket Activity & Thread ({replies.length})</span>
            </h3>

            <div className="space-y-3">
              {replies.map((reply) => {
                const isInternalNote = reply.isInternal;
                const isIT = reply.authorType === 'it_staff';

                return (
                  <div
                    key={reply.replyId}
                    className={`p-4 rounded-xl border transition-all ${
                      isInternalNote
                        ? 'bg-amber-50/80 border-amber-300 text-amber-950 shadow-2xs'
                        : isIT
                        ? 'bg-sky-50/70 border-sky-200 text-slate-900'
                        : 'bg-white border-slate-200 text-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold flex items-center gap-1.5">
                          {isInternalNote ? (
                            <Lock className="w-3.5 h-3.5 text-amber-600" />
                          ) : isIT ? (
                            <Shield className="w-3.5 h-3.5 text-sky-600" />
                          ) : (
                            <UserIcon className="w-3.5 h-3.5 text-slate-500" />
                          )}
                          {reply.authorName}
                        </span>

                        {isInternalNote ? (
                          <Badge variant="warning" size="sm">Internal IT Note (Hidden from User)</Badge>
                        ) : (
                          <Badge variant={isIT ? 'primary' : 'neutral'} size="sm">
                            {isIT ? 'IT Staff' : 'User'}
                          </Badge>
                        )}
                      </div>

                      <span className="text-2xs text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(reply.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line">
                      {reply.message}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* IT Technician Reply & Internal Note Composer */}
            <Card className="p-5 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <button
                  type="button"
                  onClick={() => setReplyMode('public')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    replyMode === 'public'
                      ? 'bg-sky-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Public Reply to User</span>
                </button>
                <button
                  type="button"
                  onClick={() => setReplyMode('internal')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    replyMode === 'internal'
                      ? 'bg-amber-500 text-slate-950 shadow-2xs font-bold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Internal IT Note (Private)</span>
                </button>
              </div>

              <form onSubmit={handleSendMessage} className="space-y-3">
                <Textarea
                  placeholder={
                    replyMode === 'internal'
                      ? 'Record internal hardware serial numbers, technician diagnostic notes, or coordination messages (NEVER visible to ordinary users or guests)...'
                      : 'Provide troubleshooting steps or request clarification from the ticket submitter...'
                  }
                  rows={4}
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  required
                />

                <div className="flex justify-between items-center pt-2">
                  <span className="text-2xs text-slate-400">
                    {replyMode === 'internal'
                      ? '🔒 Protected: Visible only to IT Staff and Administrators.'
                      : '📢 Public: Delivered directly to user view & guest tracker.'}
                  </span>

                  <Button
                    type="submit"
                    variant={replyMode === 'internal' ? 'primary' : 'primary'}
                    size="sm"
                    isLoading={isSubmitting}
                    leftIcon={replyMode === 'internal' ? <Lock className="w-3.5 h-3.5" /> : <Send className="w-3.5 h-3.5" />}
                  >
                    {replyMode === 'internal' ? 'Add Private Note' : 'Send Public Reply'}
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        </div>

        {/* Right Column: Ticket Control Panel (1 col) */}
        <div className="space-y-4">
          <Card title="Technician Control Panel" subtitle="Manage status, assignment & priority" className="p-5 space-y-4">
            {/* Status Control */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Ticket Status</label>
              <Select
                value={issue.status}
                onChange={(e) => void handleStatusChange(e.target.value as IssueStatus)}
              >
                <option value="open">Open (New)</option>
                <option value="assigned">Assigned</option>
                <option value="in_progress">In Progress</option>
                <option value="waiting_for_user">Waiting for User</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </Select>
            </div>

            {/* Assignee Control */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Assigned Technician</label>
              <Select
                value={issue.assignedTo || 'unassigned'}
                onChange={(e) => void handleAssigneeChange(e.target.value)}
              >
                <option value="unassigned">-- Unassigned (Triage) --</option>
                {staffUsers.map((s) => (
                  <option key={s.userId} value={s.userId}>
                    {s.fullName} ({s.displayName})
                  </option>
                ))}
              </Select>
            </div>

            {/* Priority Control */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Priority Level</label>
              <Select
                value={issue.priority}
                onChange={(e) => void handlePriorityChange(e.target.value as IssuePriority)}
              >
                <option value="low">Low (Routine)</option>
                <option value="medium">Medium (Standard)</option>
                <option value="high">High (Elevated)</option>
                <option value="urgent">Urgent (Critical Outage)</option>
              </Select>
            </div>

            {/* Category Control */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">System Category</label>
              <Select
                value={issue.categoryId}
                onChange={(e) => void handleCategoryChange(e.target.value)}
              >
                {categories.map((c) => (
                  <option key={c.categoryId} value={c.categoryId}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </div>

            {/* Quick claim self */}
            {user && issue.assignedTo !== user.userId && (
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-2"
                onClick={() => void handleAssigneeChange(user.userId)}
                leftIcon={<Wrench className="w-3.5 h-3.5" />}
              >
                Reassign to Me ({user.displayName})
              </Button>
            )}

            {/* Quick Mark Resolved */}
            {issue.status !== 'resolved' && (
              <Button
                variant="success"
                size="sm"
                className="w-full"
                onClick={() => void handleStatusChange('resolved')}
                leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
              >
                Mark as Resolved
              </Button>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
