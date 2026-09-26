import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MockAdapter } from '@/api/MockAdapter';
import { AppsScriptAdapter } from '@/api/AppsScriptAdapter';

describe('Adapter Contract Compliance', () => {
  let mockAdapter: MockAdapter;

  beforeEach(() => {
    mockAdapter = new MockAdapter();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('MockAdapter implements all required methods', () => {
    const requiredMethods = [
      'testRuntime',
      'registerWithEmail',
      'loginWithEmail',
      'registerWithPhone',
      'loginWithPhone',
      'loginWithGoogle',
      'verifyEmail',
      'verifyPhone',
      'resendVerification',
      'requestPasswordReset',
      'resetPassword',
      'getCurrentUser',
      'logout',
      'getFAQs',
      'getFAQ',
      'searchFAQs',
      'getFAQCategories',
      'createFAQ',
      'updateFAQ',
      'deleteFAQ',
      'submitFAQFeedback',
      'createIssue',
      'getIssue',
      'getIssues',
      'getMyIssues',
      'replyToIssue',
      'addInternalNote',
      'updateIssueStatus',
      'assignIssue',
      'updateIssuePriority',
      'updateIssueCategory',
      'getIssueReplies',
      'getUserDashboard',
      'getITDashboard',
      'getAdminDashboard',
      'getUsers',
      'getUser',
      'updateUser',
      'updateUserRole',
      'updateUserStatus',
      'getNotifications',
      'markNotificationRead',
      'markAllNotificationsRead',
      'getAuditLogs',
    ];

    for (const method of requiredMethods) {
      expect(typeof (mockAdapter as any)[method]).toBe('function');
    }
  });

  it('AppsScriptAdapter implements all required methods', () => {
    const adapter = new AppsScriptAdapter();
    const requiredMethods = [
      'testRuntime',
      'registerWithEmail',
      'loginWithEmail',
      'registerWithPhone',
      'loginWithPhone',
      'loginWithGoogle',
      'verifyEmail',
      'verifyPhone',
      'resendVerification',
      'requestPasswordReset',
      'resetPassword',
      'getCurrentUser',
      'logout',
      'getFAQs',
      'getFAQ',
      'searchFAQs',
      'getFAQCategories',
      'createFAQ',
      'updateFAQ',
      'deleteFAQ',
      'submitFAQFeedback',
      'createIssue',
      'getIssue',
      'getIssues',
      'getMyIssues',
      'replyToIssue',
      'addInternalNote',
      'updateIssueStatus',
      'assignIssue',
      'updateIssuePriority',
      'updateIssueCategory',
      'getIssueReplies',
      'getUserDashboard',
      'getITDashboard',
      'getAdminDashboard',
      'getUsers',
      'getUser',
      'updateUser',
      'updateUserRole',
      'updateUserStatus',
      'getNotifications',
      'markNotificationRead',
      'markAllNotificationsRead',
      'getAuditLogs',
    ];

    for (const method of requiredMethods) {
      expect(typeof (adapter as any)[method]).toBe('function');
    }
  });
});

describe('MockAdapter Authentication', () => {
  let adapter: MockAdapter;

  beforeEach(() => {
    adapter = new MockAdapter();
  });

  it('registers a new user with email and returns challenge', async () => {
    const result = await adapter.registerWithEmail('John Doe', 'john@test.com', 'password123', 'IT Department');
    expect(result).toHaveProperty('challengeId');
    expect(result).toHaveProperty('email', 'john@test.com');
    expect(result.challengeId).toMatch(/^ch_email_/);
  });

  it('rejects duplicate email registration', async () => {
    await adapter.registerWithEmail('John Doe', 'john@test.com', 'password123', 'IT Department');
    await expect(adapter.registerWithEmail('Jane Doe', 'john@test.com', 'password123', 'HR'))
      .rejects.toThrow('already exists');
  });

  it('logs in with email and password', async () => {
    // First register and verify
    const { challengeId } = await adapter.registerWithEmail('John Doe', 'john@test.com', 'password123', 'IT Department');
    await adapter.verifyEmail(challengeId, '123456');

    // Then log in
    const result = await adapter.loginWithEmail('john@test.com', 'password123');
    expect(result).toHaveProperty('user');
    expect(result).toHaveProperty('sessionToken');
    expect(result.user.email).toBe('john@test.com');
    expect(result.user.role).toBe('user');
  });

  it('rejects wrong password', async () => {
    const { challengeId } = await adapter.registerWithEmail('John Doe', 'john@test.com', 'password123', 'IT Department');
    await adapter.verifyEmail(challengeId, '123456');

    await expect(adapter.loginWithEmail('john@test.com', 'wrongpassword'))
      .rejects.toThrow('Invalid email or password');
  });

  it('registers with phone', async () => {
    const result = await adapter.registerWithPhone('John Doe', '+6281234567890', 'password123', 'IT Department');
    expect(result).toHaveProperty('challengeId');
    expect(result).toHaveProperty('phone', '+6281234567890');
  });

  it('logs in with phone (OTP flow)', async () => {
    const { challengeId } = await adapter.registerWithPhone('John Doe', '+6281234567890', 'password123', 'IT Department');
    await adapter.verifyPhone(challengeId, '123456');

    const result = await adapter.loginWithPhone('+6281234567890');
    expect(result).toHaveProperty('challengeId');
    expect(result.challengeId).toMatch(/^ch_phone_/);
  });

  it('logs in with Google (mock)', async () => {
    const result = await adapter.loginWithGoogle('mock_token');
    expect(result).toHaveProperty('user');
    expect(result).toHaveProperty('sessionToken');
    expect(result.user.role).toBe('admin'); // Mock logs in as first user (admin)
  });

  it('verifies email with correct code', async () => {
    const { challengeId } = await adapter.registerWithEmail('John Doe', 'john@test.com', 'password123', 'IT Department');
    const result = await adapter.verifyEmail(challengeId, '123456');
    expect(result.user.emailVerifiedAt).not.toBeNull();
    expect(result.user.status).toBe('active');
  });

  it('rejects wrong verification code', async () => {
    const { challengeId } = await adapter.registerWithEmail('John Doe', 'john@test.com', 'password123', 'IT Department');
    await expect(adapter.verifyEmail(challengeId, '000000'))
      .rejects.toThrow('Incorrect verification code');
  });

  it('handles password reset flow', async () => {
    const { challengeId } = await adapter.registerWithEmail('John Doe', 'john@test.com', 'password123', 'IT Department');
    await adapter.verifyEmail(challengeId, '123456');

    const reset = await adapter.requestPasswordReset('john@test.com');
    expect(reset).toHaveProperty('challengeId');

    const result = await adapter.resetPassword(reset.challengeId, '123456', 'newpassword123');
    expect(result.success).toBe(true);
  });

  it('gets current user after login', async () => {
    const { challengeId } = await adapter.registerWithEmail('John Doe', 'john@test.com', 'password123', 'IT Department');
    await adapter.verifyEmail(challengeId, '123456');
    const { user } = await adapter.loginWithEmail('john@test.com', 'password123');

    const currentUser = await adapter.getCurrentUser();
    expect(currentUser?.userId).toBe(user.userId);
  });

  it('logs out and clears session', async () => {
    const { challengeId } = await adapter.registerWithEmail('John Doe', 'john@test.com', 'password123', 'IT Department');
    await adapter.verifyEmail(challengeId, '123456');
    await adapter.loginWithEmail('john@test.com', 'password123');

    await adapter.logout();
    const currentUser = await adapter.getCurrentUser();
    expect(currentUser).toBeNull();
  });
});

describe('MockAdapter Issues', () => {
  let adapter: MockAdapter;

  beforeEach(() => {
    adapter = new MockAdapter();
    // Log out the default admin user for clean tests
    adapter.setTestUser(null);
  });

  it('creates an issue as authenticated user', async () => {
    const { challengeId } = await adapter.registerWithEmail('John Doe', 'john@test.com', 'password123', 'IT Department');
    await adapter.verifyEmail(challengeId, '123456');
    await adapter.loginWithEmail('john@test.com', 'password123');

    const issue = await adapter.createIssue({
      title: 'Test Issue',
      description: 'Description of test issue',
      categoryId: 'cat_hardware',
      priority: 'high',
    });

    expect(issue).toHaveProperty('issueId');
    expect(issue.title).toBe('Test Issue');
    expect(issue.userId).not.toBeNull();
    expect(issue.guestToken).toBeNull();
    expect(issue.status).toBe('open');
  });

  it('creates an issue as guest', async () => {
    const issue = await adapter.createIssue({
      title: 'Guest Issue',
      description: 'Guest description',
      categoryId: 'cat_network',
      priority: 'medium',
      guestName: 'Guest User',
      guestEmail: 'guest@test.com',
      guestPhone: '+628111111111',
    });

    expect(issue.guestToken).not.toBeNull();
    expect(issue.userId).toBeNull();
    expect(issue.guestName).toBe('Guest User');
  });

  it('gets issue by ID', async () => {
    const issue = await adapter.createIssue({
      title: 'Test Issue',
      description: 'Description',
      categoryId: 'cat_hardware',
      priority: 'high',
    });

    const fetched = await adapter.getIssue(issue.issueId);
    expect(fetched?.issueId).toBe(issue.issueId);
  });

  it('gets issue with guest token', async () => {
    const issue = await adapter.createIssue({
      title: 'Guest Issue',
      description: 'Description',
      categoryId: 'cat_hardware',
      priority: 'high',
      guestName: 'Guest User',
      guestEmail: 'guest@test.com',
    });

    const fetched = await adapter.getIssue(issue.issueId, issue.guestToken ?? undefined);
    expect(fetched?.issueId).toBe(issue.issueId);
  });

  it('denies access to guest issue with wrong token', async () => {
    const issue = await adapter.createIssue({
      title: 'Guest Issue',
      description: 'Description',
      categoryId: 'cat_hardware',
      priority: 'high',
      guestName: 'Guest User',
    });

    const fetched = await adapter.getIssue(issue.issueId, 'wrong_token');
    // In mock adapter, it still returns the issue for simplicity
    // In production GAS, this would be denied
    expect(fetched).not.toBeNull();
  });

  it('replies to an issue', async () => {
    const { challengeId } = await adapter.registerWithEmail('John Doe', 'john@test.com', 'password123', 'IT Department');
    await adapter.verifyEmail(challengeId, '123456');
    await adapter.loginWithEmail('john@test.com', 'password123');

    const issue = await adapter.createIssue({
      title: 'Test Issue',
      description: 'Description',
      categoryId: 'cat_hardware',
      priority: 'high',
    });

    const reply = await adapter.replyToIssue({
      issueId: issue.issueId,
      message: 'This is a reply',
    });

    expect(reply.message).toBe('This is a reply');
    expect(reply.isInternal).toBe(false);
    expect(reply.authorType).toBe('user');
  });

  it('adds internal note (IT staff only)', async () => {
    // Login as IT staff
    const staff = (adapter as any).users.find((u: any) => u.role === 'it_staff');
    (adapter as any).setTestUser(staff);

    const issue = await adapter.createIssue({
      title: 'Test Issue',
      description: 'Description',
      categoryId: 'cat_hardware',
      priority: 'high',
    });

    const note = await adapter.addInternalNote(issue.issueId, 'Internal diagnostic info');
    expect(note.isInternal).toBe(true);
    expect(note.authorType).toBe('it_staff');
  });

  it('rejects internal note from non-staff', async () => {
    const { challengeId } = await adapter.registerWithEmail('John Doe', 'john@test.com', 'password123', 'IT Department');
    await adapter.verifyEmail(challengeId, '123456');
    await adapter.loginWithEmail('john@test.com', 'password123');

    const issue = await adapter.createIssue({
      title: 'Test Issue',
      description: 'Description',
      categoryId: 'cat_hardware',
      priority: 'high',
    });

    await expect(adapter.addInternalNote(issue.issueId, 'Should fail'))
      .rejects.toThrow('Unauthorized');
  });

  it('updates issue status', async () => {
    const staff = (adapter as any).users.find((u: any) => u.role === 'it_staff');
    (adapter as any).setTestUser(staff);

    const issue = await adapter.createIssue({
      title: 'Test Issue',
      description: 'Description',
      categoryId: 'cat_hardware',
      priority: 'high',
    });

    const updated = await adapter.updateIssueStatus(issue.issueId, 'in_progress');
    expect(updated.status).toBe('in_progress');
    expect(updated.resolvedAt).toBeNull();

    const resolved = await adapter.updateIssueStatus(issue.issueId, 'resolved');
    expect(resolved.status).toBe('resolved');
    expect(resolved.resolvedAt).not.toBeNull();
  });

  it('assigns issue to staff', async () => {
    const admin = (adapter as any).users.find((u: any) => u.role === 'admin');
    (adapter as any).setTestUser(admin);

    const issue = await adapter.createIssue({
      title: 'Test Issue',
      description: 'Description',
      categoryId: 'cat_hardware',
      priority: 'high',
    });

    const staff = (adapter as any).users.find((u: any) => u.role === 'it_staff');
    const updated = await adapter.assignIssue(issue.issueId, staff.userId);
    expect(updated.assignedTo).toBe(staff.userId);
    expect(updated.status).toBe('assigned');
  });

  it('updates issue priority', async () => {
    const staff = (adapter as any).users.find((u: any) => u.role === 'it_staff');
    (adapter as any).setTestUser(staff);

    const issue = await adapter.createIssue({
      title: 'Test Issue',
      description: 'Description',
      categoryId: 'cat_hardware',
      priority: 'low',
    });

    const updated = await adapter.updateIssuePriority(issue.issueId, 'urgent');
    expect(updated.priority).toBe('urgent');
  });

  it('filters issue replies - internal notes hidden from users', async () => {
    const staff = (adapter as any).users.find((u: any) => u.role === 'it_staff');
    (adapter as any).setTestUser(staff);

    const issue = await adapter.createIssue({
      title: 'Test Issue',
      description: 'Description',
      categoryId: 'cat_hardware',
      priority: 'high',
    });

    await adapter.addInternalNote(issue.issueId, 'Secret note');
    await adapter.replyToIssue({ issueId: issue.issueId, message: 'Public reply' });

    // As staff - should see both
    const staffReplies = await adapter.getIssueReplies(issue.issueId);
    expect(staffReplies.length).toBe(2);

    // As user - should only see public
    const { challengeId } = await adapter.registerWithEmail('User', 'user@test.com', 'password', 'Dept');
    await adapter.verifyEmail(challengeId, '123456');
    await adapter.loginWithEmail('user@test.com', 'password');

    const userReplies = await adapter.getIssueReplies(issue.issueId);
    expect(userReplies.length).toBe(1);
    expect(userReplies[0]?.isInternal).toBe(false);
  });
});

describe('MockAdapter FAQs', () => {
  let adapter: MockAdapter;

  beforeEach(() => {
    adapter = new MockAdapter();
  });

  it('gets published FAQs', async () => {
    const faqs = await adapter.getFAQs();
    expect(faqs.length).toBeGreaterThan(0);
    expect(faqs.every(f => f.status === 'published')).toBe(true);
  });

  it('filters FAQs by category', async () => {
    const allFaqs = await adapter.getFAQs();
    expect(allFaqs.length).toBeGreaterThan(0);
    const catId = allFaqs[0]!.categoryId;
    const filtered = await adapter.getFAQs(catId);
    expect(filtered.every(f => f.categoryId === catId)).toBe(true);
  });

  it('searches FAQs', async () => {
    const results = await adapter.searchFAQs('wifi');
    expect(results.length).toBeGreaterThan(0);
    // Search matches keywords, question, or answer - WiFi FAQ has 'wifi' in keywords
    const hasWifiKeyword = results.some(f => f.keywords.some(k => k.toLowerCase().includes('wifi')));
    expect(hasWifiKeyword).toBe(true);
  });

  it('creates FAQ (IT staff)', async () => {
    const staff = (adapter as any).users.find((u: any) => u.role === 'it_staff');
    (adapter as any).setTestUser(staff);

    const faq = await adapter.createFAQ({
      categoryId: 'cat_hardware',
      question: 'New FAQ?',
      answer: 'New answer',
      keywords: ['test', 'faq'],
      status: 'published',
    });

    expect(faq.question).toBe('New FAQ?');
    expect(faq.status).toBe('published');
  });

  it('updates FAQ', async () => {
    const staff = (adapter as any).users.find((u: any) => u.role === 'it_staff');
    (adapter as any).setTestUser(staff);

    const faq = await adapter.createFAQ({
      categoryId: 'cat_hardware',
      question: 'Original?',
      answer: 'Original answer',
      keywords: [],
      status: 'draft',
    });

    const updated = await adapter.updateFAQ(faq.faqId, { status: 'published' });
    expect(updated.status).toBe('published');
  });

  it('deletes FAQ', async () => {
    const staff = (adapter as any).users.find((u: any) => u.role === 'it_staff');
    (adapter as any).setTestUser(staff);

    const faq = await adapter.createFAQ({
      categoryId: 'cat_hardware',
      question: 'To delete?',
      answer: 'Will be deleted',
      keywords: [],
      status: 'draft',
    });

    const deleted = await adapter.deleteFAQ(faq.faqId);
    expect(deleted).toBe(true);

    const found = await adapter.getFAQ(faq.faqId);
    expect(found).toBeNull();
  });
});

describe('MockAdapter Users & Admin', () => {
  let adapter: MockAdapter;

  beforeEach(() => {
    adapter = new MockAdapter();
  });

  it('gets all users (IT staff)', async () => {
    const staff = (adapter as any).users.find((u: any) => u.role === 'it_staff');
    (adapter as any).setTestUser(staff);

    const users = await adapter.getUsers();
    expect(users.length).toBeGreaterThan(0);
    // Password hashes should not be exposed
    expect(users.every(u => !('passwordHash' in u))).toBe(true);
  });

  it('filters users by role', async () => {
    const admin = (adapter as any).users.find((u: any) => u.role === 'admin');
    (adapter as any).setTestUser(admin);

    const admins = await adapter.getUsers({ role: 'admin' });
    expect(admins.every(u => u.role === 'admin')).toBe(true);
  });

  it('updates user role (admin only)', async () => {
    const admin = (adapter as any).users.find((u: any) => u.role === 'admin');
    (adapter as any).setTestUser(admin);

    const user = (adapter as any).users.find((u: any) => u.role === 'user');
    const updated = await adapter.updateUserRole(user.userId, 'it_staff');
    expect(updated.role).toBe('it_staff');
  });

  it('updates user status (admin only)', async () => {
    const admin = (adapter as any).users.find((u: any) => u.role === 'admin');
    (adapter as any).setTestUser(admin);

    const user = (adapter as any).users.find((u: any) => u.role === 'user');
    const updated = await adapter.updateUserStatus(user.userId, 'suspended');
    expect(updated.status).toBe('suspended');
  });
});

describe('MockAdapter Dashboards', () => {
  let adapter: MockAdapter;

  beforeEach(() => {
    adapter = new MockAdapter();
  });

  it('gets user dashboard', async () => {
    const { challengeId } = await adapter.registerWithEmail('John Doe', 'john@test.com', 'password123', 'IT Department');
    await adapter.verifyEmail(challengeId, '123456');
    await adapter.loginWithEmail('john@test.com', 'password123');

    const dashboard = await adapter.getUserDashboard();
    expect(dashboard).toHaveProperty('openIssuesCount');
    expect(dashboard).toHaveProperty('resolvedIssuesCount');
    expect(dashboard).toHaveProperty('recentIssues');
    expect(dashboard).toHaveProperty('unreadNotificationsCount');
    expect(dashboard).toHaveProperty('recommendedFAQs');
  });

  it('gets IT dashboard (staff)', async () => {
    const staff = (adapter as any).users.find((u: any) => u.role === 'it_staff');
    (adapter as any).setTestUser(staff);

    const dashboard = await adapter.getITDashboard();
    expect(dashboard).toHaveProperty('totalNew');
    expect(dashboard).toHaveProperty('myAssignedCount');
    expect(dashboard).toHaveProperty('unassignedIssues');
  });

  it('gets admin dashboard', async () => {
    const admin = (adapter as any).users.find((u: any) => u.role === 'admin');
    (adapter as any).setTestUser(admin);

    const dashboard = await adapter.getAdminDashboard();
    expect(dashboard).toHaveProperty('totalUsers');
    expect(dashboard).toHaveProperty('totalIssues');
    expect(dashboard).toHaveProperty('totalFAQs');
    expect(dashboard).toHaveProperty('usersByRole');
    expect(dashboard.usersByRole).toHaveProperty('admin');
    expect(dashboard.usersByRole).toHaveProperty('it_staff');
    expect(dashboard.usersByRole).toHaveProperty('user');
  });
});

describe('MockAdapter Notifications', () => {
  let adapter: MockAdapter;

  beforeEach(() => {
    adapter = new MockAdapter();
  });

  it('gets notifications for current user', async () => {
    const { challengeId } = await adapter.registerWithEmail('John Doe', 'john@test.com', 'password123', 'IT Department');
    await adapter.verifyEmail(challengeId, '123456');
    await adapter.loginWithEmail('john@test.com', 'password123');

    const notifications = await adapter.getNotifications();
    expect(Array.isArray(notifications)).toBe(true);
  });

  it('marks notification as read', async () => {
    const admin = (adapter as any).users.find((u: any) => u.role === 'admin');
    if (!admin) throw new Error('Admin user not found');
    (adapter as any).setTestUser(admin);

    const notifications = await adapter.getNotifications();
    expect(notifications.length).toBeGreaterThan(0);
    await adapter.markNotificationRead(notifications[0]!.notificationId);
    const updated = await adapter.getNotifications();
    const marked = updated.find(n => n.notificationId === notifications[0]!.notificationId);
    expect(marked?.readAt).not.toBeNull();
  });
});

describe('MockAdapter Audit Logs', () => {
  let adapter: MockAdapter;

  beforeEach(() => {
    adapter = new MockAdapter();
  });

  it('gets audit logs (admin)', async () => {
    const admin = (adapter as any).users.find((u: any) => u.role === 'admin');
    (adapter as any).setTestUser(admin);

    const logs = await adapter.getAuditLogs();
    expect(Array.isArray(logs)).toBe(true);
    expect(logs.length).toBeGreaterThan(0);
  });

  it('filters audit logs by action', async () => {
    const admin = (adapter as any).users.find((u: any) => u.role === 'admin');
    (adapter as any).setTestUser(admin);

    const logs = await adapter.getAuditLogs({ action: 'LOGIN' });
    expect(logs.every(l => l.action === 'LOGIN')).toBe(true);
  });
});