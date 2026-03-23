import { useState } from "react"
import { useAdminList, adminApi } from "@/lib/admin-api"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { NativeSelect } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Pencil, Trash2, RefreshCw } from "lucide-react"
import type { Token } from "@/types"

const defaultForm = {
  token: "",
  token_type: "normal",
  user_type: "guest",
  count: 10,
  size: 10737418240, // 10GB in bytes
  day: 1,
  can_use_ip_count: 1,
  switch: true,
  reason: "",
}

const USER_TYPES = ["guest", "vip", "svip", "admin"]
const TOKEN_TYPES = ["normal", "daily"]

export default function AdminTokens() {
  const { list, total, loading, page, setPage, reload } = useAdminList<Token>("/admin/token")
  const [dialog, setDialog] = useState<"add" | "edit" | null>(null)
  const [form, setForm] = useState(defaultForm)
  const [editId, setEditId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const openAdd = () => { setForm(defaultForm); setEditId(null); setError(""); setDialog("add") }

  const openEdit = (t: Token) => {
    setForm({
      token: t.token,
      token_type: t.token_type,
      user_type: t.user_type,
      count: t.count,
      size: t.size,
      day: 1,
      can_use_ip_count: 1,
      switch: t.switch,
      reason: t.reason ?? "",
    })
    setEditId(t.id)
    setError("")
    setDialog("edit")
  }

  const handleSave = async () => {
    setSaving(true); setError("")
    try {
      if (dialog === "add") await adminApi.post("/admin/token", form)
      else await adminApi.patch("/admin/token", { ...form, id: editId })
      setDialog(null); reload()
    } catch (e: any) {
      setError(e.response?.data?.message ?? "Save failed")
    } finally { setSaving(false) }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this token?")) return
    try { await adminApi.delete("/admin/token", { data: { id } }); reload() }
    catch (e: any) { alert(e.response?.data?.message ?? "Delete failed") }
  }

  const formatSize = (bytes: number) => {
    const gb = bytes / (1024 ** 3)
    return gb >= 1 ? gb.toFixed(1) + " GB" : (bytes / (1024 ** 2)).toFixed(0) + " MB"
  }

  const userTypeBadge = (t: string) => {
    const map: Record<string, "default" | "success" | "warning" | "destructive"> = {
      guest: "secondary" as any, vip: "default", svip: "success", admin: "destructive"
    }
    return <Badge variant={map[t] ?? "outline"}>{t}</Badge>
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-heading font-bold">Tokens</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={reload}><RefreshCw className="h-4 w-4" /></Button>
          <Button size="sm" onClick={openAdd}><Plus className="h-4 w-4 mr-2" />Add Token</Button>
        </div>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Token</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>User Type</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
              ) : list.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No tokens</TableCell></TableRow>
              ) : list.map(t => (
                <TableRow key={t.id}>
                  <TableCell className="font-mono text-xs max-w-[160px] truncate">{t.token}</TableCell>
                  <TableCell><Badge variant="outline">{t.token_type}</Badge></TableCell>
                  <TableCell>{userTypeBadge(t.user_type)}</TableCell>
                  <TableCell>
                    <div className="text-sm">{t.used_count} / {t.count}</div>
                    <div className="text-xs text-muted-foreground">{formatSize(t.used_size)} / {formatSize(t.size)}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={t.switch ? "success" : "destructive"}>{t.switch ? "Active" : "Off"}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(t)}><Pencil className="h-3 w-3" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(t.id)}><Trash2 className="h-3 w-3 text-destructive" /></Button>
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

      <Dialog open={!!dialog} onOpenChange={o => !o && setDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{dialog === "add" ? "Add Token" : "Edit Token"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Token</Label>
              <Input value={form.token} onChange={e => setForm(f => ({ ...f, token: e.target.value }))} placeholder="Token string" disabled={dialog === "edit"} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Token Type</Label>
                <NativeSelect value={form.token_type} onChange={e => setForm(f => ({ ...f, token_type: e.target.value }))}>
                  {TOKEN_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </NativeSelect>
              </div>
              <div className="space-y-1">
                <Label>User Type</Label>
                <NativeSelect value={form.user_type} onChange={e => setForm(f => ({ ...f, user_type: e.target.value }))}>
                  {USER_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </NativeSelect>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Count Limit</Label>
                <Input type="number" value={form.count} onChange={e => setForm(f => ({ ...f, count: +e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label>Size Limit (GB)</Label>
                <Input type="number" value={form.size / (1024 ** 3)} onChange={e => setForm(f => ({ ...f, size: +e.target.value * (1024 ** 3) }))} />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Reason</Label>
              <Input value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} placeholder="Optional" />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.switch} onCheckedChange={v => setForm(f => ({ ...f, switch: v }))} />
              <Label>Enabled</Label>
            </div>
            {error && <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">{error}</div>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(null)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
