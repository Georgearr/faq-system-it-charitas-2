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

export interface AppAdapter {
  // Runtime check
  testRuntime(): Promise<RuntimeInfo>;

  // Authentication
  registerWithEmail(
    fullName: string,
    email: string,
    password: string,
    department: string
  ): Promise<{ challengeId: string; email: string }>;

  loginWithEmail(email: string, password: string): Promise<AuthResponse>;

  registerWithPhone(
    fullName: string,
    phoneNumber: string,
    password: string,
    department: string
  ): Promise<{ challengeId: string; phone: string }>;

  loginWithPhone(phoneNumber: string, password?: string): Promise<{ challengeId?: string; auth?: AuthResponse }>;

  loginWithGoogle(credentialOrIdToken: string): Promise<AuthResponse>;

  verifyEmail(challengeId: string, code: string): Promise<AuthResponse>;

  verifyPhone(challengeId: string, code: string): Promise<AuthResponse>;

  resendVerification(challengeId: string): Promise<{ success: boolean; message: string }>;

  requestPasswordReset(emailOrPhone: string): Promise<{ challengeId: string; message: string }>;

  resetPassword(challengeId: string, code: string, newPassword: string): Promise<{ success: boolean }>;

  getCurrentUser(): Promise<User | null>;

  logout(): Promise<void>;

  // FAQ
  getFAQs(categoryId?: string, search?: string): Promise<FAQ[]>;

  getFAQ(id: string): Promise<FAQ | null>;

  searchFAQs(query: string): Promise<FAQ[]>;

  getFAQCategories(): Promise<FAQCategory[]>;

  createFAQ(data: Omit<FAQ, 'faqId' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>): Promise<FAQ>;

  updateFAQ(id: string, data: Partial<FAQ>): Promise<FAQ>;

  deleteFAQ(id: string): Promise<boolean>;

  submitFAQFeedback(id: string, isHelpful: boolean): Promise<{ helpfulCount: number; unhelpfulCount: number }>;

  // Issues
  createIssue(request: CreateIssueRequest): Promise<Issue>;

  getIssue(id: string, guestToken?: string): Promise<Issue | null>;

  getIssues(query?: IssueQuery): Promise<Issue[]>;

  getMyIssues(): Promise<Issue[]>;

  replyToIssue(request: ReplyRequest): Promise<IssueReply>;

  addInternalNote(issueId: string, message: string): Promise<IssueReply>;

  updateIssueStatus(issueId: string, status: IssueStatus): Promise<Issue>;

  assignIssue(issueId: string, staffUserId: string | null): Promise<Issue>;

  updateIssuePriority(issueId: string, priority: IssuePriority): Promise<Issue>;

  updateIssueCategory(issueId: string, categoryId: string): Promise<Issue>;

  getIssueReplies(issueId: string, guestToken?: string): Promise<IssueReply[]>;

  // Dashboards
  getUserDashboard(): Promise<UserDashboardData>;

  getITDashboard(): Promise<ITDashboardData>;

  getAdminDashboard(): Promise<AdminDashboardData>;

  // Users Management
  getUsers(query?: { search?: string; role?: UserRole; status?: UserStatus }): Promise<User[]>;

  getUser(userId: string): Promise<User | null>;

  updateUser(userId: string, data: Partial<User>): Promise<User>;

  updateUserRole(userId: string, role: UserRole): Promise<User>;

  updateUserStatus(userId: string, status: UserStatus): Promise<User>;

  // Notifications
  getNotifications(): Promise<Notification[]>;

  markNotificationRead(notificationId: string): Promise<void>;

  markAllNotificationsRead(): Promise<void>;

  // Audit Logs
  getAuditLogs(query?: { action?: string; actorId?: string; entityType?: string }): Promise<AuditLog[]>;
}
