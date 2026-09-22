export interface LoginPayload {
  email: string
  password: string
}

export interface LoginResponse {
  success: boolean
  message?: string
  data: {
    accessToken: string
    user: {
      id: string
      nom: string
      email: string
      role: 'ADMIN' | 'EDITOR'
    }
  }
}
