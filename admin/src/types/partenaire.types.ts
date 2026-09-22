export interface Partenaire {
  id: string
  nom: string
  logoUrl?: string | null
  siteWeb?: string | null
  ordre: number
  actif: boolean
  modifiePar?: string
  createdAt: string
  updatedAt: string
}

export interface CreatePartenairePayload {
  nom: string
  logoUrl?: string
  siteWeb?: string
  ordre?: number
  actif?: boolean
}

export type UpdatePartenairePayload = Partial<CreatePartenairePayload>
