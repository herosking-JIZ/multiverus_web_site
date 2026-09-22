export interface Product {
  id: string
  nom: string
  slug: string
  description: string
  categorie: string
  statut?: 'NOUVEAU' | 'ACTIF' | 'ARCHIVE'
  badge?: string
  couleurAccent?: string
  features: string[]
  imageUrl?: string
  ordre: number
}
