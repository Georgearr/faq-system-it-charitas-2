import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { issueService } from '@/services/issueService';
import { faqService } from '@/services/faqService';
import { adminService } from '@/services/adminService';
import { Issue, FAQCategory, User, IssueStatus } from '@/types';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { Search, Filter, Clock, ArrowRight, UserCheck } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

import { Tabs } from '@/components/ui/Tabs';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';

export const ITIssues: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialAssignee = searchParams.get('assigned') || 'all';

  const { user } = useAuthStore();
  const { addToast } = useUIStore();

  const [issues, setIssues] = useState<Issue[]>([]);
  const [categories, setCategories] = useState<FAQCategory[]>([]);
  const [staffUsers, setStaffUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [activeTab, setActiveTab] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string>(initialAssignee);
  const [search, setSearch] = useState('');

  const loadIssues = async () => {
    try {
      setLoading(true);
      const [issueList, catList, userList] = await Promise.all([
        issueService.getIssues(),
        faqService.getCategories(),
        adminService.getUsers({ role: 'it_staff' }),
      ]);
      setIssues(issueList);
      setCategories(catList);
      setStaffUsers(userList);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadIssues();
  }, []);

  const handleClaim = async (issueId: string) => {
    if (!user) return;
    try {
      await issueService.assignIssue(issueId, user.userId);
      addToast('success', `Ticket assigned to you.`);
      void loadIssues();
    } catch {
      addToast('error', 'Failed to assign ticket.');
    }
  };

  const tabs = [
    { id: 'all', label: 'All Tickets', count: issues.length },
    { id: 'open', label: 'New / Open', count: issues.filter((i) => i.status === 'open').length },
    { id: 'in_progress', label: 'In Progress', count: issues.filter((i) => i.status === 'in_progress' || i.status === 'assigned').length },
    { id: 'waiting_for_user', label: 'Waiting User', count: issues.filter((i) => i.status === 'waiting_for_user').length },
    { id: 'resolved', label: 'Resolved', count: issues.filter((i) => i.status === 'resolved').length },
    { id: 'closed', label: 'Closed', count: issues.filter((i) => i.status === 'closed').length },
  ];

  const filtered = issues.filter((issue) => {
    const matchesTab =
      activeTab === 'all'
        ? true
        : activeTab === 'in_progress'
        ? issue.status === 'in_progress' || issue.status === 'assigned'
        : issue.status === activeTab;

    const matchesPriority = priorityFilter === 'all' || issue.priority === priorityFilter;
    const matchesCategory = categoryFilter === 'all' || issue.categoryId === categoryFilter;

    let matchesAssignee = true;
    if (assigneeFilter === 'unassigned') {
      matchesAssignee = !issue.assignedTo;
    } else if (assigneeFilter === 'me') {
      matchesAssignee = issue.assignedTo === user?.userId;
    } else if (assigneeFilter !== 'all') {
      matchesAssignee = issue.assignedTo === assigneeFilter;
    }

    const q = search.toLowerCase().trim();
    const matchesSearch =
      !q ||
      issue.title.toLowerCase().includes(q) ||
      issue.description.toLowerCase().includes(q) ||
      issue.issueId.toLowerCase().includes(q) ||
      (issue.guestName && issue.guestName.toLowerCase().includes(q));

    return matchesTab && matchesPriority && matchesCategory && matchesAssignee && matchesSearch;
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
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">IT Incident & Request Queue</h1>
          <p className="text-xs text-slate-500 mt-1">
            Dispatch, prioritize, and manage hospital-wide support inquiries.
          </p>
        </div>
      </div>

      {/* Tabs & Filter Bar */}
      <Card className="p-4 space-y-4">
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search keyword or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-600 focus:bg-white"
            />
          </div>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="w-full bg-slate-50 rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-600"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent Only</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full bg-slate-50 rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-600"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.categoryId} value={c.categoryId}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Assignee Filter */}
          <select
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
            className="w-full bg-slate-50 rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-600"
          >
            <option value="all">All Assignees</option>
            <option value="me">Assigned to Me</option>
            <option value="unassigned">Unassigned (Triage)</option>
            {staffUsers.map((s) => (
              <option key={s.userId} value={s.userId}>
                {s.fullName}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {/* Issues Queue Table/Cards */}
      {loading ? (
        <div className="py-20 flex justify-center"><Spinner size="lg" /></div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Filter className="w-10 h-10 text-slate-300" />}
          title="No tickets match the selected filters"
          description="Try broadening your filter criteria or search query."
          action={
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setActiveTab('all');
                setPriorityFilter('all');
                setCategoryFilter('all');
                setAssigneeFilter('all');
                setSearch('');
              }}
            >
              Reset Filters
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((issue) => {
            const catName = categories.find((c) => c.categoryId === issue.categoryId)?.name || 'General';
            const assignedStaff = staffUsers.find((s) => s.userId === issue.assignedTo);

            return (
              <Card key={issue.issueId} className="hover:border-sky-300 transition-colors p-4 sm:p-5">
                <div className="space-y-3">
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

                    <div className="text-2xs text-slate-400 flex items-center gap-2">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Created {new Date(issue.createdAt).toLocaleString()}</span>
                      </span>
                    </div>
                  </div>

                  <Link to={`/it/issues/${issue.issueId}`} className="block group">
                    <h3 className="text-base font-semibold text-slate-900 group-hover:text-sky-600 transition-colors">
                      {issue.title}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                      {issue.description}
                    </p>
                  </Link>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
                    <div className="flex items-center gap-4">
                      <div>
                        <span className="text-slate-400">Reporter: </span>
                        <span className="font-semibold text-slate-700">{issue.guestName || 'Hospital Staff'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Technician: </span>
                        <span className="font-semibold text-slate-700">
                          {assignedStaff ? assignedStaff.fullName : 'Unassigned'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {!issue.assignedTo && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleClaim(issue.issueId)}
                          leftIcon={<UserCheck className="w-3.5 h-3.5" />}
                        >
                          Claim
                        </Button>
                      )}
                      <Link to={`/it/issues/${issue.issueId}`}>
                        <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                          Manage Ticket
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
