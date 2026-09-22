'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

/**
 * PageTransition
 * - Maintient l'app shell (Navbar/Footer) stable entre les navigations
 * - Remet le scroll en haut à chaque changement de route (sans remonter tout l'arbre)
 * - Ne force plus un démontage/remontage complet de la page (suppression de l'effet « reset »)
 */
export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior })
  }, [pathname])

  return <div className="w-full min-h-screen">{children}</div>
}
