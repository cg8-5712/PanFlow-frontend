import { useState } from "react"
import { useAdminList, adminApi } from "@/lib/admin-api"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { NativeSelect } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Pencil, Trash2, RefreshCw, Coins } from "lucide-react"
import type { User } from "@/types"

const USER_TYPES = ["guest", "vip", "svip", "admin"]

const defaultForm = { username: "", email: "", user_type: "guest", vip_balance: 0, daily_limit: 5 }

export default function AdminUsers() {
  const { list, total, loading, page, setPage, reload } = useAdminList<User>("/admin/user")
  const [dialog, setDialog] = useState<"add" | "edit" | "recharge" | null>(null)
  const [form, setForm] = useState(defaultForm)
  const [editId, setEditId] = useState<number | null>(null)
  const [rechargeAmount, setRechargeAmount] = useState(100)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const openAdd = () => { setForm(defaultForm); setEditId(null); setError(""); setDialog("add") }
  const openEdit = (u: User) => {
    setForm({ username: u.username, email: u.email ?? "", user_type: u.user_type, vip_balance: u.vip_balance, daily_limit: u.daily_limit })
    setEditId(u.id); setError(""); setDialog("edit")
  }
  const openRecharge = (u: User) => { setEditId(u.id); setRechargeAmount(100); setError(""); setDialog("recharge") }

  const handleSave = async () => {
    setSaving(true); setError("")
    try {
      if (dialog === "add") await adminApi.post("/admin/user", form)
      else await adminApi.patch("/admin/user", { ...form, id: editId })
      setDialog(null); reload()
    } catch (e: any) { setError(e.response?.data?.message ?? "Save failed") }
    finally { setSaving(false) }
  }

  const handleRecharge = async () => {
    setSaving(true); setError("")
    try {
      await adminApi.post("/admin/user/recharge", { id: editId, amount: rechargeAmount })
      setDialog(null); reload()
    } catch (e: any) { setError(e.response?.data?.message ?? "Recharge failed") }
    finally { setSaving(false) }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this user?")) return
    try { await adminApi.delete("/admin/user", { data: { id } }); reload() }
    catch (e: any) { alert(e.response?.data?.message ?? "Delete failed") }
  }

  const typeBadge = (t: string) => {
    const cls: Record<string, string> = { guest: "", vip: "default", svip: "success", admin: "destructive" }
    return <Badge variant={cls[t] as any ?? "outline"}>{t}</Badge>
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-heading font-bold">Users</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={reload}><RefreshCw className="h-4 w-4" /></Button>
          <Button size="sm" onClick={openAdd}><Plus className="h-4 w-4 mr-2" />Add User</Button>
        </div>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Daily Limit</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
              ) : list.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No users</TableCell></TableRow>
              ) : list.map(u => (
                <TableRow key={u.id}>
                  <TableCell>
                    <div className="font-medium">{u.username}</div>
                    <div className="text-xs text-muted-foreground">{u.email}</div>
                  </TableCell>
                  <TableCell>{typeBadge(u.user_type)}</TableCell>
                  <TableCell>{u.user_type === "vip" ? <span className="font-medium text-primary">{u.vip_balance}</span> : "—"}</TableCell>
                  <TableCell>{u.daily_limit}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {u.user_type === "vip" && (
                        <Button variant="ghost" size="sm" onClick={() => openRecharge(u)} title="Recharge">
                          <Coins className="h-3 w-3 text-yellow-500" />
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" onClick={() => openEdit(u)}><Pencil className="h-3 w-3" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(u.id)}><Trash2 className="h-3 w-3 text-destructive" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <div className="flex justify-between items-center mt-4">
        <span className="text-sm text-muted-foreground">Total: {total}</span>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Prev</Button>
          <span className="text-sm px-2 py-1">Page {page}</span>
          <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page * 10 >= total}>Next</Button>
        </div>
      </div>

      {/* Add / Edit Dialog */}
      <Dialog open={dialog === "add" || dialog === "edit"} onOpenChange={o => !o && setDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{dialog === "add" ? "Add User" : "Edit User"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Username</Label>
                <Input value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} disabled={dialog === "edit"} />
              </div>
              <div className="space-y-1">
                <Label>Email</Label>
                <Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>User Type</Label>
                <NativeSelect value={form.user_type} onChange={e => setForm(f => ({ ...f, user_type: e.target.value }))}>
                  {USER_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </NativeSelect>
              </div>
              <div className="space-y-1">
                <Label>Daily Limit</Label>
                <Input type="number" value={form.daily_limit} onChange={e => setForm(f => ({ ...f, daily_limit: +e.target.value }))} />
              </div>
            </div>
            {error && <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">{error}</div>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(null)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Recharge Dialog */}
      <Dialog open={dialog === "recharge"} onOpenChange={o => !o && setDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Recharge VIP Balance</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Amount</Label>
              <Input type="number" value={rechargeAmount} onChange={e => setRechargeAmount(+e.target.value)} min={1} />
            </div>
            {error && <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">{error}</div>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(null)}>Cancel</Button>
            <Button onClick={handleRecharge} disabled={saving}>{saving ? "Processing..." : "Recharge"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
