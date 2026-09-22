import adminApi from '@/lib/axios'

export interface UserDetails {
  id: string
  nomComplet: string
  email: string
  role: string
  actif: boolean
  lastLogin: string
  createdAt: string
}

export interface UserDetailsResponse {
  success: boolean
  data: UserDetails
}

export const getCurrentUserDetails = (id: string) => {
  return adminApi.get<UserDetailsResponse>(`/users/me/${id}`).then((r) => r.data)
}

export const getMe = () => {
  return adminApi.get<UserDetailsResponse>(`users/me`).then((r) => r.data)
}

export const requestPasswordReset = (email: string) => {
  return adminApi.post('/password/forgot-password', { email }).then((r) => r.data)
}
export const confirmPasswordReset = (data: { token: string, motDePasse: string, confirmMotDePasse: string }) => {
  return adminApi.post('/password/reset-password', data).then((r) => r.data)
}
