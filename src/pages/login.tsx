import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import api from "@/lib/api"
import type { ApiResponse, LoginResponse } from "@/types"

export default function LoginPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [loginType, setLoginType] = useState<"token" | "password">("token")

  const [tokenValue, setTokenValue] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const payload = loginType === "token"
        ? { token: tokenValue }
        : { username, password }

      const { data } = await api.post<ApiResponse<LoginResponse>>("/user/login", payload)

      localStorage.setItem("access_token", data.data.access_token)
      localStorage.setItem("refresh_token", data.data.refresh_token)
      localStorage.setItem("user_type", data.data.user_type)

      navigate("/")
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Login to PanFlow</CardTitle>
          <CardDescription>
            Enter your token or credentials to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-6">
            <Button
              variant={loginType === "token" ? "default" : "outline"}
              onClick={() => setLoginType("token")}
              className="flex-1"
            >
              Token Login
            </Button>
            <Button
              variant={loginType === "password" ? "default" : "outline"}
              onClick={() => setLoginType("password")}
              className="flex-1"
            >
              Password Login
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {loginType === "token" ? (
              <div className="space-y-2">
                <label className="text-sm font-medium">Token</label>
                <Input
                  type="text"
                  placeholder="Enter your token"
                  value={tokenValue}
                  onChange={(e) => setTokenValue(e.target.value)}
                  required
                />
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Username</label>
                  <Input
                    type="text"
                    placeholder="Enter username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Password</label>
                  <Input
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </>
            )}

            {error && (
              <div className="text-sm text-destructive">{error}</div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm text-muted-foreground">
            Don't have an account? Contact admin
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
