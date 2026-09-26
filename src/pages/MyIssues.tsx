import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { issueService } from '@/services/issueService';
import { faqService } from '@/services/faqService';
import { Issue, FAQCategory, IssueStatus } from '@/types';
import { Search, ShieldAlert, Ticket, Clock, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Tabs } from '@/components/ui/Tabs';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';

export const MyIssues: React.FC = () => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [categories, setCategories] = useState<FAQCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [search, setSearch] = useState<string>('');

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [myIssues, catList] = await Promise.all([
          issueService.getMyIssues(),
          faqService.getCategories(),
        ]);
        setIssues(myIssues);
        setCategories(catList);
      } finally {
        setLoading(false);
      }
    }
    void loadData();
  }, []);

  const tabs = [
    { id: 'all', label: 'All Tickets', count: issues.length },
    { id: 'open', label: 'Open', count: issues.filter((i) => i.status === 'open').length },
    { id: 'in_progress', label: 'In Progress', count: issues.filter((i) => i.status === 'in_progress' || i.status === 'assigned').length },
    { id: 'resolved', label: 'Resolved', count: issues.filter((i) => i.status === 'resolved').length },
    { id: 'closed', label: 'Closed', count: issues.filter((i) => i.status === 'closed').length },
  ];

  const filteredIssues = issues.filter((issue) => {
    const matchesTab =
      activeTab === 'all'
        ? true
        : activeTab === 'in_progress'
        ? issue.status === 'in_progress' || issue.status === 'assigned'
        : issue.status === activeTab;

    const q = search.toLowerCase().trim();
    const matchesSearch =
      !q ||
      issue.title.toLowerCase().includes(q) ||
      issue.description.toLowerCase().includes(q) ||
      issue.issueId.toLowerCase().includes(q);

    return matchesTab && matchesSearch;
  });

  const statusVariantMap: Record<IssueStatus, 'neutral' | 'primary' | 'warning' | 'info' | 'success'> = {
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Support Tickets</h1>
          <p className="text-xs text-slate-500 mt-1">
            Overview of all technical support requests opened from your account.
          </p>
        </div>

        <Link to="/issues/new">
          <Button variant="primary" size="md" leftIcon={<ShieldAlert className="w-4 h-4" />}>
            New Support Ticket
          </Button>
        </Link>
      </div>

      {/* Filter bar */}
      <Card className="p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
          <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} className="w-full sm:w-auto" />

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by subject or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-600 focus:bg-white transition-all shadow-2xs"
            />
          </div>
        </div>
      </Card>

      {/* Listing */}
      {loading ? (
        <div className="py-16 flex justify-center"><Spinner size="lg" /></div>
      ) : filteredIssues.length === 0 ? (
        <EmptyState
          icon={<Ticket className="w-10 h-10 text-slate-300" />}
          title="No support tickets found"
          description={
            search
              ? `No tickets matched "${search}".`
              : 'You have no tickets in this status tab.'
          }
          action={
            <Link to="/issues/new">
              <Button variant="primary" size="sm" leftIcon={<ShieldAlert className="w-4 h-4" />}>
                Create a Ticket
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {filteredIssues.map((issue) => {
            const catName = categories.find((c) => c.categoryId === issue.categoryId)?.name || 'General';
            return (
              <Card key={issue.issueId} className="hover:border-sky-300 transition-colors p-5">
                <Link to={`/issues/${issue.issueId}`} className="block space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant={statusVariantMap[issue.status]}>
                        {issue.status.replace(/_/g, ' ').toUpperCase()}
                      </Badge>
                      <Badge variant={priorityVariantMap[issue.priority] || 'neutral'}>
                        {issue.priority.toUpperCase()}
                      </Badge>
                      <Badge variant="neutral">{catName}</Badge>
                      <span className="text-2xs font-mono text-slate-400">#{issue.issueId}</span>
                    </div>

                    <span className="text-2xs text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Updated {new Date(issue.updatedAt).toLocaleString()}</span>
                    </span>
                  </div>

                  <h3 className="text-base font-semibold text-slate-900 hover:text-sky-600 transition-colors">
                    {issue.title}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {issue.description}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
                    <div>
                      <span>Assigned to: </span>
                      <span className="font-semibold text-slate-700">
                        {issue.assignedTo ? 'Budi (IT Support)' : 'In Dispatch Queue'}
                      </span>
                    </div>

                    <span className="inline-flex items-center gap-1 font-semibold text-sky-600 hover:text-sky-700">
                      <span>Open Conversation</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </Link>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
