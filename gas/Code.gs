/**
 * Charitas IT Issue & FAQ System — Google Apps Script Backend
 *
 * Architecture:
 *   doGet() → HtmlService → React SPA
 *   google.script.run → Functions below → Google Sheets
 *
 * Sheet names (tabs in the bound Spreadsheet):
 *   Users, Sessions, VerificationChallenges,
 *   Categories, FAQs,
 *   Issues, IssueReplies,
 *   Notifications, AuditLogs, SystemConfig
 */

// ─── Constants ───────────────────────────────────────────────────────────────

var SHEET_NAMES = {
  USERS: 'Users',
  SESSIONS: 'Sessions',
  VERIFICATIONS: 'VerificationChallenges',
  CATEGORIES: 'Categories',
  FAQS: 'FAQs',
  ISSUES: 'Issues',
  REPLIES: 'IssueReplies',
  NOTIFICATIONS: 'Notifications',
  AUDIT_LOGS: 'AuditLogs',
  CONFIG: 'SystemConfig',
};

var VERSION = '1.0.0';
var SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
var VERIFICATION_EXPIRY_MS = 15 * 60 * 1000; // 15 minutes
var RESEND_COOLDOWN_MS = 2 * 60 * 1000; // 2 minutes

// ─── Web App Entry Point ──────────────────────────────────────────────────────

function doGet(_e) {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('Charitas IT Issue & FAQ System')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

// ─── Spreadsheet Helpers ──────────────────────────────────────────────────────

function getSpreadsheet() {
  // If bound to a spreadsheet, use it; otherwise open from script properties
  try {
    return SpreadsheetApp.getActiveSpreadsheet();
  } catch (e) {
    var ssId = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
    if (!ssId) throw new Error('SPREADSHEET_ID not configured in script properties.');
    return SpreadsheetApp.openById(ssId);
  }
}

function getSheet(name) {
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }
  return sheet;
}

/**
 * Read all rows from a sheet, treating row 1 as headers.
 * Returns array of plain objects.
 */
function readSheet(sheetName) {
  var sheet = getSheet(sheetName);
  var data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];
  var headers = data[0];
  var rows = [];
  for (var i = 1; i < data.length; i++) {
    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      var val = data[i][j];
      // Convert Date objects to ISO strings
      if (val instanceof Date) val = val.toISOString();
      // Convert empty strings to null for nullable fields
      obj[headers[j]] = val === '' ? null : val;
    }
    rows.push(obj);
  }
  return rows;
}

/**
 * Append a row to a sheet. If sheet is empty, write headers first.
 */
function appendRow(sheetName, obj) {
  var sheet = getSheet(sheetName);
  var existingData = sheet.getDataRange().getValues();

  var headers;
  if (existingData.length === 0 || (existingData.length === 1 && existingData[0][0] === '')) {
    // Write headers
    headers = Object.keys(obj);
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  } else {
    headers = existingData[0];
  }

  var row = headers.map(function(h) {
    var v = obj[h];
    return v === null || v === undefined ? '' : v;
  });
  sheet.appendRow(row);
}

/**
 * Update a row in a sheet where obj[keyField] === keyValue.
 * Returns true if found and updated, false otherwise.
 */
function updateRow(sheetName, keyField, keyValue, updates) {
  var sheet = getSheet(sheetName);
  var data = sheet.getDataRange().getValues();
  if (data.length < 2) return false;

  var headers = data[0];
  var keyIdx = headers.indexOf(keyField);
  if (keyIdx === -1) return false;

  for (var i = 1; i < data.length; i++) {
    if (String(data[i][keyIdx]) === String(keyValue)) {
      var updatesKeys = Object.keys(updates);
      for (var k = 0; k < updatesKeys.length; k++) {
        var field = updatesKeys[k];
        var colIdx = headers.indexOf(field);
        if (colIdx !== -1) {
          var val = updates[field];
          sheet.getRange(i + 1, colIdx + 1).setValue(val === null ? '' : val);
        }
      }
      return true;
    }
  }
  return false;
}

/**
 * Delete a row where obj[keyField] === keyValue.
 */
function deleteRow(sheetName, keyField, keyValue) {
  var sheet = getSheet(sheetName);
  var data = sheet.getDataRange().getValues();
  if (data.length < 2) return false;

  var headers = data[0];
  var keyIdx = headers.indexOf(keyField);
  if (keyIdx === -1) return false;

  for (var i = data.length - 1; i >= 1; i--) {
    if (String(data[i][keyIdx]) === String(keyValue)) {
      sheet.deleteRow(i + 1);
      return true;
    }
  }
  return false;
}

function findRow(sheetName, keyField, keyValue) {
  var rows = readSheet(sheetName);
  for (var i = 0; i < rows.length; i++) {
    if (String(rows[i][keyField]) === String(keyValue)) return rows[i];
  }
  return null;
}

// ─── ID & Utility Helpers ─────────────────────────────────────────────────────

function generateId(prefix) {
  return prefix + '_' + Utilities.getUuid().replace(/-/g, '').substring(0, 16);
}

function nowISO() {
  return new Date().toISOString();
}

function futureISO(ms) {
  return new Date(Date.now() + ms).toISOString();
}

function isExpired(isoString) {
  if (!isoString) return true;
  return new Date(isoString).getTime() < Date.now();
}

/**
 * Simple password hash using SHA-256 via Utilities.
 * In production, use a stronger algorithm if available.
 */
function hashPassword(password) {
  var bytes = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    password,
    Utilities.Charset.UTF_8
  );
  return bytes.map(function(b) {
    return ('0' + (b & 0xff).toString(16)).slice(-2);
  }).join('');
}

function generateOTP() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function generateToken() {
  return Utilities.getUuid().replace(/-/g, '') + Utilities.getUuid().replace(/-/g, '');
}

// ─── Session Management ───────────────────────────────────────────────────────

function createSession(userId) {
  var token = generateToken();
  var tokenHash = hashPassword(token);
  var sessionId = generateId('sess');
  var session = {
    sessionId: sessionId,
    userId: userId,
    tokenHash: tokenHash,
    createdAt: nowISO(),
    expiresAt: futureISO(SESSION_DURATION_MS),
    revokedAt: '',
  };
  appendRow(SHEET_NAMES.SESSIONS, session);

  // Store token in script properties keyed by userId for quick lookup
  // (In production use a proper session store)
  var props = PropertiesService.getUserProperties();
  props.setProperty('session_token_' + userId, token);
  props.setProperty('session_id_' + userId, sessionId);

  return token;
}

function getSessionToken() {
  var props = PropertiesService.getUserProperties();
  // Try to find any active session token for current user
  var keys = props.getKeys();
  for (var i = 0; i < keys.length; i++) {
    if (keys[i].indexOf('session_token_') === 0) {
      return props.getProperty(keys[i]);
    }
  }
  return null;
}

