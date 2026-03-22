import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { LogOut, User } from "lucide-react"

export function Navbar() {
  const navigate = useNavigate()
  const isLoggedIn = !!localStorage.getItem("access_token")
  const userType = localStorage.getItem("user_type")

  const handleLogout = async () => {
    const refreshToken = localStorage.getItem("refresh_token")
    if (refreshToken) {
      try {
        await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1'}/user/logout`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh_token: refreshToken }),
        })
      } catch (error) {
        console.error("Logout error:", error)
      }
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

        <div className="flex items-center gap-4">
          <ThemeToggle />

          {isLoggedIn ? (
            <>
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
