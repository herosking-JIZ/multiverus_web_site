import { createPortal } from 'react-dom'
import { AlertTriangle, Loader2 } from 'lucide-react'

interface ConfirmDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title?: string
  message?: string
  confirmLabel?: string
  loading?: boolean
}

export default function ConfirmDialog({
  open, onClose, onConfirm,
  title = 'Confirmer la suppression',
  message = 'Cette action est irréversible. Êtes-vous sûr de vouloir continuer ?',
  confirmLabel = 'Supprimer',
  loading = false,
}: ConfirmDialogProps) {
  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-navy/60 backdrop-blur-xl animate-in fade-in duration-500" 
        onClick={onClose} 
      />

      {/* Dialog */}
      <div className="relative w-full max-w-[440px] glass-premium rounded-xl p-8 shadow-[0_32px_64px_-24px_rgba(0,0,0,0.55)] text-center animate-in fade-in zoom-in-95 duration-500 ease-out">
        <div className="w-14 h-14 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-5">
          <AlertTriangle size={32} className="text-red-500" />
        </div>

        <h3 className="text-[21px] font-bold text-foreground tracking-tight mb-3 leading-none">
          {title}
        </h3>
        <p className="text-[14px] text-muted-2 leading-relaxed mb-8 font-medium px-4">
          {message}
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={onClose}
            className="flex-1 bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-foreground text-[13px] font-semibold py-3 rounded-lg transition-colors duration-200 active:scale-[0.98]"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 bg-red-500 hover:bg-red-400 disabled:opacity-60 text-white text-[13px] font-bold py-3 rounded-lg transition-colors duration-200 flex items-center justify-center gap-3 active:scale-[0.98]"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