function getCurrentUserId() {
  var props = PropertiesService.getUserProperties();
  var keys = props.getKeys();
  for (var i = 0; i < keys.length; i++) {
    if (keys[i].indexOf('session_id_') === 0) {
      var userId = keys[i].replace('session_id_', '');
      var sessionId = props.getProperty(keys[i]);
      // Validate session still exists and not expired
      var session = findRow(SHEET_NAMES.SESSIONS, 'sessionId', sessionId);
      if (session && !session.revokedAt && !isExpired(session.expiresAt)) {
        return userId;
      }
    }
  }
  return null;
}

function revokeSession(userId) {
  var props = PropertiesService.getUserProperties();
  var sessionId = props.getProperty('session_id_' + userId);
  if (sessionId) {
    updateRow(SHEET_NAMES.SESSIONS, 'sessionId', sessionId, { revokedAt: nowISO() });
    props.deleteProperty('session_token_' + userId);
    props.deleteProperty('session_id_' + userId);
  }
}

// ─── Audit Log Helper ─────────────────────────────────────────────────────────

function writeAuditLog(actorUserId, actorName, action, entityType, entityId, metadata) {
  try {
    var log = {
      auditId: generateId('aud'),
      actorUserId: actorUserId || 'system',
      actorName: actorName || 'System',
      action: action,
      entityType: entityType,
      entityId: entityId,
      metadata: JSON.stringify(metadata || {}),
      createdAt: nowISO(),
    };
    appendRow(SHEET_NAMES.AUDIT_LOGS, log);
  } catch (e) {
    // Best effort - don't fail the main operation
    console.error('Audit log error:', e);
  }
}

// ─── Notification Helper ──────────────────────────────────────────────────────

function createNotification(userId, type, title, message, entityType, entityId) {
  try {
    var notif = {
      notificationId: generateId('notif'),
      userId: userId,
      type: type,
      title: title,
      message: message,
      entityType: entityType,
      entityId: entityId,
      readAt: '',
      createdAt: nowISO(),
    };
    appendRow(SHEET_NAMES.NOTIFICATIONS, notif);
  } catch (e) {
    console.error('Notification error:', e);
  }
}

// ─── Runtime ─────────────────────────────────────────────────────────────────

function testRuntime() {
  var userId = getCurrentUserId();
  var user = null;
  if (userId) {
    user = findRow(SHEET_NAMES.USERS, 'userId', userId);
    if (user) {
      delete user.passwordHash;
      // Parse JSON fields
      if (user.metadata) {
        try { user.metadata = JSON.parse(user.metadata); } catch(e) {}
      }
    }
  }
  return {
    environment: 'apps_script',
    version: VERSION,
    timestamp: nowISO(),
    authenticatedUser: user,
  };
}

// ─── Authentication ───────────────────────────────────────────────────────────

function registerWithEmail(fullName, email, password, department) {
  var users = readSheet(SHEET_NAMES.USERS);

  // Check duplicate email
  for (var i = 0; i < users.length; i++) {
    if (users[i].email && users[i].email.toLowerCase() === email.toLowerCase()) {
      throw new Error('An account with this email already exists.');
    }
  }

  var userId = generateId('usr');
  var passwordHash = hashPassword(password);
  var user = {
    userId: userId,
    fullName: fullName,
    displayName: fullName.split(' ')[0],
    department: department,
    email: email,
    phoneNumber: '',
    googleSub: '',
    emailVerifiedAt: '',
    phoneVerifiedAt: '',
    googleLinkedAt: '',
    role: 'user',
    status: 'pending_verification',
    twoFactorEnabled: 'false',
    passwordHash: passwordHash,
    createdAt: nowISO(),
    updatedAt: nowISO(),
    lastLoginAt: '',
  };
  appendRow(SHEET_NAMES.USERS, user);

  // Create email verification challenge
  var challengeId = createVerificationChallenge(userId, 'email', email);

  writeAuditLog(userId, fullName, 'REGISTER', 'user', userId, { email: email });

  return { challengeId: challengeId, email: email };
}

function registerWithPhone(fullName, phoneNumber, password, department) {
  var users = readSheet(SHEET_NAMES.USERS);

  for (var i = 0; i < users.length; i++) {
    if (users[i].phoneNumber && users[i].phoneNumber === phoneNumber) {
      throw new Error('An account with this phone number already exists.');
    }
  }

  var userId = generateId('usr');
  var passwordHash = hashPassword(password);
  var user = {
    userId: userId,
    fullName: fullName,
    displayName: fullName.split(' ')[0],
    department: department,
    email: '',
    phoneNumber: phoneNumber,
    googleSub: '',
    emailVerifiedAt: '',
    phoneVerifiedAt: '',
    googleLinkedAt: '',
    role: 'user',
    status: 'pending_verification',
    twoFactorEnabled: 'false',
    passwordHash: passwordHash,
    createdAt: nowISO(),
    updatedAt: nowISO(),
    lastLoginAt: '',
  };
  appendRow(SHEET_NAMES.USERS, user);

  var challengeId = createVerificationChallenge(userId, 'phone', phoneNumber);
  writeAuditLog(userId, fullName, 'REGISTER', 'user', userId, { phone: phoneNumber });

  return { challengeId: challengeId, phone: phoneNumber };
}

function loginWithEmail(email, password) {
  var users = readSheet(SHEET_NAMES.USERS);
  var user = null;

  for (var i = 0; i < users.length; i++) {
    if (users[i].email && users[i].email.toLowerCase() === email.toLowerCase()) {
      user = users[i];
      break;
    }
  }

  if (!user) throw new Error('No account found with this email address.');
  if (user.status === 'suspended') throw new Error('Your account has been suspended. Please contact IT.');

  var hash = hashPassword(password);
  if (user.passwordHash !== hash) throw new Error('Incorrect password. Please try again.');

  if (user.status === 'pending_verification') {
    throw new Error('Please verify your email address before logging in.');
  }

  // Update last login
  updateRow(SHEET_NAMES.USERS, 'userId', user.userId, { lastLoginAt: nowISO() });

  var token = createSession(user.userId);
  var safeUser = sanitizeUser(user);

  writeAuditLog(user.userId, user.displayName, 'LOGIN', 'user', user.userId, { method: 'email' });

  return { user: safeUser, sessionToken: token };
}

function loginWithPhone(phoneNumber, password) {
  var users = readSheet(SHEET_NAMES.USERS);
  var user = null;

  for (var i = 0; i < users.length; i++) {
    if (users[i].phoneNumber && users[i].phoneNumber === phoneNumber) {
      user = users[i];
      break;
    }
  }

  if (!user) throw new Error('No account found with this phone number.');
  if (user.status === 'suspended') throw new Error('Your account has been suspended.');

  if (password) {
    var hash = hashPassword(password);
    if (user.passwordHash !== hash) throw new Error('Incorrect password.');

    if (user.status === 'pending_verification') {
      throw new Error('Please verify your phone number first.');
    }

    updateRow(SHEET_NAMES.USERS, 'userId', user.userId, { lastLoginAt: nowISO() });
    var token = createSession(user.userId);
    var safeUser = sanitizeUser(user);
    writeAuditLog(user.userId, user.displayName, 'LOGIN', 'user', user.userId, { method: 'phone' });
    return { auth: { user: safeUser, sessionToken: token } };
  } else {
    // OTP flow - send OTP to phone
    var challengeId = createVerificationChallenge(user.userId, 'phone', phoneNumber);
    return { challengeId: challengeId };
  }
}

