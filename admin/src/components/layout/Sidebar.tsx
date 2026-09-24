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
        'sidebar-premium m-4 mr-0 rounded-[32px] flex flex-col transition-all duration-300 relative z-20 overflow-hidden',
        sidebarCollapsed ? 'w-[80px]' : 'w-[280px]'
      )}
    >
      {/* Logo Area */}
      <div className="h-28 flex items-center justify-center px-6 mb-4 relative">
        {!sidebarCollapsed ? (
          <div className="flex flex-col items-center relative z-10 w-full px-2">
            <div className="bg-[#f8f9fa] backdrop-blur-md p-3.5 px-6 rounded-2xl border border-white shadow-sm mb-2 w-full flex items-center justify-center group/logo overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-vivid/5 to-transparent opacity-0 group-hover/logo:opacity-100 transition-opacity duration-500" />
              <img src="/logo.svg" alt="MultiVerus" className="h-8 w-auto min-w-[120px] relative z-10" />
            </div>
            <span className="text-[10px] text-vivid font-black uppercase tracking-[0.4em] font-condensed">Administration</span>
          </div>
        ) : (
          <div className="w-14 h-14 rounded-2xl bg-[#f8f9fa] border border-white flex items-center justify-center transition-all duration-300 hover:bg-white group relative z-10 shadow-sm overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-vivid/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <img src="/logo.svg" alt="BW" className="h-6 w-auto object-contain px-1 relative z-10" />
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
                'group relative flex items-center gap-4 px-4 py-2 rounded-2xl transition-all duration-500 glass-reflection no-underline',
                isActive
                  ? 'bg-gradient-to-r from-vivid to-blue text-white shadow-[0_12px_24px_-8px_rgba(21,87,232,0.4)] scale-[1.02]'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              )
            }
          >
            <div className={cn(
              'p-1 rounded-xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-3',
              sidebarCollapsed ? 'mx-auto p-0' : ''
            )}>
              <Icon size={sidebarCollapsed ? 24 : 20} strokeWidth={2.5} />
            </div>

            {!sidebarCollapsed && (
              <span className="text-[14px] font-black tracking-tight font-condensed uppercase">
                {label}
              </span>
            )}

            {/* Active Indicator Glow */}
            <div className="absolute inset-y-2 right-2 w-1 rounded-full bg-white opacity-0 transition-opacity group-[.active]:opacity-40" />
          </NavLink>
        ))}
      </nav>

      {/* Collapse Toggle */}
      <button
        onClick={handleToggle}
        className="absolute -right-2 top-24 w-6 h-6 rounded-full bg-navy border border-white/10 grid place-items-center text-white/40 hover:text-white transition-all duration-200 hover:scale-110 z-30"
      >
        {sidebarCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>

      {/* Support Island */}
      {!sidebarCollapsed && (
        <div className="p-4 mx-4 mb-2 rounded-2xl bg-white/5 border border-white/5 group transition-all duration-500 hover:bg-white/10">
          <div className="text-[9px] text-white/20 uppercase tracking-[0.3em] mb-1 font-bold">Support 24/7</div>
          <div className="text-[11px] text-sky font-bold">info@MultiVerustechgroup.com</div>
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
