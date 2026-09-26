import { AppAdapter } from './AppAdapter';
import {
  User,
  UserRole,
  UserStatus,
  Issue,
  IssuePriority,
  IssueStatus,
  IssueReply,
  FAQ,
  FAQCategory,
  Notification,
  AuditLog,
  CreateIssueRequest,
  IssueQuery,
  ReplyRequest,
  AuthResponse,
  RuntimeInfo,
  UserDashboardData,
  ITDashboardData,
  AdminDashboardData,
} from '@/types';

type GASFunction = (...args: unknown[]) => void;

interface GASRunner {
  withSuccessHandler(callback: (result: unknown) => void): GASRunner;
  withFailureHandler(callback: (error: Error) => void): GASRunner;
  [key: string]: GASFunction | unknown;
}

declare global {
  interface Window {
    google?: {
      script?: {
        run: GASRunner;
      };
    };
  }
}

/**
 * AppsScriptAdapter wraps google.script.run calls.
 *
 * IMPORTANT: google.script.run functions are called with positional arguments.
 * The argument order must match the GAS function signatures in Code.gs exactly.
 */
export class AppsScriptAdapter implements AppAdapter {
  private isGASAvailable(): boolean {
    return (
      typeof window !== 'undefined' &&
      typeof window.google !== 'undefined' &&
      typeof window.google.script !== 'undefined' &&
      typeof window.google.script.run !== 'undefined'
    );
  }

  private callGAS<T>(functionName: string, ...args: unknown[]): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      if (!this.isGASAvailable()) {
        reject(
          new Error(
            `Google Apps Script environment not available. (Called: '${functionName}')`
          )
        );
        return;
      }

      const runner = window.google!.script!.run;
      const targetFn = runner[functionName];

      if (typeof targetFn !== 'function') {
        reject(
          new Error(`GAS function '${functionName}' is not defined on google.script.run`)
        );
        return;
      }

      runner
        .withSuccessHandler((result: unknown) => resolve(result as T))
        .withFailureHandler((error: Error) => reject(error));

