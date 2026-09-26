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
  VerificationChallenge,
  CreateIssueRequest,
  IssueQuery,
  ReplyRequest,
  AuthResponse,
  RuntimeInfo,
  UserDashboardData,
  ITDashboardData,
  AdminDashboardData,
} from '@/types';

export class MockAdapter implements AppAdapter {
  private users: User[] = [
    {
      userId: 'usr_admin_001',
      fullName: 'Dr. Michael Chen',
      displayName: 'IT Administrator',
      department: 'IT Directorate',
      email: 'admin@charitas.org',
      phoneNumber: '+628111222333',
      googleSub: 'google_sub_admin_123',
      emailVerifiedAt: '2026-01-01T00:00:00.000Z',
      phoneVerifiedAt: '2026-01-01T00:00:00.000Z',
      googleLinkedAt: '2026-01-01T00:00:00.000Z',
      role: 'admin',
      status: 'active',
      twoFactorEnabled: true,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
      lastLoginAt: '2026-09-26T08:00:00.000Z',
    },
    {
      userId: 'usr_staff_001',
      fullName: 'Budi Santoso',
      displayName: 'Budi (IT Support)',
      department: 'IT Infrastructure & Support',
      email: 'staff@charitas.org',
      phoneNumber: '+6281298765432',
      googleSub: null,
      emailVerifiedAt: '2026-01-15T00:00:00.000Z',
      phoneVerifiedAt: '2026-01-15T00:00:00.000Z',
      googleLinkedAt: null,
      role: 'it_staff',
      status: 'active',
      twoFactorEnabled: false,
      createdAt: '2026-01-15T00:00:00.000Z',
      updatedAt: '2026-01-15T00:00:00.000Z',
      lastLoginAt: '2026-09-26T07:30:00.000Z',
    },
    {
      userId: 'usr_user_001',
      fullName: 'Sister Maria Teresa',
      displayName: 'Sr. Maria',
      department: 'Inpatient Care - St. Anne Ward',
      email: 'user@charitas.org',
      phoneNumber: '+6281355566677',
      googleSub: null,
      emailVerifiedAt: '2026-02-01T00:00:00.000Z',
      phoneVerifiedAt: null,
      googleLinkedAt: null,
      role: 'user',
      status: 'active',
      twoFactorEnabled: false,
      createdAt: '2026-02-01T00:00:00.000Z',
      updatedAt: '2026-02-01T00:00:00.000Z',
      lastLoginAt: '2026-09-25T15:20:00.000Z',
    },
    {
      userId: 'usr_user_002',
      fullName: 'dr. Andi Pratama, Sp.A',
      displayName: 'dr. Andi',
      department: 'Pediatric Clinic',
      email: 'andi.pratama@charitas.org',
      phoneNumber: '+628177788899',
      googleSub: null,
      emailVerifiedAt: '2026-02-10T00:00:00.000Z',
      phoneVerifiedAt: null,
      googleLinkedAt: null,
      role: 'user',
      status: 'active',
      twoFactorEnabled: false,
      createdAt: '2026-02-10T00:00:00.000Z',
      updatedAt: '2026-02-10T00:00:00.000Z',
      lastLoginAt: '2026-09-24T11:00:00.000Z',
    },
  ];

  private categories: FAQCategory[] = [
    {
      categoryId: 'cat_his_emr',
      name: 'HIS & Electronic Medical Records (EMR)',
      description: 'Charitas In-House Hospital Information System, patient charts, electronic prescriptions, and diagnostic results.',
      icon: 'Activity',
      status: 'active',
      sortOrder: 1,
    },
    {
      categoryId: 'cat_hardware',
      name: 'Computers & Medical Peripherals',
      description: 'Workstations, nurse station PCs, thermal barcode printers, and bed-side tablets.',
      icon: 'Monitor',
      status: 'active',
      sortOrder: 2,
    },
    {
      categoryId: 'cat_network',
      name: 'Wi-Fi & Hospital Network',
      description: 'Internal Charitas-Staff Wi-Fi, PACS medical image transmission network, and branch VPN.',
      icon: 'Wifi',
      status: 'active',
      sortOrder: 3,
    },
    {
      categoryId: 'cat_account',
      name: 'Accounts & Access Credentials',
      description: 'Active Directory domain accounts, EMR credentials, and medical staff permissions.',
      icon: 'KeyRound',
      status: 'active',
      sortOrder: 4,
    },
    {
      categoryId: 'cat_printer',
      name: 'Printers & Label Scanners',
      description: 'Pharmacy prescription label printers, laboratory barcode scanners, and radiology report printing.',
      icon: 'Printer',
      status: 'active',
      sortOrder: 5,
    },
  ];

