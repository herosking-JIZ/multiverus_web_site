import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Search, Filter, Loader2, Download, X, FileText, Mail, Building } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getLeads, getLeadById, updateLeadStatus, updateLeadNotes, deleteLead, exportLeadsCsv } from '@/services/leads.service'
import type { Lead, LeadStatut } from '@/types/lead.types'
import ConfirmDialog from '@/components/shared/ConfirmDialog'

type Filtre = 'TOUS' | LeadStatut

const STATUT_STYLE: Record<string, string> = {
  NOUVEAU:  'bg-blue/5 text-blue border-blue/10',
  EN_COURS: 'bg-or/5 text-or border-or/10',
  TRAITE:   'bg-emerald-50 text-emerald-600 border-emerald-100',
  ARCHIVE:  'bg-navy/5 text-navy/40 border-navy/5',
}
const STATUT_LABEL: Record<string, string> = {
  TOUS: 'Tous', NOUVEAU: 'Nouveau', EN_COURS: 'En cours', TRAITE: 'Traité', ARCHIVE: 'Archivé',
}
const STATUT_OPTIONS: LeadStatut[] = ['NOUVEAU', 'EN_COURS', 'TRAITE', 'ARCHIVE']

export default function LeadsPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [filtre, setFiltre] = useState<Filtre>('TOUS')
  const [deleteTarget, setDeleteTarget] = useState<Lead | null>(null)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [notesValue, setNotesValue] = useState('')

  // List query
  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-leads', filtre === 'TOUS' ? undefined : filtre],
    queryFn: () => getLeads(filtre === 'TOUS' ? undefined : { statut: filtre as LeadStatut }),
  })

  // Detail query
  const detailQuery = useQuery({
    queryKey: ['admin-lead-detail', detailId],
    queryFn: () => getLeadById(detailId!),
    enabled: !!detailId,
  })

  const detailLead = detailQuery.data?.data

  // Mutations
  const statusMut = useMutation({
    mutationFn: ({ id, statut }: { id: string; statut: LeadStatut }) => updateLeadStatus(id, statut),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-leads'] })
      if (detailId) queryClient.invalidateQueries({ queryKey: ['admin-lead-detail', detailId] })
    },
  })

  const notesMut = useMutation({
    mutationFn: ({ id, notes }: { id: string; notes: string }) => updateLeadNotes(id, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-lead-detail', detailId] })
    },
  })

  const deleteMut = useMutation({
    mutationFn: deleteLead,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-leads'] }); setDeleteTarget(null); setDetailId(null) },
  })

  const leads = (data?.data ?? []).filter((l) => {
    if (!search) return true
    const q = search.toLowerCase()
    return l.nomComplet.toLowerCase().includes(q) || l.email.toLowerCase().includes(q) || (l.organisation ?? '').toLowerCase().includes(q)
  })

  const openDetail = (lead: Lead) => {
    setDetailId(lead.id)
    setNotesValue(lead.notesInternes ?? '')
  }

  return (
    <div className="flex flex-col gap-8 relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-[24px] font-black text-navy font-condensed tracking-tight">Gestion des Leads</h2>
          <p className="text-[13px] text-navy/40">Suivez et gérez les demandes de contact de vos clients.</p>
        </div>
        <button
          onClick={() => exportLeadsCsv(filtre !== 'TOUS' ? { statut: filtre as LeadStatut } : undefined)}
          className="flex items-center gap-2 bg-navy/5 hover:bg-navy hover:text-white text-navy text-[13px] font-black px-6 py-4 rounded-2xl transition-all duration-300"
        >
          <Download size={16} />
          EXPORTER CSV
        </button>
      </div>

      {/* Toolbar */}
      <div className="glass-premium p-6 rounded-[32px] flex flex-col xl:flex-row gap-6 items-center shadow-lg border border-white/20">
        <div className="relative flex-1 w-full">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-navy/30" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom, email ou organisation…"
            className="w-full pl-12 pr-6 py-4 rounded-2xl border border-navy/5 bg-white/30 text-navy text-[14px] transition-all duration-300 focus:outline-none focus:border-vivid/50 focus:bg-white/80 focus:shadow-xl placeholder:text-navy/20"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 xl:pb-0 no-scrollbar w-full xl:w-auto">
          <div className="flex items-center gap-2 px-3 py-2 bg-navy/5 rounded-2xl mr-2">
            <Filter size={14} className="text-navy/40" />
            <span className="text-[11px] font-bold text-navy/40 uppercase tracking-wider">Filtre</span>
          </div>
          {(['TOUS', ...STATUT_OPTIONS] as Filtre[]).map((s) => (
            <button
              key={s}
              onClick={() => setFiltre(s)}
              className={cn(
                'px-4 py-2.5 rounded-xl text-[12px] font-bold transition-all duration-300 whitespace-nowrap',
                filtre === s
                  ? 'bg-navy text-white shadow-xl scale-105'
                  : 'bg-white/30 border border-white/20 text-navy/60 hover:bg-white hover:text-navy hover:shadow-sm'
              )}
            >
              {STATUT_LABEL[s] ?? s}
            </button>
          ))}
        </div>
      </div>

      {/* Loading / Error */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <Loader2 size={32} className="animate-spin text-vivid" />
          <span className="text-[13px] font-medium text-navy/40">Chargement des données…</span>
        </div>
      )}
      {isError && (
        <div className="glass-premium p-12 rounded-[40px] text-center border-red-500/20">
          <div className="text-red-500 font-bold mb-2">Oups ! Une erreur est survenue</div>
          <div className="text-[13px] text-navy/40 max-w-md mx-auto">
            Nous n'avons pas pu charger les leads. Vérifiez votre connexion.
          </div>
        </div>
      )}

      {/* Table */}
      {!isLoading && !isError && (
        <div className="glass-premium rounded-[40px] shadow-sm overflow-hidden min-h-[400px]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-navy/5">
                  {['Contact', 'Organisation', 'Sujet', 'Statut', 'Date', 'Actions'].map((h) => (
                    <th key={h} className="text-[11px] font-black text-navy/40 uppercase tracking-[0.1em] px-8 py-6">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-navy/5">
                {leads.map((lead) => (
                  <tr key={lead.id} className="group hover:bg-white/30 transition-colors duration-200 cursor-pointer" onClick={() => openDetail(lead)}>
                    <td className="px-8 py-5">
                      <div className="flex flex-col">
                        <span className="text-[14px] font-bold text-navy mb-0.5">{lead.nomComplet}</span>
                        <span className="text-[12px] text-navy/40">{lead.email}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-[13px] font-medium text-navy">
                        {lead.organisation || <span className="text-navy/20">—</span>}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-[13px] text-navy/50 leading-relaxed">{lead.sujet}</span>
                    </td>
                    <td className="px-8 py-5">
                      <select
                        value={lead.statut}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => {
                          e.stopPropagation()
                          statusMut.mutate({ id: lead.id, statut: e.target.value as LeadStatut })
                        }}
                        className={cn(
                          'px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border bg-transparent cursor-pointer focus:outline-none',
                          STATUT_STYLE[lead.statut]
                        )}
                      >
                        {STATUT_OPTIONS.map((s) => (
                          <option key={s} value={s}>{STATUT_LABEL[s]}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-8 py-5 text-[12px] font-medium text-navy/30">
                      {new Date(lead.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); setDeleteTarget(lead) }}
                          className="w-8 h-8 rounded-xl bg-red-50 text-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-500 hover:text-white"
                          title="Supprimer"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {leads.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-32 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 rounded-[24px] bg-navy/5 flex items-center justify-center text-navy/20">
                          <Search size={32} />
                        </div>
                        <span className="text-[14px] font-bold text-navy/30">Aucun lead ne correspond à votre recherche</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail Slide-out Panel */}
      {detailId && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-navy/30 backdrop-blur-sm" onClick={() => setDetailId(null)} />
          <div className="relative w-full max-w-[520px] glass-premium rounded-l-[40px] p-8 shadow-2xl overflow-y-auto flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h3 className="text-[20px] font-black text-navy font-condensed">Détail du Lead</h3>
              <button onClick={() => setDetailId(null)} className="w-10 h-10 rounded-2xl bg-navy/5 hover:bg-red-50 hover:text-red-500 flex items-center justify-center text-navy/30 transition-all">
                <X size={18} />
              </button>
            </div>

            {detailQuery.isLoading && (
              <div className="flex items-center justify-center py-20">
                <Loader2 size={24} className="animate-spin text-vivid" />
              </div>
            )}

            {detailLead && (
              <>
                {/* Contact Info */}
                <div className="bg-white/30 rounded-2xl p-6 space-y-4 border border-white/20">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-vivid/5 border border-vivid/10 flex items-center justify-center">
                      <span className="text-[14px] font-black text-vivid">{detailLead.nomComplet.slice(0, 2).toUpperCase()}</span>
                    </div>
                    <div>
                      <div className="text-[16px] font-black text-navy">{detailLead.nomComplet}</div>
                      <div className="flex items-center gap-1 text-[12px] text-navy/40">
                        <Mail size={12} /> {detailLead.email}
                      </div>
                    </div>
                  </div>
                  {detailLead.organisation && (
                    <div className="flex items-center gap-2 text-[13px] text-navy/60">
                      <Building size={14} /> {detailLead.organisation}
                    </div>
                  )}
                </div>

                {/* Subject & Message */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[11px] font-black text-navy/40 uppercase tracking-wider">
                    <FileText size={14} /> Sujet
                  </div>
                  <div className="text-[14px] font-bold text-navy">{detailLead.sujet}</div>
                  <div className="bg-white/20 rounded-2xl p-5 border border-white/10 text-[13px] text-navy/70 leading-relaxed whitespace-pre-wrap">
                    {detailLead.message}
                  </div>
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <div className="text-[11px] font-black text-navy/40 uppercase tracking-wider">Statut</div>
                  <div className="flex gap-2 flex-wrap">
                    {STATUT_OPTIONS.map((s) => (
                      <button
                        key={s}
                        onClick={() => statusMut.mutate({ id: detailLead.id, statut: s })}
                        className={cn(
                          'px-4 py-2 rounded-xl text-[12px] font-bold border transition-all',
                          detailLead.statut === s
                            ? `${STATUT_STYLE[s]} scale-105 shadow-sm`
                            : 'bg-navy/5 text-navy/30 border-navy/5 hover:bg-navy/10'
                        )}
                      >
                        {STATUT_LABEL[s]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notes internes */}
                <div className="space-y-2">
                  <div className="text-[11px] font-black text-navy/40 uppercase tracking-wider">Notes internes</div>
                  <textarea
                    value={notesValue}
                    onChange={(e) => setNotesValue(e.target.value)}
                    placeholder="Ajoutez des notes internes sur ce lead…"
                    className="w-full px-5 py-4 rounded-2xl border border-navy/5 bg-white/30 text-navy text-[13px] min-h-[120px] resize-y focus:outline-none focus:border-vivid focus:bg-white transition-all"
                  />
                  <button
                    onClick={() => notesMut.mutate({ id: detailLead.id, notes: notesValue })}
                    disabled={notesMut.isPending}
                    className="text-[12px] font-black text-vivid hover:underline disabled:opacity-50 flex items-center gap-1"
                  >
                    {notesMut.isPending && <Loader2 size={12} className="animate-spin" />}
                    Enregistrer les notes
                  </button>
                </div>

                {/* Meta */}
                <div className="text-[11px] text-navy/20 space-y-1 pt-4 border-t border-navy/5">
                  <div>ID : {detailLead.id}</div>
                  <div>Créé le : {new Date(detailLead.createdAt).toLocaleString('fr-FR')}</div>
                  {detailLead.ipAdresse && <div>IP : {detailLead.ipAdresse}</div>}
                </div>

                {/* Delete */}
                <button
                  onClick={() => setDeleteTarget(detailLead)}
                  className="w-full bg-red-50 hover:bg-red-500 hover:text-white text-red-500 text-[13px] font-black py-4 rounded-2xl transition-all duration-200 mt-auto"
                >
                  Supprimer ce lead
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMut.mutate(deleteTarget.id)}
        title="Supprimer ce lead ?"
        message={`Le lead de "${deleteTarget?.nomComplet}" sera définitivement supprimé.`}
        confirmLabel="Supprimer"
        loading={deleteMut.isPending}
      />
    </div>
  )
}
