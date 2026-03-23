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
import { Plus, Pencil, Trash2, RefreshCw } from "lucide-react"
import type { BlackList } from "@/types"

const TYPES = ["ip", "fingerprint"]
const defaultForm = { type: "ip", identifier: "", reason: "", expires_at: "" }

export default function AdminBlacklist() {
  const { list, total, loading, page, setPage, reload } = useAdminList<BlackList>("/admin/black_list")
  const [dialog, setDialog] = useState<"add" | "edit" | null>(null)
  const [form, setForm] = useState(defaultForm)
  const [editId, setEditId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const openAdd = () => { setForm(defaultForm); setEditId(null); setError(""); setDialog("add") }
  const openEdit = (b: BlackList) => {
    setForm({ type: b.type, identifier: b.identifier, reason: b.reason ?? "", expires_at: b.expires_at ? b.expires_at.slice(0, 16) : "" })
    setEditId(b.id); setError(""); setDialog("edit")
  }

  const handleSave = async () => {
    setSaving(true); setError("")
    try {
      const payload = { ...form, expires_at: form.expires_at ? form.expires_at + ":00" : undefined }
      if (dialog === "add") await adminApi.post("/admin/black_list", payload)
      else await adminApi.patch("/admin/black_list", { ...payload, id: editId })
      setDialog(null); reload()
    } catch (e: any) { setError(e.response?.data?.message ?? "Save failed") }
    finally { setSaving(false) }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Remove from blacklist?")) return
    try { await adminApi.delete("/admin/black_list", { data: { id } }); reload() }
    catch (e: any) { alert(e.response?.data?.message ?? "Delete failed") }
  }

  const isExpired = (exp: string) => exp && new Date(exp) < new Date()

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-heading font-bold">Blacklist</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={reload}><RefreshCw className="h-4 w-4" /></Button>
          <Button size="sm" onClick={openAdd}><Plus className="h-4 w-4 mr-2" />Add</Button>
        </div>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Identifier</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Expires At</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
              ) : list.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Blacklist is empty</TableCell></TableRow>
              ) : list.map(b => (
                <TableRow key={b.id}>
                  <TableCell><Badge variant={b.type === "ip" ? "destructive" : "warning"}>{b.type}</Badge></TableCell>
                  <TableCell className="font-mono text-sm">{b.identifier}</TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">{b.reason}</TableCell>
                  <TableCell>
                    {b.expires_at ? (
                      <span className={isExpired(b.expires_at) ? "text-muted-foreground line-through text-xs" : "text-sm"}>
                        {new Date(b.expires_at).toLocaleString()}
                      </span>
                    ) : <span className="text-muted-foreground text-sm">Never</span>}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(b)}><Pencil className="h-3 w-3" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(b.id)}><Trash2 className="h-3 w-3 text-destructive" /></Button>
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
          <DialogHeader><DialogTitle>{dialog === "add" ? "Add to Blacklist" : "Edit Entry"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Type</Label>
              <NativeSelect value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </NativeSelect>
            </div>
            <div className="space-y-1">
              <Label>Identifier</Label>
              <Input value={form.identifier} onChange={e => setForm(f => ({ ...f, identifier: e.target.value }))} placeholder="IP or fingerprint" />
            </div>
            <div className="space-y-1">
              <Label>Reason</Label>
              <Input value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} placeholder="Block reason" />
            </div>
            <div className="space-y-1">
              <Label>Expires At (optional)</Label>
              <Input type="datetime-local" value={form.expires_at} onChange={e => setForm(f => ({ ...f, expires_at: e.target.value }))} />
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
