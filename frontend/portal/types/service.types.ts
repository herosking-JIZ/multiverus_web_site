export interface Service {
  id: string
  titre: string
  slug: string
  description: string
  descriptionLong?: string
  icone?: string
  iconeCategorie?: string
  imageUrl?: string
  backgroundImage?: string
  badge?: 'Prioritaire' | 'Populaire' | 'Nouveau' | string
  features: string[]
  ordre: number
}
