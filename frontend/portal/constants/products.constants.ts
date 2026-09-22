import type { Product } from '@/types/product.types'

export const PRODUCTS_FALLBACK: Product[] = [
  {
    id: '1',
    nom: 'GlobalMarket',
    slug: 'globalmarket',
    description:
      'Marketplace e-commerce multi-vendeurs en architecture microservices. 11 services NestJS orchestrés par RabbitMQ, authentification Keycloak, catalogue, commandes, livraison et notifications en temps réel.',
    categorie: 'Marketplace · Microservices',
    badge: 'Projet phare',
    couleurAccent: '#2DD4BF',
    features: [
      'NestJS (11 microservices)',
      'Prisma + PostgreSQL + Redis',
      'Keycloak 25 / OIDC',
      'React Native Expo',
    ],
    ordre: 1,
  },
  {
    id: '2',
    nom: 'CIF-Compliance',
    slug: 'cif-compliance',
    description:
      'Système de conformité AML/CFT avec screening de sanctions et alertes en temps réel via WebSockets. Gouvernance des rôles et piste d\'audit complète.',
    categorie: 'Fintech · Réglementaire',
    badge: 'Conformité',
    couleurAccent: '#8B5CF6',
    features: [
      'Screening sanctions',
      'Alertes WebSocket temps réel',
      'Keycloak & RBAC',
      'Piste d\'audit',
    ],
    ordre: 2,
  },
  {
    id: '3',
    nom: 'MULTIVERUS',
    slug: 'multiverus',
    description:
      'Ma marque de contenu tech & fintech et ce portfolio. Next.js 16, Tailwind v4, identité sombre teal/violet et design system maison.',
    categorie: 'Portfolio · Contenu',
    badge: 'Build in public',
    couleurAccent: '#FBBF24',
    features: [
      'Next.js 16 (App Router)',
      'Tailwind v4 & shadcn',
      'Framer Motion',
      'Design system maison',
    ],
    ordre: 3,
  },
]
