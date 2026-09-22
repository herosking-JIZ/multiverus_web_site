import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

interface AdminUser {
  id: string
  nomComplet: string
  email: string
  role: 'ADMIN' | 'EDITOR'
  lastLogin?: string
  actif?: boolean
  createdAt?: string
}

interface AuthState {
  accessToken: string | null
  user: AdminUser | null
  isAuth: boolean
  csrfToken: string | null
}

const initialState: AuthState = {
  accessToken: sessionStorage.getItem('bwt_access_token'),
  user: sessionStorage.getItem('bwt_user') ? JSON.parse(sessionStorage.getItem('bwt_user')!) : null,
  isAuth: !!sessionStorage.getItem('bwt_access_token'),
  csrfToken: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: AdminUser; accessToken: string }>
    ) => {
      state.user = action.payload.user
      state.accessToken = action.payload.accessToken
      state.isAuth = true
      sessionStorage.setItem('bwt_access_token', action.payload.accessToken)
      sessionStorage.setItem('bwt_user', JSON.stringify(action.payload.user))
    },
    setCsrfToken: (state, action: PayloadAction<string | null>) => {
      state.csrfToken = action.payload
    },
    setAccessToken: (state, action: PayloadAction<string>) => {
      state.accessToken = action.payload
      state.isAuth = true
      sessionStorage.setItem('bwt_access_token', action.payload)
    },
    setUser: (state, action: PayloadAction<AdminUser>) => {
      state.user = action.payload
      sessionStorage.setItem('bwt_user', JSON.stringify(action.payload))
    },
    logout: (state) => {
      state.user = null
      state.accessToken = null
      state.isAuth = false
      state.csrfToken = null
      sessionStorage.removeItem('bwt_access_token')
      sessionStorage.removeItem('bwt_user')
    },
  },
})

export const { setCredentials, setCsrfToken, setAccessToken, setUser, logout } = authSlice.actions
export default authSlice.reducer
