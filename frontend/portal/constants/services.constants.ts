import type { Service } from '@/types/service.types'

export const SERVICES_FALLBACK: Service[] = [
  {
    id: '1',
    titre: 'Backend & Architecture',
    slug: 'backend-architecture',
    description: 'Conception de backends robustes et scalables en microservices.',
    descriptionLong:
      'Architecture microservices, API REST, communication asynchrone (RabbitMQ), clean architecture et tests. Je conçois des systèmes backend pensés pour la montée en charge, la maintenabilité et la séparation stricte des responsabilités.',
    iconeCategorie: 'network',
    badge: 'Cœur de métier',
    features: [
      'NestJS & Node.js',
      'Microservices & RabbitMQ',
      'Clean architecture',
      'Tests automatisés',
    ],
    ordre: 1,
    backgroundImage: '',
  },
  {
    id: '2',
    titre: 'Fintech & Conformité',
    slug: 'fintech-conformite',
    description: 'Identité, sécurité et conformité réglementaire (AML/CFT).',
    descriptionLong:
      'Authentification et autorisation (Keycloak / OIDC), screening de sanctions, conformité AML/CFT et sécurisation des flux sensibles. Le domaine qui me passionne et où je construis le plus.',
    iconeCategorie: 'shield',
    badge: 'Spécialité',
    features: [
      'Keycloak / OAuth2 / OIDC',
      'Screening sanctions & AML/CFT',
      'JWT & sécurisation d\'APIs',
      'Audit & gouvernance',
    ],
    ordre: 2,
    backgroundImage: '',
  },
  {
    id: '3',
    titre: 'Frontend & Mobile',
    slug: 'frontend-mobile',
    description: 'Interfaces modernes, réactives et soignées.',
    descriptionLong:
      'React, Next.js, React Native (Expo), TypeScript, Radix UI et Tailwind. Des interfaces sombres, denses et performantes avec une vraie attention au détail et aux transitions fluides.',
    iconeCategorie: 'code',
    features: [
      'React & Next.js',
      'React Native / Expo',
      'TypeScript strict',
      'Radix UI & Tailwind',
    ],
    ordre: 3,
    backgroundImage: '',
  },
  {
    id: '4',
    titre: 'Cloud & DevOps',
    slug: 'cloud-devops',
    description: 'Conteneurisation et déploiement fiables.',
    descriptionLong:
      'Docker, orchestration et pipelines CI/CD pour livrer de manière fiable et reproductible, du poste de dev local jusqu\'à la production.',
    iconeCategorie: 'cloud',
    features: [
      'Docker & docker-compose',
      'Pipelines CI/CD',
      'Environnements reproductibles',
      'Monitoring & logs',
    ],
    ordre: 4,
    backgroundImage: '',
  },
  {
    id: '5',
    titre: 'Bases de données',
    slug: 'bases-de-donnees',
    description: 'Modélisation et optimisation des données.',
    descriptionLong:
      'PostgreSQL, Prisma ORM, Redis pour le cache et la communication. Modélisation relationnelle solide, requêtes performantes et migrations maîtrisées.',
    iconeCategorie: 'chart',
    features: [
      'PostgreSQL',
      'Prisma ORM',
      'Redis (cache / pub-sub)',
      'Modélisation & migrations',
    ],
    ordre: 5,
    backgroundImage: '',
  },
  {
    id: '6',
    titre: 'APIs & Intégrations',
    slug: 'apis-integrations',
    description: 'APIs et intégrations tierces en temps réel.',
    descriptionLong:
      'APIs REST et WebSockets, intégration de services externes (traduction, notifications, paiement) et documentation claire pour des consommateurs humains comme machines.',
    iconeCategorie: 'zap',
    features: [
      'REST & WebSockets',
      'Intégrations tierces',
      'LibreTranslate',
      'Documentation d\'API',
    ],
    ordre: 6,
    backgroundImage: '',
  },
]
