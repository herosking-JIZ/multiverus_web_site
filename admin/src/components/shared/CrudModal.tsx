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
      <div className="relative w-full max-w-[600px] glass-premium rounded-[48px] p-8 sm:p-12 shadow-[0_48px_96px_-24px_rgba(0,0,0,0.3)] animate-in fade-in zoom-in-95 slide-in-from-bottom-8 duration-500 ease-out max-h-[90vh] overflow-y-auto no-scrollbar">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-8 right-8 w-12 h-12 rounded-2xl bg-navy/5 hover:bg-red-50 hover:text-red-500 flex items-center justify-center text-navy/30 transition-all duration-300 hover:rotate-90 active:scale-95"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="mb-10 pr-12">
          <h2 className="text-[28px] sm:text-[32px] font-black text-navy font-condensed tracking-tighter leading-none">{title}</h2>
          {subtitle && (
            <p className="text-[14px] text-navy/40 mt-3 font-medium leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-8 p-5 rounded-3xl bg-red-50/80 border border-red-100/50 text-[13px] text-red-600 font-bold flex items-center gap-3 animate-in shake-in duration-300">
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
          <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-navy/5 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-navy/5 hover:bg-navy/10 text-navy text-[14px] font-black py-5 rounded-2xl transition-all duration-300 active:scale-[0.98]"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-[1.5] bg-navy hover:bg-vivid disabled:opacity-60 text-white text-[14px] font-black py-5 rounded-2xl transition-all duration-500 shadow-[0_20px_40px_-12px_rgba(21,87,232,0.3)] hover:shadow-[0_24px_48px_-12px_rgba(21,87,232,0.4)] flex items-center justify-center gap-3 active:scale-[0.98] group"
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
