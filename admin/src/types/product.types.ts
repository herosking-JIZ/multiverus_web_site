export type ProductStatut = 'NOUVEAU' | 'ACTIF' | 'ARCHIVE'

export interface Product {
  id: string
  nom: string
  slug: string
  description: string
  categorie: string
  statut: ProductStatut
  features: string[]
  imageUrl?: string | null
  actif: boolean
  modifiePar?: string
  createdAt: string
  updatedAt: string
}

export interface CreateProductPayload {
  nom: string
  description: string
  categorie: string
  statut?: ProductStatut
  features?: string[]
  imageUrl?: string
  actif?: boolean
}

export type UpdateProductPayload = Partial<CreateProductPayload>
