import React, { useEffect, useState } from 'react';
import { adminService } from '@/services/adminService';
import { useUIStore } from '@/store/uiStore';
import { User, UserRole, UserStatus } from '@/types';
import { Search, Edit2, CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { Spinner } from '@/components/ui/Spinner';

export const AdminUsers: React.FC = () => {
  const { addToast } = useUIStore();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  // Edit User Modal
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState<UserRole>('user');
  const [newStatus, setNewStatus] = useState<UserStatus>('active');
  const [saving, setSaving] = useState(false);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const list = await adminService.getUsers();
      setUsers(list);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadUsers();
  }, []);

  const openEditModal = (u: User) => {
    setSelectedUser(u);
    setNewRole(u.role);
    setNewStatus(u.status);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    try {
      setSaving(true);
      if (newRole !== selectedUser.role) {
        await adminService.updateUserRole(selectedUser.userId, newRole);
      }
      if (newStatus !== selectedUser.status) {
        await adminService.updateUserStatus(selectedUser.userId, newStatus);
      }
      addToast('success', `User ${selectedUser.fullName} updated successfully.`);
      setSelectedUser(null);
      void loadUsers();
    } catch (err) {
      addToast('error', err instanceof Error ? err.message : 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const filtered = users.filter((u) => {
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const q = search.toLowerCase().trim();
    const matchesSearch =
      !q ||
      u.fullName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.department.toLowerCase().includes(q);
    return matchesRole && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Hospital User Directory & Access</h1>
        <p className="text-xs text-slate-500 mt-1">
          Assign role privileges (Admin, IT Staff, Standard User) and manage account activity.
        </p>
      </div>

      <Card className="p-4 flex flex-col sm:flex-row gap-3 justify-between items-center">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search name, email, department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-600 focus:bg-white"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="bg-slate-50 rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-600"
        >
          <option value="all">All Roles ({users.length})</option>
          <option value="admin">Administrators</option>
          <option value="it_staff">IT Staff</option>
          <option value="user">Hospital Staff (Users)</option>
        </select>
      </Card>

      {loading ? (
        <div className="py-20 flex justify-center"><Spinner size="lg" /></div>
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">User</th>
                <th className="px-5 py-3.5">Department</th>
                <th className="px-5 py-3.5">Role</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Last Login</th>
                <th className="px-5 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((u) => (
                <tr key={u.userId} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="font-semibold text-slate-900">{u.fullName}</div>
                    <div className="text-2xs text-slate-400">{u.email}</div>
                  </td>
                  <td className="px-5 py-3.5 text-slate-600">{u.department}</td>
                  <td className="px-5 py-3.5">
                    <Badge variant={u.role === 'admin' ? 'purple' : u.role === 'it_staff' ? 'warning' : 'primary'}>
                      {u.role.toUpperCase()}
                    </Badge>
                  </td>
                  <td className="px-5 py-3.5">
                    <Badge variant={u.status === 'active' ? 'success' : u.status === 'suspended' ? 'danger' : 'neutral'}>
                      {u.status.toUpperCase()}
                    </Badge>
                  </td>
                  <td className="px-5 py-3.5 text-slate-500 text-2xs">
                    {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : 'Never'}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <Button variant="outline" size="sm" onClick={() => openEditModal(u)} leftIcon={<Edit2 className="w-3 h-3" />}>
                      Permissions
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* Permissions Edit Modal */}
      <Modal
        isOpen={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        title="Manage User Role & Privileges"
      >
        {selectedUser && (
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
              <div className="font-bold text-slate-800">{selectedUser.fullName}</div>
              <div className="text-slate-500">{selectedUser.email} • {selectedUser.department}</div>
            </div>

            <Select
              label="System Authorization Role"
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as UserRole)}
            >
              <option value="user">Standard User (Hospital Staff)</option>
              <option value="it_staff">IT Staff (Service Desk Technician)</option>
              <option value="admin">Administrator (Full System Governance)</option>
            </Select>

            <Select
              label="Account Access Status"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value as UserStatus)}
            >
              <option value="active">Active (Permitted)</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended (Blocked by IT Security)</option>
            </Select>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button type="button" variant="ghost" size="md" onClick={() => setSelectedUser(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="md" isLoading={saving} leftIcon={<CheckCircle2 className="w-4 h-4" />}>
                Save Changes
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
