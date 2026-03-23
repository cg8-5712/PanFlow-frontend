import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Database, Key, Users, FileText } from "lucide-react"
import api from "@/lib/api"
import type { ApiResponse, PaginatedResponse, Account, Token, User, ParseRecord } from "@/types"

interface Stats {
  accounts: number
  tokens: number
  users: number
  records: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ accounts: 0, tokens: 0, users: 0, records: 0 })

  useEffect(() => {
    const adminToken = localStorage.getItem("admin_token")
    const authHeader = { headers: { Authorization: `Bearer ${adminToken}` } }

    Promise.all([
      api.get<ApiResponse<PaginatedResponse<Account>>>("/admin/account?limit=1", authHeader),
      api.get<ApiResponse<PaginatedResponse<Token>>>("/admin/token?limit=1", authHeader),
      api.get<ApiResponse<PaginatedResponse<User>>>("/admin/user?limit=1", authHeader),
      api.get<ApiResponse<PaginatedResponse<ParseRecord>>>("/admin/record?limit=1", authHeader),
    ]).then(([accounts, tokens, users, records]) => {
      setStats({
        accounts: accounts.data.data.total,
        tokens: tokens.data.data.total,
        users: users.data.data.total,
        records: records.data.data.total,
      })
    }).catch(console.error)
  }, [])

  const statCards = [
    { label: "Total Accounts", value: stats.accounts, icon: Database, color: "text-blue-500" },
    { label: "Total Tokens", value: stats.tokens, icon: Key, color: "text-green-500" },
    { label: "Total Users", value: stats.users, icon: Users, color: "text-purple-500" },
    { label: "Total Records", value: stats.records, icon: FileText, color: "text-orange-500" },
  ]

  return (
    <div className="p-8">
      <h1 className="text-3xl font-heading font-bold mb-6">Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {label}
              </CardTitle>
              <Icon className={`h-5 w-5 ${color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{value.toLocaleString()}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