function loginWithGoogle(credentialOrIdToken) {
  // In production, verify the Google ID token using Google's tokeninfo endpoint
  // For now, we trust the sub from the decoded token payload
  // The frontend should send the decoded sub (Google user ID)
  var googleSub = credentialOrIdToken;

  var users = readSheet(SHEET_NAMES.USERS);
  var user = null;

  for (var i = 0; i < users.length; i++) {
    if (users[i].googleSub && users[i].googleSub === googleSub) {
      user = users[i];
      break;
    }
  }

  if (!user) {
    // Auto-create user on first Google login
    var userId = generateId('usr');
    var newUser = {
      userId: userId,
      fullName: 'Google User',
      displayName: 'Google User',
      department: 'General',
      email: '',
      phoneNumber: '',
      googleSub: googleSub,
      emailVerifiedAt: '',
      phoneVerifiedAt: '',
      googleLinkedAt: nowISO(),
      role: 'user',
      status: 'active',
      twoFactorEnabled: 'false',
      passwordHash: '',
      createdAt: nowISO(),
      updatedAt: nowISO(),
      lastLoginAt: nowISO(),
    };
    appendRow(SHEET_NAMES.USERS, newUser);
    user = newUser;
    writeAuditLog(userId, 'Google User', 'GOOGLE_LOGIN', 'user', userId, { new: true });
  } else {
    if (user.status === 'suspended') throw new Error('Your account has been suspended.');
    updateRow(SHEET_NAMES.USERS, 'userId', user.userId, { lastLoginAt: nowISO() });
    writeAuditLog(user.userId, user.displayName, 'GOOGLE_LOGIN', 'user', user.userId, {});
  }

  var token = createSession(user.userId);
  return { user: sanitizeUser(user), sessionToken: token };
}

function getCurrentUser() {
  var userId = getCurrentUserId();
  if (!userId) return null;
  var user = findRow(SHEET_NAMES.USERS, 'userId', userId);
  if (!user) return null;
  return sanitizeUser(user);
}

function logout() {
  var userId = getCurrentUserId();
  if (userId) {
    revokeSession(userId);
    writeAuditLog(userId, '', 'LOGOUT', 'user', userId, {});
  }
}

// ─── Verification ─────────────────────────────────────────────────────────────

function createVerificationChallenge(userId, type, target) {
  var challengeId = generateId('chall');
  var otp = generateOTP();
  var otpHash = hashPassword(otp);

  var challenge = {
    challengeId: challengeId,
    userId: userId,
    type: type,
    target: target,
    codeHash: otpHash,
    expiresAt: futureISO(VERIFICATION_EXPIRY_MS),
    attempts: 0,
    maxAttempts: 5,
    resendCooldownUntil: futureISO(RESEND_COOLDOWN_MS),
    createdAt: nowISO(),
  };
  appendRow(SHEET_NAMES.VERIFICATIONS, challenge);

  // In production: send OTP via email/SMS/WhatsApp
  // For development: log OTP to console (visible in GAS execution log)
  console.log('[CHARITAS_OTP] Target:', target, 'OTP:', otp, 'ChallengeId:', challengeId);

  // Send email if type is email
  if (type === 'email') {
    try {
      MailApp.sendEmail({
        to: target,
        subject: 'Charitas IT System — Verification Code',
        body: 'Your verification code is: ' + otp + '\n\nThis code expires in 15 minutes.\n\nCharitas IT Team',
        htmlBody: '<h2>Charitas IT System</h2><p>Your verification code is:</p><h1 style="letter-spacing:8px;color:#0284c7;">' + otp + '</h1><p>This code expires in 15 minutes.</p>',
      });
    } catch (e) {
      console.error('Email send error:', e);
    }
  }

  return challengeId;
}

function verifyEmail(challengeId, code) {
  return _verifyChallenge(challengeId, code, 'email', 'VERIFY_EMAIL');
}

function verifyPhone(challengeId, code) {
  return _verifyChallenge(challengeId, code, 'phone', 'VERIFY_PHONE');
}

function _verifyChallenge(challengeId, code, type, auditAction) {
  var challenge = findRow(SHEET_NAMES.VERIFICATIONS, 'challengeId', challengeId);
  if (!challenge) throw new Error('Verification challenge not found.');
  if (isExpired(challenge.expiresAt)) throw new Error('Verification code has expired. Please request a new one.');

  var attempts = parseInt(challenge.attempts) || 0;
  var maxAttempts = parseInt(challenge.maxAttempts) || 5;
  if (attempts >= maxAttempts) throw new Error('Too many attempts. Please request a new code.');

  var codeHash = hashPassword(code);
  if (challenge.codeHash !== codeHash) {
    updateRow(SHEET_NAMES.VERIFICATIONS, 'challengeId', challengeId, { attempts: attempts + 1 });
    throw new Error('Invalid verification code.');
  }

  // Mark verified
  var user = findRow(SHEET_NAMES.USERS, 'userId', challenge.userId);
  if (!user) throw new Error('User not found.');

  var now = nowISO();
  var updates = { status: 'active', updatedAt: now };
  if (type === 'email') updates.emailVerifiedAt = now;
  if (type === 'phone') updates.phoneVerifiedAt = now;

  updateRow(SHEET_NAMES.USERS, 'userId', user.userId, updates);

  // Delete challenge
  deleteRow(SHEET_NAMES.VERIFICATIONS, 'challengeId', challengeId);

  var token = createSession(user.userId);
  writeAuditLog(user.userId, user.displayName, auditAction, 'user', user.userId, {});

  // Fetch updated user
  var updatedUser = findRow(SHEET_NAMES.USERS, 'userId', user.userId);
  return { user: sanitizeUser(updatedUser), sessionToken: token };
}

function resendVerification(challengeId) {
  var challenge = findRow(SHEET_NAMES.VERIFICATIONS, 'challengeId', challengeId);
  if (!challenge) throw new Error('Challenge not found.');

  if (!isExpired(challenge.resendCooldownUntil)) {
    throw new Error('Please wait before requesting another code.');
  }

  var newChallengeId = createVerificationChallenge(challenge.userId, challenge.type, challenge.target);
  deleteRow(SHEET_NAMES.VERIFICATIONS, 'challengeId', challengeId);

  return { success: true, message: 'New verification code sent.', challengeId: newChallengeId };
}

