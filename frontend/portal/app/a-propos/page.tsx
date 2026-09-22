'use client'

import InnerHero from '@/components/shared/InnerHero'
import CtaSection from '@/components/home/CtaSection'
import ScrollReveal from '@/components/shared/ScrollReveal'

const VALEURS = [
  { icon: 'M2 7l3.5 3.5L12 4', label: 'Backend & architecture', detail: 'Des systèmes propres, scalables et testés.' },
  { icon: 'M7 2l1.2 3.6H12l-3 2.2 1.2 3.6L7 9.2 3.8 11.4 5 7.8 2 5.6h3.8z', label: 'Fintech & conformité', detail: 'Sécurité et rigueur réglementaire.' },
  { icon: 'M5 7l1.5 1.5L9 5', label: 'Build in public', detail: 'Nous documentons et partageons chaque étape.' },
  { icon: 'M7 2v10M2 7h10', label: 'Apprentissage continu', detail: 'Toujours en mouvement, jamais statique.' },
]

const PARCOURS = [
  { titre: "Ingénierie des Systèmes d'Information", detail: "École Supérieure d'Informatique · Ouagadougou", annee: 'Formation' },
  { titre: 'Backend & architecture', detail: 'Microservices, cloud & fintech', annee: 'Expertise' },
  { titre: 'MULTIVERUS', detail: 'Marque de contenu tech & fintech', annee: '2025' },
]

export default function AProposPage() {
  return (
    <>
      <InnerHero
        sup="À propos de"
        titre=""
        titrePart2="MULTIVER-US"
        tagline="Un collectif de développeurs, architectes et créateurs de contenu tech & fintech. Nous construisons, apprenons et partageons — du backend à la fintech."
        bgImage="/images/hero/hero_vision.png"
      />

      {/* Mission */}
      <section className="px-[5%] py-[100px] bg-background relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal/[0.06] blur-[140px] rounded-full pointer-events-none" />
        <div className="max-w-[900px] mx-auto relative z-10">
          <ScrollReveal>
            <div className="inline-block px-4 py-1.5 rounded-full bg-teal/10 border border-teal/20 font-mono text-[11px] font-semibold uppercase tracking-[5px] text-teal mb-6">
              Notre mission
            </div>
            <h2 className="text-[40px] lg:text-[56px] font-black text-foreground leading-[0.95] tracking-[-2px] mb-8">
              Construire, <span className="text-gradient">apprendre</span>, partager.
            </h2>
            <p className="text-[18px] text-muted-2 font-medium leading-[1.8] max-w-[720px] border-l-2 border-teal/30 pl-6">
              MULTIVERUS réunit des ingénieurs passionnés par les systèmes bien faits. Nous concevons des
              backends robustes en microservices, des interfaces soignées, et documentons chaque étape de
              notre parcours — du backend à la fintech, en passant par le contenu tech.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Valeurs */}
      <section className="px-[5%] py-[100px] bg-surface/40 relative overflow-hidden border-y border-white/[0.04]">
        <div className="max-w-[1200px] mx-auto relative z-10">
          <ScrollReveal>
            <div className="inline-block px-4 py-1.5 rounded-full bg-teal/10 border border-teal/20 font-mono text-[11px] font-semibold uppercase tracking-[5px] text-teal mb-4">
              Nos valeurs
            </div>
            <h2 className="text-[40px] lg:text-[52px] font-black text-foreground leading-[0.95] tracking-[-2px] mb-16">
              Ce qui nous <span className="text-gradient">anime</span>
            </h2>
          </ScrollReveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALEURS.map(({ icon, label, detail }, i) => (
              <ScrollReveal key={label} delay={i * 0.08}>
                <div className="glass rounded-3xl p-8 h-full transition-all duration-500 hover:-translate-y-2 hover:border-teal/30 group">
                  <div className="w-12 h-12 rounded-2xl bg-teal/10 grid place-items-center mb-6 group-hover:bg-teal group-hover:scale-110 transition-all">
                    <svg viewBox="0 0 14 14" className="w-5 h-5" fill="none" strokeWidth="2.5">
                      <path d={icon} className="stroke-teal group-hover:stroke-navy transition-colors" />
                    </svg>
                  </div>
                  <div className="text-[16px] font-bold text-foreground leading-tight mb-2">{label}</div>
                  <div className="text-[13px] text-muted-2 leading-relaxed">{detail}</div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Parcours */}
      <section className="px-[5%] py-[100px] bg-background relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-violet/[0.05] blur-[120px] rounded-full pointer-events-none" />
        <div className="max-w-[900px] mx-auto relative z-10">
          <ScrollReveal>
            <div className="inline-block px-4 py-1.5 rounded-full bg-teal/10 border border-teal/20 font-mono text-[11px] font-semibold uppercase tracking-[5px] text-teal mb-4">
              Notre parcours
            </div>
            <h2 className="text-[40px] lg:text-[52px] font-black text-foreground leading-[0.95] tracking-[-2px] mb-16">
              D'où nous <span className="text-gradient">venons</span>
            </h2>
          </ScrollReveal>
          <div className="flex flex-col gap-4">
            {PARCOURS.map(({ titre, detail, annee }, i) => (
              <ScrollReveal key={titre} delay={i * 0.08}>
                <div className="bg-white/[0.03] border border-white/[0.06] hover:border-teal/20 rounded-2xl p-6 flex items-center gap-6 transition-all duration-500 hover:bg-white/[0.05]">
                  <div className="flex-1">
                    <div className="text-[17px] font-bold text-foreground">{titre}</div>
                    <div className="text-[14px] text-muted-2 font-medium mt-1.5">{detail}</div>
                  </div>
                  <div className="font-mono text-[11px] font-semibold text-teal bg-teal/10 px-4 py-2 rounded-xl border border-teal/10">{annee}</div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <CtaSection />
    </>
  )
}
