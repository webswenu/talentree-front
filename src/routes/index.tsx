import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { UserRole } from '../types/user.types';
import { ProtectedRoute } from './ProtectedRoute';

// Layouts
import { LandingLayout } from '../components/layouts/LandingLayout';
import { AdminLayout } from '../components/layouts/AdminLayout';
import { CompanyLayout } from '../components/layouts/CompanyLayout';
import { EvaluatorLayout } from '../components/layouts/EvaluatorLayout';
import { WorkerLayout } from '../components/layouts/WorkerLayout';
import { GuestLayout } from '../components/layouts/GuestLayout';

// Public Pages
import { LandingPage } from '../pages/public/LandingPage';
import { LoginPage } from '../pages/public/LoginPage';
import { RegisterWorkerPage } from '../pages/public/RegisterWorkerPage';
import { UnauthorizedPage } from '../pages/public/UnauthorizedPage';
import { NotFoundPage } from '../pages/public/NotFoundPage';

// Admin Pages
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { CompaniesPage } from '../pages/admin/CompaniesPage';
import { CompanyDetailPage } from '../pages/admin/CompanyDetailPage';
import ProcessesPage from '../pages/admin/ProcessesPage';
import { ProcessDetailPage } from '../pages/admin/ProcessDetailPage';
import TestsPage from '../pages/admin/TestsPage';
import { TestDetailPage } from '../pages/admin/TestDetailPage';
import WorkersPage from '../pages/admin/WorkersPage';
import { WorkerDetailPage } from '../pages/admin/WorkerDetailPage';
import { UsersPage } from '../pages/admin/UsersPage';
import ReportsPage from '../pages/admin/ReportsPage';
import AuditPage from '../pages/admin/AuditPage';
import { SettingsPage } from '../pages/admin/SettingsPage';
import { ProfilePage } from '../pages/admin/ProfilePage';

// Company Pages
import { CompanyDashboard } from '../pages/company/CompanyDashboard';
import { CompanyProcessesPage } from '../pages/company/CompanyProcessesPage';
import { CompanyProcessDetailPage } from '../pages/company/CompanyProcessDetailPage';
import { CompanyWorkersPage } from '../pages/company/CompanyWorkersPage';
import { CompanyReportsPage } from '../pages/company/CompanyReportsPage';
import { CompanySettingsPage } from '../pages/company/CompanySettingsPage';
import { CompanyProfilePage } from '../pages/company/CompanyProfilePage';

// Evaluator Pages
import { EvaluatorDashboard } from '../pages/evaluator/EvaluatorDashboard';
import { EvaluatorProcessesPage } from '../pages/evaluator/EvaluatorProcessesPage';
import { EvaluatorProcessDetailPage } from '../pages/evaluator/EvaluatorProcessDetailPage';
import { EvaluatorTestReviewPage } from '../pages/evaluator/EvaluatorTestReviewPage';
import { EvaluatorWorkersPage } from '../pages/evaluator/EvaluatorWorkersPage';
import { EvaluatorProfilePage } from '../pages/evaluator/EvaluatorProfilePage';

// Worker Pages
import { WorkerDashboard } from '../pages/worker/WorkerDashboard';
import { WorkerProcessesPage } from '../pages/worker/WorkerProcessesPage';
import { WorkerApplicationsPage } from '../pages/worker/WorkerApplicationsPage';
import { WorkerTestTakingPage } from '../pages/worker/WorkerTestTakingPage';
import { WorkerTestResultsPage } from '../pages/worker/WorkerTestResultsPage';
import { WorkerProfilePage } from '../pages/worker/WorkerProfilePage';

// Guest Pages
import { GuestDashboard } from '../pages/guest/GuestDashboard';
import { GuestProcessViewPage } from '../pages/guest/GuestProcessViewPage';
import { GuestReportsViewPage } from '../pages/guest/GuestReportsViewPage';