  private faqs: FAQ[] = [
    {
      faqId: 'faq_emr_001',
      categoryId: 'cat_his_emr',
      question: 'How do I unlock an EMR patient record locked by another workstation?',
      answer:
        'If a patient record displays "Locked by Nurse Station 3B", wait 5 minutes for automatic session timeout. If urgent, contact IT Support ext 1100 with the Medical Record Number (MRN) for administrative lock release.',
      keywords: ['emr', 'his', 'locked record', 'mrn', 'patient chart'],
      status: 'published',
      helpfulCount: 42,
      unhelpfulCount: 1,
      createdBy: 'usr_admin_001',
      updatedBy: 'usr_admin_001',
      createdAt: '2026-02-01T08:00:00.000Z',
      updatedAt: '2026-02-01T08:00:00.000Z',
    },
    {
      faqId: 'faq_wifi_001',
      categoryId: 'cat_network',
      question: 'How do I connect my clinical tablet to Charitas-Staff Wi-Fi?',
      answer:
        'Select the "Charitas-Staff" SSID from the Wi-Fi list. In the security dialog, select WPA2-Enterprise with PEAP method, enter your hospital Active Directory username and password, and accept the security certificate.',
      keywords: ['wifi', 'network', 'connect', 'staff', 'tablet'],
      status: 'published',
      helpfulCount: 89,
      unhelpfulCount: 3,
      createdBy: 'usr_admin_001',
      updatedBy: 'usr_staff_001',
      createdAt: '2026-02-05T09:00:00.000Z',
      updatedAt: '2026-02-15T10:00:00.000Z',
    },
    {
      faqId: 'faq_printer_001',
      categoryId: 'cat_printer',
      question: 'How to clear barcode label printer calibration errors in Pharmacy?',
      answer:
        'Turn off the Zebra label printer. Press and hold the Feed button while turning power on. Release when the status light flashes green three times. The printer will calibrate gap sensors automatically.',
      keywords: ['printer', 'label', 'pharmacy', 'calibration', 'barcode'],
      status: 'published',
      helpfulCount: 31,
      unhelpfulCount: 0,
      createdBy: 'usr_staff_001',
      updatedBy: 'usr_staff_001',
      createdAt: '2026-02-10T11:00:00.000Z',
      updatedAt: '2026-02-10T11:00:00.000Z',
    },
    {
      faqId: 'faq_pwd_001',
      categoryId: 'cat_account',
      question: 'How do I reset my hospital computer login password?',
      answer:
        'Press Ctrl+Alt+Del on your hospital PC and select "Change a password". If you are already locked out, you can request a reset via this portal using your registered staff phone number or by calling IT Helpdesk ext 1100.',
      keywords: ['password', 'reset', 'active directory', 'login', 'account'],
      status: 'published',
      helpfulCount: 114,
      unhelpfulCount: 2,
      createdBy: 'usr_admin_001',
      updatedBy: 'usr_admin_001',
      createdAt: '2026-02-12T14:00:00.000Z',
      updatedAt: '2026-02-12T14:00:00.000Z',
    },
  ];

  private issues: Issue[] = [
    {
      issueId: 'iss_20260926_001',
      title: 'Emergency Room bedside vital monitor printer offline',
      description: 'The thermal slip printer connected to Bed 4 Vital Monitor in ER is unresponsive. Red error LED is flashing continuously.',
      categoryId: 'cat_hardware',
      priority: 'urgent',
      status: 'in_progress',
      userId: null,
      guestToken: 'guest_token_er_vital_001',
      guestName: 'Nurse Yohana (ER)',
      guestEmail: 'yohana.er@charitas.org',
      guestPhone: '+6281234567890',
      assignedTo: 'usr_staff_001',
      createdAt: '2026-09-26T06:30:00.000Z',
      updatedAt: '2026-09-26T07:15:00.000Z',
      resolvedAt: null,
      closedAt: null,
    },
    {
      issueId: 'iss_20260925_002',
      title: 'EMR Prescription Module freezing after recent update',
      description: 'When prescribing multiple antibiotics in St. Anne Ward, the system hangs for 30 seconds before confirming submission.',
      categoryId: 'cat_his_emr',
      priority: 'high',
      status: 'assigned',
      userId: 'usr_user_001',
      guestToken: null,
      assignedTo: 'usr_staff_001',
      createdAt: '2026-09-25T14:00:00.000Z',
      updatedAt: '2026-09-25T14:30:00.000Z',
      resolvedAt: null,
      closedAt: null,
    },
    {
      issueId: 'iss_20260924_003',
      title: 'Pediatric Clinic Wi-Fi signal weak in Doctor Consultation Room 2',
      description: 'Wi-Fi drops frequently during telemedicine video sessions with patients.',
      categoryId: 'cat_network',
      priority: 'medium',
      status: 'resolved',
      userId: 'usr_user_002',
      guestToken: null,
      assignedTo: 'usr_staff_001',
      createdAt: '2026-09-24T09:00:00.000Z',
      updatedAt: '2026-09-24T16:00:00.000Z',
      resolvedAt: '2026-09-24T16:00:00.000Z',
      closedAt: null,
    },
    {
      issueId: 'iss_20260923_004',
      title: 'New radiologist access account provisioning',
      description: 'Please create an account for Dr. Hendra with access to PACS server and Radiology Reporting workstation.',
      categoryId: 'cat_account',
      priority: 'low',
      status: 'closed',
      userId: 'usr_user_001',
      guestToken: null,
      assignedTo: 'usr_admin_001',
      createdAt: '2026-09-23T08:00:00.000Z',
      updatedAt: '2026-09-23T12:00:00.000Z',
      resolvedAt: '2026-09-23T11:30:00.000Z',
      closedAt: '2026-09-23T12:00:00.000Z',
    },
    {
      issueId: 'iss_20260926_005',
      title: 'Laboratory barcode scanner not reading test tube labels',
      description: 'Scanner laser flashes but does not input barcode into the LIS terminal. Cleaned optical glass but problem persists.',
      categoryId: 'cat_printer',
      priority: 'high',
      status: 'open',
      userId: null,
      guestToken: 'guest_token_lab_barcode_002',
      guestName: 'Analis Laboratorium Santo Lukas',
      guestEmail: 'lab@charitas.org',
      guestPhone: '+6281987654321',
      assignedTo: null,
      createdAt: '2026-09-26T08:15:00.000Z',
      updatedAt: '2026-09-26T08:15:00.000Z',
      resolvedAt: null,
      closedAt: null,
    },
  ];

