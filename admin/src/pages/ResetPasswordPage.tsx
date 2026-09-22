import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { confirmPasswordReset } from '@/services/users.service'
import { Key, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react'

const schema = z.object({
  token: z.string().min(1, 'Le token est requis'),
  motDePasse: z.string().min(6, 'Le mot de passe doit faire au moins 6 caractères'),
  confirmMotDePasse: z.string().min(6, 'Veuillez confirmer le mot de passe'),
}).refine((data) => data.motDePasse === data.confirmMotDePasse, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmMotDePasse"],
})

type FormData = z.infer<typeof schema>

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { token }
  })

  // Update token if it changes in URL
  useEffect(() => {
    if (token) setValue('token', token)
  }, [token, setValue])

  const mutation = useMutation({
    mutationFn: (data: FormData) => confirmPasswordReset(data),
    onSuccess: (res) => {
      if (res.success) {
        alert('Votre mot de passe a été réinitialisé avec succès.')
        navigate('/login', { replace: true })
      }
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Une erreur est survenue lors de la réinitialisation.'
      alert(msg)
    }
  })

  return (
    <div className="min-h-screen mesh-gradient flex items-center justify-center px-4 relative overflow-hidden font-roboto">
      {/* Background Accents */}
      <div className="absolute top-[-10%] right-[-10%] w-[800px] h-[800px] bg-vivid/10 rounded-full blur-[140px] animate-pulse-ring" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[800px] h-[800px] bg-or/10 rounded-full blur-[140px] animate-pulse-ring2" />

      <div className="w-full max-w-[480px] relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex flex-col items-center gap-0 group">
            <div className="bg-[#f8f9fa]/90 backdrop-blur-md p-6 px-10 rounded-[32px] border border-white shadow-[0_20px_50px_-20px_rgba(0,0,0,0.1)] mb-3 transition-all duration-700 hover:scale-105">
              <img src="/logo.svg" alt="Logo" className="h-10 w-auto" />
            </div>
          </div>
        </div>

        <div className="glass-premium rounded-[40px] p-10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] text-navy border border-white/40">
          <div className="mb-8">
            <h1 className="font-black text-[28px] tracking-tight font-condensed mb-2 text-navy flex items-center gap-3">
              <Key className="text-vivid" size={28} />
              Nouveau mot de passe
            </h1>
            <p className="text-[13px] text-navy/50 font-medium">
              {token ? 'Veuillez sécuriser votre compte avec un nouveau mot de passe.' : 'Lien de réinitialisation invalide ou expiré.'}
            </p>
            {!token && (
              <div className="mt-4 p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-[12px] font-bold animate-in shake-in duration-500">
                Le jeton de sécurité est manquant. Veuillez utiliser le lien reçu par e-mail.
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="flex flex-col gap-6">
            <input type="hidden" {...register('token')} />

            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-black text-navy uppercase tracking-[0.1em] ml-1">Nouveau mot de passe</label>
              <div className="relative group">
                <input
                  {...register('motDePasse')}
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-5 py-4 pl-12 rounded-2xl border border-navy/5 bg-navy/[0.02] text-navy text-[14px] transition-all duration-200 focus:outline-none focus:border-vivid focus:bg-white focus:shadow-[0_0_0_4px_rgba(21,87,232,0.1)]"
                />
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-navy/20 group-focus-within:text-vivid transition-colors" size={18} />
              </div>
              {errors.motDePasse && <span className="text-[11px] text-red-500 ml-1 font-medium italic">{errors.motDePasse.message}</span>}
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-black text-navy uppercase tracking-[0.1em] ml-1">Confirmer le mot de passe</label>
              <div className="relative group">
                <input
                  {...register('confirmMotDePasse')}
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-5 py-4 pl-12 rounded-2xl border border-navy/5 bg-navy/[0.02] text-navy text-[14px] transition-all duration-200 focus:outline-none focus:border-vivid focus:bg-white focus:shadow-[0_0_0_4px_rgba(21,87,232,0.1)]"
                />
                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-navy/20 group-focus-within:text-vivid transition-colors" size={18} />
              </div>
              {errors.confirmMotDePasse && <span className="text-[11px] text-red-500 ml-1 font-medium italic">{errors.confirmMotDePasse.message}</span>}
            </div>

            <button
              type="submit"
              disabled={mutation.isPending}
              className="mt-4 w-full bg-navy hover:bg-vivid active:scale-[0.98] disabled:opacity-60 text-white py-5 rounded-2xl font-black text-[14px] tracking-tight transition-all duration-500 shadow-[0_16px_32px_-8px_rgba(3,8,22,0.3)] flex items-center justify-center gap-3"
            >
              {mutation.isPending ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <>
                  <span className="uppercase tracking-widest italic font-condensed">Mettre à jour le mot de passe</span>
                  <ArrowRight size={18} className="translate-x-0 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>

        <button
          onClick={() => navigate('/login')}
          className="w-full text-center text-[12px] text-navy/30 mt-8 font-black uppercase tracking-widest hover:text-vivid transition-colors"
        >
          Retour à la connexion
        </button>
      </div>
    </div>
  )
}