      (targetFn as GASFunction)(...args);
    });
  }

  // ─── Runtime ───────────────────────────────────────────────────────────────

  async testRuntime(): Promise<RuntimeInfo> {
    if (!this.isGASAvailable()) {
      return {
        environment: 'apps_script',
        version: '1.0.0-unconnected',
        timestamp: new Date().toISOString(),
        authenticatedUser: null,
      };
    }
    return this.callGAS<RuntimeInfo>('testRuntime');
  }

  // ─── Authentication ────────────────────────────────────────────────────────

  async registerWithEmail(
    fullName: string,
    email: string,
    password: string,
    department: string
  ): Promise<{ challengeId: string; email: string }> {
    return this.callGAS('registerWithEmail', fullName, email, password, department);
  }

  async loginWithEmail(email: string, password: string): Promise<AuthResponse> {
    return this.callGAS('loginWithEmail', email, password);
  }

  async registerWithPhone(
    fullName: string,
    phoneNumber: string,
    password: string,
    department: string
  ): Promise<{ challengeId: string; phone: string }> {
    return this.callGAS('registerWithPhone', fullName, phoneNumber, password, department);
  }

  async loginWithPhone(
    phoneNumber: string,
    password?: string
  ): Promise<{ challengeId?: string; auth?: AuthResponse }> {
    return this.callGAS('loginWithPhone', phoneNumber, password ?? null);
  }

  async loginWithGoogle(credentialOrIdToken: string): Promise<AuthResponse> {
    return this.callGAS('loginWithGoogle', credentialOrIdToken);
  }

  async verifyEmail(challengeId: string, code: string): Promise<AuthResponse> {
    return this.callGAS('verifyEmail', challengeId, code);
  }

  async verifyPhone(challengeId: string, code: string): Promise<AuthResponse> {
    return this.callGAS('verifyPhone', challengeId, code);
  }

  async resendVerification(challengeId: string): Promise<{ success: boolean; message: string }> {
    return this.callGAS('resendVerification', challengeId);
  }

  async requestPasswordReset(emailOrPhone: string): Promise<{ challengeId: string; message: string }> {
    return this.callGAS('requestPasswordReset', emailOrPhone);
  }

  async resetPassword(
    challengeId: string,
    code: string,
    newPassword: string
  ): Promise<{ success: boolean }> {
    return this.callGAS('resetPassword', challengeId, code, newPassword);
  }

  async getCurrentUser(): Promise<User | null> {
    if (!this.isGASAvailable()) return null;
    return this.callGAS<User | null>('getCurrentUser');
  }

  async logout(): Promise<void> {
    if (this.isGASAvailable()) {
      await this.callGAS<void>('logout');
    }
  }

  // ─── FAQ ───────────────────────────────────────────────────────────────────

  async getFAQs(categoryId?: string, search?: string): Promise<FAQ[]> {
    return this.callGAS('getFAQs', categoryId ?? null, search ?? null);
  }

  async getFAQ(id: string): Promise<FAQ | null> {
    return this.callGAS('getFAQ', id);
  }

  async searchFAQs(query: string): Promise<FAQ[]> {
    return this.callGAS('searchFAQs', query);
  }

  async getFAQCategories(): Promise<FAQCategory[]> {
    return this.callGAS('getFAQCategories');
  }

  async createFAQ(
    data: Omit<FAQ, 'faqId' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>
  ): Promise<FAQ> {
    return this.callGAS('createFAQ', data);
  }

  async updateFAQ(id: string, data: Partial<FAQ>): Promise<FAQ> {
    return this.callGAS('updateFAQ', id, data);
  }

  async deleteFAQ(id: string): Promise<boolean> {
    return this.callGAS('deleteFAQ', id);
  }

  async submitFAQFeedback(
    id: string,
    isHelpful: boolean
  ): Promise<{ helpfulCount: number; unhelpfulCount: number }> {
    return this.callGAS('submitFAQFeedback', id, isHelpful);
  }

  // ─── Issues ────────────────────────────────────────────────────────────────

  async createIssue(request: CreateIssueRequest): Promise<Issue> {
    return this.callGAS('createIssue', request);
  }

  async getIssue(id: string, guestToken?: string): Promise<Issue | null> {
    return this.callGAS('getIssue', id, guestToken ?? null);
  }

  async getIssues(query?: IssueQuery): Promise<Issue[]> {
    return this.callGAS('getIssues', query ?? null);
  }

  async getMyIssues(): Promise<Issue[]> {
    return this.callGAS('getMyIssues');
  }

  async replyToIssue(request: ReplyRequest): Promise<IssueReply> {
    return this.callGAS('replyToIssue', request);
  }

  async addInternalNote(issueId: string, message: string): Promise<IssueReply> {
    return this.callGAS('addInternalNote', issueId, message);
  }

  async updateIssueStatus(issueId: string, status: IssueStatus): Promise<Issue> {
    return this.callGAS('updateIssueStatus', issueId, status);
  }

  async assignIssue(issueId: string, staffUserId: string | null): Promise<Issue> {
    return this.callGAS('assignIssue', issueId, staffUserId);
  }

  async updateIssuePriority(issueId: string, priority: IssuePriority): Promise<Issue> {
    return this.callGAS('updateIssuePriority', issueId, priority);
  }

  async updateIssueCategory(issueId: string, categoryId: string): Promise<Issue> {
    return this.callGAS('updateIssueCategory', issueId, categoryId);
  }

  async getIssueReplies(issueId: string, guestToken?: string): Promise<IssueReply[]> {
    return this.callGAS('getIssueReplies', issueId, guestToken ?? null);
  }

  // ─── Dashboards ────────────────────────────────────────────────────────────

  async getUserDashboard(): Promise<UserDashboardData> {
    return this.callGAS('getUserDashboard');
  }

  async getITDashboard(): Promise<ITDashboardData> {
    return this.callGAS('getITDashboard');
  }

  async getAdminDashboard(): Promise<AdminDashboardData> {
    return this.callGAS('getAdminDashboard');
  }

  // ─── Users Management ──────────────────────────────────────────────────────

  async getUsers(
    query?: { search?: string; role?: UserRole; status?: UserStatus }
  ): Promise<User[]> {
    return this.callGAS('getUsers', query ?? null);
  }

  async getUser(userId: string): Promise<User | null> {
    return this.callGAS('getUser', userId);
  }

  async updateUser(userId: string, data: Partial<User>): Promise<User> {
    return this.callGAS('updateUser', userId, data);
  }

  async updateUserRole(userId: string, role: UserRole): Promise<User> {
    return this.callGAS('updateUserRole', userId, role);
  }

  async updateUserStatus(userId: string, status: UserStatus): Promise<User> {
    return this.callGAS('updateUserStatus', userId, status);
  }

  // ─── Notifications ─────────────────────────────────────────────────────────

  async getNotifications(): Promise<Notification[]> {
    return this.callGAS('getNotifications');
  }

  async markNotificationRead(notificationId: string): Promise<void> {
    return this.callGAS('markNotificationRead', notificationId);
  }

  async markAllNotificationsRead(): Promise<void> {
    return this.callGAS('markAllNotificationsRead');
  }

  // ─── Audit Logs ────────────────────────────────────────────────────────────

  async getAuditLogs(
    query?: { action?: string; actorId?: string; entityType?: string }
  ): Promise<AuditLog[]> {
    return this.callGAS('getAuditLogs', query ?? null);
  }
}
