'use client'

import { motion, useInView } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

interface ScrollRevealProps {
  children: React.ReactNode
  delay?: number
  direction?: 'up' | 'left' | 'right' | 'none'
  className?: string
  once?: boolean
}

/** Filet de sécurité : on force l'affichage après ce délai même si
 *  l'IntersectionObserver ne s'est jamais déclenché (mobile, JS lent, observer peu fiable). */
const REVEAL_TIMEOUT_MS = 2000

const directionVariants = {
  up:    { y: 30, opacity: 0 },
  left:  { x: -30, opacity: 0 },
  right: { x: 30, opacity: 0 },
  none:  { opacity: 0 },
}

export default function ScrollReveal({
  children,
  delay = 0,
  direction = 'up',
  className,
  once = true,
}: ScrollRevealProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once, margin: '0px' })
  const [forceVisible, setForceVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setForceVisible(true), REVEAL_TIMEOUT_MS)
    return () => clearTimeout(t)
  }, [])

  const visible = isInView || forceVisible

  return (
    <motion.div
      ref={ref}
      initial={directionVariants[direction]}
      animate={visible ? { x: 0, y: 0, opacity: 1 } : directionVariants[direction]}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
