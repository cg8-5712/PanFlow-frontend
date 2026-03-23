import { useState, useEffect } from "react"
import { adminApi } from "@/lib/admin-api"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { RefreshCw, Save, RotateCcw } from "lucide-react"
import type { ApiResponse, PaginatedResponse, Config } from "@/types"

export default function AdminConfig() {
  const [configs, setConfigs] = useState<Config[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState<number | null>(null)
  const [reloading, setReloading] = useState(false)
  const [edits, setEdits] = useState<Record<number, string>>({})
  const [message, setMessage] = useState("")

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await adminApi.get<ApiResponse<PaginatedResponse<Config>>>("/admin/config?limit=100")
      setConfigs(data.data.list ?? [])
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const getValue = (cfg: Config) => edits[cfg.id] !== undefined ? edits[cfg.id] : cfg.value

  const handleChange = (id: number, val: string) => {
    setEdits(e => ({ ...e, [id]: val }))
  }

  const handleSave = async (cfg: Config) => {
    const val = edits[cfg.id] !== undefined ? edits[cfg.id] : cfg.value
    setSaving(cfg.id)
    try {
      await adminApi.patch("/admin/config", { key: cfg.key, value: val })
      setConfigs(cs => cs.map(c => c.id === cfg.id ? { ...c, value: val } : c))
      setEdits(e => { const n = { ...e }; delete n[cfg.id]; return n })
      setMessage(`Saved: ${cfg.key}`)
      setTimeout(() => setMessage(""), 2000)
    } catch (e: any) {
      alert(e.response?.data?.message ?? "Save failed")
    } finally { setSaving(null) }
  }

  const handleReload = async () => {
    setReloading(true)
    try {
      await adminApi.post("/admin/config/reload", {})
      setMessage("Config reloaded successfully")
      setTimeout(() => setMessage(""), 3000)
    } catch (e: any) {
      alert(e.response?.data?.message ?? "Reload failed")
    } finally { setReloading(false) }
  }

  const renderInput = (cfg: Config) => {
    const val = getValue(cfg)
    const isDirty = edits[cfg.id] !== undefined && edits[cfg.id] !== cfg.value

    if (cfg.type === "bool") {
      return (
        <div className="flex items-center gap-3">
          <Switch
            checked={val === "true"}
            onCheckedChange={v => handleChange(cfg.id, v ? "true" : "false")}
          />
          <span className="text-sm">{val === "true" ? "true" : "false"}</span>
          {isDirty && <Badge variant="warning" className="text-xs">Unsaved</Badge>}
        </div>
      )
    }

    return (
      <div className="flex gap-2 items-center">
        <Input
          value={val}
          onChange={e => handleChange(cfg.id, e.target.value)}
          type={cfg.type === "int" ? "number" : "text"}
          className={`max-w-xs ${isDirty ? "border-yellow-400" : ""}`}
        />
        {isDirty && <Badge variant="warning" className="text-xs">Unsaved</Badge>}
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-heading font-bold">System Config</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={load}><RefreshCw className="h-4 w-4" /></Button>
          <Button variant="outline" size="sm" onClick={handleReload} disabled={reloading}>
            <RotateCcw className={`h-4 w-4 mr-2 ${reloading ? "animate-spin" : ""}`} />
            Reload Cache
          </Button>
        </div>
      </div>

      {message && (
        <div className="mb-4 text-sm text-green-600 bg-green-50 dark:bg-green-900/20 p-3 rounded-md">
          {message}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading...</div>
      ) : (
        <div className="space-y-3">
          {configs.map(cfg => (
            <Card key={cfg.id}>
              <CardHeader className="pb-2 flex flex-row items-start justify-between">
                <div>
                  <CardTitle className="text-sm font-mono">{cfg.key}</CardTitle>
                  {cfg.description && <CardDescription>{cfg.description}</CardDescription>}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">{cfg.type}</Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleSave(cfg)}
                    disabled={saving === cfg.id || edits[cfg.id] === undefined}
                  >
                    <Save className="h-3 w-3 mr-1" />
                    {saving === cfg.id ? "Saving..." : "Save"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Label className="text-xs text-muted-foreground mb-1 block">Value</Label>
                {renderInput(cfg)}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
