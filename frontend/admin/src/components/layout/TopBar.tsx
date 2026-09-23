import { LogOut, User } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useLocation } from 'react-router-dom'
import type { RootState } from '@/store'
import { logout } from '@/store/authSlice'
import { logout as logoutRequest } from '@/services/auth.service'

const PAGE_LABELS: Record<string, string> = {
  '/': 'Dashboard',
  '/leads': 'Leads',
  '/services': 'Services',
  '/produits': 'Produits',
  '/references': 'Références',
  '/partenaires': 'Partenaires',
}

export default function TopBar({ onProfileClick }: { onProfileClick: () => void }) {
  const { user } = useSelector((state: RootState) => state.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const pageLabel = PAGE_LABELS[location.pathname] ?? 'Dashboard'

  const handleLogout = async () => {
    try {
      await logoutRequest()
    } finally {
      dispatch(logout())
      navigate('/login')
    }
  }

  return (
    <header className="h-20 glass-premium m-4 mb-0 rounded-[32px] flex items-center justify-between px-8 z-10 border border-white/40">
      {/* Page Info */}
      <div className="flex flex-col">
        <span className="text-[10px] text-vivid/60 uppercase tracking-widest font-black font-condensed mb-0.5">Broadway / Admin</span>
        <h1 className="text-[20px] font-black text-navy tracking-tight font-condensed">
          {pageLabel}
        </h1>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        <div className="h-8 w-px bg-navy/5 mx-2" />

        {/* User Profile */}
        <div className="flex items-center gap-3 pl-2">
          {user && (
            <button
              onClick={onProfileClick}
              className="flex items-center gap-3 text-right hidden sm:flex group transition-all duration-300 hover:opacity-80"
            >
              <div className="flex flex-col">
                <div className="text-[13px] font-bold text-navy leading-none mb-1 group-hover:text-vivid transition-colors">{user.nomComplet}</div>
                <div className="inline-flex px-2 py-0.5 rounded-full bg-vivid/10 text-[10px] font-bold text-vivid uppercase tracking-wider">
                  {user.role}
                </div>
              </div>
            </button>
          )}

          <button
            onClick={onProfileClick}
            className="w-10 h-10 rounded-2xl bg-vivid shadow-[0_8px_16px_rgba(21,87,232,0.2)] flex items-center justify-center text-white transition-transform duration-200 hover:scale-105 active:scale-95"
          >
            <User size={20} />
          </button>

          <button
            onClick={handleLogout}
            className="w-10 h-10 rounded-2xl bg-white/50 border border-white/80 flex items-center justify-center text-muted-text hover:text-red-500 hover:bg-white hover:shadow-lg transition-all duration-200"
            aria-label="Se déconnecter"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  )
}
