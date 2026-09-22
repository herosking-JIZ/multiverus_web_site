export interface Reference {
  id: string
  titre: string
  client: string
  secteur: string
  description: string
  technologies: string[]
  logoClientUrl?: string | null
  dateRealisation?: string
  publie: boolean
  modifiePar?: string
  createdAt: string
  updatedAt: string
}

export interface CreateReferencePayload {
  titre: string
  client: string
  secteur: string
  description: string
  technologies?: string[]
  logoClientUrl?: string
  dateRealisation?: string
  publie?: boolean
}

export type UpdateReferencePayload = Partial<CreateReferencePayload>
