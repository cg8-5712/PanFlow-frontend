import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { Navbar } from "@/components/navbar"
import { AdminLayout } from "@/components/admin-layout"
import HomePage from "@/pages/home"
import LoginPage from "@/pages/login"
import ProfilePage from "@/pages/profile"
import AdminDashboard from "@/pages/admin/dashboard"
import AdminAccounts from "@/pages/admin/accounts"
import AdminUsers from "@/pages/admin/users"
import AdminBlacklist from "@/pages/admin/blacklist"
import AdminRecords from "@/pages/admin/records"
import AdminConfig from "@/pages/admin/config"
import { useEffect } from "react"

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isLoggedIn = !!localStorage.getItem("access_token")
  return isLoggedIn ? <>{children}</> : <Navigate to="/login" replace />
}

function AdminProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem("access_token")
  const userType = localStorage.getItem("user_type")
  const isAdmin = !!token && userType === "admin"
  return isAdmin
    ? <AdminLayout>{children}</AdminLayout>
    : <Navigate to="/login" replace />
}

function App() {
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme")
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark")
    } else if (savedTheme === "light") {
      document.documentElement.classList.remove("dark")
    } else {
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        document.documentElement.classList.add("dark")
      }
    }
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        {/* User-facing routes */}
        <Route path="/" element={<><Navbar /><HomePage /></>} />
        <Route path="/login" element={<><Navbar /><LoginPage /></>} />
        <Route path="/profile" element={
          <ProtectedRoute><Navbar /><ProfilePage /></ProtectedRoute>
        } />

        {/* /admin/login → redirect to unified /login */}
        <Route path="/admin/login" element={<Navigate to="/login" replace />} />

        {/* Admin routes */}
        <Route path="/admin" element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />
        <Route path="/admin/accounts" element={<AdminProtectedRoute><AdminAccounts /></AdminProtectedRoute>} />
        <Route path="/admin/users" element={<AdminProtectedRoute><AdminUsers /></AdminProtectedRoute>} />
        <Route path="/admin/blacklist" element={<AdminProtectedRoute><AdminBlacklist /></AdminProtectedRoute>} />
        <Route path="/admin/records" element={<AdminProtectedRoute><AdminRecords /></AdminProtectedRoute>} />
        <Route path="/admin/config" element={<AdminProtectedRoute><AdminConfig /></AdminProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