  private replies: IssueReply[] = [
    {
      replyId: 'rep_001',
      issueId: 'iss_20260926_001',
      authorId: 'usr_staff_001',
      authorName: 'Budi (IT Support)',
      authorType: 'it_staff',
      message: 'Acknowledged. IT technician Budi is on the way to ER bed 4 with replacement thermal print-head.',
      isInternal: false,
      createdAt: '2026-09-26T06:45:00.000Z',
    },
    {
      replyId: 'rep_002',
      issueId: 'iss_20260926_001',
      authorId: 'usr_staff_001',
      authorName: 'Budi (IT Support)',
      authorType: 'it_staff',
      message: 'INTERNAL NOTE: Replacement hardware unit serial #TH-9942 fetched from IT inventory cabinet A-2.',
      isInternal: true,
      createdAt: '2026-09-26T06:50:00.000Z',
    },
    {
      replyId: 'rep_003',
      issueId: 'iss_20260924_003',
      authorId: 'usr_staff_001',
      authorName: 'Budi (IT Support)',
      authorType: 'it_staff',
      message: 'Installed additional Ubiquiti UniFi AP ceiling unit in corridor outside Room 2. Signal level verified at -52 dBm.',
      isInternal: false,
      createdAt: '2026-09-24T15:45:00.000Z',
    },
  ];

  private notifications: Notification[] = [
    {
      notificationId: 'notif_001',
      userId: 'usr_user_001',
      type: 'issue_assigned',
      title: 'Ticket Assigned to IT Support',
      message: 'Your ticket "EMR Prescription Module freezing" has been assigned to Budi Santoso.',
      entityType: 'issue',
      entityId: 'iss_20260925_002',
      readAt: null,
      createdAt: '2026-09-25T14:30:00.000Z',
    },
    {
      notificationId: 'notif_002',
      userId: 'usr_staff_001',
      type: 'issue_created',
      title: 'Urgent ER Ticket Created',
      message: 'A high-priority ticket was submitted for ER bedside vital monitor printer.',
      entityType: 'issue',
      entityId: 'iss_20260926_001',
      readAt: null,
      createdAt: '2026-09-26T06:30:00.000Z',
    },
  ];

  private auditLogs: AuditLog[] = [
    {
      auditId: 'aud_001',
      actorUserId: 'usr_admin_001',
      actorName: 'Dr. Michael Chen',
      action: 'LOGIN',
      entityType: 'session',
      entityId: 'usr_admin_001',
      metadata: { method: 'email', ip: '10.10.1.25' },
      createdAt: '2026-09-26T08:00:00.000Z',
    },
    {
      auditId: 'aud_002',
      actorUserId: 'usr_staff_001',
      actorName: 'Budi Santoso',
      action: 'ASSIGN_ISSUE',
      entityType: 'issue',
      entityId: 'iss_20260926_001',
      metadata: { assignedTo: 'usr_staff_001' },
      createdAt: '2026-09-26T06:40:00.000Z',
    },
    {
      auditId: 'aud_003',
      actorUserId: 'usr_admin_001',
      actorName: 'Dr. Michael Chen',
      action: 'UPDATE_FAQ',
      entityType: 'faq',
      entityId: 'faq_emr_001',
      metadata: { status: 'published' },
      createdAt: '2026-09-25T10:00:00.000Z',
    },
  ];

  private challenges: Map<string, VerificationChallenge> = new Map();
  private currentUser: User | null = null;

  constructor() {
    // Default logged in user for local development ease is admin
    this.currentUser = this.users[0] ?? null;
  }

  async testRuntime(): Promise<RuntimeInfo> {
    return {
      environment: 'mock',
      version: '1.0.0-mock-local',
      timestamp: new Date().toISOString(),
      authenticatedUser: this.currentUser,
    };
  }

  // Authentication
  async registerWithEmail(
    fullName: string,
    email: string,
    _password: string,
    department: string
  ): Promise<{ challengeId: string; email: string }> {
    const existing = this.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      throw new Error('An account with this email address already exists.');
    }

    const userId = `usr_${Date.now()}`;
    const newUser: User = {
      userId,
      fullName,
      displayName: fullName.split(' ')[0] || fullName,
      department: department || 'General Hospital Staff',
      email,
      phoneNumber: null,
      googleSub: null,
      emailVerifiedAt: null,
      phoneVerifiedAt: null,
      googleLinkedAt: null,
      role: 'user',
      status: 'pending_verification',
      twoFactorEnabled: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLoginAt: null,
    };

    this.users.push(newUser);

    const challengeId = `ch_email_${Date.now()}`;
    this.challenges.set(challengeId, {
      challengeId,
      userId,
      type: 'email',
      target: email,
      codeHash: '123456', // Deterministic code for mock development
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      attempts: 0,
      maxAttempts: 5,
      resendCooldownUntil: new Date(Date.now() + 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
    });

    this.recordAudit(userId, fullName, 'REGISTER', 'user', userId, { email, department });

    return { challengeId, email };
  }

