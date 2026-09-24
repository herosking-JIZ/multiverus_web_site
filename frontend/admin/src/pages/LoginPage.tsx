import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { useDispatch, useSelector } from 'react-redux'
import { setCredentials } from '@/store/authSlice'
import type { RootState } from '@/store'
import { login } from '@/services/auth.service'
import type { LoginPayload } from '@/types/auth.types'

const schema = z.object({
  email:    z.string().email('Email invalide'),
  password: z.string().min(6, 'Mot de passe requis'),
})

type FormData = z.infer<typeof schema>

export default function LoginPage() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const isAuth = useSelector((state: RootState) => state.auth.isAuth)

  useEffect(() => {
    if (isAuth) navigate('/', { replace: true })
  }, [isAuth, navigate])

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const mutation = useMutation({
    mutationFn: (data: LoginPayload) => login(data),
    onSuccess: (response) => {
      if (response.success && response.data) {
        dispatch(setCredentials({
          user: response.data.user as any,
          accessToken: response.data.accessToken
        }))
        navigate('/', { replace: true })
      }
    },
  })

  return (
    <div className="min-h-screen mesh-gradient flex items-center justify-center px-4 relative overflow-hidden font-roboto">
      <div className="w-full max-w-[440px] relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex flex-col items-center gap-0 group">
            <div className="p-5 px-7 rounded-2xl border border-white/10 bg-[#0A0E14] mb-3 transition-all duration-700 group-hover:scale-105 group-hover:shadow-[0_40px_80px_-30px_rgba(45,212,191,0.2)]">
              <img src="/multiverus-horizontal.svg" alt="MULTIVERUS" className="w-[250px] max-w-full" />
            </div>
            <div className="text-[10px] text-sky font-black uppercase tracking-[0.6em] mt-2 font-condensed opacity-60">
              Studio admin
            </div>
          </div>
        </div>

        {/* Login Card - Glass Content Island 2.0 */}
        <div className="glass-premium rounded-[40px] p-10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] relative overflow-hidden group/card text-navy">
          <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 -translate-x-full group-hover/card:translate-x-full transition-transform duration-1000 pointer-events-none" />
          
          <div className="mb-8 relative z-10">
            <h1 className="font-black text-[28px] tracking-tight font-condensed mb-2 text-navy">
              Connexion
            </h1>
              <p className="text-[13px] text-navy/50 font-medium">Accédez à l’espace de pilotage du portail.</p>
          </div>

          <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-black text-navy uppercase tracking-[0.1em] ml-1">E-mail</label>
              <input 
                {...register('email')} 
                type="email" 
                placeholder="admin@multiverus.dev"
                className="w-full px-5 py-4 rounded-2xl border border-navy/5 bg-navy/[0.02] text-navy text-[14px] transition-all duration-200 focus:outline-none focus:border-vivid focus:bg-white focus:shadow-[0_0_0_4px_rgba(21,87,232,0.1)] placeholder:text-navy/20" 
              />
              {errors.email && <span className="text-[11px] text-red-500 ml-1 font-medium italic">{errors.email.message}</span>}
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-black text-navy uppercase tracking-[0.1em] ml-1">Mot de passe</label>
              <input 
                {...register('password')} 
                type="password" 
                placeholder="••••••••" 
                className="w-full px-5 py-4 rounded-2xl border border-navy/5 bg-navy/[0.02] text-navy text-[14px] transition-all duration-200 focus:outline-none focus:border-vivid focus:bg-white focus:shadow-[0_0_0_4px_rgba(21,87,232,0.1)] placeholder:text-navy/20" 
              />
              {errors.password && <span className="text-[11px] text-red-500 ml-1 font-medium italic">{errors.password.message}</span>}
            </div>

            {mutation.isError && (
              <div className="text-[12px] text-red-600 text-center bg-red-50 border border-red-100 rounded-xl px-4 py-3 animate-shake">
                Identifiants incorrects ou session expirée.
              </div>
            )}

            <button
              type="submit"
              disabled={mutation.isPending}
              className="mt-4 w-full bg-navy hover:bg-vivid active:scale-[0.98] disabled:opacity-60 text-white py-5 rounded-2xl font-black text-[14px] tracking-tight transition-all duration-500 shadow-[0_16px_32px_-8px_rgba(3,8,22,0.3)] hover:shadow-[0_20px_40px_-10px_rgba(21,87,232,0.4)] relative overflow-hidden group/btn font-condensed"
            >
              <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
              <span className="relative z-10 uppercase tracking-widest">{mutation.isPending ? 'Authentification…' : 'Accéder au dashboard'}</span>
            </button>
          </form>
        </div>

        <p className="text-center text-[12px] text-navy/20 mt-10 font-medium">
          &copy; 2026 MULTIVERUS. Tous droits réservés.
        </p>
      </div>
    </div>
  )
}
