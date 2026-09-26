import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dashboardService } from '@/services/dashboardService';
import { useAuthStore } from '@/store/authStore';
import { UserDashboardData } from '@/types';
import {
  Ticket,
  CheckCircle2,
  Bell,
  ShieldAlert,
  ArrowRight,
  HelpCircle,
  Clock,
  Sparkles,
} from 'lucide-react';
import { StatCard } from '@/components/ui/StatCard';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';

export const UserDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [data, setData] = useState<UserDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const res = await dashboardService.getUserDashboard();
        setData(res);
      } finally {
        setLoading(false);
      }
    }
    void loadDashboard();
  }, []);

  const statusVariantMap: Record<string, 'neutral' | 'primary' | 'warning' | 'info' | 'success'> = {
    open: 'warning',
    assigned: 'info',
    in_progress: 'primary',
    waiting_for_user: 'warning',
    resolved: 'success',
    closed: 'neutral',
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-sky-600">Employee Workspace</span>
            <span className="text-slate-300">•</span>
            <span className="text-xs text-slate-500">{user?.department}</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Welcome back, {user?.displayName || 'Staff Member'}!
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track your ongoing IT tickets, review technician answers, or consult hospital procedures.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link to="/issues/new">
            <Button variant="primary" size="md" leftIcon={<ShieldAlert className="w-4 h-4" />}>
              Submit New Ticket
            </Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <Spinner size="lg" />
        </div>
      ) : data ? (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              label="Active Open Tickets"
              value={data.openIssuesCount}
              icon={<Ticket className="w-5 h-5" />}
              variant="amber"
            />
            <StatCard
              label="Resolved Tickets"
              value={data.resolvedIssuesCount}
              icon={<CheckCircle2 className="w-5 h-5" />}
              variant="emerald"
            />
            <StatCard
              label="Unread Notifications"
              value={data.unreadNotificationsCount}
              icon={<Bell className="w-5 h-5" />}
              variant="sky"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Tickets List (2 cols) */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Ticket className="w-4 h-4 text-sky-600" />
                  <span>Your Recent Support Tickets</span>
                </h2>
                <Link to="/issues" className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1">
                  <span>View All</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {data.recentIssues.length === 0 ? (
                <Card className="p-8 text-center text-xs text-slate-500">
                  You currently have no tickets submitted under your account.
                </Card>
              ) : (
                <div className="space-y-3">
                  {data.recentIssues.map((issue) => (
                    <Card key={issue.issueId} className="hover:border-sky-300 transition-colors p-4">
                      <Link to={`/issues/${issue.issueId}`} className="block space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant={statusVariantMap[issue.status] || 'neutral'}>
                              {issue.status.replace(/_/g, ' ').toUpperCase()}
                            </Badge>
                            <span className="text-2xs font-mono text-slate-400">#{issue.issueId}</span>
                          </div>
                          <span className="text-2xs text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(issue.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        <h3 className="text-sm font-semibold text-slate-900 hover:text-sky-600 transition-colors">
                          {issue.title}
                        </h3>

                        <p className="text-xs text-slate-500 line-clamp-1 leading-relaxed">
                          {issue.description}
                        </p>
                      </Link>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Recommended FAQs (1 col) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Helpful Knowledge Articles</span>
                </h2>
              </div>

              <div className="space-y-3">
                {data.recommendedFAQs.map((faq) => (
                  <Card key={faq.faqId} className="p-4 hover:border-sky-300 transition-colors">
                    <Link to={`/faq/${faq.faqId}`} className="block space-y-1">
                      <div className="flex items-center gap-1 text-2xs text-sky-600 font-medium">
                        <HelpCircle className="w-3 h-3" />
                        <span>Self-Service Guide</span>
                      </div>
                      <h4 className="text-xs font-semibold text-slate-900 hover:text-sky-600 transition-colors line-clamp-2">
                        {faq.question}
                      </h4>
                      <p className="text-2xs text-slate-500 line-clamp-2 mt-1">
                        {faq.answer}
                      </p>
                    </Link>
                  </Card>
                ))}

                <Link
                  to="/faq"
                  className="block p-3 rounded-xl border border-dashed border-slate-300 text-center text-xs font-semibold text-slate-600 hover:text-sky-600 hover:border-sky-300 hover:bg-slate-50 transition-all"
                >
                  Browse Full Hospital IT Knowledge Base →
                </Link>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};
