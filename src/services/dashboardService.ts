import { getAppAdapter } from '@/api';
import { UserDashboardData, ITDashboardData, AdminDashboardData } from '@/types';

export class DashboardService {
  private get adapter() {
    return getAppAdapter();
  }

  async getUserDashboard(): Promise<UserDashboardData> {
    return this.adapter.getUserDashboard();
  }

  async getITDashboard(): Promise<ITDashboardData> {
    return this.adapter.getITDashboard();
  }

  async getAdminDashboard(): Promise<AdminDashboardData> {
    return this.adapter.getAdminDashboard();
  }
}

export const dashboardService = new DashboardService();
