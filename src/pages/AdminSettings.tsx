import React, { useState } from 'react';
import { useUIStore } from '@/store/uiStore';
import { CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export const AdminSettings: React.FC = () => {
  const { addToast } = useUIStore();
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  const scriptProperties = [
    { key: 'GOOGLE_CLIENT_ID', description: 'Google Identity OAuth 2.0 Web Client ID', status: 'Gated / Configured in GAS' },
    { key: 'GOOGLE_CLIENT_SECRET', description: 'Google Identity OAuth Client Secret', status: 'Gated / Secret' },
    { key: 'TWILIO_ACCOUNT_SID', description: 'Twilio SMS & Phone verification SID', status: 'Gated / Secret' },
    { key: 'TWILIO_AUTH_TOKEN', description: 'Twilio Verification API token', status: 'Gated / Secret' },
    { key: 'TWILIO_SERVICE_SID', description: 'Twilio Verify Service SID', status: 'Gated / Secret' },
    { key: 'MAILGUN_API_KEY', description: 'Mailgun transactional email dispatch key', status: 'Gated / Secret' },
    { key: 'MAILGUN_DOMAIN', description: 'Authorized sending domain (e.g. mail.charitas.org)', status: 'Configured' },
    { key: 'DATABASE_SPREADSHEET_ID', description: 'Primary Google Sheets Database ID', status: 'Active (Production Sheet)' },
  ];

  const handleSaveSettings = () => {
    addToast('success', 'System configurations updated.');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Configuration & Script Properties</h1>
        <p className="text-xs text-slate-500 mt-1">
          Review production environment variables, Google Apps Script secrets, and security policies.
        </p>
      </div>

      <div className="space-y-6">
        {/* Runtime Environment Info */}
        <Card title="Runtime Architecture Target" subtitle="Execution environment specification" className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-400 block text-2xs uppercase">Frontend Runtime</span>
              <span className="font-bold text-slate-900">React + Vite + TypeScript</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-400 block text-2xs uppercase">Production Backend</span>
              <span className="font-bold text-slate-900">Google Apps Script (V8)</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-400 block text-2xs uppercase">Primary Persistence</span>
              <span className="font-bold text-slate-900">Google Sheets Database</span>
            </div>
          </div>
        </Card>

        {/* Script Properties Inspection */}
        <Card
          title="Google Apps Script Properties (Secrets Management)"
          subtitle="Required PropertiesService keys for production external integrations"
          className="p-5"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Property Key</th>
                  <th className="px-4 py-3">Purpose</th>
                  <th className="px-4 py-3">Production Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-2xs">
                {scriptProperties.map((prop) => (
                  <tr key={prop.key} className="hover:bg-slate-50/60">
                    <td className="px-4 py-3 font-bold text-slate-900">{prop.key}</td>
                    <td className="px-4 py-3 font-sans text-slate-600">{prop.description}</td>
                    <td className="px-4 py-3 font-sans">
                      <Badge variant="purple" size="sm">{prop.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Operational Security Controls */}
        <Card title="System Operational Controls" subtitle="Emergency and maintenance settings" className="p-5 space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <div className="text-xs font-semibold text-slate-900">Hospital IT Maintenance Mode</div>
              <div className="text-2xs text-slate-500 mt-0.5">
                Temporarily pause new guest ticket submissions during major HIS server migrations.
              </div>
            </div>
            <Button
              variant={maintenanceMode ? 'danger' : 'outline'}
              size="sm"
              onClick={() => {
                setMaintenanceMode(!maintenanceMode);
                addToast('info', `Maintenance mode ${!maintenanceMode ? 'ENABLED' : 'DISABLED'}`);
              }}
            >
              {maintenanceMode ? 'Disable Maintenance' : 'Enable Maintenance'}
            </Button>
          </div>

          <div className="flex justify-end">
            <Button variant="primary" size="md" onClick={handleSaveSettings} leftIcon={<CheckCircle2 className="w-4 h-4" />}>
              Save System Policies
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