function requestPasswordReset(emailOrPhone) {
  var users = readSheet(SHEET_NAMES.USERS);
  var user = null;

  for (var i = 0; i < users.length; i++) {
    if (
      (users[i].email && users[i].email.toLowerCase() === emailOrPhone.toLowerCase()) ||
      (users[i].phoneNumber && users[i].phoneNumber === emailOrPhone)
    ) {
      user = users[i];
      break;
    }
  }

  if (!user) throw new Error('No account found with that email or phone number.');

  var target = user.email || user.phoneNumber;
  var type = user.email ? 'email' : 'phone';
  var challengeId = createVerificationChallenge(user.userId, type, target);

  return { challengeId: challengeId, message: 'Reset code sent to your ' + type + '.' };
}

function resetPassword(challengeId, code, newPassword) {
  var challenge = findRow(SHEET_NAMES.VERIFICATIONS, 'challengeId', challengeId);
  if (!challenge) throw new Error('Reset challenge not found.');
  if (isExpired(challenge.expiresAt)) throw new Error('Reset code has expired.');

  var codeHash = hashPassword(code);
  if (challenge.codeHash !== codeHash) throw new Error('Invalid reset code.');

  var newHash = hashPassword(newPassword);
  updateRow(SHEET_NAMES.USERS, 'userId', challenge.userId, {
    passwordHash: newHash,
    updatedAt: nowISO(),
  });

  deleteRow(SHEET_NAMES.VERIFICATIONS, 'challengeId', challengeId);
  writeAuditLog(challenge.userId, '', 'PASSWORD_RESET', 'user', challenge.userId, {});

  return { success: true };
}

function sanitizeUser(user) {
  if (!user) return null;
  var safe = {};
  var keys = Object.keys(user);
  for (var i = 0; i < keys.length; i++) {
    if (keys[i] !== 'passwordHash') {
      safe[keys[i]] = user[keys[i]];
    }
  }
  // Normalize boolean
  if (safe.twoFactorEnabled === 'true' || safe.twoFactorEnabled === true) {
    safe.twoFactorEnabled = true;
  } else {
    safe.twoFactorEnabled = false;
  }
  return safe;
}

// ─── FAQ Categories ───────────────────────────────────────────────────────────

function getFAQCategories() {
  return readSheet(SHEET_NAMES.CATEGORIES).filter(function(c) {
    return c.status === 'active';
  });
}

function createCategory(data) {
  _requireAdmin();
  var cat = {
    categoryId: generateId('cat'),
    name: data.name,
    description: data.description || '',
    icon: data.icon || '',
    status: data.status || 'active',
    sortOrder: data.sortOrder || 0,
  };
  appendRow(SHEET_NAMES.CATEGORIES, cat);
  var userId = getCurrentUserId();
  writeAuditLog(userId, '', 'UPDATE_CATEGORY', 'category', cat.categoryId, { action: 'create' });
  return cat;
}

function updateCategory(categoryId, updates) {
  _requireAdmin();
  var success = updateRow(SHEET_NAMES.CATEGORIES, 'categoryId', categoryId, updates);
  if (!success) throw new Error('Category not found.');
  var userId = getCurrentUserId();
  writeAuditLog(userId, '', 'UPDATE_CATEGORY', 'category', categoryId, updates);
  return findRow(SHEET_NAMES.CATEGORIES, 'categoryId', categoryId);
}

function deleteCategory(categoryId) {
  _requireAdmin();
  deleteRow(SHEET_NAMES.CATEGORIES, 'categoryId', categoryId);
  var userId = getCurrentUserId();
  writeAuditLog(userId, '', 'UPDATE_CATEGORY', 'category', categoryId, { action: 'delete' });
  return { success: true };
}

// ─── FAQs ─────────────────────────────────────────────────────────────────────

function getFAQs(categoryId, search) {
  var faqs = readSheet(SHEET_NAMES.FAQS).filter(function(f) {
    return f.status === 'published';
  });

  if (categoryId && categoryId !== 'all') {
    faqs = faqs.filter(function(f) { return f.categoryId === categoryId; });
  }

  if (search) {
    var q = search.toLowerCase();
    faqs = faqs.filter(function(f) {
      return (
        (f.question && f.question.toLowerCase().indexOf(q) !== -1) ||
        (f.answer && f.answer.toLowerCase().indexOf(q) !== -1) ||
        (f.keywords && f.keywords.toLowerCase().indexOf(q) !== -1)
      );
    });
  }

  return faqs.map(normalizeFAQ);
}

function getFAQ(id) {
  var faq = findRow(SHEET_NAMES.FAQS, 'faqId', id);
  if (!faq) return null;
  return normalizeFAQ(faq);
}

function searchFAQs(query) {
  return getFAQs(null, query);
}

function createFAQ(data) {
  _requireITStaff();
  var userId = getCurrentUserId();
  var user = userId ? findRow(SHEET_NAMES.USERS, 'userId', userId) : null;

  var faq = {
    faqId: generateId('faq'),
    categoryId: data.categoryId,
    question: data.question,
    answer: data.answer,
    keywords: Array.isArray(data.keywords) ? data.keywords.join(',') : (data.keywords || ''),
    status: data.status || 'published',
    helpfulCount: 0,
    unhelpfulCount: 0,
    createdBy: userId || 'system',
    updatedBy: userId || 'system',
    createdAt: nowISO(),
    updatedAt: nowISO(),
  };
  appendRow(SHEET_NAMES.FAQS, faq);
  writeAuditLog(userId, user ? user.displayName : '', 'CREATE_FAQ', 'faq', faq.faqId, { question: faq.question });
  return normalizeFAQ(faq);
}

function updateFAQ(id, data) {
  _requireITStaff();
  var userId = getCurrentUserId();
  var updates = {};
  var allowedFields = ['categoryId', 'question', 'answer', 'keywords', 'status'];
  allowedFields.forEach(function(f) {
    if (data[f] !== undefined) {
      updates[f] = Array.isArray(data[f]) ? data[f].join(',') : data[f];
    }
  });
  updates.updatedBy = userId;
  updates.updatedAt = nowISO();

  var success = updateRow(SHEET_NAMES.FAQS, 'faqId', id, updates);
  if (!success) throw new Error('FAQ not found.');
  writeAuditLog(userId, '', 'UPDATE_FAQ', 'faq', id, updates);
  return normalizeFAQ(findRow(SHEET_NAMES.FAQS, 'faqId', id));
}

function deleteFAQ(id) {
  _requireITStaff();
  var userId = getCurrentUserId();
  deleteRow(SHEET_NAMES.FAQS, 'faqId', id);
  writeAuditLog(userId, '', 'DELETE_FAQ', 'faq', id, {});
  return true;
}

function submitFAQFeedback(id, isHelpful) {
  var faq = findRow(SHEET_NAMES.FAQS, 'faqId', id);
  if (!faq) throw new Error('FAQ not found.');

  var helpfulCount = parseInt(faq.helpfulCount) || 0;
  var unhelpfulCount = parseInt(faq.unhelpfulCount) || 0;

  if (isHelpful) {
    helpfulCount++;
  } else {
    unhelpfulCount++;
  }

  updateRow(SHEET_NAMES.FAQS, 'faqId', id, { helpfulCount: helpfulCount, unhelpfulCount: unhelpfulCount });
  return { helpfulCount: helpfulCount, unhelpfulCount: unhelpfulCount };
}

