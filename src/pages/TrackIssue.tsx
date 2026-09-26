import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { issueService } from '@/services/issueService';
import { faqService } from '@/services/faqService';
import { Issue, IssueReply, FAQCategory } from '@/types';
import { useUIStore } from '@/store/uiStore';
import { FileSearch, Send, MessageSquare, Clock, User as UserIcon, Shield, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';

export const TrackIssue: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialId = searchParams.get('id') || '';
  const initialToken = searchParams.get('token') || '';

  const [issueId, setIssueId] = useState(initialId);
  const [guestToken, setGuestToken] = useState(initialToken);
  const [issue, setIssue] = useState<Issue | null>(null);
  const [replies, setReplies] = useState<IssueReply[]>([]);
  const [categories, setCategories] = useState<FAQCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [searched, setSearched] = useState(false);
  const { addToast } = useUIStore();

  useEffect(() => {
    async function loadCategories() {
      const cats = await faqService.getCategories();
      setCategories(cats);
    }
    void loadCategories();
  }, []);

  useEffect(() => {
    if (initialId) {
      void fetchIssue(initialId, initialToken);
    }
  }, [initialId, initialToken]);

  const fetchIssue = async (id: string, token: string) => {
    if (!id.trim()) return;
    try {
      setLoading(true);
      setSearched(true);
      const [issueData, repliesData] = await Promise.all([
        issueService.getIssue(id.trim(), token.trim() || undefined),
        issueService.getIssueReplies(id.trim(), token.trim() || undefined),
      ]);

      if (issueData) {
        setIssue(issueData);
        setReplies(repliesData);
      } else {
        setIssue(null);
        setReplies([]);
        addToast('error', 'No ticket found matching the provided Ticket ID and Token.');
      }
    } catch (err) {
      setIssue(null);
      setReplies([]);
      addToast('error', err instanceof Error ? err.message : 'Lookup failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueId.trim()) {
      addToast('error', 'Please enter a Ticket ID.');
      return;
    }
    setSearchParams({ id: issueId.trim(), token: guestToken.trim() });
    void fetchIssue(issueId, guestToken);
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !issue) return;

    try {
      setSendingReply(true);
      const newReply = await issueService.replyToIssue({
        issueId: issue.issueId,
        message: replyText.trim(),
        guestToken: guestToken.trim() || undefined,
      });

      setReplies((prev) => [...prev, newReply]);
      setReplyText('');
      addToast('success', 'Your reply has been added to the ticket.');
    } catch (err) {
      addToast('error', err instanceof Error ? err.message : 'Failed to post reply');
    } finally {
      setSendingReply(false);
    }
  };

  const statusVariantMap: Record<string, 'neutral' | 'primary' | 'warning' | 'info' | 'success'> = {
    open: 'warning',
    assigned: 'info',
    in_progress: 'primary',
    waiting_for_user: 'warning',
    resolved: 'success',
    closed: 'neutral',
  };

  const priorityVariantMap: Record<string, 'neutral' | 'info' | 'warning' | 'danger'> = {
    low: 'neutral',
    medium: 'info',
    high: 'warning',
    urgent: 'danger',
  };

  const categoryName = categories.find((c) => c.categoryId === issue?.categoryId)?.name || 'General IT';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Title */}
      <div>
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-600 mb-1">
          <FileSearch className="w-4 h-4" />
          <span>Ticket Tracking</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Track Support Request</h1>
        <p className="text-xs text-slate-500 mt-1">
          Enter your Ticket ID and private tracking token received during ticket submission.
        </p>
      </div>

      {/* Lookup Card */}
      <Card className="p-6">
        <form onSubmit={handleLookup} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Ticket ID *"
              placeholder="e.g. iss_20260926_001"
              value={issueId}
              onChange={(e) => setIssueId(e.target.value)}
              required
            />
            <Input
              label="Guest Token (If submitted as guest)"
              placeholder="e.g. guest_token_er_vital_001"
              value={guestToken}
              onChange={(e) => setGuestToken(e.target.value)}
            />
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={loading}
              leftIcon={<FileSearch className="w-4 h-4" />}
            >
              Lookup Ticket
            </Button>
          </div>
        </form>
      </Card>

      {/* Loading state */}
      {loading && (
        <div className="py-12 flex justify-center">
          <Spinner size="lg" />
        </div>
      )}

      {/* Not found state */}
      {!loading && searched && !issue && (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center space-y-3">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
          <h3 className="text-base font-semibold text-slate-900">Ticket Not Found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Please double-check the Ticket ID and private guest token. If you need help locating your ticket, contact IT Helpdesk ext 1100.
          </p>
        </div>
      )}

      {/* Ticket Details & Conversation */}
      {!loading && issue && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <Card className="p-6 sm:p-8 space-y-6">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant={statusVariantMap[issue.status] || 'neutral'}>
                    Status: {issue.status.replace(/_/g, ' ').toUpperCase()}
                  </Badge>
                  <Badge variant={priorityVariantMap[issue.priority] || 'neutral'}>
                    Priority: {issue.priority.toUpperCase()}
                  </Badge>
                  <Badge variant="neutral">{categoryName}</Badge>
                </div>
                <h2 className="text-xl font-bold text-slate-900 mt-2">{issue.title}</h2>
              </div>
              <div className="text-right text-2xs text-slate-400 shrink-0">
                <div>Ticket ID: #{issue.issueId}</div>
                <div>Submitted: {new Date(issue.createdAt).toLocaleString()}</div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Issue Description</h4>
              <div className="bg-slate-50 rounded-xl p-4 text-xs sm:text-sm text-slate-700 leading-relaxed border border-slate-200/70 whitespace-pre-line">
                {issue.description}
              </div>
            </div>

            {/* Submitter & Assignee info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-slate-50/60 p-4 rounded-xl border border-slate-200/50">
              <div>
                <span className="font-semibold text-slate-500 block">Submitted By:</span>
                <span className="text-slate-800 font-medium">{issue.guestName || 'Hospital Staff'}</span>
                {issue.guestEmail && <span className="text-slate-500 block text-2xs">{issue.guestEmail}</span>}
              </div>
              <div>
                <span className="font-semibold text-slate-500 block">Assigned Technician:</span>
                <span className="text-slate-800 font-medium">
                  {issue.assignedTo ? 'Budi Santoso (IT Support)' : 'Unassigned (In IT Dispatch Queue)'}
                </span>
              </div>
            </div>
          </Card>

          {/* Conversation Stream */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-sky-600" />
              <span>Conversation & IT Updates ({replies.length})</span>
            </h3>

            {replies.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-6 text-center text-xs text-slate-500">
                No replies yet. IT technicians will update this ticket upon review.
              </div>
            ) : (
              <div className="space-y-3">
                {replies.map((reply) => {
                  const isIT = reply.authorType === 'it_staff';
                  return (
                    <div
                      key={reply.replyId}
                      className={`p-4 rounded-xl border transition-all ${
                        isIT
                          ? 'bg-sky-50/60 border-sky-200 text-slate-900 ml-4 sm:ml-8'
                          : 'bg-white border-slate-200 text-slate-900 mr-4 sm:mr-8'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold flex items-center gap-1.5">
                            {isIT ? (
                              <Shield className="w-3.5 h-3.5 text-sky-600" />
                            ) : (
                              <UserIcon className="w-3.5 h-3.5 text-slate-500" />
                            )}
                            {reply.authorName}
                          </span>
                          <Badge variant={isIT ? 'primary' : 'neutral'} size="sm">
                            {isIT ? 'IT Support' : 'User'}
                          </Badge>
                        </div>
                        <span className="text-2xs text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(reply.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                        {reply.message}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Reply Input Form */}
            {issue.status !== 'closed' ? (
              <Card className="p-4 sm:p-6">
                <form onSubmit={handleSendReply} className="space-y-3">
                  <Textarea
                    label="Send a message to IT Support"
                    placeholder="Provide additional details, report workstation changes, or reply to questions..."
                    rows={3}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    required
                  />
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      isLoading={sendingReply}
                      leftIcon={<Send className="w-3.5 h-3.5" />}
                    >
                      Send Reply
                    </Button>
                  </div>
                </form>
              </Card>
            ) : (
              <div className="bg-slate-100 p-4 rounded-xl text-center text-xs text-slate-500 font-medium">
                This ticket has been marked closed. If the problem reoccurs, please submit a new service ticket.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
