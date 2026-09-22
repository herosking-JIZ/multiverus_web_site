'use client'

import Link from 'next/link'
import ScrollReveal from '@/components/shared/ScrollReveal'
import { PRODUCTS_FALLBACK } from '@/constants/products.constants'
import { useProduits } from '@/hooks/api.hooks'

export default function ProductsTeaser() {
  const { data: produitsData } = useProduits()
  const displayProducts = (produitsData && (produitsData as any).length > 0) ? produitsData : PRODUCTS_FALLBACK

  return (
    <section className="px-[5%] py-[120px] bg-background overflow-hidden">
      <ScrollReveal className="max-w-[1400px] mx-auto text-center mb-16">
        <div className="inline-block px-4 py-1.5 rounded-full bg-teal/10 border border-teal/20 font-mono text-[12px] font-semibold uppercase tracking-[4px] text-teal mb-6">
          Nos réalisations
        </div>
        <h2 className="text-[45px] lg:text-[64px] font-black text-foreground leading-[0.9] tracking-[-2px] mb-6">
          Projets <span className="text-gradient">construits</span> <br />
          en conditions réelles
        </h2>
        <p className="text-[18px] text-muted-2 font-medium leading-[1.7] max-w-[700px] mx-auto">
          Des systèmes pensés pour la montée en charge, la sécurité et la maintenabilité —
          du backend microservices aux interfaces mobiles.
        </p>
      </ScrollReveal>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-[1200px] mx-auto">
        {displayProducts.map((product, i) => {
          const accent = (product as any).couleurAccent || '#2DD4BF'
          return (
            <ScrollReveal key={product.id} delay={i * 0.1}>
              <div
                className="glass rounded-[32px] p-8 h-full flex flex-col relative overflow-hidden transition-all duration-500 hover:-translate-y-2 group"
                style={{ borderColor: 'rgba(255,255,255,0.08)' }}
              >
                <div
                  className="absolute -top-20 -right-20 w-48 h-48 rounded-full blur-[80px] pointer-events-none opacity-30 group-hover:opacity-50 transition-opacity"
                  style={{ background: accent }}
                />
                <div className="flex items-center justify-between mb-6">
                  <span
                    className="font-mono text-[11px] font-semibold uppercase tracking-[3px] px-3 py-1.5 rounded-lg border"
                    style={{ color: accent, borderColor: `${accent}33`, background: `${accent}14` }}
                  >
                    {(product as any).categorie || 'Projet'}
                  </span>
                  <span className="font-mono text-[12px] text-faint">{String(product.ordre).padStart(2, '0')}</span>
                </div>

                <h3 className="text-[28px] font-black text-foreground mb-3 tracking-tight">{product.nom}</h3>
                <p className="text-[15px] text-muted-2 leading-[1.7] mb-8 flex-1">{product.description}</p>

                <div className="flex flex-wrap gap-2 mb-8">
                  {product.features.map((f) => (
                    <span key={f} className="font-mono text-[11px] text-muted-2 px-3 py-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03]">
                      {f}
                    </span>
                  ))}
                </div>

                <Link
                  href="/produits"
                  className="inline-flex items-center gap-2 text-[14px] font-bold text-teal hover:text-foreground transition-colors group/cta no-underline"
                >
                  En savoir plus
                  <span className="transition-transform group-hover/cta:translate-x-1">→</span>
                </Link>
              </div>
            </ScrollReveal>
          )
        })}
      </div>
    </section>
  )
}
