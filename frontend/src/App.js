import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, AdminRoute, GuestRoute } from './components/common/ProtectedRoute';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';

// Pages
import HomePage from './pages/HomePage';
import CampaignsPage from './pages/CampaignsPage';
import CampaignDetailPage from './pages/CampaignDetailPage';
import { CreateCampaignPage, EditCampaignPage } from './pages/CampaignFormPage';
import { LoginPage, RegisterPage } from './pages/AuthPages';
import { DashboardPage, ProfilePage } from './pages/DashboardPages';
import AdminPage from './pages/AdminPage';
import { DonationSuccessPage, NotFoundPage } from './pages/UtilityPages';

// FIX: static info pages that were missing and causing 404s
import {
  AboutPage,
  HowItWorksPage,
  PricingPage,
  BlogPage,
  CareersPage,
  HelpPage,
  ContactPage,
  SafetyPage,
  FundraisingTipsPage,
  PrivacyPage,
  TermsPage,
  CookiePolicyPage,
  ForgotPasswordPage,
} from './pages/StaticPages';

const Layout = ({ children }) => (
  <div className="flex flex-col min-h-screen">
    <Navbar />
    <main className="flex-1">{children}</main>
    <Footer />
  </div>
);

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1f2937',
              color: '#f9fafb',
              borderRadius: '12px',
              padding: '12px 16px',
              fontSize: '14px',
            },
            success: {
              iconTheme: { primary: '#02a95c', secondary: '#fff' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#fff' },
            },
          }}
        />
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Layout><HomePage /></Layout>} />
          <Route path="/campaigns" element={<Layout><CampaignsPage /></Layout>} />
          <Route path="/campaigns/:id" element={<Layout><CampaignDetailPage /></Layout>} />
          <Route path="/donation-success" element={<Layout><DonationSuccessPage /></Layout>} />

          {/* FIX: Static info pages — were all hitting the 404 wildcard */}
          <Route path="/about"   element={<Layout><AboutPage /></Layout>} />
          <Route path="/how-it-works" element={<Layout><HowItWorksPage /></Layout>} />
          <Route path="/pricing" element={<Layout><PricingPage /></Layout>} />
          <Route path="/blog"    element={<Layout><BlogPage /></Layout>} />
          <Route path="/careers" element={<Layout><CareersPage /></Layout>} />
          <Route path="/help"    element={<Layout><HelpPage /></Layout>} />
          <Route path="/contact" element={<Layout><ContactPage /></Layout>} />
          <Route path="/safety"  element={<Layout><SafetyPage /></Layout>} />
          <Route path="/tips"    element={<Layout><FundraisingTipsPage /></Layout>} />
          <Route path="/privacy" element={<Layout><PrivacyPage /></Layout>} />
          <Route path="/terms"   element={<Layout><TermsPage /></Layout>} />
          <Route path="/cookies" element={<Layout><CookiePolicyPage /></Layout>} />

          {/* Guest only routes */}
          <Route path="/login"           element={<GuestRoute><LoginPage /></GuestRoute>} />
          <Route path="/register"        element={<GuestRoute><RegisterPage /></GuestRoute>} />
          {/* FIX: /forgot-password was linked from LoginPage but had no route */}
          <Route path="/forgot-password" element={<GuestRoute><ForgotPasswordPage /></GuestRoute>} />

          {/* Protected routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute><Layout><DashboardPage /></Layout></ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute><Layout><ProfilePage /></Layout></ProtectedRoute>
          } />
          <Route path="/my-donations" element={
            <ProtectedRoute><Layout><DashboardPage initialTab="donations" /></Layout></ProtectedRoute>
          } />
          <Route path="/campaigns/create" element={
            <ProtectedRoute><Layout><CreateCampaignPage /></Layout></ProtectedRoute>
          } />
          <Route path="/campaigns/:id/edit" element={
            <ProtectedRoute><Layout><EditCampaignPage /></Layout></ProtectedRoute>
          } />

          {/* Admin routes */}
          <Route path="/admin" element={
            <AdminRoute><Layout><AdminPage /></Layout></AdminRoute>
          } />
          <Route path="/admin/*" element={
            <AdminRoute><Layout><AdminPage /></Layout></AdminRoute>
          } />

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
