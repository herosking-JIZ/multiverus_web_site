import type { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface BaseFieldProps {
  label: string
  error?: string
  hint?: string
}

type InputFieldProps = BaseFieldProps & InputHTMLAttributes<HTMLInputElement> & { as?: 'input' }
type TextareaFieldProps = BaseFieldProps & TextareaHTMLAttributes<HTMLTextAreaElement> & { as: 'textarea' }
type SelectFieldProps = BaseFieldProps & SelectHTMLAttributes<HTMLSelectElement> & { as: 'select'; options: { value: string; label: string }[] }

type FormFieldProps = InputFieldProps | TextareaFieldProps | SelectFieldProps

const baseClasses = "w-full px-6 py-4 rounded-2xl border border-navy/5 bg-white/40 backdrop-blur-md text-navy text-[15px] font-medium transition-all duration-500 focus:outline-none focus:border-vivid focus:bg-white focus:shadow-[0_0_0_1px_#1557E8,0_16px_32px_-12px_rgba(21,87,232,0.15)] placeholder:text-navy/20"

export default function FormField(props: FormFieldProps) {
  const { label, error, hint, as = 'input', ...rest } = props

  return (
    <div className="flex flex-col gap-2.5 group/field">
      <div className="flex items-center justify-between px-1">
        <label className="text-[11px] font-black text-navy/40 uppercase tracking-[0.15em] transition-colors duration-300 group-focus-within/field:text-vivid">
          {label}
        </label>
        {rest.required && (
          <span className="text-[10px] font-black text-vivid/40 uppercase tracking-widest">Requis</span>
        )}
      </div>

      <div className="relative">
        {as === 'textarea' ? (
          <textarea
            className={cn(baseClasses, "min-h-[140px] resize-y leading-relaxed", error && "border-red-200 focus:border-red-500 focus:shadow-[0_0_0_1px_#EF4444,0_16px_32px_-12px_rgba(239,68,68,0.15)]")}
            {...(rest as TextareaHTMLAttributes<HTMLTextAreaElement>)}
          />
        ) : as === 'select' ? (
          <div className="relative">
            <select
              className={cn(baseClasses, "appearance-none cursor-pointer", error && "border-red-200 focus:border-red-500")}
              {...(rest as SelectHTMLAttributes<HTMLSelectElement>)}
            >
              {(props as SelectFieldProps).options.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-navy/20">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        ) : (
          <input
            className={cn(baseClasses, error && "border-red-200 focus:border-red-500 focus:shadow-[0_0_0_1px_#EF4444,0_16px_32px_-12px_rgba(239,68,68,0.15)]")}
            {...(rest as InputHTMLAttributes<HTMLInputElement>)}
          />
        )}
      </div>

      {hint && !error && (
        <span className="text-[12px] text-navy/30 ml-1 font-medium leading-relaxed italic">{hint}</span>
      )}
      {error && (
        <div className="flex items-center gap-1.5 ml-1 text-red-500 animate-in slide-in-from-left-2 duration-300">
          <div className="w-1 h-1 rounded-full bg-red-500" />
          <span className="text-[12px] font-bold italic">{error}</span>
        </div>
      )}
    </div>
  )
}
