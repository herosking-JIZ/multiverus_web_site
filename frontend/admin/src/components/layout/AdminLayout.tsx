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

      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden relative">
        <TopBar onProfileClick={() => setProfileOpen(true)} />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 relative scroll-smooth custom-scrollbar">
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
