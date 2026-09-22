import { useState, type FormEvent } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getReferences, createReference, updateReference, deleteReference } from '@/services/references.service'
import type { Reference, CreateReferencePayload } from '@/types/reference.types'
import CrudModal from '@/components/shared/CrudModal'
import FormField from '@/components/shared/FormField'
import ImageUpload from '@/components/shared/ImageUpload'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import { uploadMedia } from '@/services/medias.service'

export default function ReferencesPage() {
  const queryClient = useQueryClient()

  // State
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Reference | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Reference | null>(null)
  const [form, setForm] = useState<CreateReferencePayload>({ titre: '', client: '', secteur: '', description: '', technologies: [], logoClientUrl: '', dateRealisation: '', publie: true })
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [techText, setTechText] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  // Queries
  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-references'],
    queryFn: () => getReferences(),
  })

  // Mutations
  const createMut = useMutation({
    mutationFn: (payload: CreateReferencePayload) => createReference(payload),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-references'] }); closeModal() },
    onError: () => setFormError('Erreur lors de la création de la référence.'),
  })

  const updateMut = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CreateReferencePayload> }) => updateReference(id, payload),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-references'] }); closeModal() },
    onError: () => setFormError('Erreur lors de la mise à jour.'),
  })

  const deleteMut = useMutation({
    mutationFn: deleteReference,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-references'] }); setDeleteTarget(null) },
  })

  const references = data?.data ?? []

  // Helpers
  const openCreate = () => {
    setEditing(null)
    setForm({ titre: '', client: '', secteur: '', description: '', technologies: [], logoClientUrl: '', dateRealisation: '', publie: true })
    setPendingFile(null)
    setTechText('')
    setFormError(null)
    setModalOpen(true)
  }

  const openEdit = (ref: Reference) => {
    setEditing(ref)
    setForm({
      titre: ref.titre, client: ref.client, secteur: ref.secteur, description: ref.description,
      technologies: ref.technologies, logoClientUrl: ref.logoClientUrl ?? '', dateRealisation: ref.dateRealisation ?? '', publie: ref.publie,
    })
    setPendingFile(null)
    setTechText(ref.technologies.join(', '))
    setFormError(null)
    setModalOpen(true)
  }

  const closeModal = () => { setModalOpen(false); setEditing(null); setFormError(null) }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!form.titre.trim() || !form.client.trim() || !form.secteur.trim() || !form.description.trim()) {
      setFormError('Le titre, le client, le secteur et la description sont requis.')
      return
    }
    const payload = { ...form, technologies: techText.split(',').map((t) => t.trim()).filter(Boolean) }

    // Upload file if selected
    if (pendingFile) {
      setIsUploading(true)
      try {
        const res = await uploadMedia(pendingFile, 'references')
        payload.logoClientUrl = res.data.url
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
          <h2 className="text-[24px] font-black text-navy font-condensed tracking-tight">Références Clients</h2>
          <p className="text-[13px] text-navy/40">Affichez vos réussites et vos partenaires stratégiques.</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-navy hover:bg-vivid text-white text-[13px] font-black px-6 py-4 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-vivid/20 active:scale-[0.98]">
          <Plus size={18} />
          AJOUTER UNE RÉFÉRENCE
        </button>
      </div>

      {/* Loading / Error */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <Loader2 size={32} className="animate-spin text-vivid" />
          <span className="text-[13px] font-medium text-navy/40">Chargement des références…</span>
        </div>
      )}
      {isError && (
        <div className="glass p-12 rounded-[40px] text-center">
          <div className="text-red-500 font-bold mb-2">Erreur de chargement</div>
          <div className="text-[13px] text-navy/40">Impossible de récupérer les références.</div>
        </div>
      )}

      {/* Cards Grid */}
      {!isLoading && !isError && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {references.map((ref) => (
            <div key={ref.id} className="group glass-premium rounded-[40px] p-8 flex flex-col gap-5 hover:shadow-xl hover:shadow-vivid/5 transition-all duration-300 transform hover:-translate-y-2 border border-white/20">
              <div className="flex items-center justify-between">
                <div className="text-[11px] text-vivid font-black uppercase tracking-widest">{ref.secteur}</div>
                <span className={cn(
                  'px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border',
                  ref.publie
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                    : 'bg-navy/5 text-navy/40 border-navy/5'
                )}>
                  {ref.publie ? 'Publié' : 'Brouillon'}
                </span>
              </div>

              <div className="flex-1">
                <h3 className="text-[15px] font-black text-navy uppercase tracking-tight mb-2 group-hover:text-vivid transition-colors">
                  {ref.client}
                </h3>
                <p className="text-[14px] font-medium text-navy/70 leading-relaxed font-roboto line-clamp-2">
                  {ref.titre}
                </p>
                {ref.dateRealisation && (
                  <div className="text-[11px] text-navy/30 mt-2 font-mono">
                    {new Date(ref.dateRealisation).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })}
                  </div>
                )}
              </div>

              {ref.technologies.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {ref.technologies.map((t) => (
                    <span key={t} className="text-[10px] font-bold text-navy/40 bg-navy/5 px-2.5 py-1 rounded-lg">{t}</span>
                  ))}
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-navy/5">
                <button onClick={() => openEdit(ref)} className="flex-1 bg-navy/5 hover:bg-navy hover:text-white text-navy text-[12px] font-black py-3 rounded-xl transition-all duration-200">
                  Éditer
                </button>
                <button onClick={() => setDeleteTarget(ref)} className="flex-1 bg-red-50 hover:bg-red-500 hover:text-white text-red-500 text-[12px] font-black py-3 rounded-xl transition-all duration-200">
                  Supprimer
                </button>
              </div>
            </div>
          ))}

          {references.length === 0 && (
            <div className="col-span-full py-32 text-center text-[14px] font-bold text-navy/30 bg-navy/5 rounded-[40px] border border-dashed border-navy/10">
              Aucune référence n'est disponible.
            </div>
          )}
        </div>
      )}

      {/* Create / Edit Modal */}
      <CrudModal
        open={modalOpen}
        onClose={closeModal}
        title={editing ? 'Modifier la référence' : 'Nouvelle référence'}
        subtitle={editing ? `Édition de "${editing.client}"` : 'Ajoutez un nouveau projet de référence.'}
        onSubmit={handleSubmit}
        loading={isSaving}
        error={formError}
        submitLabel={editing ? 'Mettre à jour' : 'Créer la référence'}
      >
        <FormField label="Titre du projet" placeholder="Ex : Refonte SI — Orange Burkina" value={form.titre} onChange={(e) => setForm({ ...form, titre: (e.target as HTMLInputElement).value })} required />
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Client" placeholder="Ex : Orange Burkina Faso" value={form.client} onChange={(e) => setForm({ ...form, client: (e.target as HTMLInputElement).value })} required />
          <FormField label="Secteur" placeholder="Ex : Télécommunications" value={form.secteur} onChange={(e) => setForm({ ...form, secteur: (e.target as HTMLInputElement).value })} required />
        </div>
        <FormField label="Description" as="textarea" placeholder="Décrivez le projet…" value={form.description} onChange={(e) => setForm({ ...form, description: (e.target as HTMLTextAreaElement).value })} required />
        <FormField label="Technologies" as="textarea" placeholder="Node.js, PostgreSQL, React, Docker" value={techText} onChange={(e) => setTechText((e.target as HTMLTextAreaElement).value)} hint="Séparées par des virgules" />
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Date de réalisation" type="date" value={form.dateRealisation ?? ''} onChange={(e) => setForm({ ...form, dateRealisation: (e.target as HTMLInputElement).value })} />
        <ImageUpload
          label="Logo du client"
          value={form.logoClientUrl ?? ''}
          onFileSelect={setPendingFile}
        />
        </div>
        <div className="flex items-center gap-3 px-1">
          <input type="checkbox" id="ref-publie" checked={form.publie ?? true} onChange={(e) => setForm({ ...form, publie: e.target.checked })} className="w-5 h-5 rounded-lg border-navy/10 text-vivid focus:ring-vivid/20" />
          <label htmlFor="ref-publie" className="text-[13px] font-bold text-navy">Publier sur le portail</label>
        </div>
      </CrudModal>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMut.mutate(deleteTarget.id)}
        title="Supprimer cette référence ?"
        message={`La référence "${deleteTarget?.client}" sera définitivement supprimée. Cette action est irréversible.`}
        confirmLabel="Supprimer"
        loading={deleteMut.isPending}
      />
    </div>
  )
}
