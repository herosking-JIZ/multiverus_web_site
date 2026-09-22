'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useSubmitContact } from '@/hooks/api.hooks'

const schema = z.object({
  nomComplet:  z.string().min(2, 'Nom requis (min. 2 caractères)'),
  email:        z.string().email('Adresse e-mail invalide'),
  organisation: z.string().optional(),
  sujet: z.enum([
    'Projet backend / microservices',
    'Projet frontend / mobile',
    'Fintech / conformité',
    'Audit & conseil technique',
    'Collaboration contenu (LinkedIn / YouTube)',
    'Autre demande',
  ] as const, { message: 'Sélectionnez un sujet' }),
  message: z.string().min(10, 'Le message doit contenir au moins 10 caractères'),
})

type FormData = z.infer<typeof schema>

const inputClass =
  'w-full px-4 py-4 rounded-[10px] border border-white/[0.1] bg-white/[0.04] text-foreground text-sm transition-all duration-200 focus:outline-none focus:border-teal focus:bg-white/[0.06] focus:shadow-[0_0_0_4px_rgba(45,212,191,0.1)] placeholder:text-faint'

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const mutation = useSubmitContact()

  const onFormSubmit = (data: FormData) => {
    mutation.mutate(data, {
      onSuccess: () => {
        setSubmitted(true)
        reset()
      }
    })
  }

  if (submitted) {
    return (
      <div className="glass rounded-[32px] p-12 lg:p-16 text-center transition-all duration-700 animate-fade-in-up">
        <div className="w-20 h-20 rounded-full bg-teal/10 grid place-items-center mx-auto mb-8 animate-pulse">
          <svg viewBox="0 0 24 24" className="w-10 h-10" fill="none" stroke="#2DD4BF" strokeWidth="2.5">
            <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h3 className="text-[32px] font-black text-foreground mb-4 tracking-tight">
          Message transmis
        </h3>
        <p className="text-[16px] text-muted-2 font-medium mb-10 max-w-sm mx-auto leading-relaxed">
          Merci pour votre message. Nous revenons vers vous rapidement.
        </p>
        <button
          onClick={() => setSubmitted(false)}
          className="text-sm font-bold text-teal hover:text-foreground transition-colors uppercase tracking-[2px]"
        >
          Envoyer un autre message →
        </button>
      </div>
    )
  }

  return (
    <div className="glass rounded-[32px] p-12 lg:p-16">
      <h2 className="text-[40px] font-black text-foreground mb-10 leading-[0.9] tracking-[-1.5px]">
        Lançons la <span className="text-gradient">conversation</span>
      </h2>

      <form onSubmit={handleSubmit(onFormSubmit)}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-bold text-foreground uppercase tracking-[0.5px]">Nom Complet</label>
            <input {...register('nomComplet')} placeholder="Jean Dupont" className={inputClass} />
            {errors.nomComplet && <span className="text-[12px] text-red-400">{errors.nomComplet.message}</span>}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-bold text-foreground uppercase tracking-[0.5px]">Adresse E-mail</label>
            <input {...register('email')} type="email" placeholder="jean@entreprise.com" className={inputClass} />
            {errors.email && <span className="text-[12px] text-red-400">{errors.email.message}</span>}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-bold text-foreground uppercase tracking-[0.5px]">Organisation</label>
            <input {...register('organisation')} placeholder="Entreprise S.A." className={inputClass} />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-bold text-foreground uppercase tracking-[0.5px]">Sujet de votre demande</label>
            <select {...register('sujet')} className={`${inputClass} [&>option]:bg-surface [&>option]:text-foreground`}>
              <option value="">--- Sélectionnez ---</option>
              <option>Projet backend / microservices</option>
              <option>Projet frontend / mobile</option>
              <option>Fintech / conformité</option>
              <option>Audit & conseil technique</option>
              <option>Collaboration contenu (LinkedIn / YouTube)</option>
              <option>Autre demande</option>
            </select>
            {errors.sujet && <span className="text-[12px] text-red-400">{errors.sujet.message}</span>}
          </div>

          <div className="flex flex-col gap-2 col-span-full">
            <label className="text-[11px] font-bold text-foreground uppercase tracking-[0.5px]">Message</label>
            <textarea
              {...register('message')}
              placeholder="Décrivez votre projet, vos besoins techniques ou vos questions en détail..."
              className={`${inputClass} resize-y min-h-[140px]`}
            />
            {errors.message && <span className="text-[12px] text-red-400">{errors.message.message}</span>}
          </div>

          <div className="col-span-full mt-4">
            <button
              type="submit"
              disabled={mutation.isPending}
              className="w-full bg-gradient-to-br from-teal to-violet hover:brightness-110 active:scale-[0.98] disabled:opacity-60 text-navy py-[24px] rounded-[12px] font-bold text-[15px] uppercase tracking-[2px] transition-all duration-500 shadow-[0_20px_40px_-10px_rgba(45,212,191,0.4)] hover:-translate-y-1"
            >
              <span className="relative z-10">
                {mutation.isPending ? 'Transmission...' : 'Envoyer la demande →'}
              </span>
            </button>
            {mutation.isError && (
              <p className="text-center text-[13px] text-red-400 mt-3 font-semibold">
                {(() => {
                  const apiErr = mutation.error as any;
                  const details = apiErr?.response?.data?.erreurs?.[0]?.message;
                  if (details) return `Données incorrectes : ${details}`;
                  return apiErr?.response?.data?.message || 'Une erreur est survenue. Veuillez réessayer.';
                })()}
              </p>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}
