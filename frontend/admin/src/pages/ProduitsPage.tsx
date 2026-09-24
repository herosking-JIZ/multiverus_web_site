import { useState, type FormEvent } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getProducts, createProduct, updateProduct, deleteProduct } from '@/services/products.service'
import type { Product, CreateProductPayload, ProductStatut } from '@/types/product.types'
import CrudModal from '@/components/shared/CrudModal'
import FormField from '@/components/shared/FormField'
import ImageUpload from '@/components/shared/ImageUpload'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import { uploadMedia } from '@/services/medias.service'

const STATUT_STYLE: Record<string, string> = {
  NOUVEAU: 'bg-blue/5 text-blue border-blue/10',
  ACTIF:   'bg-emerald-50 text-emerald-600 border-emerald-100',
  ARCHIVE: 'bg-navy/5 text-navy/40 border-navy/5',
}

const STATUT_OPTIONS: { value: ProductStatut; label: string }[] = [
  { value: 'NOUVEAU', label: 'Nouveau' },
  { value: 'ACTIF', label: 'Actif' },
  { value: 'ARCHIVE', label: 'Archivé' },
]

export default function ProduitsPage() {
  const queryClient = useQueryClient()

  // State
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null)
  const [form, setForm] = useState<CreateProductPayload>({ nom: '', description: '', categorie: '', statut: 'ACTIF', features: [], imageUrl: '', actif: true })
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [featuresText, setFeaturesText] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  // Queries
  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-products'],
    queryFn: () => getProducts(),
  })

  // Mutations
  const createMut = useMutation({
    mutationFn: (payload: CreateProductPayload) => createProduct(payload),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-products'] }); closeModal() },
    onError: () => setFormError('Erreur lors de la création du produit.'),
  })

  const updateMut = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CreateProductPayload> }) => updateProduct(id, payload),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-products'] }); closeModal() },
    onError: () => setFormError('Erreur lors de la mise à jour.'),
  })

  const deleteMut = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-products'] }); setDeleteTarget(null) },
  })

  const produits = data?.data ?? []

  // Helpers
  const openCreate = () => {
    setEditing(null)
    setForm({ nom: '', description: '', categorie: '', statut: 'ACTIF', features: [], imageUrl: '', actif: true })
    setPendingFile(null)
    setFeaturesText('')
    setFormError(null)
    setModalOpen(true)
  }

  const openEdit = (p: Product) => {
    setEditing(p)
    setForm({ nom: p.nom, description: p.description, categorie: p.categorie, statut: p.statut, features: p.features, imageUrl: p.imageUrl ?? '', actif: p.actif })
    setPendingFile(null)
    setFeaturesText(p.features.join(', '))
    setFormError(null)
    setModalOpen(true)
  }

  const closeModal = () => { setModalOpen(false); setEditing(null); setFormError(null) }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!form.nom.trim() || !form.description.trim() || !form.categorie.trim()) {
      setFormError('Le nom, la description et la catégorie sont requis.')
      return
    }

    const payload = { 
      ...form, 
      features: featuresText.split(',').map((f) => f.trim()).filter(Boolean) 
    }

    // Upload file if selected
    if (pendingFile) {
      setIsUploading(true)
      try {
        const res = await uploadMedia(pendingFile, 'produits')
        payload.imageUrl = res.data.url
      } catch (err) {
        setFormError("Échec de l'upload de l'image.")
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
          <h2 className="text-[24px] font-black text-navy font-condensed tracking-tight">Catalogue Produits</h2>
          <p className="text-[13px] text-navy/40">Gérez les solutions et produits MULTIVERUS présentés sur le site.</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-navy hover:bg-vivid text-white text-[13px] font-black px-6 py-4 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-vivid/20 active:scale-[0.98]">
          <Plus size={18} />
          AJOUTER UN PRODUIT
        </button>
      </div>

      {/* Loading / Error */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <Loader2 size={32} className="animate-spin text-vivid" />
          <span className="text-[13px] font-medium text-navy/40">Chargement des produits…</span>
        </div>
      )}
      {isError && (
        <div className="glass p-12 rounded-[40px] text-center">
          <div className="text-red-500 font-bold mb-2">Erreur de chargement</div>
          <div className="text-[13px] text-navy/40">Impossible de récupérer le catalogue.</div>
        </div>
      )}

      {/* Cards Grid */}
      {!isLoading && !isError && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
          {produits.map((p) => (
            <div key={p.id} className="group glass-premium rounded-[40px] p-8 flex flex-col gap-6 hover:shadow-xl hover:shadow-vivid/5 transition-all duration-300 transform hover:-translate-y-2 border border-white/20">
              <div className="flex items-start justify-between">
                <div className="w-14 h-14 rounded-2xl bg-navy shadow-lg flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-3">
                  <span className="text-[16px] font-black text-white font-condensed">
                    {p.nom.split(' ').pop()?.slice(0, 2).toUpperCase() ?? '??'}
                  </span>
                </div>
                <span className={cn(
                  'px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border',
                  STATUT_STYLE[p.statut] || 'bg-navy/5 text-navy/40 border-navy/5'
                )}>
                  {p.statut}
                </span>
              </div>

              <div className="flex-1">
                <div className="text-[11px] text-vivid font-black uppercase tracking-widest mb-1">{p.categorie}</div>
                <h3 className="text-[18px] font-black text-navy font-condensed leading-tight">{p.nom}</h3>
                {p.features.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {p.features.slice(0, 3).map((f) => (
                      <span key={f} className="text-[10px] font-bold text-navy/40 bg-navy/5 px-2 py-0.5 rounded-lg">{f}</span>
                    ))}
                    {p.features.length > 3 && (
                      <span className="text-[10px] font-bold text-vivid">+{p.features.length - 3}</span>
                    )}
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4 border-t border-navy/5">
                <button onClick={() => openEdit(p)} className="flex-1 bg-navy/5 hover:bg-navy hover:text-white text-navy text-[12px] font-black py-3 rounded-xl transition-all duration-200">
                  Éditer
                </button>
                <button onClick={() => setDeleteTarget(p)} className="flex-1 bg-red-50 hover:bg-red-500 hover:text-white text-red-500 text-[12px] font-black py-3 rounded-xl transition-all duration-200">
                  Archiver
                </button>
              </div>
            </div>
          ))}

          {produits.length === 0 && (
            <div className="col-span-full py-32 text-center text-[14px] font-bold text-navy/30 bg-navy/5 rounded-[40px] border border-dashed border-navy/10">
              Le catalogue est vide.
            </div>
          )}
        </div>
      )}

      {/* Create / Edit Modal */}
      <CrudModal
        open={modalOpen}
        onClose={closeModal}
        title={editing ? 'Modifier le produit' : 'Nouveau produit'}
        subtitle={editing ? `Édition de "${editing.nom}"` : 'Ajoutez un nouveau produit au catalogue.'}
        onSubmit={handleSubmit}
        loading={isSaving}
        error={formError}
        submitLabel={editing ? 'Mettre à jour' : 'Créer le produit'}
      >
        <FormField label="Nom du produit" placeholder="Ex : MULTIVERUS CRM" value={form.nom} onChange={(e) => setForm({ ...form, nom: (e.target as HTMLInputElement).value })} required />
        <FormField label="Description" as="textarea" placeholder="Décrivez le produit…" value={form.description} onChange={(e) => setForm({ ...form, description: (e.target as HTMLTextAreaElement).value })} required />
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Catégorie" placeholder="Ex : Logiciel" value={form.categorie} onChange={(e) => setForm({ ...form, categorie: (e.target as HTMLInputElement).value })} required />
          <FormField label="Statut" as="select" options={STATUT_OPTIONS} value={form.statut ?? 'ACTIF'} onChange={(e) => setForm({ ...form, statut: (e.target as HTMLSelectElement).value as ProductStatut })} />
        </div>
        <FormField label="Features" as="textarea" placeholder="Séparez par des virgules : Gestion contacts, Pipeline, Reporting" value={featuresText} onChange={(e) => setFeaturesText((e.target as HTMLTextAreaElement).value)} hint="Séparées par des virgules" />
        <ImageUpload
          label="Image du produit"
          value={form.imageUrl ?? ''}
          onFileSelect={setPendingFile}
          hint="Format recommandé : 800x600px"
        />
        <div className="flex items-center gap-3 px-1">
          <input type="checkbox" id="produit-actif" checked={form.actif ?? true} onChange={(e) => setForm({ ...form, actif: e.target.checked })} className="w-5 h-5 rounded-lg border-navy/10 text-vivid focus:ring-vivid/20" />
          <label htmlFor="produit-actif" className="text-[13px] font-bold text-navy">Produit actif</label>
        </div>
      </CrudModal>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMut.mutate(deleteTarget.id)}
        title="Archiver ce produit ?"
        message={`"${deleteTarget?.nom}" sera archivé et retiré du catalogue public.`}
        confirmLabel="Archiver"
        loading={deleteMut.isPending}
      />
    </div>
  )
}
