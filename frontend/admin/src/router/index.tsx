import { createBrowserRouter } from 'react-router-dom'
import AuthGuard from './AuthGuard'
import AdminLayout from '@/components/layout/AdminLayout'
import LoginPage from '@/pages/LoginPage'
import DashboardPage from '@/pages/DashboardPage'
import LeadsPage from '@/pages/LeadsPage'
import ServicesPage from '@/pages/ServicesPage'
import ProduitsPage from '@/pages/ProduitsPage'
import ReferencesPage from '@/pages/ReferencesPage'
import PartenairesPage from '@/pages/PartenairesPage'
import ResetPasswordPage from '@/pages/ResetPasswordPage'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/reset-password',
    element: <ResetPasswordPage />,
  },
  {
    path: '/',
    element: (
      <AuthGuard>
        <AdminLayout />
      </AuthGuard>
    ),
    children: [
      { index: true,          element: <DashboardPage /> },
      { path: 'leads',        element: <LeadsPage /> },
      { path: 'services',     element: <ServicesPage /> },
      { path: 'produits',     element: <ProduitsPage /> },
      { path: 'references',   element: <ReferencesPage /> },
      { path: 'partenaires',  element: <PartenairesPage /> },
    ],
  },
])

