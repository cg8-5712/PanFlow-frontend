import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import api from "@/lib/api"
import type { ApiResponse, UserProfile, PaginatedResponse, ParseRecord } from "@/types"

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [history, setHistory] = useState<ParseRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    loadProfile()
    loadHistory()
  }, [page])

  const loadProfile = async () => {
    try {
      const { data } = await api.get<ApiResponse<UserProfile>>("/user/profile")
      setProfile(data.data)
    } catch (err) {
      console.error("Failed to load profile:", err)
    }
  }

  const loadHistory = async () => {
    setLoading(true)
    try {
      const { data } = await api.get<ApiResponse<PaginatedResponse<ParseRecord>>>(
        `/user/history?page=${page}&limit=10`
      )
      setHistory(data.data.list)
      setTotal(data.data.total)
    } catch (err) {
      console.error("Failed to load history:", err)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString()
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-heading font-bold mb-6">Profile</h1>

      {profile && (
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Account Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Username:</span>
                <span className="font-medium">{profile.username}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email:</span>
                <span className="font-medium">{profile.email || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">User Type:</span>
                <span className="font-medium uppercase">{profile.user_type}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Usage Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {profile.user_type === "vip" && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">VIP Balance:</span>
                  <span className="font-medium">{profile.vip_balance}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Daily Used:</span>
                <span className="font-medium">{profile.daily_used_count}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Daily Limit:</span>
                <span className="font-medium">{profile.daily_limit}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Remaining:</span>
                <span className="font-medium text-primary">{profile.daily_remaining}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Parse History</CardTitle>
          <CardDescription>Your recent download link generations</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : history.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No history yet</div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>File ID</TableHead>
                    <TableHead>IP</TableHead>
                    <TableHead>Created At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-mono">{record.fs_id}</TableCell>
                      <TableCell>{record.ip}</TableCell>
                      <TableCell>{formatDate(record.created_at)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="flex justify-between items-center mt-4">
                <div className="text-sm text-muted-foreground">
                  Total: {total} records
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => p + 1)}
                    disabled={page * 10 >= total}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
