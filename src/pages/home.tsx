import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Download, Loader2 } from "lucide-react"
import api from "@/lib/api"
import type { ApiResponse, ParseConfig, ParseLimit, DownloadLink } from "@/types"

export default function HomePage() {
  const [config, setConfig] = useState<ParseConfig | null>(null)
  const [limit, setLimit] = useState<ParseLimit | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [surl, setSurl] = useState("")
  const [pwd, setPwd] = useState("")
  const [fsIds, setFsIds] = useState("")
  const [results, setResults] = useState<DownloadLink[]>([])

  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    try {
      const [configRes, limitRes] = await Promise.all([
        api.get<ApiResponse<ParseConfig>>("/user/parse/config"),
        api.get<ApiResponse<ParseLimit>>("/user/parse/limit"),
      ])
      setConfig(configRes.data.data)
      setLimit(limitRes.data.data)
    } catch (err) {
      console.error("Failed to load config:", err)
    }
  }

  const handleParse = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setResults([])
    setLoading(true)

    try {
      const fsIdArray = fsIds
        .split(/[\n,]/)
        .map(id => parseInt(id.trim()))
        .filter(id => !isNaN(id))

      if (fsIdArray.length === 0) {
        setError("Please enter valid file IDs")
        return
      }

      const { data } = await api.post<ApiResponse<DownloadLink[]>>(
        "/user/parse/get_download_links",
        { surl, pwd, fs_id: fsIdArray }
      )

      setResults(data.data)
    } catch (err: any) {
      setError(err.response?.data?.message || "Parse failed")
    } finally {
      setLoading(false)
    }
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B"
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB"
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + " MB"
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + " GB"
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-heading font-bold mb-2">PanFlow</h1>
        <p className="text-muted-foreground">
          Baidu Pan SVIP Download Link Generator
        </p>
      </div>

      {config && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Usage Limits</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <div className="grid grid-cols-2 gap-4">
              <div>Guest Daily Limit: {config.guest_daily_limit}</div>
              <div>SVIP Daily Limit: {config.svip_daily_limit}</div>
              {limit && (
                <>
                  <div>Max Files Per Request: {limit.max_once}</div>
                  <div>Max File Size: {formatSize(limit.max_single_filesize)}</div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Parse Share Link</CardTitle>
          <CardDescription>
            Enter Baidu Pan share link details to generate download links
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleParse} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Share URL (surl)</label>
              <Input
                placeholder="e.g., 1a2b3c4d"
                value={surl}
                onChange={(e) => setSurl(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Password (optional)</label>
              <Input
                placeholder="e.g., abcd"
                value={pwd}
                onChange={(e) => setPwd(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">File IDs (one per line or comma-separated)</label>
              <Textarea
                placeholder="123456789&#10;987654321"
                value={fsIds}
                onChange={(e) => setFsIds(e.target.value)}
                rows={4}
                required
              />
            </div>

            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Parsing...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Generate Download Links
                </>
              )}
            </Button>
          </form>

          {results.length > 0 && (
            <div className="mt-6 space-y-4">
              <h3 className="font-semibold">Download Links</h3>
              {results.map((result) => (
                <Card key={result.fs_id}>
                  <CardContent className="pt-6">
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <div className="font-medium truncate flex-1">
                          {result.filename}
                        </div>
                        <div className="text-sm text-muted-foreground ml-4">
                          {formatSize(result.size)}
                        </div>
                      </div>
                      <div className="space-y-1">
                        {result.urls.map((url, idx) => (
                          <div key={idx} className="flex gap-2">
                            <Input
                              value={url}
                              readOnly
                              className="font-mono text-xs"
                            />
                            <Button
                              size="sm"
                              onClick={() => {
                                navigator.clipboard.writeText(url)
                              }}
                            >
                              Copy
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
