import { Routes, Route, Navigate } from 'react-router-dom'
import { PageLayout } from './components/layout/PageLayout'
import { ProtectedRoute } from './components/layout/ProtectedRoute'
import { LoginPage, RegisterPage, ForgotPasswordPage } from './pages/auth'
import DashboardPage from './pages/DashboardPage'
import ContactsPage from './pages/ContactsPage'
import { ContactDetailPage } from './features/contacts'
import CompaniesPage from './pages/CompaniesPage'
import { CompanyDetailPage } from './features/companies'
import DealsPage from './pages/DealsPage'
import TasksPage from './pages/TasksPage'
import SettingsPage from './pages/SettingsPage'
import { CustomFieldsPanel } from './features/admin/CustomFieldsPanel'
import { AutomationsPanel } from './features/admin/AutomationsPanel'
import { WebhooksPanel } from './features/admin/WebhooksPanel'

function App() {
  return (
    <Routes>
      {/* Public auth routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<PageLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/contacts" element={<ContactsPage />} />
          <Route path="/contacts/:id" element={<ContactDetailPage />} />
          <Route path="/companies" element={<CompaniesPage />} />
          <Route path="/companies/:id" element={<CompanyDetailPage />} />
          <Route path="/deals" element={<DealsPage />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/admin/fields" element={<CustomFieldsPanel />} />
          <Route path="/admin/automations" element={<AutomationsPanel />} />
          <Route path="/admin/webhooks" element={<WebhooksPanel />} />
        </Route>
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default App
