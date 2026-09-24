import { NavLink } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import type { RootState } from '@/store'
import { toggleSidebar } from '@/store/uiSlice'
import {
  LayoutDashboard, MessageSquare, Layers, Package,
  Star, ChevronLeft, ChevronRight, LogOut, Handshake,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/leads', label: 'Leads', icon: MessageSquare },
  { to: '/services', label: 'Services', icon: Layers },
  { to: '/produits', label: 'Produits', icon: Package },
  { to: '/references', label: 'Références', icon: Star },
  { to: '/partenaires', label: 'Partenaires', icon: Handshake },
]

export default function Sidebar() {
  const dispatch = useDispatch()
  const { sidebarCollapsed } = useSelector((state: RootState) => state.ui)

  const handleToggle = () => {
    dispatch(toggleSidebar())
  }

  return (
    <aside
      className={cn(
        'sidebar-premium m-3 mr-0 rounded-xl flex flex-col transition-all duration-300 relative z-20 overflow-hidden',
        sidebarCollapsed ? 'w-[76px]' : 'w-[264px]'
      )}
    >
      {/* Logo Area */}
      <div className="h-28 flex items-center justify-center px-5 mb-4 relative">
        {!sidebarCollapsed ? (
          <div className="flex flex-col items-center relative z-10 w-full px-2">
            <div className="p-3 rounded-lg border border-white/10 bg-[#111722] mb-3 w-full flex items-center justify-center group/logo overflow-hidden relative">
              <img src="/multiverus-horizontal.svg" alt="MULTIVERUS" className="relative z-10 w-full max-w-[190px]" />
            </div>
            <span className="text-[10px] text-muted-2 font-mono uppercase tracking-[0.28em]">Studio admin</span>
          </div>
        ) : (
          <div className="w-12 h-12 rounded-lg bg-[#111722] border border-white/10 flex items-center justify-center transition-all duration-300 hover:bg-white/10 group relative z-10 overflow-hidden">
            <img src="/multiverus-mark.svg" alt="MULTIVERUS" className="w-9 h-9 relative z-10" />
          </div>
        )}
        <div className="absolute bottom-0 left-6 right-6 h-px bg-white/10" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1.5 overflow-y-auto custom-scrollbar">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'group relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-300 no-underline',
                isActive
                  ? 'bg-teal/12 text-teal border border-teal/20'
                  : 'text-white/55 hover:text-white hover:bg-white/[0.06]'
              )
            }
          >
            <div className={cn(
              'p-1 rounded-lg transition-all duration-300',
              sidebarCollapsed ? 'mx-auto p-0' : ''
            )}>
              <Icon size={sidebarCollapsed ? 24 : 20} strokeWidth={2.5} />
            </div>

            {!sidebarCollapsed && (
                <span className="text-[13px] font-semibold tracking-wide">
                {label}
              </span>
            )}

            {/* Active Indicator Glow */}
          </NavLink>
        ))}
      </nav>

      {/* Collapse Toggle */}
      <button
        onClick={handleToggle}
        className="absolute -right-2 top-24 w-6 h-6 rounded-full bg-surface border border-white/10 grid place-items-center text-white/40 hover:text-white transition-all duration-200 hover:scale-110 z-30"
      >
        {sidebarCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>

      {/* Support Island */}
      {!sidebarCollapsed && (
        <div className="p-3 mx-4 mb-2 rounded-lg bg-white/[0.03] border border-white/5 group transition-all duration-300 hover:bg-white/10">
          <div className="text-[9px] text-faint uppercase tracking-[0.22em] mb-1 font-mono">Support 24/7</div>
          <div className="text-[11px] text-teal font-medium">hello@multiverus.dev</div>
        </div>
      )}

      {/* Footer / Logout */}
      <div className="p-4 relative z-10 border-t border-white/5 bg-white/2">
        <button className="group flex items-center justify-center gap-4 w-full h-12 rounded-xl bg-white/5 border border-white/5 text-white/40 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 transition-all duration-500 glass-reflection">
          <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
          {!sidebarCollapsed && <span className="text-[12px] font-black uppercase tracking-widest">Déconnexion</span>}
        </button>
      </div>
    </aside>
  )
}
