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

const baseClasses = "w-full px-4 py-3 rounded-lg border border-[#1F2633] bg-[#0A0E14]/70 text-foreground text-[14px] font-medium transition-colors duration-200 focus:outline-none focus:border-teal focus:bg-[#0A0E14] focus:ring-2 focus:ring-teal/15 placeholder:text-muted-2/60"

export default function FormField(props: FormFieldProps) {
  const { label, error, hint, as = 'input', ...rest } = props

  return (
    <div className="flex flex-col gap-2.5 group/field">
      <div className="flex items-center justify-between px-1">
        <label className="text-[11px] font-mono text-muted-2 uppercase tracking-[0.12em] transition-colors duration-200 group-focus-within/field:text-teal">
          {label}
        </label>
        {rest.required && (
          <span className="text-[10px] font-mono text-teal/70 uppercase tracking-widest">Requis</span>
        )}
      </div>

      <div className="relative">
        {as === 'textarea' ? (
          <textarea
            className={cn(baseClasses, "min-h-[140px] resize-y leading-relaxed", error && "border-red-500 focus:border-red-500 focus:ring-red-500/15")}
            {...(rest as TextareaHTMLAttributes<HTMLTextAreaElement>)}
          />
        ) : as === 'select' ? (
          <div className="relative">
            <select
              className={cn(baseClasses, "appearance-none cursor-pointer", error && "border-red-500 focus:border-red-500")}
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
            className={cn(baseClasses, error && "border-red-500 focus:border-red-500 focus:ring-red-500/15")}
            {...(rest as InputHTMLAttributes<HTMLInputElement>)}
          />
        )}
      </div>

      {hint && !error && (
        <span className="text-[12px] text-muted-2 ml-1 font-medium leading-relaxed">{hint}</span>
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
