import { useMutation } from '@tanstack/react-query'
import { User, Mail, Shield, Calendar, Clock, Key, Loader2 } from 'lucide-react'
import { useSelector } from 'react-redux'
import type { RootState } from '@/store'
import { requestPasswordReset } from '@/services/users.service'
import CrudModal from '@/components/shared/CrudModal'

interface UserProfileModalProps {
  open: boolean
  onClose: () => void
}

export default function UserProfileModal({ open, onClose }: UserProfileModalProps) {
  const { user } = useSelector((state: RootState) => state.auth)

  const resetMut = useMutation({
    mutationFn: (email: string) => requestPasswordReset(email),
    onSuccess: () => alert('Demande de réinitialisation envoyée par email.'),
    onError: () => alert('Erreur lors de la demande de réinitialisation.'),
  })

  const handleResetPassword = () => {
    if (user?.email) {
      resetMut.mutate(user.email)
    }
  }

  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <CrudModal
      open={open}
      onClose={onClose}
      title="Profil Administrateur"
      subtitle="Informations de votre compte et sécurité"
      onSubmit={(e) => e.preventDefault()}
    >
      {!user ? (
        <div className="py-20 flex flex-col items-center justify-center gap-4">
          <Loader2 className="animate-spin text-vivid" size={40} />
          <p className="text-navy/40 font-medium italic">Chargement des données...</p>
        </div>
      ) : (
        <div className="flex flex-col gap-8 py-4">
          {/* Header Info */}
          <div className="flex items-center gap-6 p-6 rounded-[32px] bg-navy/5 border border-navy/5">
            <div className="w-20 h-20 rounded-[28px] bg-vivid flex items-center justify-center text-white shadow-xl shadow-vivid/20">
              <User size={40} />
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="text-[20px] font-black text-navy uppercase tracking-tight">{user.nomComplet}</h3>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] font-black uppercase tracking-wider border border-emerald-500/20">
                  {user.actif !== false ? 'Compte Actif' : 'Inactif'}
                </span>
                <span className="px-3 py-1 rounded-full bg-vivid/10 text-vivid text-[10px] font-black uppercase tracking-wider border border-vivid/20">
                  {user.role}
                </span>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoCard icon={<Mail size={18} />} label="Email" value={user.email} />
            <InfoCard icon={<Shield size={18} />} label="Rôle" value={user.role === 'ADMIN' ? 'Administrateur Principal' : 'Éditeur'} />
            <InfoCard icon={<Calendar size={18} />} label="Membre depuis le" value={formatDate(user.createdAt)} />
            <InfoCard icon={<Clock size={18} />} label="Dernière connexion" value={formatDate(user.lastLogin)} />
          </div>

          <div className="h-px bg-navy/5 my-2" />

          {/* Security Actions */}
          <div className="flex flex-col gap-4">
            <h4 className="text-[11px] font-black text-navy/40 uppercase tracking-[0.2em] ml-1">Sécurité</h4>
            <button
              type="button"
              onClick={handleResetPassword}
              disabled={resetMut.isPending}
              className="group flex items-center justify-between p-5 rounded-[24px] bg-white border border-navy/5 transition-all duration-300 hover:border-vivid/30 hover:shadow-xl hover:shadow-vivid/5 active:scale-[0.98]"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-vivid/5 text-vivid flex items-center justify-center group-hover:bg-vivid group-hover:text-white transition-all duration-300">
                  <Key size={22} />
                </div>
                <div className="flex flex-col items-start gap-0.5">
                  <span className="text-[14px] font-black text-navy uppercase tracking-tight">Réinitialiser le mot de passe</span>
                  <span className="text-[11px] text-navy/40 font-medium">Un lien sécurisé vous sera envoyé par email</span>
                </div>
              </div>
              {resetMut.isPending && <Loader2 className="animate-spin text-vivid" size={20} />}
            </button>
          </div>
        </div>
      )}
    </CrudModal>
  )
}

function InfoCard({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="flex flex-col gap-2 p-5 rounded-[24px] border border-navy/5 bg-white/40 transition-colors hover:bg-white/60">
      <div className="flex items-center gap-2 text-vivid/40">
        {icon}
        <span className="text-[10px] font-black uppercase tracking-widest leading-none">{label}</span>
      </div>
      <div className="text-[14px] font-bold text-navy truncate ml-1">{value}</div>
    </div>
  )
}
