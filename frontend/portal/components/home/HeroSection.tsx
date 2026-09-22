'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { CONTACT_INFO } from '@/constants/nav.constants'

const KPIS = [
  { val: 'Full-stack', label: 'Développement & architecture', accent: true },
  { val: '11', label: 'Microservices en production', accent: false },
  { val: '5', label: 'Piliers de contenu MULTIVERUS', accent: false },
]

const STACK = [
  'NestJS', 'React', 'TypeScript', 'Keycloak', 'Prisma',
  'PostgreSQL', 'Redis', 'RabbitMQ', 'Next.js', 'Expo',
]

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-background pt-[150px] pb-20">
      {/* Background */}
      <div className="absolute inset-0 mesh-gradient opacity-60" />
      <div className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:48px_48px]" />
      <div className="absolute -top-40 right-0 w-[600px] h-[600px] bg-teal/10 blur-[160px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-violet/10 blur-[160px] rounded-full pointer-events-none" />

      <div className="relative z-10 w-full px-[6%] grid grid-cols-1 lg:grid-cols-[1.5fr_360px] gap-12 items-center">
        {/* Left column */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center gap-3 glass px-5 py-2.5 rounded-full mb-8"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-teal animate-pulse-led" />
            <span className="font-mono text-[12px] font-semibold text-teal uppercase tracking-[4px]">
              Africa · FinTech
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 1, ease: [0.33, 1, 0.68, 1] }}
            className="text-[56px] lg:text-[92px] font-black leading-[0.88] tracking-[-3px] text-foreground"
          >
            MULTIVER
            <span className="text-gradient text-[56px] lg:text-[92px]">US</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 1, ease: [0.33, 1, 0.68, 1] }}
            className="font-mono text-teal text-[14px] tracking-[4px] uppercase mt-8 mb-6"
          >
            Développement · Architecture · Contenu tech
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 1, ease: [0.33, 1, 0.68, 1] }}
            className="text-[18px] text-muted-2 font-medium leading-[1.7] mb-10 max-w-[560px]"
          >
            Nous concevons des logiciels robustes, des interfaces soignées, et
            partageons notre parcours tech & fintech sur MULTIVERUS — construire, apprendre, partager.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 1, ease: [0.33, 1, 0.68, 1] }}
            className="flex flex-wrap gap-4"
          >
            <Link
              href="/produits"
              className="inline-flex items-center gap-3 bg-gradient-to-br from-teal to-violet text-navy font-bold px-8 py-4 rounded-2xl transition-all duration-300 hover:brightness-110 shadow-[0_20px_40px_-10px_rgba(45,212,191,0.4)] no-underline"
            >
              Voir nos projets
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </Link>
            <a
              href={CONTACT_INFO.youtube}
              target="_blank"
              rel="noopener noreferrer"
              className="glass inline-flex items-center gap-3 text-foreground font-bold px-8 py-4 rounded-2xl transition-all duration-300 hover:bg-white/[0.08] no-underline"
            >
              Découvrir nos contenus
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 1, ease: [0.33, 1, 0.68, 1] }}
            className="mt-12 flex flex-wrap gap-2"
          >
            {STACK.map((s) => (
              <span
                key={s}
                className="font-mono text-[12px] text-muted-2 px-3 py-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03]"
              >
                {s}
              </span>
            ))}
          </motion.div>
        </div>

        {/* Right column — KPI stack */}
        <div className="hidden lg:flex flex-col gap-4">
          {KPIS.map(({ val, label, accent }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.15, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ x: -10, scale: 1.02 }}
              className={`rounded-2xl px-4 py-6 flex items-center justify-between border transition-all duration-300 ${accent
                ? 'bg-teal/10 border-teal/30 shadow-teal/20'
                : 'glass border-white/[0.08]'
                }`}
            >
              <div className={`font-black text-[30px] leading-none tracking-tight ${accent ? 'text-teal' : 'text-foreground'}`}>
                {val}
              </div>
              <div className={`text-[12px] font-semibold text-right max-w-[150px] leading-tight ${accent ? 'text-teal/90' : 'text-muted-2'}`}>
                {label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
