import React, { useEffect, useState } from 'react';
import { adminService } from '@/services/adminService';
import { AuditLog } from '@/types';
import { Search } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';

export const AdminAuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function loadLogs() {
      try {
        setLoading(true);
        const list = await adminService.getAuditLogs();
        setLogs(list);
      } finally {
        setLoading(false);
      }
    }
    void loadLogs();
  }, []);

  const actionVariantMap: Record<string, 'primary' | 'success' | 'warning' | 'danger' | 'purple' | 'neutral'> = {
    LOGIN: 'primary',
    LOGOUT: 'neutral',
    REGISTER: 'success',
    CREATE_ISSUE: 'warning',
    UPDATE_ISSUE: 'warning',
    ASSIGN_ISSUE: 'purple',
    CHANGE_ROLE: 'danger',
    CHANGE_USER_STATUS: 'danger',
    CREATE_FAQ: 'success',
    UPDATE_FAQ: 'primary',
    DELETE_FAQ: 'danger',
  };

  const filtered = logs.filter((log) => {
    const matchesAction = actionFilter === 'all' || log.action === actionFilter;
    const q = search.toLowerCase().trim();
    const matchesSearch =
      !q ||
      log.actorName.toLowerCase().includes(q) ||
      log.action.toLowerCase().includes(q) ||
      log.entityId.toLowerCase().includes(q);
    return matchesAction && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Security & Audit Event Trail</h1>
        <p className="text-xs text-slate-500 mt-1">
          Immutable log of administrative access, security mutations, and operational activities.
        </p>
      </div>

      <Card className="p-4 flex flex-col sm:flex-row gap-3 justify-between items-center">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search actor, action, entity ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-600 focus:bg-white"
          />
        </div>

        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="bg-slate-50 rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-600"
        >
          <option value="all">All Audit Actions ({logs.length})</option>
          <option value="LOGIN">LOGIN</option>
          <option value="LOGOUT">LOGOUT</option>
          <option value="REGISTER">REGISTER</option>
          <option value="CREATE_ISSUE">CREATE_ISSUE</option>
          <option value="ASSIGN_ISSUE">ASSIGN_ISSUE</option>
          <option value="CHANGE_ROLE">CHANGE_ROLE</option>
          <option value="UPDATE_FAQ">UPDATE_FAQ</option>
        </select>
      </Card>

      {loading ? (
        <div className="py-20 flex justify-center"><Spinner size="lg" /></div>
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Timestamp</th>
                <th className="px-5 py-3.5">Actor</th>
                <th className="px-5 py-3.5">Action</th>
                <th className="px-5 py-3.5">Target Entity</th>
                <th className="px-5 py-3.5">Context Metadata</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {filtered.map((log) => (
                <tr key={log.auditId} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-5 py-3 text-slate-400 text-2xs whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="px-5 py-3 font-sans text-slate-900 font-medium">
                    {log.actorName}
                  </td>
                  <td className="px-5 py-3">
                    <Badge variant={actionVariantMap[log.action] || 'neutral'}>
                      {log.action}
                    </Badge>
                  </td>
                  <td className="px-5 py-3 text-slate-600">
                    <span className="text-slate-400 uppercase text-3xs font-semibold mr-1 font-sans">{log.entityType}</span>
                    <span className="font-semibold text-2xs">#{log.entityId}</span>
                  </td>
                  <td className="px-5 py-3 text-2xs text-slate-500 max-w-xs truncate">
                    {JSON.stringify(log.metadata)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
};
