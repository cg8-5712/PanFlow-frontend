import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { Navbar } from "@/components/navbar"
import { AdminLayout } from "@/components/admin-layout"
import HomePage from "@/pages/home"
import LoginPage from "@/pages/login"
import ProfilePage from "@/pages/profile"
import AdminLoginPage from "@/pages/admin/login"
import AdminDashboard from "@/pages/admin/dashboard"
import AdminAccounts from "@/pages/admin/accounts"
import AdminTokens from "@/pages/admin/tokens"
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
  const isAdminLoggedIn = !!localStorage.getItem("admin_token")
  return isAdminLoggedIn
    ? <AdminLayout>{children}</AdminLayout>
    : <Navigate to="/admin/login" replace />
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
        {/* User-facing routes with Navbar */}
        <Route path="/" element={<><Navbar /><HomePage /></>} />
        <Route path="/login" element={<><Navbar /><LoginPage /></>} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Navbar /><ProfilePage />
            </ProtectedRoute>
          }
        />

        {/* Admin routes */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin" element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />
        <Route path="/admin/accounts" element={<AdminProtectedRoute><AdminAccounts /></AdminProtectedRoute>} />
        <Route path="/admin/tokens" element={<AdminProtectedRoute><AdminTokens /></AdminProtectedRoute>} />
        <Route path="/admin/users" element={<AdminProtectedRoute><AdminUsers /></AdminProtectedRoute>} />
        <Route path="/admin/blacklist" element={<AdminProtectedRoute><AdminBlacklist /></AdminProtectedRoute>} />
        <Route path="/admin/records" element={<AdminProtectedRoute><AdminRecords /></AdminProtectedRoute>} />
        <Route path="/admin/config" element={<AdminProtectedRoute><AdminConfig /></AdminProtectedRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
