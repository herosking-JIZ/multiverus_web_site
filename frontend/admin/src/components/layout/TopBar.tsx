import { LogOut, User } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useLocation } from 'react-router-dom'
import type { RootState } from '@/store'
import { logout } from '@/store/authSlice'

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

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  return (
    <header className="h-[76px] border-b border-white/[0.08] bg-[#0A0E14]/80 backdrop-blur-xl m-3 mb-0 rounded-xl flex items-center justify-between px-5 lg:px-7 z-10">
      {/* Page Info */}
      <div className="flex flex-col">
        <span className="text-[10px] text-muted-2 uppercase tracking-[0.18em] font-mono mb-1">MULTIVERUS / ADMIN</span>
        <h1 className="text-[18px] font-bold text-foreground tracking-tight">
          {pageLabel}
        </h1>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        <div className="h-7 w-px bg-white/10 mx-2" />

        {/* User Profile */}
        <div className="flex items-center gap-3 pl-2">
          {user && (
            <button
              onClick={onProfileClick}
              className="hidden sm:flex items-center gap-3 text-right group transition-all duration-300 hover:opacity-80"
            >
              <div className="flex flex-col">
                <div className="text-[13px] font-semibold text-foreground leading-none mb-1 group-hover:text-teal transition-colors">{user.nomComplet}</div>
                <div className="inline-flex px-2 py-0.5 rounded-full bg-teal/10 text-[10px] font-bold text-teal uppercase tracking-wider">
                  {user.role}
                </div>
              </div>
            </button>
          )}

          <button
            onClick={onProfileClick}
            className="w-10 h-10 rounded-lg bg-teal shadow-[0_8px_16px_rgba(45,212,191,0.2)] flex items-center justify-center text-navy transition-transform duration-200 hover:scale-105 active:scale-95"
          >
            <User size={20} />
          </button>

          <button
            onClick={handleLogout}
            className="w-10 h-10 rounded-lg bg-white/[0.04] border border-white/10 flex items-center justify-center text-muted hover:text-red-400 hover:bg-red-500/10 hover:shadow-lg transition-all duration-200"
            aria-label="Se déconnecter"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  )
}
