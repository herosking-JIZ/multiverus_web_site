'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { CONTACT_INFO } from '@/constants/nav.constants'
import ScrollReveal from '@/components/shared/ScrollReveal'

export default function CtaSection() {
  return (
    <section className="bg-background px-[5%] py-24">
      <div className="relative rounded-[48px] overflow-hidden bg-surface/60 border border-white/[0.06]">
        {/* Background Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[20%] -right-[10%] w-[60%] h-[80%] rounded-full bg-teal/[0.07] blur-[120px] animate-pulse-ring" />
          <div className="absolute -bottom-[20%] -left-[10%] w-[50%] h-[70%] rounded-full bg-violet/[0.07] blur-[100px] animate-pulse-ring2" />
          <div className="absolute inset-0 opacity-[0.4]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.06) 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        </div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 px-10 py-20 lg:p-24 items-center">
          {/* Left Content */}
          <ScrollReveal direction="left">
            <div className="inline-block px-4 py-1.5 rounded-full bg-teal/10 border border-teal/20 text-[12px] font-bold uppercase tracking-[4px] text-teal mb-8">
              Prêt pour la suite ?
            </div>
            <h2 className="text-[52px] lg:text-[82px] font-black text-foreground leading-[0.85] tracking-[-3.5px] mb-10">
              Travaillons <br />
              <span className="text-gradient">ensemble</span> sur un <br />
              projet.
            </h2>
            <p className="text-[18px] text-muted-2 font-medium leading-[1.7] mb-12 max-w-[480px] border-l-2 border-teal/30 pl-6">
              Backend, architecture, fintech ou contenu tech — discutons de votre projet ou de
              votre idée. Nous répondons rapidement.
            </p>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link
                href="/contact"
                className="relative group inline-flex items-center gap-6 bg-gradient-to-br from-teal to-violet text-navy px-14 py-6 rounded-2xl text-[19px] font-bold no-underline transition-all duration-500 shadow-[0_30px_60px_-15px_rgba(45,212,191,0.4)]"
              >
                <span className="relative z-10">Nous contacter</span>
                <span className="relative z-10 w-10 h-10 rounded-full bg-navy/10 text-navy grid place-items-center text-lg transition-all duration-500 group-hover:translate-x-2">
                  →
                </span>
              </Link>
            </motion.div>
          </ScrollReveal>

          {/* Right Cards */}
          <ScrollReveal direction="right" delay={0.2}>
            <div className="grid grid-cols-1 gap-5">
              {[
                { label: 'Email', value: CONTACT_INFO.email, tag: '✉' },
                { label: 'Ville', value: CONTACT_INFO.address, tag: '⌖' },
                { label: 'YouTube', value: '@multiverus', tag: '◎' },
              ].map(({ label, value, tag }) => (
                <motion.div
                  key={label}
                  whileHover={{ x: -12 }}
                  className="glass rounded-3xl p-7 flex items-center gap-6 transition-all duration-500 group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-teal/10 grid place-items-center text-teal text-xl group-hover:scale-110 transition-all duration-500">
                    {tag}
                  </div>
                  <div className="flex-1">
                    <div className="font-mono text-[11px] font-semibold uppercase tracking-[3px] text-muted-2 mb-1 group-hover:text-teal transition-colors">{label}</div>
                    <div className="text-[17px] font-bold text-foreground group-hover:text-teal transition-colors break-all">{value}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </ScrollReveal>
        </div>

        {/* Bottom accent line */}
        <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-teal via-violet to-teal opacity-40" />
      </div>
    </section>
  )
}
