export type LeadStatut = 'NOUVEAU' | 'EN_COURS' | 'TRAITE' | 'ARCHIVE'

export interface Lead {
  id: string
  nomComplet: string
  email: string
  organisation?: string
  sujet: string
  message: string
  statut: LeadStatut
  notesInternes?: string
  ipAdresse?: string
  traitePar?: string
  createdAt: string
  updatedAt: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}