function normalizeFAQ(faq) {
  if (!faq) return null;
  return {
    faqId: faq.faqId,
    categoryId: faq.categoryId,
    question: faq.question,
    answer: faq.answer,
    keywords: faq.keywords ? faq.keywords.split(',').map(function(k) { return k.trim(); }) : [],
    status: faq.status,
    helpfulCount: parseInt(faq.helpfulCount) || 0,
    unhelpfulCount: parseInt(faq.unhelpfulCount) || 0,
    createdBy: faq.createdBy,
    updatedBy: faq.updatedBy,
    createdAt: faq.createdAt,
    updatedAt: faq.updatedAt,
  };
}

// ─── Issues ───────────────────────────────────────────────────────────────────

function createIssue(request) {
  var userId = getCurrentUserId();
  var guestToken = null;

  if (!userId) {
    // Guest submission
    guestToken = generateToken();
  }

  var issue = {
    issueId: generateId('iss'),
    title: request.title,
    description: request.description,
    categoryId: request.categoryId,
    priority: request.priority || 'medium',
    status: 'open',
    userId: userId || '',
    guestToken: guestToken || '',
    guestName: request.guestName || '',
    guestEmail: request.guestEmail || '',
    guestPhone: request.guestPhone || '',
    assignedTo: '',
    createdAt: nowISO(),
    updatedAt: nowISO(),
    resolvedAt: '',
    closedAt: '',
  };
  appendRow(SHEET_NAMES.ISSUES, issue);

  writeAuditLog(userId || 'guest', request.guestName || 'Guest', 'CREATE_ISSUE', 'issue', issue.issueId, { title: issue.title });

  // Notify IT staff
  _notifyITStaffNewIssue(issue);

  // Return issue with guestToken if guest
  return normalizeIssue(issue);
}

function _notifyITStaffNewIssue(issue) {
  try {
    var itStaff = readSheet(SHEET_NAMES.USERS).filter(function(u) {
      return u.role === 'it_staff' || u.role === 'admin';
    });
    itStaff.forEach(function(staff) {
      createNotification(
        staff.userId,
        'issue_created',
        'New Issue: ' + issue.title,
        'A new IT issue has been submitted: ' + issue.title,
        'issue',
        issue.issueId
      );
    });
  } catch (e) {
    console.error('Notify error:', e);
  }
}

function getIssue(id, guestToken) {
  var issue = findRow(SHEET_NAMES.ISSUES, 'issueId', id);
  if (!issue) return null;

  var userId = getCurrentUserId();

  // Authorization check
  if (!userId) {
    // Guest: must match guestToken
    if (!guestToken || issue.guestToken !== guestToken) return null;
  } else {
    var user = findRow(SHEET_NAMES.USERS, 'userId', userId);
    if (!user) return null;
    // IT staff and admin can see all
    if (user.role === 'user') {
      // Regular users can only see their own issues
      if (issue.userId !== userId) return null;
    }
  }

  return normalizeIssue(issue);
}

function getIssues(query) {
  _requireITStaff();
  var userId = getCurrentUserId();
  var user = findRow(SHEET_NAMES.USERS, 'userId', userId);

  var issues = readSheet(SHEET_NAMES.ISSUES);

  if (query) {
    if (query.status && query.status !== 'all') {
      issues = issues.filter(function(i) { return i.status === query.status; });
    }
    if (query.categoryId && query.categoryId !== 'all') {
      issues = issues.filter(function(i) { return i.categoryId === query.categoryId; });
    }
    if (query.priority && query.priority !== 'all') {
      issues = issues.filter(function(i) { return i.priority === query.priority; });
    }
    if (query.assignedTo) {
      if (query.assignedTo === 'me') {
        issues = issues.filter(function(i) { return i.assignedTo === userId; });
      } else if (query.assignedTo === 'unassigned') {
        issues = issues.filter(function(i) { return !i.assignedTo; });
      } else if (query.assignedTo !== 'all') {
        issues = issues.filter(function(i) { return i.assignedTo === query.assignedTo; });
      }
    }
    if (query.userId) {
      issues = issues.filter(function(i) { return i.userId === query.userId; });
    }
    if (query.search) {
      var q = query.search.toLowerCase();
      issues = issues.filter(function(i) {
        return (
          (i.title && i.title.toLowerCase().indexOf(q) !== -1) ||
          (i.description && i.description.toLowerCase().indexOf(q) !== -1) ||
          (i.issueId && i.issueId.toLowerCase().indexOf(q) !== -1)
        );
      });
    }
    if (query.limit) {
      var offset = query.offset || 0;
      issues = issues.slice(offset, offset + query.limit);
    }
  }

  return issues.map(normalizeIssue);
}

function getMyIssues() {
  var userId = getCurrentUserId();
  if (!userId) throw new Error('Not authenticated.');

  var issues = readSheet(SHEET_NAMES.ISSUES).filter(function(i) {
    return i.userId === userId;
  });

  return issues.map(normalizeIssue);
}

function replyToIssue(request) {
  var issue = findRow(SHEET_NAMES.ISSUES, 'issueId', request.issueId);
  if (!issue) throw new Error('Issue not found.');

  var userId = getCurrentUserId();
  var authorName, authorType;

  if (userId) {
    var user = findRow(SHEET_NAMES.USERS, 'userId', userId);
    if (!user) throw new Error('User not found.');
    authorName = user.displayName;
    authorType = user.role === 'it_staff' || user.role === 'admin' ? 'it_staff' : 'user';
  } else {
    // Guest reply
    if (!request.guestToken || issue.guestToken !== request.guestToken) {
      throw new Error('Invalid guest token.');
    }
    authorName = issue.guestName || 'Guest';
    authorType = 'guest';
    userId = null;
  }

  var reply = {
    replyId: generateId('rep'),
    issueId: request.issueId,
    authorId: userId || 'guest',
    authorName: authorName,
    authorType: authorType,
    message: request.message,
    isInternal: request.isInternal ? 'true' : 'false',
    createdAt: nowISO(),
  };
  appendRow(SHEET_NAMES.REPLIES, reply);

  // Update issue updatedAt
  updateRow(SHEET_NAMES.ISSUES, 'issueId', request.issueId, { updatedAt: nowISO() });

  writeAuditLog(userId || 'guest', authorName, 'REPLY_ISSUE', 'issue', request.issueId, {});

  // Notify issue owner
  if (issue.userId && issue.userId !== userId) {
    createNotification(
      issue.userId,
      'issue_replied',
      'Reply on: ' + issue.title,
      authorName + ' replied to your issue.',
      'issue',
      issue.issueId
    );
  }

  return normalizeReply(reply);
}

function addInternalNote(issueId, message) {
  _requireITStaff();
  return replyToIssue({ issueId: issueId, message: message, isInternal: true });
}

