import { createPortal } from 'react-dom'
import { X, Loader2 } from 'lucide-react'
import type { ReactNode, FormEvent } from 'react'

interface CrudModalProps {
  open: boolean
  onClose: () => void
  title: string
  subtitle?: string
  onSubmit: (e: FormEvent) => void
  loading?: boolean
  error?: string | null
  submitLabel?: string
  children: ReactNode
}

export default function CrudModal({
  open, onClose, title, subtitle, onSubmit, loading, error, submitLabel = 'Enregistrer', children
}: CrudModalProps) {
  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-[900] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-navy/60 backdrop-blur-xl transition-opacity animate-in fade-in duration-500"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-[600px] glass-premium rounded-xl p-7 sm:p-9 shadow-[0_32px_64px_-24px_rgba(0,0,0,0.55)] animate-in fade-in zoom-in-95 slide-in-from-bottom-8 duration-500 ease-out max-h-[90vh] overflow-y-auto no-scrollbar">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-9 h-9 rounded-lg bg-white/[0.04] border border-white/10 hover:bg-red-500/10 hover:text-red-400 flex items-center justify-center text-muted transition-colors duration-200 active:scale-95"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="mb-10 pr-12">
          <h2 className="text-[22px] sm:text-[26px] font-bold text-foreground tracking-tight leading-none">{title}</h2>
          {subtitle && (
            <p className="text-[13px] text-muted-2 mt-3 font-medium leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-8 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-[13px] text-red-300 font-bold flex items-center gap-3 animate-in shake-in duration-300">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={onSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-5">
            {children}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-white/10 mt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-foreground text-[13px] font-semibold py-3 rounded-lg transition-colors duration-200 active:scale-[0.98]"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-[1.5] bg-teal hover:bg-teal/85 disabled:opacity-60 text-navy text-[13px] font-bold py-3 rounded-lg transition-colors duration-200 shadow-[0_10px_24px_-10px_rgba(45,212,191,0.55)] flex items-center justify-center gap-3 active:scale-[0.98] group"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <span className="group-hover:translate-x-0.5 transition-transform duration-300">{submitLabel}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  )
}
