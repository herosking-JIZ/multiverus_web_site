import { useState, type FormEvent } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Loader2, GripVertical, ExternalLink } from 'lucide-react'
import { getPartenaires, createPartenaire, updatePartenaire, deletePartenaire } from '@/services/partenaires.service'
import type { Partenaire, CreatePartenairePayload } from '@/types/partenaire.types'
import CrudModal from '@/components/shared/CrudModal'
import FormField from '@/components/shared/FormField'
import ImageUpload from '@/components/shared/ImageUpload'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import { uploadMedia } from '@/services/medias.service'

export default function PartenairesPage() {
  const queryClient = useQueryClient()

  // State
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Partenaire | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Partenaire | null>(null)
  const [form, setForm] = useState<CreatePartenairePayload>({ nom: '', logoUrl: '', siteWeb: '', ordre: 0, actif: true })
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  // Queries
  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-partenaires'],
    queryFn: () => getPartenaires(),
  })

  // Mutations
  const createMut = useMutation({
    mutationFn: (payload: CreatePartenairePayload) => createPartenaire(payload),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-partenaires'] }); closeModal() },
    onError: () => setFormError('Erreur lors de la création du partenaire.'),
  })

  const updateMut = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CreatePartenairePayload> }) => updatePartenaire(id, payload),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-partenaires'] }); closeModal() },
    onError: () => setFormError('Erreur lors de la mise à jour.'),
  })

  const deleteMut = useMutation({
    mutationFn: deletePartenaire,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-partenaires'] }); setDeleteTarget(null) },
  })

  const partenaires = data?.data ?? []

  // Helpers
  const openCreate = () => {
    setEditing(null)
    setForm({ nom: '', logoUrl: '', siteWeb: '', ordre: 0, actif: true })
    setPendingFile(null)
    setFormError(null)
    setModalOpen(true)
  }

  const openEdit = (p: Partenaire) => {
    setEditing(p)
    setForm({ nom: p.nom, logoUrl: p.logoUrl ?? '', siteWeb: p.siteWeb ?? '', ordre: p.ordre, actif: p.actif })
    setPendingFile(null)
    setFormError(null)
    setModalOpen(true)
  }

  const closeModal = () => { setModalOpen(false); setEditing(null); setFormError(null) }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!form.nom.trim()) {
      setFormError('Le nom du partenaire est requis.')
      return
    }

    const payload = { ...form }

    // Upload file if selected
    if (pendingFile) {
      setIsUploading(true)
      try {
        const res = await uploadMedia(pendingFile, 'partenaires')
        payload.logoUrl = res.data.url
      } catch (err) {
        setFormError("Échec de l'upload du logo.")
        setIsUploading(false)
        return
      }
      setIsUploading(false)
    }

    if (editing) {
      updateMut.mutate({ id: editing.id, payload })
    } else {
      createMut.mutate(payload)
    }
  }

  const isSaving = createMut.isPending || updateMut.isPending || isUploading

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-[24px] font-black text-navy font-condensed tracking-tight">Partenaires</h2>
          <p className="text-[13px] text-navy/40">Gérez les logos partenaires affichés sur le portail public.</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-navy hover:bg-vivid text-white text-[13px] font-black px-6 py-4 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-vivid/20 active:scale-[0.98]">
          <Plus size={18} />
          AJOUTER UN PARTENAIRE
        </button>
      </div>

      {/* Loading / Error */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <Loader2 size={32} className="animate-spin text-vivid" />
          <span className="text-[13px] font-medium text-navy/40">Chargement des partenaires…</span>
        </div>
      )}
      {isError && (
        <div className="glass p-12 rounded-[40px] text-center">
          <div className="text-red-500 font-bold mb-2">Erreur de chargement</div>
          <div className="text-[13px] text-navy/40">Impossible de récupérer les partenaires.</div>
        </div>
      )}

      {/* Table */}
      {!isLoading && !isError && (
        <div className="glass-premium rounded-[40px] p-8 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-navy/5">
                <th className="text-[11px] font-black text-navy/40 uppercase tracking-[0.1em] px-4 py-6 w-12"></th>
                <th className="text-[11px] font-black text-navy/40 uppercase tracking-[0.1em] px-4 py-6 w-20">Ordre</th>
                <th className="text-[11px] font-black text-navy/40 uppercase tracking-[0.1em] px-4 py-6">Partenaire</th>
                <th className="text-[11px] font-black text-navy/40 uppercase tracking-[0.1em] px-4 py-6">Site Web</th>
                <th className="text-[11px] font-black text-navy/40 uppercase tracking-[0.1em] px-4 py-6">Statut</th>
                <th className="text-[11px] font-black text-navy/40 uppercase tracking-[0.1em] px-4 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy/5">
              {partenaires.map((p) => (
                <tr key={p.id} className="group hover:bg-white/30 transition-colors duration-150">
                  <td className="px-4 py-5 text-navy/20 cursor-grab">
                    <GripVertical size={16} />
                  </td>
                  <td className="px-4 py-5">
                    <span className="text-[13px] font-bold text-navy/30 font-mono">{String(p.ordre).padStart(2, '0')}</span>
                  </td>
                  <td className="px-4 py-5">
                    <div className="flex items-center gap-3">
                      {p.logoUrl ? (
                        <img src={p.logoUrl} alt={p.nom} className="w-10 h-10 rounded-xl object-contain bg-white border border-navy/5 p-1" />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-vivid/5 border border-vivid/10 flex items-center justify-center text-[12px] font-black text-vivid">
                          {p.nom.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <span className="text-[14px] font-bold text-navy">{p.nom}</span>
                    </div>
                  </td>
                  <td className="px-4 py-5">
                    {p.siteWeb ? (
                      <a href={p.siteWeb} target="_blank" rel="noopener noreferrer" className="text-[12px] text-vivid font-medium hover:underline flex items-center gap-1">
                        {new URL(p.siteWeb).hostname} <ExternalLink size={10} />
                      </a>
                    ) : (
                      <span className="text-navy/20 text-[12px]">—</span>
                    )}
                  </td>
                  <td className="px-4 py-5">
                    <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                      p.actif
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                        : 'bg-navy/5 text-navy/40 border-navy/5'
                    }`}>
                      {p.actif ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="px-4 py-5">
                    <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button onClick={() => openEdit(p)} className="text-[12px] font-bold text-vivid hover:underline">Éditer</button>
                      <button onClick={() => setDeleteTarget(p)} className="text-[12px] font-bold text-red-500 hover:underline">Supprimer</button>
                    </div>
                  </td>
                </tr>
              ))}

              {partenaires.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-32 text-center text-[14px] font-bold text-navy/30">
                    Aucun partenaire configuré.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Create / Edit Modal */}
      <CrudModal
        open={modalOpen}
        onClose={closeModal}
        title={editing ? 'Modifier le partenaire' : 'Nouveau partenaire'}
        subtitle={editing ? `Édition de "${editing.nom}"` : 'Ajoutez un partenaire au portail.'}
        onSubmit={handleSubmit}
        loading={isSaving}
        error={formError}
        submitLabel={editing ? 'Mettre à jour' : 'Créer le partenaire'}
      >
        <FormField label="Nom" placeholder="Ex : Microsoft" value={form.nom} onChange={(e) => setForm({ ...form, nom: (e.target as HTMLInputElement).value })} required />
        <ImageUpload
          label="Logo du partenaire"
          value={form.logoUrl ?? ''}
          onFileSelect={setPendingFile}
        />
        <FormField label="Site Web" placeholder="https://microsoft.com" value={form.siteWeb ?? ''} onChange={(e) => setForm({ ...form, siteWeb: (e.target as HTMLInputElement).value })} />
        <FormField label="Ordre d'affichage" type="number" value={form.ordre ?? 0} onChange={(e) => setForm({ ...form, ordre: Number((e.target as HTMLInputElement).value) })} />
        <div className="flex items-center gap-3 px-1">
          <input type="checkbox" id="partenaire-actif" checked={form.actif ?? true} onChange={(e) => setForm({ ...form, actif: e.target.checked })} className="w-5 h-5 rounded-lg border-navy/10 text-vivid focus:ring-vivid/20" />
          <label htmlFor="partenaire-actif" className="text-[13px] font-bold text-navy">Partenaire actif</label>
        </div>
      </CrudModal>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMut.mutate(deleteTarget.id)}
        title="Désactiver ce partenaire ?"
        message={`"${deleteTarget?.nom}" sera désactivé et retiré du portail public.`}
        confirmLabel="Désactiver"
        loading={deleteMut.isPending}
      />
    </div>
  )
}