function updateIssueStatus(issueId, status) {
  _requireITStaff();
  var userId = getCurrentUserId();
  var now = nowISO();
  var updates = { status: status, updatedAt: now };

  if (status === 'resolved') updates.resolvedAt = now;
  if (status === 'closed') updates.closedAt = now;

  var success = updateRow(SHEET_NAMES.ISSUES, 'issueId', issueId, updates);
  if (!success) throw new Error('Issue not found.');

  var issue = findRow(SHEET_NAMES.ISSUES, 'issueId', issueId);
  writeAuditLog(userId, '', 'UPDATE_ISSUE', 'issue', issueId, { status: status });

  // Notify issue owner
  if (issue && issue.userId) {
    createNotification(
      issue.userId,
      'issue_status_changed',
      'Issue Status Updated',
      'Your issue "' + issue.title + '" status changed to ' + status + '.',
      'issue',
      issueId
    );
  }

  return normalizeIssue(findRow(SHEET_NAMES.ISSUES, 'issueId', issueId));
}

function assignIssue(issueId, staffUserId) {
  _requireITStaff();
  var currentUserId = getCurrentUserId();
  var updates = { assignedTo: staffUserId || '', updatedAt: nowISO() };

  if (staffUserId) {
    updates.status = 'assigned';
  }

  var success = updateRow(SHEET_NAMES.ISSUES, 'issueId', issueId, updates);
  if (!success) throw new Error('Issue not found.');

  writeAuditLog(currentUserId, '', 'ASSIGN_ISSUE', 'issue', issueId, { assignedTo: staffUserId });

  if (staffUserId) {
    createNotification(
      staffUserId,
      'issue_assigned',
      'Issue Assigned to You',
      'An issue has been assigned to you.',
      'issue',
      issueId
    );
  }

  return normalizeIssue(findRow(SHEET_NAMES.ISSUES, 'issueId', issueId));
}

function updateIssuePriority(issueId, priority) {
  _requireITStaff();
  var userId = getCurrentUserId();
  var success = updateRow(SHEET_NAMES.ISSUES, 'issueId', issueId, { priority: priority, updatedAt: nowISO() });
  if (!success) throw new Error('Issue not found.');
  writeAuditLog(userId, '', 'UPDATE_ISSUE', 'issue', issueId, { priority: priority });
  return normalizeIssue(findRow(SHEET_NAMES.ISSUES, 'issueId', issueId));
}

function updateIssueCategory(issueId, categoryId) {
  _requireITStaff();
  var userId = getCurrentUserId();
  var success = updateRow(SHEET_NAMES.ISSUES, 'issueId', issueId, { categoryId: categoryId, updatedAt: nowISO() });
  if (!success) throw new Error('Issue not found.');
  writeAuditLog(userId, '', 'UPDATE_ISSUE', 'issue', issueId, { categoryId: categoryId });
  return normalizeIssue(findRow(SHEET_NAMES.ISSUES, 'issueId', issueId));
}

function getIssueReplies(issueId, guestToken) {
  var issue = findRow(SHEET_NAMES.ISSUES, 'issueId', issueId);
  if (!issue) return [];

  var userId = getCurrentUserId();
  var isStaff = false;

  if (userId) {
    var user = findRow(SHEET_NAMES.USERS, 'userId', userId);
    isStaff = user && (user.role === 'it_staff' || user.role === 'admin');
  }

  var replies = readSheet(SHEET_NAMES.REPLIES).filter(function(r) {
    if (r.issueId !== issueId) return false;
    // Filter out internal notes for non-staff
    if ((r.isInternal === 'true' || r.isInternal === true) && !isStaff) return false;
    return true;
  });

  return replies.map(normalizeReply);
}

function normalizeIssue(issue) {
  if (!issue) return null;
  return {
    issueId: issue.issueId,
    title: issue.title,
    description: issue.description,
    categoryId: issue.categoryId,
    priority: issue.priority,
    status: issue.status,
    userId: issue.userId || null,
    guestToken: issue.guestToken || null,
    guestName: issue.guestName || null,
    guestEmail: issue.guestEmail || null,
    guestPhone: issue.guestPhone || null,
    assignedTo: issue.assignedTo || null,
    createdAt: issue.createdAt,
    updatedAt: issue.updatedAt,
    resolvedAt: issue.resolvedAt || null,
    closedAt: issue.closedAt || null,
  };
}

function normalizeReply(reply) {
  if (!reply) return null;
  return {
    replyId: reply.replyId,
    issueId: reply.issueId,
    authorId: reply.authorId,
    authorName: reply.authorName,
    authorType: reply.authorType,
    message: reply.message,
    isInternal: reply.isInternal === 'true' || reply.isInternal === true,
    createdAt: reply.createdAt,
  };
}

// ─── Dashboards ───────────────────────────────────────────────────────────────

function getUserDashboard() {
  var userId = getCurrentUserId();
  if (!userId) throw new Error('Not authenticated.');

  var issues = readSheet(SHEET_NAMES.ISSUES).filter(function(i) {
    return i.userId === userId;
  });

  var openCount = issues.filter(function(i) {
    return ['open', 'assigned', 'in_progress', 'waiting_for_user'].indexOf(i.status) !== -1;
  }).length;

  var resolvedCount = issues.filter(function(i) {
    return i.status === 'resolved' || i.status === 'closed';
  }).length;

  var recentIssues = issues
    .sort(function(a, b) { return new Date(b.createdAt) - new Date(a.createdAt); })
    .slice(0, 5)
    .map(normalizeIssue);

  var notifs = readSheet(SHEET_NAMES.NOTIFICATIONS).filter(function(n) {
    return n.userId === userId && !n.readAt;
  });

  var recommendedFAQs = readSheet(SHEET_NAMES.FAQS)
    .filter(function(f) { return f.status === 'published'; })
    .slice(0, 3)
    .map(normalizeFAQ);

  return {
    openIssuesCount: openCount,
    resolvedIssuesCount: resolvedCount,
    recentIssues: recentIssues,
    unreadNotificationsCount: notifs.length,
    recommendedFAQs: recommendedFAQs,
  };
}

function getITDashboard() {
  _requireITStaff();
  var userId = getCurrentUserId();

  var allIssues = readSheet(SHEET_NAMES.ISSUES);

  var countByStatus = function(status) {
    return allIssues.filter(function(i) { return i.status === status; }).length;
  };

  var myAssigned = allIssues.filter(function(i) { return i.assignedTo === userId; });
  var unassigned = allIssues.filter(function(i) {
    return (!i.assignedTo || i.assignedTo === '') && ['open', 'in_progress'].indexOf(i.status) !== -1;
  });

  return {
    totalNew: countByStatus('open'),
    totalOpen: countByStatus('open') + countByStatus('assigned'),
    totalInProgress: countByStatus('in_progress'),
    totalWaitingUser: countByStatus('waiting_for_user'),
    totalResolved: countByStatus('resolved'),
    totalClosed: countByStatus('closed'),
    myAssignedCount: myAssigned.length,
    recentAssignedIssues: myAssigned.slice(0, 5).map(normalizeIssue),
    unassignedIssues: unassigned.slice(0, 10).map(normalizeIssue),
  };
}

