import type { ReactNode } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './components/Toast'
import { ConfirmProvider } from './components/ConfirmDialog'
import Layout from './components/Layout'
import Login from './pages/Login'
import DashboardPage from './pages/Dashboard'
import CalendarPage from './pages/Calendar'
import SitesPage from './pages/Sites'
import DeceasedPage from './pages/Deceased'
import FamiliesPage from './pages/Families'
import ReservationsPage from './pages/Reservations'
import PaymentsPage from './pages/Payments'

function RequireAuth({ children }: { children: ReactNode }) {
  const hasToken = Boolean(localStorage.getItem('token'))
  if (!hasToken) return <Navigate to="/login" replace />
  return <>{children}</>
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <RequireAuth>
            <Layout />
          </RequireAuth>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="calendar" element={<CalendarPage />} />
        <Route path="sites" element={<SitesPage />} />
        <Route path="deceased" element={<DeceasedPage />} />
        <Route path="families" element={<FamiliesPage />} />
        <Route path="reservations" element={<ReservationsPage />} />
        <Route path="payments" element={<PaymentsPage />} />
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <ConfirmProvider>
            <AppRoutes />
          </ConfirmProvider>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
