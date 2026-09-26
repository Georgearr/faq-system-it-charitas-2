import React from 'react';
import { Link } from 'react-router-dom';
import { useNotificationStore } from '@/store/notificationStore';
import { Bell, CheckCheck, Clock, Ticket, HelpCircle, Shield, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';

export const NotificationsPage: React.FC = () => {
  const { notifications, markAsRead, markAllAsRead } = useNotificationStore();

  const iconMap = {
    issue_created: <Ticket className="w-4 h-4 text-sky-600" />,
    issue_assigned: <Shield className="w-4 h-4 text-amber-600" />,
    issue_replied: <Ticket className="w-4 h-4 text-emerald-600" />,
    issue_status_changed: <Ticket className="w-4 h-4 text-purple-600" />,
    issue_resolved: <CheckCheck className="w-4 h-4 text-emerald-600" />,
    system_announcement: <HelpCircle className="w-4 h-4 text-blue-600" />,
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Notification Center</h1>
          <p className="text-xs text-slate-500 mt-1">
            System alerts, status changes, and technician replies for your tickets.
          </p>
        </div>

        {notifications.some((n) => !n.readAt) && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => void markAllAsRead()}
            leftIcon={<CheckCheck className="w-3.5 h-3.5" />}
          >
            Mark All as Read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState
          icon={<Bell className="w-10 h-10 text-slate-300" />}
          title="No Notifications"
          description="You're all caught up! You'll receive alerts here when your tickets are updated."
        />
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => {
            const isUnread = !notif.readAt;
            return (
              <Card
                key={notif.notificationId}
                className={`transition-all p-4 ${
                  isUnread ? 'border-sky-300 bg-sky-50/20 shadow-xs' : 'hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                      {iconMap[notif.type] || <Bell className="w-4 h-4 text-slate-500" />}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-slate-900">{notif.title}</h4>
                        {isUnread && (
                          <Badge variant="primary" size="sm">New</Badge>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{notif.message}</p>
                      <div className="flex items-center gap-3 pt-1 text-2xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(notif.createdAt).toLocaleString()}
                        </span>
                        {notif.entityType === 'issue' && (
                          <Link
                            to={`/issues/${notif.entityId}`}
                            onClick={() => void markAsRead(notif.notificationId)}
                            className="text-sky-600 font-semibold hover:underline flex items-center gap-0.5"
                          >
                            <span>Open Ticket</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>

                  {isUnread && (
                    <button
                      onClick={() => void markAsRead(notif.notificationId)}
                      className="text-2xs font-semibold text-slate-400 hover:text-sky-600 shrink-0 cursor-pointer"
                    >
                      Mark read
                    </button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