function getAdminDashboard() {
  _requireAdmin();

  var users = readSheet(SHEET_NAMES.USERS);
  var issues = readSheet(SHEET_NAMES.ISSUES);
  var faqs = readSheet(SHEET_NAMES.FAQS);
  var auditLogs = readSheet(SHEET_NAMES.AUDIT_LOGS);

  var usersByRole = { guest: 0, user: 0, it_staff: 0, admin: 0 };
  users.forEach(function(u) {
    if (usersByRole[u.role] !== undefined) usersByRole[u.role]++;
  });

  return {
    totalUsers: users.length,
    activeUsers: users.filter(function(u) { return u.status === 'active'; }).length,
    totalIssues: issues.length,
    openIssues: issues.filter(function(i) { return ['open', 'assigned', 'in_progress'].indexOf(i.status) !== -1; }).length,
    totalFAQs: faqs.filter(function(f) { return f.status === 'published'; }).length,
    recentAuditLogs: auditLogs.slice(-10).reverse().map(normalizeAuditLog),
    usersByRole: usersByRole,
  };
}

// ─── Users Management ─────────────────────────────────────────────────────────

function getUsers(query) {
  _requireITStaff();
  var users = readSheet(SHEET_NAMES.USERS);

  if (query) {
    if (query.search) {
      var q = query.search.toLowerCase();
      users = users.filter(function(u) {
        return (
          (u.fullName && u.fullName.toLowerCase().indexOf(q) !== -1) ||
          (u.email && u.email.toLowerCase().indexOf(q) !== -1) ||
          (u.department && u.department.toLowerCase().indexOf(q) !== -1)
        );
      });
    }
    if (query.role) users = users.filter(function(u) { return u.role === query.role; });
    if (query.status) users = users.filter(function(u) { return u.status === query.status; });
  }

  return users.map(sanitizeUser);
}

function getUser(userId) {
  _requireITStaff();
  var user = findRow(SHEET_NAMES.USERS, 'userId', userId);
  return user ? sanitizeUser(user) : null;
}

function updateUser(userId, data) {
  var currentUserId = getCurrentUserId();
  if (!currentUserId) throw new Error('Not authenticated.');

  // Users can update their own profile; admins can update anyone
  var currentUser = findRow(SHEET_NAMES.USERS, 'userId', currentUserId);
  if (currentUser.role !== 'admin' && currentUserId !== userId) {
    throw new Error('Unauthorized.');
  }

  var allowed = ['fullName', 'displayName', 'department', 'phoneNumber'];
  var updates = { updatedAt: nowISO() };
  allowed.forEach(function(f) {
    if (data[f] !== undefined) updates[f] = data[f];
  });

  updateRow(SHEET_NAMES.USERS, 'userId', userId, updates);
  return sanitizeUser(findRow(SHEET_NAMES.USERS, 'userId', userId));
}

function updateUserRole(userId, role) {
  _requireAdmin();
  var currentUserId = getCurrentUserId();
  updateRow(SHEET_NAMES.USERS, 'userId', userId, { role: role, updatedAt: nowISO() });
  writeAuditLog(currentUserId, '', 'CHANGE_ROLE', 'user', userId, { role: role });
  return sanitizeUser(findRow(SHEET_NAMES.USERS, 'userId', userId));
}

function updateUserStatus(userId, status) {
  _requireAdmin();
  var currentUserId = getCurrentUserId();
  updateRow(SHEET_NAMES.USERS, 'userId', userId, { status: status, updatedAt: nowISO() });
  writeAuditLog(currentUserId, '', 'CHANGE_USER_STATUS', 'user', userId, { status: status });
  return sanitizeUser(findRow(SHEET_NAMES.USERS, 'userId', userId));
}

// ─── Notifications ────────────────────────────────────────────────────────────

function getNotifications() {
  var userId = getCurrentUserId();
  if (!userId) throw new Error('Not authenticated.');

  return readSheet(SHEET_NAMES.NOTIFICATIONS)
    .filter(function(n) { return n.userId === userId; })
    .sort(function(a, b) { return new Date(b.createdAt) - new Date(a.createdAt); })
    .map(function(n) {
      return {
        notificationId: n.notificationId,
        userId: n.userId,
        type: n.type,
        title: n.title,
        message: n.message,
        entityType: n.entityType,
        entityId: n.entityId,
        readAt: n.readAt || null,
        createdAt: n.createdAt,
      };
    });
}

function markNotificationRead(notificationId) {
  updateRow(SHEET_NAMES.NOTIFICATIONS, 'notificationId', notificationId, { readAt: nowISO() });
}

function markAllNotificationsRead() {
  var userId = getCurrentUserId();
  if (!userId) return;

  var sheet = getSheet(SHEET_NAMES.NOTIFICATIONS);
  var data = sheet.getDataRange().getValues();
  if (data.length < 2) return;

  var headers = data[0];
  var userIdIdx = headers.indexOf('userId');
  var readAtIdx = headers.indexOf('readAt');
  if (userIdIdx === -1 || readAtIdx === -1) return;

  var now = nowISO();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][userIdIdx]) === userId && !data[i][readAtIdx]) {
      sheet.getRange(i + 1, readAtIdx + 1).setValue(now);
    }
  }
}

// ─── Audit Logs ───────────────────────────────────────────────────────────────

function getAuditLogs(query) {
  _requireAdmin();

  var logs = readSheet(SHEET_NAMES.AUDIT_LOGS);

  if (query) {
    if (query.action) logs = logs.filter(function(l) { return l.action === query.action; });
    if (query.actorId) logs = logs.filter(function(l) { return l.actorUserId === query.actorId; });
    if (query.entityType) logs = logs.filter(function(l) { return l.entityType === query.entityType; });
  }

  return logs.slice(-100).reverse().map(normalizeAuditLog);
}

function normalizeAuditLog(log) {
  var metadata = {};
  try {
    metadata = typeof log.metadata === 'string' ? JSON.parse(log.metadata) : (log.metadata || {});
  } catch (e) {}

  return {
    auditId: log.auditId,
    actorUserId: log.actorUserId,
    actorName: log.actorName,
    action: log.action,
    entityType: log.entityType,
    entityId: log.entityId,
    metadata: metadata,
    createdAt: log.createdAt,
  };
}

// ─── Authorization Helpers ────────────────────────────────────────────────────

function _requireAuth() {
  var userId = getCurrentUserId();
  if (!userId) throw new Error('Authentication required.');
  return userId;
}

function _requireITStaff() {
  var userId = _requireAuth();
  var user = findRow(SHEET_NAMES.USERS, 'userId', userId);
  if (!user || (user.role !== 'it_staff' && user.role !== 'admin')) {
    throw new Error('IT Staff access required.');
  }
  return userId;
}

function _requireAdmin() {
  var userId = _requireAuth();
  var user = findRow(SHEET_NAMES.USERS, 'userId', userId);
  if (!user || user.role !== 'admin') {
    throw new Error('Administrator access required.');
  }
  return userId;
}

