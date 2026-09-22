import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import type { RootState } from '@/store'

interface AuthGuardProps {
  children: React.ReactNode
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const isAuth = useSelector((state: RootState) => state.auth.isAuth)
  if (!isAuth) return <Navigate to="/login" replace />
  return <>{children}</>
}
