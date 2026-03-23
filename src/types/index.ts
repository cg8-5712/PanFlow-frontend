export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

export interface LoginResponse {
  access_token: string
  refresh_token: string
  user_type: 'guest' | 'vip' | 'svip' | 'admin'
  expires_at: string
}

export interface UserProfile {
  username: string
  email: string
  user_type: 'guest' | 'vip' | 'svip' | 'admin'
  vip_balance: number
  daily_used_count: number
  daily_limit: number
  daily_remaining: number
}

export interface ParseConfig {
  guest_daily_limit: number
  svip_daily_limit: number
  vip_count_based: boolean
  admin_unlimited: boolean
}

export interface ParseLimit {
  max_once: number
  min_single_filesize: number
  max_single_filesize: number
  max_all_filesize: number
}

export interface DownloadLink {
  fs_id: number
  urls: string[]
  size: number
  filename: string
}

export interface ParseRequest {
  surl: string
  pwd?: string
  fs_id: number[]
}

export interface ParseRecord {
  id: number
  ip: string
  fingerprint: string
  fs_id: number
  urls: string[]
  token_id: number
  account_id: number
  user_id?: number
  created_at: string
}

export interface Account {
  id: number
  baidu_name: string
  uk: string
  account_type: 'cookie' | 'open_platform' | 'enterprise_cookie' | 'download_ticket'
  account_data: { [key: string]: unknown }
  switch: boolean
  reason: string
  used_count: number
  used_size: number
  created_at: string
}

export interface Token {
  id: number
  token: string
  token_type: 'normal' | 'daily'
  user_type: 'guest' | 'vip' | 'svip' | 'admin'
  count: number
  used_count: number
  size: number
  used_size: number
  switch: boolean
  reason?: string
  created_at: string
}

export interface User {
  id: number
  username: string
  email: string
  user_type: 'guest' | 'vip' | 'svip' | 'admin'
  vip_balance: number
  daily_limit: number
  created_at: string
}

export interface BlackList {
  id: number
  type: 'ip' | 'fingerprint'
  identifier: string
  reason: string
  expires_at: string
  created_at: string
}

export interface Config {
  id: number
  key: string
  value: string
  type: 'string' | 'int' | 'bool' | 'json'
  description: string
}

export interface PaginatedResponse<T> {
  total: number
  list: T[]
}
