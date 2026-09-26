import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PublicLayout } from '@/layouts/PublicLayout';
import { AppLayout } from '@/layouts/AppLayout';
import { ITLayout } from '@/layouts/ITLayout';
import { AdminLayout } from '@/layouts/AdminLayout';

import { RequireAuth, RequireITStaff, RequireAdmin } from '@/app/guards';

// Public pages
import { Home } from '@/pages/Home';
import { FAQPage } from '@/pages/FAQ';
import { FAQDetail } from '@/pages/FAQDetail';
import { CreateIssue } from '@/pages/CreateIssue';
import { TrackIssue } from '@/pages/TrackIssue';
import { Login } from '@/pages/Login';
import { Register } from '@/pages/Register';
import { Verify } from '@/pages/Verify';
import { ForgotPassword } from '@/pages/ForgotPassword';

// Authenticated pages
import { UserDashboard } from '@/pages/UserDashboard';
import { MyIssues } from '@/pages/MyIssues';
import { IssueDetail } from '@/pages/IssueDetail';
import { Profile } from '@/pages/Profile';
import { NotificationsPage } from '@/pages/NotificationsPage';

// IT Staff pages
import { ITDashboard } from '@/pages/ITDashboard';
import { ITIssues } from '@/pages/ITIssues';
import { ITIssueDetail } from '@/pages/ITIssueDetail';
import { ITFAQs } from '@/pages/ITFAQs';

// Admin pages
import { AdminDashboard } from '@/pages/AdminDashboard';
import { AdminUsers } from '@/pages/AdminUsers';
import { AdminCategories } from '@/pages/AdminCategories';
import { AdminAuditLogs } from '@/pages/AdminAuditLogs';
import { AdminSettings } from '@/pages/AdminSettings';

export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/faq/:id" element={<FAQDetail />} />
          <Route path="/issues/new" element={<CreateIssue />} />
          <Route path="/issues/track" element={<TrackIssue />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify" element={<Verify />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Route>

        {/* Authenticated User Routes */}
        <Route
          element={
            <RequireAuth>
              <AppLayout />
            </RequireAuth>
          }
        >
          <Route path="/dashboard" element={<UserDashboard />} />
          <Route path="/issues" element={<MyIssues />} />
          <Route path="/issues/:id" element={<IssueDetail />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/notifications" element={<NotificationsPage />} />
        </Route>

        {/* IT Staff Routes */}
        <Route
          element={
            <RequireITStaff>
              <ITLayout />
            </RequireITStaff>
          }
        >
          <Route path="/it" element={<ITDashboard />} />
          <Route path="/it/issues" element={<ITIssues />} />
          <Route path="/it/issues/:id" element={<ITIssueDetail />} />
          <Route path="/it/faqs" element={<ITFAQs />} />
        </Route>

        {/* Admin Routes */}
        <Route
          element={
            <RequireAdmin>
              <AdminLayout />
            </RequireAdmin>
          }
        >
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/categories" element={<AdminCategories />} />
          <Route path="/admin/faqs" element={<ITFAQs />} />
          <Route path="/admin/audit" element={<AdminAuditLogs />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