// Componente para redirigir según el rol
const RoleBasedRedirect = () => {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  switch (user.role) {
    case UserRole.ADMIN_TALENTREE:
      return <Navigate to="/admin" replace />;
    case UserRole.COMPANY:
      return <Navigate to="/empresa" replace />;
    case UserRole.EVALUATOR:
      return <Navigate to="/evaluador" replace />;
    case UserRole.WORKER:
      return <Navigate to="/trabajador" replace />;
    case UserRole.GUEST:
      return <Navigate to="/invitado" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
};

export const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingLayout />}>
          <Route index element={<LandingPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register/worker" element={<RegisterWorkerPage />} />
          <Route path="unauthorized" element={<UnauthorizedPage />} />
        </Route>

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={[UserRole.ADMIN_TALENTREE]}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="empresas" element={<CompaniesPage />} />
          <Route path="empresas/:id" element={<CompanyDetailPage />} />
          <Route path="procesos" element={<ProcessesPage />} />
          <Route path="procesos/:id" element={<ProcessDetailPage />} />
          <Route path="tests" element={<TestsPage />} />
          <Route path="tests/:id" element={<TestDetailPage />} />
          <Route path="trabajadores" element={<WorkersPage />} />
          <Route path="trabajadores/:id" element={<WorkerDetailPage />} />
          <Route path="usuarios" element={<UsersPage />} />
          <Route path="reportes" element={<ReportsPage />} />
          <Route path="auditoria" element={<AuditPage />} />
          <Route path="configuracion" element={<SettingsPage />} />
          <Route path="perfil" element={<ProfilePage />} />
        </Route>

        {/* Company Routes */}
        <Route
          path="/empresa"
          element={
            <ProtectedRoute allowedRoles={[UserRole.COMPANY]}>
              <CompanyLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<CompanyDashboard />} />
          <Route path="procesos" element={<CompanyProcessesPage />} />
          <Route path="procesos/:id" element={<CompanyProcessDetailPage />} />
          <Route path="trabajadores" element={<CompanyWorkersPage />} />
          <Route path="reportes" element={<CompanyReportsPage />} />
          <Route path="configuracion" element={<CompanySettingsPage />} />
          <Route path="perfil" element={<CompanyProfilePage />} />
        </Route>

        {/* Evaluator Routes */}
        <Route
          path="/evaluador"
          element={
            <ProtectedRoute allowedRoles={[UserRole.EVALUATOR]}>
              <EvaluatorLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<EvaluatorDashboard />} />
          <Route path="procesos" element={<EvaluatorProcessesPage />} />
          <Route path="procesos/:id" element={<EvaluatorProcessDetailPage />} />
          <Route path="trabajadores" element={<EvaluatorWorkersPage />} />
          <Route path="perfil" element={<EvaluatorProfilePage />} />
        </Route>

        {/* Evaluator Test Review - Full width layout */}
        <Route
          path="/evaluador/revisar/:testResponseId"
          element={
            <ProtectedRoute allowedRoles={[UserRole.EVALUATOR]}>
              <EvaluatorTestReviewPage />
            </ProtectedRoute>
          }
        />

        {/* Worker Routes */}
        <Route
          path="/trabajador"
          element={
            <ProtectedRoute allowedRoles={[UserRole.WORKER]}>
              <WorkerLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<WorkerDashboard />} />
          <Route path="procesos" element={<WorkerProcessesPage />} />
          <Route path="postulaciones" element={<WorkerApplicationsPage />} />
          <Route path="resultados" element={<WorkerTestResultsPage />} />
          <Route path="perfil" element={<WorkerProfilePage />} />
        </Route>

        {/* Worker Test Taking - Full width layout */}
        <Route
          path="/trabajador/test/:testResponseId"
          element={
            <ProtectedRoute allowedRoles={[UserRole.WORKER]}>
              <WorkerTestTakingPage />
            </ProtectedRoute>
          }
        />

        {/* Guest Routes */}
        <Route
          path="/invitado"
          element={
            <ProtectedRoute allowedRoles={[UserRole.GUEST]}>
              <GuestLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<GuestDashboard />} />
          <Route path="proceso/:id" element={<GuestProcessViewPage />} />
          <Route path="reportes" element={<GuestReportsViewPage />} />
        </Route>

        {/* Redirect basado en rol */}
        <Route path="/dashboard" element={<RoleBasedRedirect />} />

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
};
