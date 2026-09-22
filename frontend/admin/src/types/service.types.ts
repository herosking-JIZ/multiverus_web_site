export interface Service {
  id: string
  titre: string
  slug: string
  description: string
  icone?: string
  imageUrl?: string | null
  ordre: number
  actif: boolean
  modifiePar?: string
  createdAt: string
  updatedAt: string
}

export interface CreateServicePayload {
  titre: string
  description: string
  icone?: string
  imageUrl?: string
  ordre?: number
  actif?: boolean
}

export type UpdateServicePayload = Partial<CreateServicePayload>
