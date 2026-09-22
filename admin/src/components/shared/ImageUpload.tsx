import { useState, useRef, type ChangeEvent, useEffect } from 'react'
import { Upload, X, ImageIcon, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ImageUploadProps {
  label: string
  value?: string // Existing URL (for edits)
  onFileSelect: (file: File | null) => void
  error?: string
  hint?: string
}

// Helper to resolve image URLs
const getMediaUrl = (url: string | undefined): string => {
  if (!url) return ''
  if (url.startsWith('blob:') || url.startsWith('data:')) return url
  
  // If it's a full URL (containing http), we try to extract only the path to use our local proxy
  if (url.startsWith('http')) {
    try {
      const parsed = new URL(url)
      // If it's one of our known backend IPs or ports, strip the origin
      if (parsed.hostname.startsWith('10.3.3.') || parsed.port === '8080') {
        return parsed.pathname + parsed.search
      }
    } catch (e) {
      // Fallback: search for the first slash after http://...
      const match = url.match(/^https?:\/\/[^/]+(\/.*)$/)
      if (match) return match[1]
    }
  }
  
  // Ensure it starts with a slash for the proxy
  return url.startsWith('/') ? url : `/${url}`
}

export default function ImageUpload({ label, value, onFileSelect, error, hint }: ImageUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Cleanup blob URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Basic validation
    if (!file.type.startsWith('image/')) {
      alert("Seules les images (JPEG, PNG, WEBP) sont autorisées.")
      return
    }
    if (file.size > 1024 * 1024 * 1024) {
      alert("L'image est trop lourde (max 1 GB).")
      return
    }

    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl(objectUrl)
    onFileSelect(file)
  }

  const removeImage = () => {
    setPreviewUrl(null)
    onFileSelect(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // Final resolved URL for display
  const displayUrl = previewUrl || getMediaUrl(value)

  return (
    <div className="flex flex-col gap-2.5 group/upload">
      <div className="flex items-center justify-between px-1">
        <label className="text-[11px] font-black text-navy/40 uppercase tracking-[0.15em] transition-colors duration-300 group-focus-within/upload:text-vivid">
          {label}
        </label>
        {previewUrl ? (
          <span className="text-[10px] font-black text-vivid uppercase tracking-widest bg-vivid/5 px-2 py-0.5 rounded-lg border border-vivid/10 animate-pulse">
            Nouvel aperçu
          </span>
        ) : value ? (
          <span className="text-[10px] font-black text-navy/40 uppercase tracking-widest bg-navy/5 px-2 py-0.5 rounded-lg border border-navy/5">
            Image actuelle
          </span>
        ) : null}
      </div>

      {displayUrl ? (
        <div className="relative group w-full aspect-video rounded-[32px] overflow-hidden border border-navy/5 bg-white/20 backdrop-blur-sm shadow-xl transition-all duration-500 hover:shadow-2xl hover:scale-[1.01]">
          <img src={displayUrl} alt="Preview" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
          <div className="absolute inset-0 bg-navy/60 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-14 h-14 rounded-2xl bg-white text-navy flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300 shadow-2xl hover:bg-vivid hover:text-white"
              title="Changer l'image"
            >
              <Upload size={24} />
            </button>
            <button
              type="button"
              onClick={removeImage}
              className="w-14 h-14 rounded-2xl bg-red-500 text-white flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300 shadow-2xl hover:bg-red-600"
              title="Supprimer"
            >
              <X size={24} />
            </button>
          </div>
          {previewUrl && (
            <div className="absolute top-6 left-6 px-4 py-1.5 bg-vivid text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-2xl animate-in zoom-in duration-500">
              Cliquer sur "Mettre à jour" pour valider
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "w-full aspect-video rounded-[32px] border-2 border-dashed flex flex-col items-center justify-center gap-4 transition-all duration-500",
            "border-navy/10 bg-white/40 backdrop-blur-md hover:bg-white/60 hover:border-vivid/40 hover:shadow-2xl group/btn",
            error ? "border-red-200 bg-red-50/50" : ""
          )}
        >
          <div className="w-20 h-20 rounded-[32px] bg-navy/5 flex items-center justify-center text-navy/20 transition-all duration-500 group-hover/btn:scale-110 group-hover/btn:bg-vivid/5 group-hover/btn:text-vivid">
            <ImageIcon size={40} strokeWidth={1.5} />
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <div className="flex items-center gap-2">
              <Plus size={16} className="text-vivid" />
              <span className="text-[15px] font-black text-navy uppercase tracking-tight">Choisir une image</span>
            </div>
            <span className="text-[12px] text-navy/30 font-medium">PNG, JPG ou WEBP • Max 1 GB</span>
          </div>
        </button>
      )}

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {(hint || error) && (
        <div className="flex flex-col gap-1 pr-1 mt-1">
          {error && (
            <div className="flex items-center gap-1.5 ml-1 text-red-500 animate-in slide-in-from-left-2 duration-300">
              <div className="w-1 h-1 rounded-full bg-red-500" />
              <span className="text-[12px] font-bold italic">{error}</span>
            </div>
          )}
          {hint && !error && (
            <span className="text-[12px] text-navy/30 ml-1 font-medium leading-relaxed italic">{hint}</span>
          )}
        </div>
      )}
    </div>
  )
}
