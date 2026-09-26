import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dashboardService } from '@/services/dashboardService';
import { issueService } from '@/services/issueService';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { ITDashboardData } from '@/types';
import {
  Layers,
  Clock,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  Inbox,
  HelpCircle,
} from 'lucide-react';
import { StatCard } from '@/components/ui/StatCard';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';

export const ITDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { addToast } = useUIStore();
  const [data, setData] = useState<ITDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await dashboardService.getITDashboard();
      setData(res);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const handleClaimIssue = async (e: React.MouseEvent, issueId: string) => {
    e.preventDefault();
    if (!user) return;
    try {
      await issueService.assignIssue(issueId, user.userId);
      addToast('success', `Ticket #${issueId} assigned to you.`);
      void loadData();
    } catch {
      addToast('error', 'Failed to assign ticket.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-slate-900 text-white rounded-xl p-6 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-amber-400">IT Helpdesk Dispatcher</span>
            <span className="text-slate-500">•</span>
            <span className="text-xs text-slate-300">Logged in as {user?.fullName}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">IT Service Queue Dashboard</h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time tracking of incoming hospital IT incidents, unassigned triage queue, and active assignments.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/it/issues">
            <Button variant="primary" size="md" leftIcon={<Layers className="w-4 h-4" />}>
              Open Ticket Queue
            </Button>
          </Link>
          <Link to="/it/faqs">
            <Button variant="secondary" size="md" leftIcon={<HelpCircle className="w-4 h-4" />}>
              Manage FAQs
            </Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center"><Spinner size="lg" /></div>
      ) : data ? (
        <>
          {/* Status Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <StatCard label="New / Open" value={data.totalNew} icon={<Inbox className="w-4 h-4" />} variant="rose" />
            <StatCard label="Assigned" value={data.totalOpen} icon={<Layers className="w-4 h-4" />} variant="amber" />
            <StatCard label="In Progress" value={data.totalInProgress} icon={<Clock className="w-4 h-4" />} variant="sky" />
            <StatCard label="Waiting User" value={data.totalWaitingUser} icon={<AlertTriangle className="w-4 h-4" />} variant="purple" />
            <StatCard label="Resolved" value={data.totalResolved} icon={<CheckCircle2 className="w-4 h-4" />} variant="emerald" />
            <StatCard label="Assigned To Me" value={data.myAssignedCount} icon={<UserCheck className="w-4 h-4" />} variant="sky" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Unassigned Dispatch Triage */}
            <Card
              title="Unassigned Incoming Queue"
              subtitle="Hospital issues pending technician assignment"
              action={
                <Link to="/it/issues?assigned=unassigned" className="text-xs font-semibold text-sky-600 hover:underline">
                  View All ({data.unassignedIssues.length})
                </Link>
              }
              className="p-5"
            >
              {data.unassignedIssues.length === 0 ? (
                <div className="text-center py-10 text-xs text-slate-500">
                  🎉 Queue is clear! No unassigned incoming tickets.
                </div>
              ) : (
                <div className="space-y-3">
                  {data.unassignedIssues.map((issue) => (
                    <div
                      key={issue.issueId}
                      className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-100/60 transition-colors"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Badge variant={issue.priority === 'urgent' ? 'danger' : 'warning'} size="sm">
                            {issue.priority.toUpperCase()}
                          </Badge>
                          <span className="text-2xs font-mono text-slate-400">#{issue.issueId}</span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 truncate">{issue.title}</h4>
                        <div className="text-2xs text-slate-500">
                          From: {issue.guestName || 'Staff'} • {new Date(issue.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => handleClaimIssue(e, issue.issueId)}
                        >
                          Claim Ticket
                        </Button>
                        <Link to={`/it/issues/${issue.issueId}`}>
                          <Button variant="primary" size="sm">
                            Inspect
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* My Active Assignments */}
            <Card
              title="My Assigned Tickets"
              subtitle="Tickets currently assigned to your workbench"
              action={
                <Link to="/it/issues?assigned=me" className="text-xs font-semibold text-sky-600 hover:underline">
                  View All ({data.myAssignedCount})
                </Link>
              }
              className="p-5"
            >
              {data.recentAssignedIssues.length === 0 ? (
                <div className="text-center py-10 text-xs text-slate-500">
                  You have no active tickets assigned right now.
                </div>
              ) : (
                <div className="space-y-3">
                  {data.recentAssignedIssues.map((issue) => (
                    <Link
                      key={issue.issueId}
                      to={`/it/issues/${issue.issueId}`}
                      className="block p-3.5 bg-slate-50 rounded-xl border border-slate-200 hover:border-sky-300 transition-colors space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant={issue.status === 'in_progress' ? 'primary' : 'warning'} size="sm">
                            {issue.status.replace(/_/g, ' ').toUpperCase()}
                          </Badge>
                          <span className="text-2xs font-mono text-slate-400">#{issue.issueId}</span>
                        </div>
                        <span className="text-2xs text-slate-400">
                          {new Date(issue.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{issue.title}</h4>
                      <p className="text-2xs text-slate-500 line-clamp-1">{issue.description}</p>
                    </Link>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </>
      ) : null}
    </div>
  );
};
