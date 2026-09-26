import { getAppAdapter } from '@/api';
import { User, UserRole, UserStatus, AuditLog } from '@/types';

export class AdminService {
  private get adapter() {
    return getAppAdapter();
  }

  async getUsers(query?: { search?: string; role?: UserRole; status?: UserStatus }): Promise<User[]> {
    return this.adapter.getUsers(query);
  }

  async getUser(userId: string): Promise<User | null> {
    return this.adapter.getUser(userId);
  }

  async updateUser(userId: string, data: Partial<User>): Promise<User> {
    return this.adapter.updateUser(userId, data);
  }

  async updateUserRole(userId: string, role: UserRole): Promise<User> {
    return this.adapter.updateUserRole(userId, role);
  }

  async updateUserStatus(userId: string, status: UserStatus): Promise<User> {
    return this.adapter.updateUserStatus(userId, status);
  }

  async getAuditLogs(query?: { action?: string; actorId?: string; entityType?: string }): Promise<AuditLog[]> {
    return this.adapter.getAuditLogs(query);
  }
}

export const adminService = new AdminService();