// ─── Setup / Initialization ───────────────────────────────────────────────────

/**
 * Run this function once to set up the spreadsheet with all required sheets
 * and seed initial data. Call from the Apps Script editor.
 */
function setupSpreadsheet() {
  var ss = getSpreadsheet();
  var sheetNames = [
    SHEET_NAMES.USERS,
    SHEET_NAMES.SESSIONS,
    SHEET_NAMES.VERIFICATIONS,
    SHEET_NAMES.CATEGORIES,
    SHEET_NAMES.FAQS,
    SHEET_NAMES.ISSUES,
    SHEET_NAMES.REPLIES,
    SHEET_NAMES.NOTIFICATIONS,
    SHEET_NAMES.AUDIT_LOGS,
    SHEET_NAMES.CONFIG,
  ];

  sheetNames.forEach(function(name) {
    if (!ss.getSheetByName(name)) {
      ss.insertSheet(name);
    }
  });

  _seedAdminUser();
  _seedCategories();
  _seedSampleFAQs();

  Logger.log('Setup complete!');
}

function _seedAdminUser() {
  var existing = readSheet(SHEET_NAMES.USERS);
  if (existing.length > 0) return; // Already seeded

  var admin = {
    userId: 'usr_admin_001',
    fullName: 'IT Administrator',
    displayName: 'IT Admin',
    department: 'IT Directorate',
    email: 'admin@charitas.org',
    phoneNumber: '+628111222333',
    googleSub: '',
    emailVerifiedAt: nowISO(),
    phoneVerifiedAt: nowISO(),
    googleLinkedAt: '',
    role: 'admin',
    status: 'active',
    twoFactorEnabled: 'false',
    passwordHash: hashPassword('Admin@1234'),
    createdAt: nowISO(),
    updatedAt: nowISO(),
    lastLoginAt: '',
  };
  appendRow(SHEET_NAMES.USERS, admin);

  var staff = {
    userId: 'usr_staff_001',
    fullName: 'Budi Santoso',
    displayName: 'Budi (IT Support)',
    department: 'IT Infrastructure & Support',
    email: 'staff@charitas.org',
    phoneNumber: '+6281298765432',
    googleSub: '',
    emailVerifiedAt: nowISO(),
    phoneVerifiedAt: '',
    googleLinkedAt: '',
    role: 'it_staff',
    status: 'active',
    twoFactorEnabled: 'false',
    passwordHash: hashPassword('Staff@1234'),
    createdAt: nowISO(),
    updatedAt: nowISO(),
    lastLoginAt: '',
  };
  appendRow(SHEET_NAMES.USERS, staff);

  Logger.log('Admin and staff users seeded.');
  Logger.log('Admin: admin@charitas.org / Admin@1234');
  Logger.log('Staff: staff@charitas.org / Staff@1234');
}

function _seedCategories() {
  var existing = readSheet(SHEET_NAMES.CATEGORIES);
  if (existing.length > 0) return;

  var categories = [
    { name: 'Network & Connectivity', description: 'Wi-Fi, internet, VPN, network access issues', icon: 'Wifi', sortOrder: 1 },
    { name: 'Hardware', description: 'Computers, printers, peripherals, medical devices', icon: 'Cpu', sortOrder: 2 },
    { name: 'Software & Applications', description: 'HIS, EMR, office software, custom apps', icon: 'AppWindow', sortOrder: 3 },
    { name: 'Email & Communication', description: 'Email access, messaging, video conferencing', icon: 'Mail', sortOrder: 4 },
    { name: 'Access & Permissions', description: 'Account access, password reset, permissions', icon: 'ShieldCheck', sortOrder: 5 },
    { name: 'Medical Devices IT', description: 'PACS, lab systems, medical device connectivity', icon: 'Activity', sortOrder: 6 },
    { name: 'Data & Backup', description: 'Data recovery, backups, storage issues', icon: 'Database', sortOrder: 7 },
    { name: 'Security', description: 'Malware, suspicious activity, security incidents', icon: 'Shield', sortOrder: 8 },
  ];

  categories.forEach(function(cat) {
    appendRow(SHEET_NAMES.CATEGORIES, {
      categoryId: generateId('cat'),
      name: cat.name,
      description: cat.description,
      icon: cat.icon,
      status: 'active',
      sortOrder: cat.sortOrder,
    });
  });

  Logger.log('Categories seeded.');
}

function _seedSampleFAQs() {
  var existing = readSheet(SHEET_NAMES.FAQS);
  if (existing.length > 0) return;

  var cats = readSheet(SHEET_NAMES.CATEGORIES);
  var networkCat = cats.find(function(c) { return c.name === 'Network & Connectivity'; });
  var accessCat = cats.find(function(c) { return c.name === 'Access & Permissions'; });
  var hwCat = cats.find(function(c) { return c.name === 'Hardware'; });

  if (!networkCat || !accessCat || !hwCat) return;

  var now = nowISO();
  var faqs = [
    {
      faqId: generateId('faq'),
      categoryId: networkCat.categoryId,
      question: 'How do I connect to the hospital Wi-Fi?',
      answer: 'Connect to the "Charitas-Staff" SSID using your staff credentials (same as your Windows login). If you encounter issues, ensure your device is registered with IT. Contact the helpdesk at ext. 1100 if the problem persists.',
      keywords: 'wifi,wireless,network,connect,internet',
      status: 'published',
      helpfulCount: 24,
      unhelpfulCount: 2,
      createdBy: 'usr_admin_001',
      updatedBy: 'usr_admin_001',
      createdAt: now,
      updatedAt: now,
    },
    {
      faqId: generateId('faq'),
      categoryId: accessCat.categoryId,
      question: 'How do I reset my password?',
      answer: 'You can reset your password through the IT portal by clicking "Forgot Password" on the login page. A verification code will be sent to your registered email or phone. For immediate assistance, contact IT at ext. 1100.',
      keywords: 'password,reset,forgot,login,access',
      status: 'published',
      helpfulCount: 42,
      unhelpfulCount: 1,
      createdBy: 'usr_admin_001',
      updatedBy: 'usr_admin_001',
      createdAt: now,
      updatedAt: now,
    },
    {
      faqId: generateId('faq'),
      categoryId: hwCat.categoryId,
      question: 'My printer is not printing. What should I do?',
      answer: '1. Check that the printer is powered on and not in error state.\n2. Ensure the printer is connected to the network (check the IP on the printer screen).\n3. Try removing and re-adding the printer from Control Panel > Devices and Printers.\n4. If issues persist, submit a hardware ticket through this portal.',
      keywords: 'printer,print,hardware,not working',
      status: 'published',
      helpfulCount: 18,
      unhelpfulCount: 3,
      createdBy: 'usr_admin_001',
      updatedBy: 'usr_admin_001',
      createdAt: now,
      updatedAt: now,
    },
  ];

  faqs.forEach(function(faq) {
    appendRow(SHEET_NAMES.FAQS, faq);
  });

  Logger.log('Sample FAQs seeded.');
}
