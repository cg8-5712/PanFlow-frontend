import { useState, useEffect, useCallback } from "react"
import axios from "axios"
import type { ApiResponse, PaginatedResponse } from "@/types"

const API_BASE = "/api/v1"

// Admin API: uses admin JWT in Authorization header
export const adminApi = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
})

adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("admin_token") ?? ""
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`
  }
  return config
})

// Generic hook for admin CRUD pages
export function useAdminList<T>(endpoint: string, defaultParams: Record<string, string | number> = {}) {
  const [list, setList] = useState<T[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [params, setParams] = useState(defaultParams)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const query = new URLSearchParams({ page: String(page), limit: "10", ...Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)])) })
      const { data } = await adminApi.get<ApiResponse<PaginatedResponse<T>>>(`${endpoint}?${query}`)
      setList(data.data.list ?? [])
      setTotal(data.data.total ?? 0)
    } catch (e) {
      console.error("load error:", e)
    } finally {
      setLoading(false)
    }
  }, [endpoint, page, params])

  useEffect(() => { load() }, [load])

  return { list, total, loading, page, setPage, params, setParams, reload: load }
}