  async loginWithEmail(email: string, _password: string): Promise<AuthResponse> {
    const user = this.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      throw new Error('Invalid email or password.');
    }

    if (user.status === 'suspended') {
      throw new Error('This account has been suspended by IT Security.');
    }

    this.currentUser = user;
    user.lastLoginAt = new Date().toISOString();

    this.recordAudit(user.userId, user.fullName, 'LOGIN', 'user', user.userId, { method: 'email' });

    return {
      user,
      sessionToken: `mock_session_token_${user.userId}_${Date.now()}`,
    };
  }

  async registerWithPhone(
    fullName: string,
    phoneNumber: string,
    _password: string,
    department: string
  ): Promise<{ challengeId: string; phone: string }> {
    const cleanPhone = phoneNumber.trim();
    const userId = `usr_${Date.now()}`;
    const newUser: User = {
      userId,
      fullName,
      displayName: fullName.split(' ')[0] || fullName,
      department: department || 'Clinical Department',
      email: `${cleanPhone.replace(/\D/g, '')}@charitas.internal`,
      phoneNumber: cleanPhone,
      googleSub: null,
      emailVerifiedAt: null,
      phoneVerifiedAt: null,
      googleLinkedAt: null,
      role: 'user',
      status: 'pending_verification',
      twoFactorEnabled: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLoginAt: null,
    };

    this.users.push(newUser);

    const challengeId = `ch_phone_${Date.now()}`;
    this.challenges.set(challengeId, {
      challengeId,
      userId,
      type: 'phone',
      target: cleanPhone,
      codeHash: '123456',
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      attempts: 0,
      maxAttempts: 5,
      resendCooldownUntil: new Date(Date.now() + 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
    });

    return { challengeId, phone: cleanPhone };
  }

  async loginWithPhone(phoneNumber: string, _password?: string): Promise<{ challengeId?: string; auth?: AuthResponse }> {
    const cleanPhone = phoneNumber.trim();
    const user = this.users.find((u) => u.phoneNumber === cleanPhone);

    if (user) {
      const challengeId = `ch_phone_${Date.now()}`;
      this.challenges.set(challengeId, {
        challengeId,
        userId: user.userId,
        type: 'phone',
        target: cleanPhone,
        codeHash: '123456',
        expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        attempts: 0,
        maxAttempts: 5,
        resendCooldownUntil: new Date(Date.now() + 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
      });
      return { challengeId };
    }

    // Auto-create or invite
    const challengeId = `ch_phone_${Date.now()}`;
    const newUserId = `usr_${Date.now()}`;
    const newUser: User = {
      userId: newUserId,
      fullName: 'Phone User ' + cleanPhone.slice(-4),
      displayName: 'Staff ' + cleanPhone.slice(-4),
      department: 'General Staff',
      email: `${cleanPhone.replace(/\D/g, '')}@charitas.internal`,
      phoneNumber: cleanPhone,
      googleSub: null,
      emailVerifiedAt: null,
      phoneVerifiedAt: null,
      googleLinkedAt: null,
      role: 'user',
      status: 'active',
      twoFactorEnabled: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLoginAt: null,
    };
    this.users.push(newUser);

    this.challenges.set(challengeId, {
      challengeId,
      userId: newUserId,
      type: 'phone',
      target: cleanPhone,
      codeHash: '123456',
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      attempts: 0,
      maxAttempts: 5,
      resendCooldownUntil: new Date(Date.now() + 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
    });

    return { challengeId };
  }

  async loginWithGoogle(_credentialOrIdToken: string): Promise<AuthResponse> {
    // In mock mode, log in as primary demo admin or user
    const targetUser = this.users[0]!;
    this.currentUser = targetUser;
    targetUser.googleLinkedAt = targetUser.googleLinkedAt || new Date().toISOString();
    targetUser.lastLoginAt = new Date().toISOString();

    this.recordAudit(targetUser.userId, targetUser.fullName, 'GOOGLE_LOGIN', 'user', targetUser.userId, {
      provider: 'mock_google_identity',
    });

    return {
      user: targetUser,
      sessionToken: `mock_google_session_${targetUser.userId}`,
    };
  }

  async verifyEmail(challengeId: string, code: string): Promise<AuthResponse> {
    const challenge = this.challenges.get(challengeId);
    if (!challenge) {
      throw new Error('Invalid or expired verification session.');
    }

    if (code !== '123456' && code !== challenge.codeHash) {
      challenge.attempts += 1;
      if (challenge.attempts >= challenge.maxAttempts) {
        this.challenges.delete(challengeId);
        throw new Error('Maximum verification attempts exceeded. Please request a new code.');
      }
      throw new Error(`Incorrect verification code. (${challenge.maxAttempts - challenge.attempts} attempts remaining)`);
    }

    const user = this.users.find((u) => u.userId === challenge.userId);
    if (!user) throw new Error('User not found.');

    user.emailVerifiedAt = new Date().toISOString();
    user.status = 'active';
    this.currentUser = user;
    this.challenges.delete(challengeId);

    this.recordAudit(user.userId, user.fullName, 'VERIFY_EMAIL', 'user', user.userId, {});

    return {
      user,
      sessionToken: `mock_session_${user.userId}`,
    };
  }

  async verifyPhone(challengeId: string, code: string): Promise<AuthResponse> {
    const challenge = this.challenges.get(challengeId);
    if (!challenge) {
      throw new Error('Invalid or expired verification session.');
    }

    if (code !== '123456' && code !== challenge.codeHash) {
      challenge.attempts += 1;
      if (challenge.attempts >= challenge.maxAttempts) {
        this.challenges.delete(challengeId);
        throw new Error('Maximum verification attempts exceeded. Please request a new code.');
      }
      throw new Error('Incorrect verification code. Default development code is 123456.');
    }

    const user = this.users.find((u) => u.userId === challenge.userId);
    if (!user) throw new Error('User not found.');

    user.phoneVerifiedAt = new Date().toISOString();
    user.status = 'active';
    this.currentUser = user;
    this.challenges.delete(challengeId);

    this.recordAudit(user.userId, user.fullName, 'VERIFY_PHONE', 'user', user.userId, {});

    return {
      user,
      sessionToken: `mock_session_${user.userId}`,
    };
  }

  async resendVerification(challengeId: string): Promise<{ success: boolean; message: string }> {
    const challenge = this.challenges.get(challengeId);
    if (!challenge) {
      return { success: false, message: 'Challenge session expired. Please start over.' };
    }

    challenge.codeHash = '123456';
    challenge.expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    challenge.resendCooldownUntil = new Date(Date.now() + 60 * 1000).toISOString();

    return { success: true, message: `New verification code dispatched to ${challenge.target}. (Mock code: 123456)` };
  }

  async requestPasswordReset(emailOrPhone: string): Promise<{ challengeId: string; message: string }> {
    const clean = emailOrPhone.trim().toLowerCase();
    const user = this.users.find(
      (u) => u.email.toLowerCase() === clean || u.phoneNumber === clean
    );

    const challengeId = `ch_pwd_reset_${Date.now()}`;
    const targetUserId = user ? user.userId : 'anonymous';

    this.challenges.set(challengeId, {
      challengeId,
      userId: targetUserId,
      type: 'password_reset',
      target: clean,
      codeHash: '123456',
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      attempts: 0,
      maxAttempts: 3,
      resendCooldownUntil: new Date(Date.now() + 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
    });

    return {
      challengeId,
      message: 'If the account exists, a 6-digit recovery code was sent. (Mock code: 123456)',
    };
  }

  async resetPassword(challengeId: string, code: string, _newPassword: string): Promise<{ success: boolean }> {
    const challenge = this.challenges.get(challengeId);
    if (!challenge || challenge.type !== 'password_reset') {
      throw new Error('Invalid or expired password reset challenge.');
    }

    if (code !== '123456' && code !== challenge.codeHash) {
      throw new Error('Invalid recovery code.');
    }

    const user = this.users.find((u) => u.userId === challenge.userId);
    if (user) {
      this.recordAudit(user.userId, user.fullName, 'PASSWORD_RESET', 'user', user.userId, {});
    }

    this.challenges.delete(challengeId);
    return { success: true };
  }

  async getCurrentUser(): Promise<User | null> {
    return this.currentUser;
  }

  async logout(): Promise<void> {
    if (this.currentUser) {
      this.recordAudit(this.currentUser.userId, this.currentUser.fullName, 'LOGOUT', 'user', this.currentUser.userId, {});
    }
    this.currentUser = null;
  }

  // FAQ Operations
  async getFAQs(categoryId?: string, search?: string): Promise<FAQ[]> {
    let result = this.faqs.filter((f) => f.status === 'published');
    if (categoryId && categoryId !== 'all') {
      result = result.filter((f) => f.categoryId === categoryId);
    }
    if (search && search.trim() !== '') {
      const q = search.toLowerCase();
      result = result.filter(
        (f) =>
          f.question.toLowerCase().includes(q) ||
          f.answer.toLowerCase().includes(q) ||
          f.keywords.some((k) => k.toLowerCase().includes(q))
      );
    }
    return result;
  }

  async getFAQ(id: string): Promise<FAQ | null> {
    const faq = this.faqs.find((f) => f.faqId === id);
    return faq ?? null;
  }

  async searchFAQs(query: string): Promise<FAQ[]> {
    return this.getFAQs(undefined, query);
  }

  async getFAQCategories(): Promise<FAQCategory[]> {
    return this.categories.filter((c) => c.status === 'active').sort((a, b) => a.sortOrder - b.sortOrder);
  }

  async createFAQ(data: Omit<FAQ, 'faqId' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>): Promise<FAQ> {
    const faqId = `faq_${Date.now()}`;
    const authorId = this.currentUser?.userId ?? 'usr_admin_001';
    const newFaq: FAQ = {
      faqId,
      ...data,
      helpfulCount: 0,
      unhelpfulCount: 0,
      createdBy: authorId,
      updatedBy: authorId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.faqs.unshift(newFaq);
    this.recordAudit(authorId, this.currentUser?.fullName ?? 'Admin', 'CREATE_FAQ', 'faq', faqId, {
      question: data.question,
    });
    return newFaq;
  }

  async updateFAQ(id: string, data: Partial<FAQ>): Promise<FAQ> {
    const faq = this.faqs.find((f) => f.faqId === id);
    if (!faq) throw new Error(`FAQ not found: ${id}`);

    Object.assign(faq, data, {
      updatedBy: this.currentUser?.userId ?? faq.updatedBy,
      updatedAt: new Date().toISOString(),
    });

    this.recordAudit(this.currentUser?.userId ?? 'sys', this.currentUser?.fullName ?? 'Staff', 'UPDATE_FAQ', 'faq', id, data);
    return faq;
  }

  async deleteFAQ(id: string): Promise<boolean> {
    const idx = this.faqs.findIndex((f) => f.faqId === id);
    if (idx === -1) return false;
    this.faqs.splice(idx, 1);
    this.recordAudit(this.currentUser?.userId ?? 'sys', this.currentUser?.fullName ?? 'Staff', 'DELETE_FAQ', 'faq', id, {});
    return true;
  }

  async submitFAQFeedback(id: string, isHelpful: boolean): Promise<{ helpfulCount: number; unhelpfulCount: number }> {
    const faq = this.faqs.find((f) => f.faqId === id);
    if (!faq) throw new Error('FAQ not found');
    if (isHelpful) {
      faq.helpfulCount = (faq.helpfulCount || 0) + 1;
    } else {
      faq.unhelpfulCount = (faq.unhelpfulCount || 0) + 1;
    }
    return {
      helpfulCount: faq.helpfulCount || 0,
      unhelpfulCount: faq.unhelpfulCount || 0,
    };
  }

  // Issue Operations
  async createIssue(request: CreateIssueRequest): Promise<Issue> {
    const issueId = `iss_${Date.now()}`;
    const guestToken = this.currentUser ? null : `gst_${Math.random().toString(36).substring(2, 12)}`;

    const newIssue: Issue = {
      issueId,
      title: request.title,
      description: request.description,
      categoryId: request.categoryId,
      priority: request.priority,
      status: 'open',
      userId: this.currentUser?.userId ?? null,
      guestToken,
      guestName: request.guestName ?? (this.currentUser ? this.currentUser.fullName : 'Guest Hospital User'),
      guestEmail: request.guestEmail ?? (this.currentUser ? this.currentUser.email : null),
      guestPhone: request.guestPhone ?? (this.currentUser ? this.currentUser.phoneNumber : null),
      assignedTo: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      resolvedAt: null,
      closedAt: null,
    };

    this.issues.unshift(newIssue);

    this.recordAudit(
      this.currentUser?.userId ?? 'guest',
      this.currentUser?.fullName ?? (request.guestName || 'Guest'),
      'CREATE_ISSUE',
      'issue',
      issueId,
      { title: request.title, priority: request.priority }
    );

    // Notify IT staff
    this.notifications.unshift({
      notificationId: `notif_${Date.now()}`,
      userId: 'usr_staff_001',
      type: 'issue_created',
      title: `New Ticket Created: ${request.title}`,
      message: `${newIssue.guestName} submitted an issue with priority ${request.priority.toUpperCase()}.`,
      entityType: 'issue',
      entityId: issueId,
      readAt: null,
      createdAt: new Date().toISOString(),
    });

    return newIssue;
  }

  async getIssue(id: string, guestToken?: string): Promise<Issue | null> {
    const issue = this.issues.find((i) => i.issueId === id);
    if (!issue) return null;

    // Check authorization:
    // If staff/admin, can view any
    // If authenticated user, can view own
    // If guest with valid token, can view
    if (this.currentUser) {
      if (
        this.currentUser.role === 'admin' ||
        this.currentUser.role === 'it_staff' ||
        issue.userId === this.currentUser.userId
      ) {
        return issue;
      }
    }

    if (guestToken && issue.guestToken === guestToken) {
      return issue;
    }

    // Return issue if publicly requested without sensitive fields or if guest token matches
    return issue;
  }

  async getIssues(query?: IssueQuery): Promise<Issue[]> {
    let result = [...this.issues];

    if (query?.status && query.status !== 'all') {
      result = result.filter((i) => i.status === query.status);
    }
    if (query?.categoryId && query.categoryId !== 'all') {
      result = result.filter((i) => i.categoryId === query.categoryId);
    }
    if (query?.priority && query.priority !== 'all') {
      result = result.filter((i) => i.priority === query.priority);
    }
    if (query?.assignedTo && query.assignedTo !== 'all') {
      if (query.assignedTo === 'unassigned') {
        result = result.filter((i) => !i.assignedTo);
      } else if (query.assignedTo === 'me' && this.currentUser) {
        result = result.filter((i) => i.assignedTo === this.currentUser!.userId);
      } else {
        result = result.filter((i) => i.assignedTo === query.assignedTo);
      }
    }
    if (query?.userId) {
      result = result.filter((i) => i.userId === query.userId);
    }
    if (query?.search && query.search.trim() !== '') {
      const q = query.search.toLowerCase();
      result = result.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q) ||
          i.issueId.toLowerCase().includes(q) ||
          (i.guestName && i.guestName.toLowerCase().includes(q))
      );
    }

    return result;
  }

  async getMyIssues(): Promise<Issue[]> {
    if (!this.currentUser) return [];
    return this.issues.filter((i) => i.userId === this.currentUser!.userId);
  }

  async replyToIssue(request: ReplyRequest): Promise<IssueReply> {
    const issue = this.issues.find((i) => i.issueId === request.issueId);
    if (!issue) throw new Error(`Issue not found: ${request.issueId}`);

    const replyId = `rep_${Date.now()}`;
    const authorId = this.currentUser ? this.currentUser.userId : 'guest';
    const authorName = this.currentUser ? this.currentUser.fullName : (issue.guestName || 'Guest User');
    const authorType = this.currentUser
      ? this.currentUser.role === 'it_staff' || this.currentUser.role === 'admin'
        ? 'it_staff'
        : 'user'
      : 'guest';

    const reply: IssueReply = {
      replyId,
      issueId: request.issueId,
      authorId,
      authorName,
      authorType,
      message: request.message,
      isInternal: false,
      createdAt: new Date().toISOString(),
    };

    this.replies.push(reply);
    issue.updatedAt = new Date().toISOString();

    // If IT replies, status flips to waiting_for_user or in_progress
    if (authorType === 'it_staff' && issue.status === 'open') {
      issue.status = 'in_progress';
    } else if (authorType === 'user' && issue.status === 'waiting_for_user') {
      issue.status = 'in_progress';
    }

    this.recordAudit(authorId, authorName, 'REPLY_ISSUE', 'issue', request.issueId, { messagePreview: request.message.slice(0, 50) });

    return reply;
  }

  async addInternalNote(issueId: string, message: string): Promise<IssueReply> {
    if (!this.currentUser || (this.currentUser.role !== 'it_staff' && this.currentUser.role !== 'admin')) {
      throw new Error('Unauthorized: Only IT Staff and Administrators may add internal notes.');
    }

    const issue = this.issues.find((i) => i.issueId === issueId);
    if (!issue) throw new Error(`Issue not found: ${issueId}`);

    const reply: IssueReply = {
      replyId: `rep_note_${Date.now()}`,
      issueId,
      authorId: this.currentUser.userId,
      authorName: this.currentUser.fullName,
      authorType: 'it_staff',
      message,
      isInternal: true,
      createdAt: new Date().toISOString(),
    };

    this.replies.push(reply);
    issue.updatedAt = new Date().toISOString();

    this.recordAudit(this.currentUser.userId, this.currentUser.fullName, 'INTERNAL_NOTE', 'issue', issueId, {});

    return reply;
  }

  async updateIssueStatus(issueId: string, status: IssueStatus): Promise<Issue> {
    const issue = this.issues.find((i) => i.issueId === issueId);
    if (!issue) throw new Error(`Issue not found: ${issueId}`);

    issue.status = status;
    issue.updatedAt = new Date().toISOString();

    if (status === 'resolved') {
      issue.resolvedAt = new Date().toISOString();
    } else if (status === 'closed') {
      issue.closedAt = new Date().toISOString();
    }

    this.recordAudit(
      this.currentUser?.userId ?? 'sys',
      this.currentUser?.fullName ?? 'IT Staff',
      'UPDATE_ISSUE',
      'issue',
      issueId,
      { status }
    );

    return issue;
  }

  async assignIssue(issueId: string, staffUserId: string | null): Promise<Issue> {
    const issue = this.issues.find((i) => i.issueId === issueId);
    if (!issue) throw new Error(`Issue not found: ${issueId}`);

    issue.assignedTo = staffUserId;
    if (staffUserId && issue.status === 'open') {
      issue.status = 'assigned';
    }
    issue.updatedAt = new Date().toISOString();

    this.recordAudit(
      this.currentUser?.userId ?? 'sys',
      this.currentUser?.fullName ?? 'IT Staff',
      'ASSIGN_ISSUE',
      'issue',
      issueId,
      { assignedTo: staffUserId }
    );

    return issue;
  }

  async updateIssuePriority(issueId: string, priority: IssuePriority): Promise<Issue> {
    const issue = this.issues.find((i) => i.issueId === issueId);
    if (!issue) throw new Error(`Issue not found: ${issueId}`);

    issue.priority = priority;
    issue.updatedAt = new Date().toISOString();

    return issue;
  }

  async updateIssueCategory(issueId: string, categoryId: string): Promise<Issue> {
    const issue = this.issues.find((i) => i.issueId === issueId);
    if (!issue) throw new Error(`Issue not found: ${issueId}`);

    issue.categoryId = categoryId;
    issue.updatedAt = new Date().toISOString();

    return issue;
  }

  async getIssueReplies(issueId: string, _guestToken?: string): Promise<IssueReply[]> {
    const replies = this.replies.filter((r) => r.issueId === issueId);
    const isStaffOrAdmin =
      this.currentUser &&
      (this.currentUser.role === 'it_staff' || this.currentUser.role === 'admin');

    if (!isStaffOrAdmin) {
      // Filter out internal notes completely from guests and normal users
      return replies.filter((r) => !r.isInternal);
    }

    return replies;
  }

  // Dashboards
  async getUserDashboard(): Promise<UserDashboardData> {
    const myIssues = await this.getMyIssues();
    const open = myIssues.filter((i) => i.status !== 'closed' && i.status !== 'resolved').length;
    const resolved = myIssues.filter((i) => i.status === 'resolved' || i.status === 'closed').length;
    const unread = this.notifications.filter((n) => n.userId === this.currentUser?.userId && !n.readAt).length;

    return {
      openIssuesCount: open,
      resolvedIssuesCount: resolved,
      recentIssues: myIssues.slice(0, 5),
      unreadNotificationsCount: unread,
      recommendedFAQs: this.faqs.slice(0, 3),
    };
  }

  async getITDashboard(): Promise<ITDashboardData> {
    const totalNew = this.issues.filter((i) => i.status === 'open').length;
    const totalOpen = this.issues.filter((i) => i.status === 'assigned').length;
    const totalInProgress = this.issues.filter((i) => i.status === 'in_progress').length;
    const totalWaitingUser = this.issues.filter((i) => i.status === 'waiting_for_user').length;
    const totalResolved = this.issues.filter((i) => i.status === 'resolved').length;
    const totalClosed = this.issues.filter((i) => i.status === 'closed').length;

    const myAssigned = this.issues.filter((i) => i.assignedTo === this.currentUser?.userId);
    const unassigned = this.issues.filter((i) => !i.assignedTo && i.status !== 'closed');

    return {
      totalNew,
      totalOpen,
      totalInProgress,
      totalWaitingUser,
      totalResolved,
      totalClosed,
      myAssignedCount: myAssigned.length,
      recentAssignedIssues: myAssigned.slice(0, 5),
      unassignedIssues: unassigned.slice(0, 5),
    };
  }

  async getAdminDashboard(): Promise<AdminDashboardData> {
    const roleCounts: Record<UserRole, number> = {
      guest: 0,
      user: 0,
      it_staff: 0,
      admin: 0,
    };

    for (const u of this.users) {
      roleCounts[u.role] = (roleCounts[u.role] || 0) + 1;
    }

    return {
      totalUsers: this.users.length,
      activeUsers: this.users.filter((u) => u.status === 'active').length,
      totalIssues: this.issues.length,
      openIssues: this.issues.filter((i) => i.status !== 'closed' && i.status !== 'resolved').length,
      totalFAQs: this.faqs.length,
      recentAuditLogs: this.auditLogs.slice(0, 10),
      usersByRole: roleCounts,
    };
  }

  // Users Management
  async getUsers(query?: { search?: string; role?: UserRole; status?: UserStatus }): Promise<User[]> {
    let result = [...this.users];
    if (query?.role) {
      result = result.filter((u) => u.role === query.role);
    }
    if (query?.status) {
      result = result.filter((u) => u.status === query.status);
    }
    if (query?.search && query.search.trim() !== '') {
      const q = query.search.toLowerCase();
      result = result.filter(
        (u) =>
          u.fullName.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.department.toLowerCase().includes(q)
      );
    }
    return result;
  }

  async getUser(userId: string): Promise<User | null> {
    const user = this.users.find((u) => u.userId === userId);
    return user ?? null;
  }

  async updateUser(userId: string, data: Partial<User>): Promise<User> {
    const user = this.users.find((u) => u.userId === userId);
    if (!user) throw new Error('User not found');

    Object.assign(user, data, { updatedAt: new Date().toISOString() });
    return user;
  }

  async updateUserRole(userId: string, role: UserRole): Promise<User> {
    const user = this.users.find((u) => u.userId === userId);
    if (!user) throw new Error('User not found');

    user.role = role;
    user.updatedAt = new Date().toISOString();

    this.recordAudit(this.currentUser?.userId ?? 'admin', this.currentUser?.fullName ?? 'Admin', 'CHANGE_ROLE', 'user', userId, {
      newRole: role,
    });

    return user;
  }

  async updateUserStatus(userId: string, status: UserStatus): Promise<User> {
    const user = this.users.find((u) => u.userId === userId);
    if (!user) throw new Error('User not found');

    user.status = status;
    user.updatedAt = new Date().toISOString();

    this.recordAudit(this.currentUser?.userId ?? 'admin', this.currentUser?.fullName ?? 'Admin', 'CHANGE_USER_STATUS', 'user', userId, {
      newStatus: status,
    });

    return user;
  }

  // Notifications
  async getNotifications(): Promise<Notification[]> {
    if (!this.currentUser) return [];
    return this.notifications.filter(
      (n) => n.userId === this.currentUser!.userId || this.currentUser!.role === 'admin'
    );
  }

  async markNotificationRead(notificationId: string): Promise<void> {
    const notif = this.notifications.find((n) => n.notificationId === notificationId);
    if (notif) {
      notif.readAt = new Date().toISOString();
    }
  }

  async markAllNotificationsRead(): Promise<void> {
    const uid = this.currentUser?.userId;
    for (const notif of this.notifications) {
      if (!uid || notif.userId === uid) {
        notif.readAt = new Date().toISOString();
      }
    }
  }

  // Audit Logs
  async getAuditLogs(query?: { action?: string; actorId?: string; entityType?: string }): Promise<AuditLog[]> {
    let result = [...this.auditLogs];
    if (query?.action) {
      result = result.filter((a) => a.action === query.action);
    }
    if (query?.actorId) {
      result = result.filter((a) => a.actorUserId === query.actorId);
    }
    if (query?.entityType) {
      result = result.filter((a) => a.entityType === query.entityType);
    }
    return result;
  }

  // Helper
  private recordAudit(
    actorUserId: string,
    actorName: string,
    action: any,
    entityType: string,
    entityId: string,
    metadata: Record<string, unknown>
  ): void {
    this.auditLogs.unshift({
      auditId: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      actorUserId,
      actorName,
      action,
      entityType,
      entityId,
      metadata,
      createdAt: new Date().toISOString(),
    });
  }

  // For testing switch user
  setTestUser(user: User | null): void {
    this.currentUser = user;
  }
}
