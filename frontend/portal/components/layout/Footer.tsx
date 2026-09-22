'use client'

import { motion, useInView } from 'framer-motion'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import Logo from '@/components/shared/Logo'
import { CONTACT_INFO, NAV_LINKS } from '@/constants/nav.constants'

/** Filet de sécurité : on force l'affichage après ce délai même si
 *  l'IntersectionObserver ne s'est jamais déclenché (mobile, JS lent, observer peu fiable). */
const REVEAL_TIMEOUT_MS = 2000

const FOOTER_SERVICES = [
  'Backend & Architecture',
  'Fintech & Conformité',
  'Frontend & Mobile',
  'Cloud & DevOps',
]

const SOCIALS = [
  {
    label: 'YouTube',
    href: CONTACT_INFO.youtube,
    path: 'M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z',
    extra: <path d="M9.75 15.02V8.48l5.5 3.27-5.5 3.27z" />,
  },
]

export default function Footer() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  const [forceVisible, setForceVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setForceVisible(true), REVEAL_TIMEOUT_MS)
    return () => clearTimeout(t)
  }, [])

  const show = isInView || forceVisible

  const containerVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 1.2,
        staggerChildren: 0.1,
        ease: [0.16, 1, 0.3, 1] as any
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  }

  return (
    <footer className="bg-surface/40 pt-20 border-t border-white/[0.06] relative overflow-hidden">
      <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        animate={show ? { scaleX: 1, opacity: 1 } : { scaleX: 0, opacity: 0 }}
        transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
        className="absolute top-0 left-0 w-full h-px origin-center"
        style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(45,212,191,0.8) 50%, transparent 100%)' }}
      />

      <div className="px-[5%]" ref={ref}>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={show ? 'visible' : 'hidden'}
          className="grid grid-cols-1 lg:grid-cols-[1.2fr_2fr] gap-[60px] pb-[60px]"
        >
          {/* Brand column */}
          <motion.div variants={itemVariants} className="flex flex-col">
            <div className="mb-6 h-16"><Logo footer /></div>
            <p className="text-sm text-muted-2 leading-[1.7] font-light max-w-[380px] mb-8">
              MULTIVERUS — une équipe de développeurs full-stack, architectes backend et
              créateurs de contenu tech & fintech. Construire, apprendre, partager.
            </p>
            <div className="flex gap-4">
              {SOCIALS.map(({ label, href, path, extra }) => (
                <motion.a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  whileHover={{ y: -5, backgroundColor: 'rgba(45,212,191,0.15)', borderColor: 'rgba(45,212,191,0.5)' }}
                  className="grid place-items-center w-10 h-10 rounded-full bg-white/[0.04] border border-white/[0.08] transition-all duration-300 group"
                >
                  <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] fill-muted-2 group-hover:fill-teal transition-colors">
                    <path d={path} />{extra}
                  </svg>
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Links columns */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
            {/* Services */}
            <motion.div variants={itemVariants}>
              <h4 className="font-mono font-semibold text-[13px] uppercase tracking-[3px] text-foreground mb-8 relative inline-block after:content-[''] after:absolute after:bottom-[-8px] after:left-0 after:w-8 after:h-0.5 after:bg-teal after:rounded-full">
                Services
              </h4>
              <div className="flex flex-col gap-3">
                {FOOTER_SERVICES.map((s) => (
                  <Link
                    key={s}
                    href="/services"
                    className="text-sm text-muted-2 hover:text-teal hover:translate-x-1 transition-all duration-200 no-underline"
                  >
                    {s}
                  </Link>
                ))}
              </div>
            </motion.div>

            {/* Navigation */}
            <motion.div variants={itemVariants}>
              <h4 className="font-mono font-semibold text-[13px] uppercase tracking-[3px] text-foreground mb-8 relative inline-block after:content-[''] after:absolute after:bottom-[-8px] after:left-0 after:w-8 after:h-0.5 after:bg-teal after:rounded-full">
                Navigation
              </h4>
              <div className="flex flex-col gap-3">
                {NAV_LINKS.map(({ label, href }) => (
                  <Link
                    key={href}
                    href={href}
                    className="text-sm text-muted-2 hover:text-teal hover:translate-x-1 transition-all duration-200 no-underline"
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </motion.div>

            {/* Contact */}
            <motion.div variants={itemVariants}>
              <h4 className="font-mono font-semibold text-[13px] uppercase tracking-[3px] text-foreground mb-8 relative inline-block after:content-[''] after:absolute after:bottom-[-8px] after:left-0 after:w-8 after:h-0.5 after:bg-teal after:rounded-full">
                Contact
              </h4>
              <div className="flex flex-col gap-3">
                {[
                  { label: 'Email', value: CONTACT_INFO.email },
                  { label: 'Ville', value: CONTACT_INFO.address },
                ].map(({ label, value }) => (
                  <p key={label} className="text-sm text-muted-2 font-light">
                    <span className="text-faint font-medium mr-1.5 inline-block w-12">{label}:</span>
                    {value}
                  </p>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Bottom bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={show ? { opacity: 1 } : { opacity: 0 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="py-6 border-t border-white/[0.06] flex flex-col sm:flex-row justify-between items-center gap-4"
        >
          <span className="text-[13px] text-faint font-light">
            © 2026 MULTIVERUS — Tous droits réservés.
          </span>
          <div className="flex gap-6 font-mono text-[11px] uppercase tracking-wider">
            <span className="text-faint">Innov · Fintech · Afrique</span>
          </div>
        </motion.div>
      </div>
    </footer>
  )
}
