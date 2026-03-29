import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Database, Users, FileText } from "lucide-react"
import { adminApi } from "@/lib/admin-api"
import type { ApiResponse, PaginatedResponse, Account, User, ParseRecord } from "@/types"

interface Stats {
  accounts: number
  users: number
  records: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ accounts: 0, users: 0, records: 0 })

  useEffect(() => {
    Promise.all([
      adminApi.get<ApiResponse<PaginatedResponse<Account>>>("/admin/account?limit=1"),
      adminApi.get<ApiResponse<PaginatedResponse<User>>>("/admin/user?limit=1"),
      adminApi.get<ApiResponse<PaginatedResponse<ParseRecord>>>("/admin/record?limit=1"),
    ]).then(([accounts, users, records]) => {
      setStats({
        accounts: accounts.data.data.total,
        users: users.data.data.total,
        records: records.data.data.total,
      })
    }).catch(console.error)
  }, [])

  const statCards = [
    { label: "Total Accounts", value: stats.accounts, icon: Database, color: "text-blue-500" },
    { label: "Total Users", value: stats.users, icon: Users, color: "text-purple-500" },
    { label: "Total Records", value: stats.records, icon: FileText, color: "text-orange-500" },
  ]

  return (
    <div className="p-8">
      <h1 className="text-3xl font-heading font-bold mb-6">Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-3">
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
