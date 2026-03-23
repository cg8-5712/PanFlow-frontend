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
import { Textarea } from "@/components/ui/textarea"
import { Plus, Pencil, Trash2, RefreshCw } from "lucide-react"
import type { Account } from "@/types"

const ACCOUNT_TYPES = ["cookie", "open_platform", "enterprise_cookie", "download_ticket"]

const defaultForm = {
  baidu_name: "",
  uk: "",
  account_type: "cookie",
  account_data: "{}",
  switch: true,
  reason: "",
  prov: "",
}

export default function AdminAccounts() {
  const { list, total, loading, page, setPage, reload } = useAdminList<Account>("/admin/account")
  const [dialog, setDialog] = useState<"add" | "edit" | null>(null)
  const [form, setForm] = useState(defaultForm)
  const [editId, setEditId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const openAdd = () => {
    setForm(defaultForm)
    setEditId(null)
    setError("")
    setDialog("add")
  }

  const openEdit = (acc: Account) => {
    setForm({
      baidu_name: acc.baidu_name,
      uk: acc.uk,
      account_type: acc.account_type,
      account_data: JSON.stringify(acc.account_data, null, 2),
      switch: acc.switch,
      reason: acc.reason ?? "",
      prov: "",
    })
    setEditId(acc.id)
    setError("")
    setDialog("edit")
  }

  const handleSave = async () => {
    setSaving(true)
    setError("")
    try {
      let accountData
      try { accountData = JSON.parse(form.account_data) }
      catch { setError("account_data must be valid JSON"); setSaving(false); return }

      const payload = { ...form, account_data: accountData }
      if (dialog === "add") {
        await adminApi.post("/admin/account", payload)
      } else {
        await adminApi.patch("/admin/account", { ...payload, id: editId })
      }
      setDialog(null)
      reload()
    } catch (e: any) {
      setError(e.response?.data?.message ?? "Save failed")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this account?")) return
    try {
      await adminApi.delete("/admin/account", { data: { id } })
      reload()
    } catch (e: any) {
      alert(e.response?.data?.message ?? "Delete failed")
    }
  }

  const formatSize = (bytes: number) => {
    if (!bytes) return "0 B"
    const gb = bytes / (1024 ** 3)
    return gb > 1 ? gb.toFixed(2) + " GB" : (bytes / (1024 ** 2)).toFixed(2) + " MB"
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-heading font-bold">Accounts</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={reload}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button size="sm" onClick={openAdd}>
            <Plus className="h-4 w-4 mr-2" />Add Account
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Used</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
              ) : list.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No accounts</TableCell></TableRow>
              ) : list.map((acc) => (
                <TableRow key={acc.id}>
                  <TableCell className="font-mono text-xs">{acc.id}</TableCell>
                  <TableCell>
                    <div className="font-medium">{acc.baidu_name}</div>
                    <div className="text-xs text-muted-foreground">{acc.uk}</div>
                  </TableCell>
                  <TableCell><Badge variant="outline">{acc.account_type}</Badge></TableCell>
                  <TableCell>
                    <Badge variant={acc.switch ? "success" : "destructive"}>
                      {acc.switch ? "Active" : "Disabled"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{acc.used_count} times</div>
                    <div className="text-xs text-muted-foreground">{formatSize(acc.used_size)}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(acc)}>
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(acc.id)}>
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
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

      <Dialog open={!!dialog} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialog === "add" ? "Add Account" : "Edit Account"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Baidu Name</Label>
                <Input value={form.baidu_name} onChange={e => setForm(f => ({ ...f, baidu_name: e.target.value }))} placeholder="Username" />
              </div>
              <div className="space-y-1">
                <Label>UK</Label>
                <Input value={form.uk} onChange={e => setForm(f => ({ ...f, uk: e.target.value }))} placeholder="User key" />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Account Type</Label>
              <NativeSelect value={form.account_type} onChange={e => setForm(f => ({ ...f, account_type: e.target.value }))}>
                {ACCOUNT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </NativeSelect>
            </div>
            <div className="space-y-1">
              <Label>Account Data (JSON)</Label>
              <Textarea
                value={form.account_data}
                onChange={e => setForm(f => ({ ...f, account_data: e.target.value }))}
                rows={6}
                className="font-mono text-xs"
                placeholder='{"cookie": "BDUSS=..."}'
              />
            </div>
            <div className="space-y-1">
              <Label>Reason</Label>
              <Input value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} placeholder="Disable reason (optional)" />
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
