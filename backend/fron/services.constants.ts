import type { Service } from '@/types/service.types'

export const SERVICES_FALLBACK: Service[] = [
  {
    id: '1',
    titre: 'Cyber Sécurité',
    slug: 'cybersecurite',
    description: 'Protection avancée de vos systèmes, réseaux et données contre les cybermenaces.',
    descriptionLong:
      'Protection avancée de vos systèmes, réseaux et données contre les cybermenaces. Notre approche proactive garantit la sécurité de vos actifs les plus critiques et assure la continuité de vos opérations commerciales sans interruption.',
    iconeCategorie: 'shield',
    badge: 'Prioritaire',
    features: [
      'Audits de sécurité complets',
      'Tests d\'intrusion (Pentesting)',
      'Architecture de sécurité réseau',
      'Formation et sensibilisation des équipes',
    ],
    ordre: 1,
    backgroundImage: '/images/services/cyber-security.webp',
  },
  {
    id: '2',
    titre: 'Cloud Computing',
    slug: 'cloud-computing',
    description: 'Accédez à vos données délocalisées sans les coûts d\'infrastructure.',
    descriptionLong:
      'Accédez à vos données délocalisées sans les coûts d\'infrastructure liés. Nous facilitons votre transition vers le cloud et optimisons vos ressources existantes pour accroître votre agilité et vos performances globales.',
    iconeCategorie: 'cloud',
    badge: 'Populaire',
    features: [
      'Migration vers AWS, Azure, GCP',
      'Hébergement sécurisé de données',
      'Gestion d\'infrastructure Cloud',
      'Solutions de sauvegarde et PRA',
    ],
    ordre: 2,
    backgroundImage: '/images/services/cloud-computing.webp',
  },
  {
    id: '3',
    titre: 'Business Intelligence',
    slug: 'business-intelligence',
    description: 'Analyse de données, KPIs et tableaux de bord pour piloter vos décisions.',
    descriptionLong:
      'Analyse de données, KPIs et tableaux de bord pour piloter vos décisions. Transformez vos données brutes en informations stratégiques exploitables pour devancer la concurrence.',
    iconeCategorie: 'chart',
    features: [
      'Création de tableaux de bord interactifs',
      'Analyse prédictive et reporting',
      'Intégration de données multi-sources',
      'Formation aux outils BI (Power BI, Tableau)',
    ],
    ordre: 3,
    backgroundImage: '/images/services/business-intelligence.webp',
  },
  {
    id: '4',
    titre: 'Ingénierie Logicielles',
    slug: 'ingenierie-logicielles',
    description: 'Conception et développement de sites web, apps mobiles et logiciels sur mesure.',
    descriptionLong:
      'Conception et développement de sites web, applications mobiles et logiciels sur mesure. Nos développeurs expérimentés créent des solutions technologiques robustes et évolutives.',
    iconeCategorie: 'code',
    features: [
      'Développement d\'applications Web & Mobiles',
      'Conception de logiciels métiers (ERP, CRM)',
      'Modernisation d\'applications legacy',
      'Assurance qualité et tests automatisés',
    ],
    ordre: 4,
    backgroundImage: '/images/services/software-engineering.webp',
  },
  {
    id: '5',
    titre: 'Infogérance',
    slug: 'infogerance',
    description: 'Gestion complète de votre système informatique par notre équipe d\'experts.',
    descriptionLong:
      'Gestion complète de votre système informatique par notre équipe d\'experts certifiés. Concentrez-vous sur votre cœur de métier pendant que nous assumons entièrement la maintenance, la sécurité et le support réactif de votre IT.',
    iconeCategorie: 'grid',
    features: [
      'Support technique (Helpdesk) 24/7',
      'Maintenance préventive et curative',
      'Gestion de parc informatique centralisée',
      'Supervision proactive des systèmes IT',
    ],
    ordre: 5,
    backgroundImage: '/images/services/infogerance.webp',
  },
  {
    id: '6',
    titre: 'Ingénierie Réseaux',
    slug: 'ingenierie-reseaux',
    description: 'Étude, mise en place et sécurisation de vos réseaux locaux et d\'inter-connexion.',
    descriptionLong:
      'Étude, mise en place et sécurisation complète de vos réseaux locaux et d\'inter-connexion. Nous concevons des infrastructures réseau de haute performance et résilientes.',
    iconeCategorie: 'network',
    features: [
      'Déploiement LAN/WAN et fibre optique',
      'Solutions réseaux sans fil (Wi-Fi d\'entreprise)',
      'Optimisation et audit des performances réseau',
      'Interconnexion sécurisée de sites distants (VPN)',
    ],
    ordre: 6,
    backgroundImage: '/images/services/ingenierie-reseaux.webp',
  },
  {
    id: '7',
    titre: 'Nouvelles Énergies',
    slug: 'nouvelles-energies',
    description: 'Solutions pour une transition vers l\'énergie propre et renouvelable.',
    descriptionLong:
      'Solutions globales pour une transition vers l\'énergie propre et renouvelable. Nous intégrons des technologies intelligentes et durables pour optimiser votre consommation énergétique.',
    iconeCategorie: 'zap',
    badge: 'Nouveau',
    features: [
      'Audit et analyse énergétique',
      'Installation de solutions solaires (Photovoltaïque)',
      'Systèmes intelligents de stockage d\'énergie',
      'Smart grids et supervision de la consommation',
    ],
    ordre: 7,
    backgroundImage: '/images/services/cloud-computing.webp',
  },
  {
    id: '8',
    titre: 'Audit & Conformité',
    slug: 'audit-conformite',
    description: 'Vérification des processus et normes de fonctionnement de votre entreprise.',
    descriptionLong:
      'Vérification approfondie des processus et des normes de fonctionnement de votre entreprise. Nous vous aidons à évaluer, atteindre et maintenir rigoureusement la conformité avec l\'ensemble des standards internationaux.',
    iconeCategorie: 'clock',
    features: [
      'Audit complet des systèmes d\'information (SI)',
      'Mise en conformité ISO (27001, 9001, etc.)',
      'Gestion et mitigation des risques IT',
      'Gouvernance (ITIL, COBIT) et bonnes pratiques',
    ],
    ordre: 8,
    backgroundImage: '/images/services/business-intelligence.webp',
  },
]
