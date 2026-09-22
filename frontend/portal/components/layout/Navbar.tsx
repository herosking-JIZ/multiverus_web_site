'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import Image from 'next/image'
import Logo from '@/components/shared/Logo'
import { NAV_LINKS } from '@/constants/nav.constants'

export default function Navbar() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const isContact = pathname.startsWith('/contact')

  useEffect(() => {
    setMounted(true)
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  if (!mounted) return null

  return (
    <>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] as any, delay: 0.1 }}
        className="fixed top-0 left-0 right-0 z-[200] transition-all duration-500 flex items-center justify-center pt-6 md:pt-8 pointer-events-none"
      >
        <div
          className={`
            relative flex items-center justify-between px-5 py-2 rounded-[2.5rem] pointer-events-auto
            transition-all duration-700 border
            ${scrolled
              ? 'glass-dark !bg-navy/70 shadow-[0_20px_50px_rgba(0,0,0,0.5)] h-20 border-white/10 w-[85%] max-w-6xl'
              : 'bg-white/[0.03] backdrop-blur-xl border-white/10 h-24 shadow-sm w-[94%] max-w-7xl'}
          `}
        >
          {/* Architectural Background Elements (Masked) */}
          <div className="absolute inset-0 z-1 pointer-events-none overflow-hidden rounded-[2.5rem]">
            <div className="absolute -top-full -left-1/4 w-full h-[200%] bg-teal/10 blur-[120px] opacity-40 animate-pulse" />
            <div className="absolute -bottom-full -right-1/4 w-full h-[200%] bg-violet/5 blur-[80px] opacity-20" />
            <div className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:32px_32px]" />
          </div>

          <div className="relative z-10 flex items-center justify-between w-full h-full">
            {/* Logo Island */}
            <div className={`flex items-center px-5 transition-all duration-700 bg-white/[0.04] rounded-2xl border border-white/10 shadow-sm backdrop-blur-md ${scrolled ? 'py-1 h-16' : 'py-2 h-20'}`}>
              <Logo />
            </div>

            {/* Desktop Navigation Link Island */}
            <div className="hidden lg:flex gap-1 items-center bg-white/[0.03] backdrop-blur-2xl rounded-2xl p-1 border border-white/10 mx-4 overflow-hidden">
              {NAV_LINKS.map((link) => {
                const isActive =
                  link.href === '/' ? pathname === '/' : pathname.startsWith(link.href)
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`relative text-[13px] tracking-wide font-semibold px-5 py-3 transition-all duration-500 rounded-xl overflow-hidden group/link ${isActive
                      ? 'text-foreground'
                      : 'text-muted-2 hover:text-foreground'
                      }`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-teal/20 to-transparent -translate-x-full group-hover/link:translate-x-full transition-transform duration-1000 ease-in-out" />

                    <span className="relative z-10">{link.label}</span>

                    {isActive && (
                      <motion.div
                        layoutId="nav-active"
                        className="absolute bottom-1.5 left-4 right-4 h-[2px] bg-teal rounded-full shadow-[0_0_12px_rgba(45,212,191,0.8)]"
                      />
                    )}
                  </Link>
                )
              })}
            </div>

            {/* Functional Island (CTA + Mobile) */}
            <div className="flex items-center gap-4">
              <Link
                href="/contact"
                aria-current={isContact ? 'page' : undefined}
                className={`
                  hidden md:flex items-center justify-center text-[12px] uppercase tracking-[2px] font-bold px-8 py-4 rounded-[1.5rem] transition-all duration-500 active:scale-95
                  ${isContact
                    ? 'bg-teal text-navy shadow-[0_10px_35px_-8px_rgba(45,212,191,0.65)]'
                    : 'border border-teal/30 text-teal bg-white/[0.03] backdrop-blur-xl hover:bg-teal/10 hover:border-teal/60'}
                `}
              >
                Discutons
              </Link>

              <button
                onClick={() => setMobileOpen((o) => !o)}
                className="lg:hidden text-foreground p-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 transition-all group/burger"
                aria-label={mobileOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
              >
                {mobileOpen ? <X size={22} /> : <Menu size={22} className="group-hover/burger:scale-110 transition-transform" />}
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-[190] bg-navy/98 backdrop-blur-3xl flex flex-col justify-center items-center gap-12 px-8 md:hidden"
          >
            <div className="absolute inset-0 opacity-[0.04] pointer-events-none flex items-center justify-center overflow-hidden">
              <Image src="/multiverus-mark.svg" alt="" fill className="object-contain scale-[1.3]" />
            </div>

            <div className="relative z-10 flex flex-col gap-6 w-full text-center">
              {NAV_LINKS.map((link, i) => {
                const isActive = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href)
                return (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Link
                      href={link.href}
                      className={`text-3xl font-bold uppercase tracking-tight py-2 block transition-all ${isActive ? 'text-teal scale-110' : 'text-white/40 hover:text-white'
                        }`}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                )
              })}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="relative z-10 w-full"
            >
              {/* <Link
                href="/contact"
                className="bg-teal text-navy text-center py-6 rounded-[2rem] font-bold text-xl shadow-2xl shadow-teal/30 block border border-white/10"
              >
                Contact
              </Link> */}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
