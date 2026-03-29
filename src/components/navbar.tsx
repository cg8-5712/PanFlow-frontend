import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { LogOut, User, ShieldCheck } from "lucide-react"
import api from "@/lib/api"

export function Navbar() {
  const navigate = useNavigate()
  const isLoggedIn = !!localStorage.getItem("access_token")
  const userType = localStorage.getItem("user_type")
  const isAdmin = userType === "admin"

  const handleLogout = async () => {
    const refreshToken = localStorage.getItem("refresh_token")
    if (refreshToken) {
      try {
        await api.post("/user/logout", { refresh_token: refreshToken })
      } catch {}
    }
    localStorage.removeItem("access_token")
    localStorage.removeItem("refresh_token")
    localStorage.removeItem("user_type")
    navigate("/login")
  }

  return (
    <nav className="border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="text-2xl font-heading font-bold text-primary">
          PanFlow
        </Link>

        <div className="flex items-center gap-2">
          <ThemeToggle />

          {isLoggedIn ? (
            <>
              {isAdmin && (
                <Link to="/admin">
                  <Button variant="outline" size="sm">
                    <ShieldCheck className="h-4 w-4 mr-2" />
                    Admin
                  </Button>
                </Link>
              )}
              <Link to="/profile">
                <Button variant="ghost" size="sm">
                  <User className="h-4 w-4 mr-2" />
                  {userType || "User"}
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </>
          ) : (
            <Link to="/login">
              <Button size="sm">Login</Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
