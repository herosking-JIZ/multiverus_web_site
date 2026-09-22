export type ContactSujet =
  | 'Audit de Cybersécurité'
  | 'Projet Cloud Computing'
  | 'Développement Logiciel'
  | 'Ingénierie Réseaux'
  | 'Démo d\'un produit spécifique'
  | 'Autre demande globale'

export interface ContactPayload {
  nomComplet: string
  email: string
  organisation?: string
  sujet: ContactSujet
  message: string
}

export interface ContactResponse {
  message: string
  id?: string
}
