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
      <div className="relative w-full max-w-[440px] glass-premium rounded-[40px] p-10 shadow-[0_48px_96px_-24px_rgba(0,0,0,0.3)] text-center animate-in fade-in zoom-in-95 duration-500 ease-out">
        <div className="w-20 h-20 rounded-[32px] bg-red-50/80 border border-red-100/50 flex items-center justify-center mx-auto mb-6 animate-bounce-subtle">
          <AlertTriangle size={32} className="text-red-500" />
        </div>

        <h3 className="text-[24px] font-black text-navy font-condensed tracking-tighter mb-3 leading-none">
          {title}
        </h3>
        <p className="text-[14px] text-navy/50 leading-relaxed mb-10 font-medium px-4">
          {message}
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={onClose}
            className="flex-1 bg-navy/5 hover:bg-navy/10 text-navy text-[14px] font-black py-4.5 rounded-2xl transition-all duration-300 active:scale-[0.98]"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white text-[14px] font-black py-4.5 rounded-2xl transition-all duration-300 shadow-[0_20px_40px_-12px_rgba(239,68,68,0.3)] hover:shadow-[0_24px_48px_-12px_rgba(239,68,68,0.4)] flex items-center justify-center gap-3 active:scale-[0.98]"
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
