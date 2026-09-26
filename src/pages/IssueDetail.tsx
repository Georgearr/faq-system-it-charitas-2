import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { issueService } from '@/services/issueService';
import { faqService } from '@/services/faqService';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { Issue, IssueReply, FAQCategory } from '@/types';
import {
  ArrowLeft,
  MessageSquare,
  Send,
  Clock,
  User as UserIcon,
  Shield,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { Spinner } from '@/components/ui/Spinner';

export const IssueDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const { addToast } = useUIStore();

  const [issue, setIssue] = useState<Issue | null>(null);
  const [replies, setReplies] = useState<IssueReply[]>([]);
  const [categories, setCategories] = useState<FAQCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (!id) return;
      try {
        setLoading(true);
        const [issueData, repliesData, catList] = await Promise.all([
          issueService.getIssue(id),
          issueService.getIssueReplies(id),
          faqService.getCategories(),
        ]);
        setIssue(issueData);
        setReplies(repliesData);
        setCategories(catList);
      } finally {
        setLoading(false);
      }
    }
    void loadData();
  }, [id]);

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !id) return;

    try {
      setIsSending(true);
      const newReply = await issueService.replyToIssue({
        issueId: id,
        message: replyText.trim(),
      });
      setReplies((prev) => [...prev, newReply]);
      setReplyText('');
      addToast('success', 'Reply posted successfully.');
    } catch (err) {
      addToast('error', err instanceof Error ? err.message : 'Failed to post reply.');
    } finally {
      setIsSending(false);
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
        <h2 className="text-lg font-bold text-slate-800">Support Ticket Not Found</h2>
        <p className="text-xs text-slate-500">The requested ticket does not exist or you lack permission to view it.</p>
        <Link to="/issues">
          <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back to My Tickets
          </Button>
        </Link>
      </div>
    );
  }

  const catName = categories.find((c) => c.categoryId === issue.categoryId)?.name || 'General Support';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back button */}
      <div>
        <Link
          to="/issues"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to My Tickets</span>
        </Link>
      </div>

      {/* Ticket Header & Description Card */}
      <Card className="p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant={statusVariantMap[issue.status] || 'neutral'}>
                {issue.status.replace(/_/g, ' ').toUpperCase()}
              </Badge>
              <Badge variant="neutral">{catName}</Badge>
              <span className="text-2xs font-mono text-slate-400">#{issue.issueId}</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 mt-2">{issue.title}</h1>
          </div>

          <div className="text-right text-2xs text-slate-400 shrink-0">
            <div>Submitted: {new Date(issue.createdAt).toLocaleString()}</div>
            <div>Last Updated: {new Date(issue.updatedAt).toLocaleString()}</div>
          </div>
        </div>

        {/* Description body */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Problem Summary</h3>
          <div className="bg-slate-50 rounded-xl p-4 text-xs sm:text-sm text-slate-700 leading-relaxed border border-slate-200/70 whitespace-pre-line">
            {issue.description}
          </div>
        </div>

        {/* Assigned Staff Info */}
        <div className="flex items-center justify-between bg-slate-50/60 p-3 rounded-xl border border-slate-200/50 text-xs">
          <div className="flex items-center gap-2 text-slate-600">
            <Shield className="w-4 h-4 text-sky-600" />
            <span>Assigned IT Support:</span>
            <span className="font-semibold text-slate-900">
              {issue.assignedTo ? 'Budi Santoso (IT Support)' : 'In Dispatch Queue'}
            </span>
          </div>

          {issue.resolvedAt && (
            <div className="flex items-center gap-1.5 text-emerald-600 font-semibold text-2xs">
              <CheckCircle2 className="w-4 h-4" />
              <span>Resolved on {new Date(issue.resolvedAt).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      </Card>

      {/* Conversation Thread */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-sky-600" />
            <span>Ticket Conversation ({replies.length})</span>
          </h2>
          <span className="text-2xs text-slate-400">All messages encrypted & logged</span>
        </div>

        {replies.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-xs text-slate-500">
            No technician replies yet. The IT service desk has received your ticket and is assessing the report.
          </div>
        ) : (
          <div className="space-y-3">
            {replies.map((reply) => {
              const isIT = reply.authorType === 'it_staff';
              const isMe = reply.authorId === user?.userId;

              return (
                <div
                  key={reply.replyId}
                  className={`p-4 rounded-xl border transition-all ${
                    reply.isInternal
                      ? 'bg-amber-50 border-amber-300 text-amber-900'
                      : isIT
                      ? 'bg-sky-50/70 border-sky-200 text-slate-900 sm:ml-8'
                      : isMe
                      ? 'bg-white border-slate-200 text-slate-900 sm:mr-8'
                      : 'bg-slate-50 border-slate-200 text-slate-800'
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
                        {isIT ? 'IT Staff' : 'User'}
                      </Badge>
                      {reply.isInternal && (
                        <Badge variant="warning" size="sm" className="flex items-center gap-1">
                          <Lock className="w-3 h-3" />
                          <span>Internal Staff Note</span>
                        </Badge>
                      )}
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

        {/* Reply Box */}
        {issue.status !== 'closed' ? (
          <Card className="p-4 sm:p-6">
            <form onSubmit={handleSendReply} className="space-y-3">
              <Textarea
                label="Reply to IT Support"
                placeholder="Type your message, add diagnostic details, or confirm if the issue is solved..."
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
                  isLoading={isSending}
                  leftIcon={<Send className="w-3.5 h-3.5" />}
                >
                  Post Message
                </Button>
              </div>
            </form>
          </Card>
        ) : (
          <div className="bg-slate-100 p-4 rounded-xl text-center text-xs text-slate-500 font-medium">
            This ticket is closed. To report another issue, please create a new ticket.
          </div>
        )}
      </div>
    </div>
  );
};
