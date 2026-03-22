import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { Navbar } from "@/components/navbar"
import { AdminLayout } from "@/components/admin-layout"
import HomePage from "@/pages/home"
import LoginPage from "@/pages/login"
import ProfilePage from "@/pages/profile"
import AdminLoginPage from "@/pages/admin/login"
import AdminDashboard from "@/pages/admin/dashboard"
import { useEffect } from "react"

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isLoggedIn = !!localStorage.getItem("access_token")
  return isLoggedIn ? <>{children}</> : <Navigate to="/login" replace />
}

function AdminProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAdminLoggedIn = !!localStorage.getItem("admin_token")
  return isAdminLoggedIn ? <AdminLayout>{children}</AdminLayout> : <Navigate to="/admin/login" replace />
}

function App() {
  useEffect(() => {
    // Initialize theme from localStorage
    const savedTheme = localStorage.getItem("theme")
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark")
    } else if (savedTheme === "light") {
      document.documentElement.classList.remove("dark")
    } else {
      // Default to system preference
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      if (prefersDark) {
        document.documentElement.classList.add("dark")
      }
    }
  }, [])

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background">
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route
            path="/admin"
            element={
              <AdminProtectedRoute>
                <AdminDashboard />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/*"
            element={
              <AdminProtectedRoute>
                <div className="p-8">
                  <h1 className="text-2xl font-bold mb-4">Coming Soon</h1>
                  <p className="text-muted-foreground">
                    This admin page is under construction.
                  </p>
                </div>
              </AdminProtectedRoute>
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
