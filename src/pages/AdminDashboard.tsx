import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dashboardService } from '@/services/dashboardService';
import { AdminDashboardData } from '@/types';
import { Users, Ticket, HelpCircle, Shield, ArrowRight, CheckCircle2 } from 'lucide-react';
import { StatCard } from '@/components/ui/StatCard';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';

export const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAdminData() {
      try {
        const res = await dashboardService.getAdminDashboard();
        setData(res);
      } finally {
        setLoading(false);
      }
    }
    void loadAdminData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Administration Overview</h1>
        <p className="text-xs text-slate-500 mt-1">
          Hospital-wide IT system metrics, account directories, and operational audit trail.
        </p>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center"><Spinner size="lg" /></div>
      ) : data ? (
        <>
          {/* Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total Registered Users" value={data.totalUsers} icon={<Users className="w-5 h-5" />} variant="purple" />
            <StatCard label="Active Accounts" value={data.activeUsers} icon={<CheckCircle2 className="w-5 h-5" />} variant="emerald" />
            <StatCard label="Total Incident Tickets" value={data.totalIssues} icon={<Ticket className="w-5 h-5" />} variant="sky" />
            <StatCard label="Published FAQs" value={data.totalFAQs} icon={<HelpCircle className="w-5 h-5" />} variant="amber" />
          </div>

          {/* Role Distribution & System Health */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card title="User Role Distribution" subtitle="System authorization hierarchy" className="p-5">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-2.5 bg-purple-50/50 rounded-lg border border-purple-100">
                  <span className="text-xs font-semibold text-purple-900">Administrators</span>
                  <Badge variant="purple">{data.usersByRole.admin || 0}</Badge>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-amber-50/50 rounded-lg border border-amber-100">
                  <span className="text-xs font-semibold text-amber-900">IT Support Staff</span>
                  <Badge variant="warning">{data.usersByRole.it_staff || 0}</Badge>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-sky-50/50 rounded-lg border border-sky-100">
                  <span className="text-xs font-semibold text-sky-900">Hospital Staff (Users)</span>
                  <Badge variant="primary">{data.usersByRole.user || 0}</Badge>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-xs font-semibold text-slate-700">Guests</span>
                  <Badge variant="neutral">{data.usersByRole.guest || 0}</Badge>
                </div>
              </div>
            </Card>

            <Card
              title="Recent Security Audit Logs"
              subtitle="Latest system security actions"
              action={
                <Link to="/admin/audit" className="text-xs font-semibold text-sky-600 hover:underline flex items-center gap-1">
                  <span>Full Audit Trail</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              }
              className="lg:col-span-2 p-5"
            >
              <div className="space-y-2">
                {data.recentAuditLogs.slice(0, 5).map((log) => (
                  <div key={log.auditId} className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 hover:bg-slate-50 text-xs">
                    <div className="flex items-center gap-3">
                      <Shield className="w-4 h-4 text-slate-400" />
                      <div>
                        <span className="font-bold text-slate-800">{log.action}</span>
                        <span className="text-slate-500 text-2xs block">
                          By {log.actorName} on {log.entityType} #{log.entityId}
                        </span>
                      </div>
                    </div>
                    <span className="text-2xs text-slate-400">
                      {new Date(log.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </>
      ) : null}
    </div>
  );
};
