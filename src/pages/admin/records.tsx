import { useState } from "react"
import { useAdminList } from "@/lib/admin-api"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { RefreshCw, Search } from "lucide-react"
import type { ParseRecord } from "@/types"

export default function AdminRecords() {
  const [search, setSearch] = useState("")
  const [searchInput, setSearchInput] = useState("")
  const { list, total, loading, page, setPage, setParams, reload } = useAdminList<ParseRecord>("/admin/record")

  const handleSearch = () => {
    setSearch(searchInput)
    setParams(searchInput ? { ip: searchInput } : {})
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch()
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-heading font-bold">Parse Records</h1>
        <Button variant="outline" size="sm" onClick={reload}><RefreshCw className="h-4 w-4" /></Button>
      </div>

      <div className="flex gap-2 mb-4">
        <Input
          placeholder="Search by IP..."
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="max-w-xs"
        />
        <Button variant="outline" onClick={handleSearch}>
          <Search className="h-4 w-4 mr-2" />Search
        </Button>
        {search && (
          <Button variant="ghost" onClick={() => { setSearchInput(""); setSearch(""); setParams({}) }}>
            Clear
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>IP</TableHead>
                <TableHead>File ID</TableHead>
                <TableHead>Account</TableHead>
                <TableHead>Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
              ) : list.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No records</TableCell></TableRow>
              ) : list.map(r => (
                <TableRow key={r.id}>
                  <TableCell className="font-mono text-xs">{r.id}</TableCell>
                  <TableCell className="font-mono text-sm">{r.ip}</TableCell>
                  <TableCell className="font-mono text-xs">{r.fs_id}</TableCell>
                  <TableCell>{r.account_id}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{new Date(r.created_at).toLocaleString()}</TableCell>
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
    </div>
  )
}
