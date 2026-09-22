import { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import UserProfileModal from './UserProfileModal'
import type { RootState } from '@/store'
import { getMe } from '@/services/users.service'
import { setUser } from '@/store/authSlice'

export default function AdminLayout() {
  const { user, isAuth } = useSelector((state: RootState) => state.auth)
  const dispatch = useDispatch()
  const [profileOpen, setProfileOpen] = useState(false)

  // Session restoration
  useEffect(() => {
    if (isAuth && !user) {
      getMe()
        .then((res) => {
          if (res.success && res.data) {
            dispatch(setUser(res.data as any))
          }
        })
        .catch((err) => {
          console.error('Session restoration failed:', err)
        })
    }
  }, [isAuth, user, dispatch])

  return (
    <div className="flex h-screen mesh-gradient overflow-hidden font-roboto relative">
      {/* Dynamic Background Accents */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-vivid/15 rounded-full blur-[140px] pointer-events-none animate-pulse-ring" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-sky/10 rounded-full blur-[120px] pointer-events-none animate-pulse-ring2" />
      <div className="absolute top-[20%] right-[10%] w-[40%] h-[40%] bg-or/10 rounded-full blur-[100px] pointer-events-none" />

      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden relative">
        <TopBar onProfileClick={() => setProfileOpen(true)} />
        <main className="flex-1 overflow-y-auto p-8 relative scroll-smooth custom-scrollbar">
          <Outlet />
        </main>
      </div>

      <UserProfileModal
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
      />
    </div>
  )
}
