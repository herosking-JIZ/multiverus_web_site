'use client'

import { motion } from 'framer-motion'
import ScrollReveal from '@/components/shared/ScrollReveal'

const PRINCIPES = [
  { icon: 'M2 7l3.5 3.5L12 4', label: 'Backend & architecture', detail: 'Des systèmes propres, scalables et testés.' },
  { icon: 'M7 2l1.2 3.6H12l-3 2.2 1.2 3.6L7 9.2 3.8 11.4 5 7.8 2 5.6h3.8z', label: 'Fintech & conformité', detail: 'Sécurité et rigueur réglementaire.' },
  { icon: 'M5 7l1.5 1.5L9 5', label: 'Build in public', detail: 'Nous documentons et partageons chaque étape.' },
  { icon: 'M7 2v10M2 7h10', label: 'Apprentissage continu', detail: 'Toujours en mouvement, jamais statique.' },
]

const PARCOURS = [
  { tag: '🎓', titre: 'Ingénierie des Systèmes d\'Information', detail: 'École Supérieure d\'Informatique · Ouagadougou', annee: 'Formation' },
  { tag: '🛠', titre: 'Backend & architecture', detail: 'Microservices, cloud & fintech', annee: 'Expertise' },
  { tag: '🌍', titre: 'MULTIVERUS', detail: 'Marque de contenu tech & fintech', annee: '2025' },
]

export default function ValuesSection() {
  return (
    <section className="bg-surface/30 px-[8%] py-[120px] grid grid-cols-1 lg:grid-cols-2 gap-20 items-center relative overflow-hidden border-y border-white/[0.04]">
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[400px] h-[400px] bg-violet/[0.05] rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-[10%] right-0 w-[300px] h-[300px] bg-teal/[0.05] rounded-full blur-[100px] pointer-events-none" />

      {/* Left */}
      <ScrollReveal direction="left">
        <div className="inline-block px-4 py-1.5 rounded-full bg-teal/10 border border-teal/20 font-mono text-[11px] font-semibold uppercase tracking-[5px] text-teal mb-4">
          À propos
        </div>
        <h2 className="text-[38px] lg:text-[46px] font-black text-foreground leading-[1] tracking-[-1px] mb-6">
          L'équipe derrière <span className="text-gradient">MULTIVERUS</span>
        </h2>
        <p className="text-[17px] text-muted-2 font-medium leading-[1.7] mb-10 max-w-[550px] border-l-2 border-teal/30 pl-6">
          Une équipe de développeurs full-stack et architectes backend basée à Ouagadougou,
          issue de l'Ingénierie des Systèmes d'Information. Nous construisons des systèmes
          robustes et partageons notre parcours, du backend à la fintech.
        </p>
        <div className="grid grid-cols-1 gap-4">
          {PRINCIPES.map(({ icon, label, detail }) => (
            <motion.div
              key={label}
              whileHover={{ x: 10, y: -5 }}
              className="flex items-center gap-6 px-7 py-5 glass rounded-[24px] transition-all duration-500 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-teal/10 grid place-items-center flex-shrink-0 group-hover:scale-110 group-hover:bg-teal transition-all">
                <svg viewBox="0 0 14 14" className="w-5 h-5 flex-shrink-0" fill="none" strokeWidth="2.5">
                  <path d={icon} className="stroke-teal group-hover:stroke-navy transition-colors" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="text-[15px] font-bold text-foreground leading-tight">{label}</div>
                <div className="text-[13px] text-muted-2 mt-0.5">{detail}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </ScrollReveal>

      {/* Right — parcours */}
      <ScrollReveal direction="right" delay={0.2}>
        <div className="glass rounded-[40px] p-12 relative overflow-hidden group">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            className="absolute -right-20 -top-20 w-[400px] h-[400px] rounded-full border border-teal/10 border-dashed pointer-events-none"
          />

          <div className="font-mono text-[11px] font-semibold uppercase tracking-[5px] text-teal mb-10 relative z-10">
            Notre parcours
          </div>

          <div className="flex flex-col gap-4 relative z-10">
            {PARCOURS.map(({ tag, titre, detail, annee }) => (
              <div
                key={titre}
                className="bg-white/[0.03] border border-white/[0.06] hover:border-teal/20 rounded-2xl p-6 flex items-center gap-5 transition-all duration-500 hover:bg-white/[0.05]"
              >
                <div className="w-14 h-14 rounded-2xl bg-teal/10 grid place-items-center flex-shrink-0 text-2xl transition-transform">
                  {tag}
                </div>
                <div className="flex-1">
                  <div className="text-[16px] font-bold text-foreground">{titre}</div>
                  <div className="text-[13px] text-muted-2 font-medium mt-1.5">{detail}</div>
                </div>
                <div className="hidden sm:block font-mono text-[11px] font-semibold text-teal bg-teal/10 px-4 py-2 rounded-xl border border-teal/10">{annee}</div>
              </div>
            ))}
          </div>

          <div className="mt-12 pt-10 border-t border-white/[0.06] relative z-10">
            <p className="text-[16px] text-muted-2 font-medium leading-relaxed italic relative">
              <span className="text-teal text-4xl absolute -top-4 -left-6 opacity-20">"</span>
              Construire, apprendre, partager — c'est le moteur de tout ce que nous faisons.
            </p>
          </div>
        </div>
      </ScrollReveal>
    </section>
  )
}
