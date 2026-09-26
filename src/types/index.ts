/**
 * Charitas IT Issue & FAQ System - Core Domain Types
 */

export type UserRole = 'guest' | 'user' | 'it_staff' | 'admin';

export type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending_verification';

export interface User {
  userId: string;
  fullName: string;
  displayName: string;
  department: string;
  email: string;
  phoneNumber: string | null;
  googleSub: string | null;
  emailVerifiedAt: string | null;
  phoneVerifiedAt: string | null;
  googleLinkedAt: string | null;
  role: UserRole;
  status: UserStatus;
  twoFactorEnabled?: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string | null;
}

export type IssuePriority = 'low' | 'medium' | 'high' | 'urgent';

export type IssueStatus =
  | 'open'
  | 'assigned'
  | 'in_progress'
  | 'waiting_for_user'
  | 'resolved'
  | 'closed';

export interface Issue {
  issueId: string;
  title: string;
  description: string;
  categoryId: string;
  priority: IssuePriority;
  status: IssueStatus;
  userId: string | null;
  guestToken: string | null;
  guestName?: string | null;
  guestEmail?: string | null;
  guestPhone?: string | null;
  assignedTo: string | null;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
  closedAt: string | null;
}

export type AuthorType = 'user' | 'it_staff' | 'guest';

export interface IssueReply {
  replyId: string;
  issueId: string;
  authorId: string;
  authorName: string;
  authorType: AuthorType;
  message: string;
  isInternal: boolean;
  createdAt: string;
}

export type FAQStatus = 'published' | 'draft' | 'archived';

export interface FAQ {
  faqId: string;
  categoryId: string;
  question: string;
  answer: string;
  keywords: string[];
  status: FAQStatus;
  helpfulCount?: number;
  unhelpfulCount?: number;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface FAQCategory {
  categoryId: string;
  name: string;
  description: string;
  icon: string | null;
  status: 'active' | 'inactive';
  sortOrder: number;
}

export type NotificationType =
  | 'issue_created'
  | 'issue_assigned'
  | 'issue_replied'
  | 'issue_status_changed'
  | 'issue_resolved'
  | 'system_announcement';

export interface Notification {
  notificationId: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  entityType: 'issue' | 'faq' | 'user' | 'system';
  entityId: string;
  readAt: string | null;
  createdAt: string;
}

export type AuditAction =
  | 'LOGIN'
  | 'LOGOUT'
  | 'REGISTER'
  | 'VERIFY_EMAIL'
  | 'VERIFY_PHONE'
  | 'GOOGLE_LOGIN'
  | 'PASSWORD_RESET'
  | 'CREATE_ISSUE'
  | 'UPDATE_ISSUE'
  | 'REPLY_ISSUE'
  | 'INTERNAL_NOTE'
  | 'ASSIGN_ISSUE'
  | 'CHANGE_ROLE'
  | 'CHANGE_USER_STATUS'
  | 'CREATE_FAQ'
  | 'UPDATE_FAQ'
  | 'DELETE_FAQ'
  | 'UPDATE_CATEGORY'
  | 'SYSTEM_CONFIG_CHANGED';

export interface AuditLog {
  auditId: string;
  actorUserId: string;
  actorName: string;
  action: AuditAction;
  entityType: string;
  entityId: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface Session {
  sessionId: string;
  userId: string;
  tokenHash: string;
  createdAt: string;
  expiresAt: string;
  revokedAt: string | null;
}

export type VerificationType = 'email' | 'phone' | 'whatsapp' | 'password_reset';

export interface VerificationChallenge {
  challengeId: string;
  userId: string;
  type: VerificationType;
  target: string;
  codeHash: string;
  expiresAt: string;
  attempts: number;
  maxAttempts: number;
  resendCooldownUntil: string;
  createdAt: string;
}

// Request and Response DTOs
export interface CreateIssueRequest {
  title: string;
  description: string;
  categoryId: string;
  priority: IssuePriority;
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
}

export interface IssueQuery {
  status?: IssueStatus | 'all';
  categoryId?: string | 'all';
  priority?: IssuePriority | 'all';
  assignedTo?: string | 'all' | 'unassigned' | 'me';
  userId?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface ReplyRequest {
  issueId: string;
  message: string;
  isInternal?: boolean;
  guestToken?: string;
}

export interface AuthResponse {
  user: User;
  sessionToken: string;
}

export interface RuntimeInfo {
  environment: 'mock' | 'apps_script';
  version: string;
  timestamp: string;
  authenticatedUser: User | null;
}

// Dashboard statistics
export interface UserDashboardData {
  openIssuesCount: number;
  resolvedIssuesCount: number;
  recentIssues: Issue[];
  unreadNotificationsCount: number;
  recommendedFAQs: FAQ[];
}

export interface ITDashboardData {
  totalNew: number;
  totalOpen: number;
  totalInProgress: number;
  totalWaitingUser: number;
  totalResolved: number;
  totalClosed: number;
  myAssignedCount: number;
  recentAssignedIssues: Issue[];
  unassignedIssues: Issue[];
}

export interface AdminDashboardData {
  totalUsers: number;
  activeUsers: number;
  totalIssues: number;
  openIssues: number;
  totalFAQs: number;
  recentAuditLogs: AuditLog[];
  usersByRole: Record<UserRole, number>;
}
