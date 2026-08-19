import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from './layouts/DashboardLayout';
import { DashboardOverview } from './pages/DashboardOverview';
import { DoctorManagementPage } from './pages/DoctorManagementPage';
import { PatientManagementPage } from './pages/PatientManagementPage';
import { AppointmentPage } from './pages/AppointmentPage';
import { QueuePage } from './pages/QueuePage';
import { ConsultationPage } from './pages/ConsultationPage';
import { PharmacyPage } from './pages/PharmacyPage';
import { BillingPage } from './pages/BillingPage';
import { PaymentHistoryPage } from './pages/PaymentHistoryPage';
import { TariffSettingsPage } from './pages/TariffSettingsPage';
import { CMSManagementPage } from './pages/CMSManagementPage';
import { MedicalRecordPage } from './pages/MedicalRecordPage';
import { ReportsPage } from './pages/ReportsPage';
import { AuditLogPage } from './pages/AuditLogPage';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPatientPage } from './pages/RegisterPatientPage';
import { UserManagementPage } from './pages/UserManagementPage';
import { MasterDataManagementPage } from './pages/MasterDataManagementPage';
import { PublicQueueMonitorPage } from './pages/PublicQueueMonitorPage';
import { useAuthStore } from './store/useAuthStore';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPatientPage />} />
        <Route path="/public-queue-monitor" element={<PublicQueueMonitorPage />} />

        {/* Protected Dashboard Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardOverview />} />
          <Route path="master-data" element={<MasterDataManagementPage />} />
          <Route path="users" element={<UserManagementPage />} />
          <Route path="doctors" element={<DoctorManagementPage />} />
          <Route path="patients" element={<PatientManagementPage />} />
          <Route path="appointments" element={<AppointmentPage />} />
          <Route path="queues" element={<QueuePage />} />
          <Route path="consultation" element={<ConsultationPage />} />
          <Route path="pharmacy" element={<PharmacyPage />} />
          <Route path="billing" element={<BillingPage />} />
          <Route path="payment-history" element={<PaymentHistoryPage />} />
          <Route path="tariffs" element={<TariffSettingsPage />} />
          <Route path="cms" element={<CMSManagementPage />} />
          <Route path="medical-records" element={<MedicalRecordPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="audit-logs" element={<AuditLogPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
