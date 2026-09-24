import type { Product } from '@/types/product.types'

export const PRODUCTS_FALLBACK: Product[] = [
  {
    id: '1',
    nom: 'MultiVerus Shield',
    slug: 'multiverus-shield',
    description:
      'Une plateforme intelligente (SOC) de surveillance et de remédiation en temps réel. MultiVerus Shield protège vos données contre les attaques zero-day et les menaces internes.',
    categorie: 'Sécurité',
    badge: 'Sécurité',
    couleurAccent: '#F07800',
    features: [
      'Détection IA des anomalies 24/7',
      'Tableau de bord centralisé',
      'Automatisation des réponses (SOAR)',
      'Rapports de conformité en un clic',
    ],
    ordre: 1,
  },
  {
    id: '2',
    nom: 'MultiVerus CloudDesk',
    slug: 'multiverus-clouddesk',
    description:
      'Votre bureau virtuel accessible partout. CloudDesk unifie vos applications, vos fichiers et vos communications dans un espace de travail ultra-rapide et hautement sécurisé.',
    categorie: 'Productivité',
    badge: 'Populaire',
    couleurAccent: '#1557E8',
    features: [
      'Accès universel multi-appareils',
      'Chiffrement de bout en bout',
      'Gestion granulaire des droits utilisateurs',
      'Intégration transparente avec vos applications IT',
    ],
    ordre: 2,
  },
  {
    id: '3',
    nom: 'MultiVerus ERP Suite',
    slug: 'multiverus-erp-suite',
    description:
      'Le système de gestion d\'entreprise modulaire. Comptabilité, stocks, RH et ventes se rencontrent sur une plateforme agile capable d\'évoluer avec votre croissance organique.',
    categorie: 'Gestion',
    couleurAccent: '#9214bfff',
    features: [
      'Modules 100% personnalisables',
      'Suivi financier en temps réel',
      'Workflows d\'approbation intelligents',
      'APIs ouvertes pour l\'interopérabilité',
    ],
    ordre: 3,
  },
  {
    id: '4',
    nom: 'MultiVerus GreenSync',
    slug: 'multiverus-greensync',
    description:
      'Un logiciel intelligent de gestion énergétique pour vos parcs immobiliers et industriels. Surveillez, lissez vos pics de consommation et réduisez vos coûts d\'énergie de 30% en moyenne.',
    categorie: 'Énergie',
    couleurAccent: '#27c93f',
    features: [
      'Cartographie énergétique complète',
      'Alertes de surconsommation automatiques',
      'Modélisation de la transition solaire',
      'Reporting automatisé RSE',
    ],
    ordre: 4,
  },
]
