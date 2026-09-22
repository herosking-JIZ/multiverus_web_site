import adminApi from '@/lib/axios'
import type { LoginPayload, LoginResponse } from '@/types/auth.types'

export const login = (payload: LoginPayload) =>
  adminApi.post<LoginResponse>('/auth/login', payload).then((r) => r.data)

export const logout = () =>
  adminApi.post('/auth/logout').then((r) => r.data)
