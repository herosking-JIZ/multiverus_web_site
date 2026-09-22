import { useState, type FormEvent } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as Icons from 'lucide-react'
import { Plus, Loader2, GripVertical, HelpCircle } from 'lucide-react'
import { getServices, createService, updateService, deleteService } from '@/services/services.service'
import type { Service, CreateServicePayload } from '@/types/service.types'
import CrudModal from '@/components/shared/CrudModal'
import FormField from '@/components/shared/FormField'
import ImageUpload from '@/components/shared/ImageUpload'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import { uploadMedia } from '@/services/medias.service'

export default function ServicesPage() {
  const queryClient = useQueryClient()

  // State
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Service | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Service | null>(null)
  const [form, setForm] = useState<CreateServicePayload>({ titre: '', description: '', icone: '', imageUrl: '', ordre: 0, actif: true })
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  // Queries
  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-services'],
    queryFn: () => getServices(),
  })

  // Mutations
  const createMut = useMutation({
    mutationFn: (payload: CreateServicePayload) => createService(payload),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-services'] }); closeModal() },
    onError: () => setFormError('Erreur lors de la création du service.'),
  })

  const updateMut = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CreateServicePayload> }) => updateService(id, payload),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-services'] }); closeModal() },
    onError: () => setFormError('Erreur lors de la mise à jour.'),
  })

  const deleteMut = useMutation({
    mutationFn: deleteService,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-services'] }); setDeleteTarget(null) },
  })

  const services = data?.data ?? []

  // Helpers
  const openCreate = () => {
    setEditing(null)
    setForm({ titre: '', description: '', icone: '', imageUrl: '', ordre: 0, actif: true })
    setPendingFile(null)
    setFormError(null)
    setModalOpen(true)
  }

  const openEdit = (s: Service) => {
    setEditing(s)
    setForm({ titre: s.titre, description: s.description, icone: s.icone ?? '', imageUrl: s.imageUrl ?? '', ordre: s.ordre, actif: s.actif })
    setPendingFile(null)
    setFormError(null)
    setModalOpen(true)
  }

  const closeModal = () => { setModalOpen(false); setEditing(null); setFormError(null) }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!form.titre.trim() || !form.description.trim()) {
      setFormError('Le titre et la description sont requis.')
      return
    }

    let finalPayload = { ...form }

    // Upload file if selected
    if (pendingFile) {
      setIsUploading(true)
      try {
        const res = await uploadMedia(pendingFile, 'services')
        finalPayload.imageUrl = res.data.url
      } catch (err) {
        setFormError("Échec de l'upload de l'image.")
        setIsUploading(false)
        return
      }
      setIsUploading(false)
    }

    if (editing) {
      updateMut.mutate({ id: editing.id, payload: finalPayload })
    } else {
      createMut.mutate(finalPayload)
    }
  }

  const isSaving = createMut.isPending || updateMut.isPending || isUploading

  // Helper to render icon preview
  const IconPreview = ({ name }: { name: string }) => {
    if (!name) return <HelpCircle size={24} className="text-navy/10" />
    const capitalized = name.charAt(0).toUpperCase() + name.slice(1)
    // @ts-ignore
    const Icon = Icons[capitalized] || Icons[name]
    if (!Icon) return <span className="text-[10px] font-bold text-red-400 capitalize">{name.slice(0, 2)}</span>
    return <Icon size={24} className="text-vivid" />
  }

  return (
    <div className="glass-premium rounded-[40px] p-8 min-h-[calc(100vh-160px)]">
      <div className="flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-[24px] font-black text-navy font-condensed tracking-tight">Services</h2>
            <p className="text-[13px] text-navy/40">Gérez les services affichés sur le portail public.</p>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-navy hover:bg-vivid text-white text-[13px] font-black px-6 py-4 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-vivid/20 active:scale-[0.98]"
          >
            <Plus size={18} />
            AJOUTER UN SERVICE
          </button>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Loader2 size={32} className="animate-spin text-vivid" />
            <span className="text-[13px] font-medium text-navy/40">Chargement des services…</span>
          </div>
        )}

        {/* Error */}
        {isError && (
          <div className="glass p-12 rounded-[40px] text-center">
            <div className="text-red-500 font-bold mb-2">Erreur de chargement</div>
            <div className="text-[13px] text-navy/40">Impossible de récupérer la liste des services.</div>
          </div>
        )}

        {/* Table */}
        {!isLoading && !isError && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-navy/5">
                  <th className="text-[11px] font-black text-navy/40 uppercase tracking-[0.1em] px-4 py-6 w-16"></th>
                  <th className="text-[11px] font-black text-navy/40 uppercase tracking-[0.1em] px-4 py-6 w-20">Ordre</th>
                  <th className="text-[11px] font-black text-navy/40 uppercase tracking-[0.1em] px-4 py-6">Titre</th>
                  <th className="text-[11px] font-black text-navy/40 uppercase tracking-[0.1em] px-4 py-6">Slug</th>
                  <th className="text-[11px] font-black text-navy/40 uppercase tracking-[0.1em] px-4 py-6">Statut</th>
                  <th className="text-[11px] font-black text-navy/40 uppercase tracking-[0.1em] px-4 py-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy/5">
                {services.map((s) => (
                  <tr key={s.id} className="group hover:bg-white/30 transition-colors duration-150">
                    <td className="px-4 py-5 text-navy/20 cursor-grab">
                      <GripVertical size={16} />
                    </td>
                    <td className="px-4 py-5">
                      <span className="text-[13px] font-bold text-navy/30 font-mono">
                        {String(s.ordre).padStart(2, '0')}
                      </span>
                    </td>
                    <td className="px-4 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-vivid/5 border border-vivid/10 flex items-center justify-center text-vivid">
                          <IconPreview name={s.icone ?? ''} />
                        </div>
                        <span className="text-[14px] font-bold text-navy">{s.titre}</span>
                      </div>
                    </td>
                    <td className="px-4 py-5 font-mono text-[11px] text-navy/30">/{s.slug}</td>
                    <td className="px-4 py-5">
                      <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${s.actif
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                        : 'bg-navy/5 text-navy/40 border-navy/5'
                        }`}>
                        {s.actif ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="px-4 py-5">
                      <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button onClick={() => openEdit(s)} className="text-[12px] font-bold text-vivid hover:underline">
                          Éditer
                        </button>
                        <button onClick={() => setDeleteTarget(s)} className="text-[12px] font-bold text-red-500 hover:underline">
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {services.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-32 text-center text-[14px] font-bold text-navy/30">
                      Aucun service n'est encore configuré.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      <CrudModal
        open={modalOpen}
        onClose={closeModal}
        title={editing ? 'Modifier le service' : 'Nouveau service'}
        subtitle={editing ? `Édition de "${editing.titre}"` : 'Ajoutez un nouveau service au portail.'}
        onSubmit={handleSubmit}
        loading={isSaving}
        error={formError}
        submitLabel={editing ? 'Mettre à jour' : 'Créer le service'}
      >
        <FormField label="Titre" placeholder="Ex : Développement Web" value={form.titre} onChange={(e) => setForm({ ...form, titre: (e.target as HTMLInputElement).value })} required />
        <FormField label="Description" as="textarea" placeholder="Décrivez le service en quelques lignes…" value={form.description} onChange={(e) => setForm({ ...form, description: (e.target as HTMLTextAreaElement).value })} required />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-end">
          <div className="flex-1 flex flex-col gap-2">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <FormField
                  label="Icône"
                  placeholder="Ex : code"
                  value={form.icone ?? ''}
                  onChange={(e) => setForm({ ...form, icone: (e.target as HTMLInputElement).value })}
                  hint="Nom de l'icône Lucide"
                />
              </div>
              <div className="w-14 h-14 rounded-2xl bg-white/50 border border-navy/5 flex items-center justify-center shadow-inner mt-6">
                <IconPreview name={form.icone ?? ''} />
              </div>
            </div>
          </div>
          <FormField label="Ordre" type="number" value={form.ordre ?? 0} onChange={(e) => setForm({ ...form, ordre: Number((e.target as HTMLInputElement).value) })} />
        </div>
        <ImageUpload
          label="Image de couverture"
          value={form.imageUrl ?? ''}
          onFileSelect={setPendingFile}
          hint="Affichée dans l'en-tête du service sur le portail."
        />
        <div className="flex items-center gap-3 px-1">
          <input type="checkbox" id="actif-toggle" checked={form.actif ?? true} onChange={(e) => setForm({ ...form, actif: e.target.checked })} className="w-5 h-5 rounded-lg border-navy/10 text-vivid focus:ring-vivid/20" />
          <label htmlFor="actif-toggle" className="text-[13px] font-bold text-navy">Service actif</label>
        </div>
      </CrudModal>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMut.mutate(deleteTarget.id)}
        title="Désactiver ce service ?"
        message={`Le service "${deleteTarget?.titre}" sera marqué comme inactif. Il ne sera plus visible sur le portail public.`}
        confirmLabel="Désactiver"
        loading={deleteMut.isPending}
      />
    </div>
  )
}
