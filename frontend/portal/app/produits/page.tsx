'use client'

import InnerHero from '@/components/shared/InnerHero'
import CtaSection from '@/components/home/CtaSection'
import ScrollReveal from '@/components/shared/ScrollReveal'
import { PRODUCTS_FALLBACK } from '@/constants/products.constants'
import { useProduits } from '@/hooks/api.hooks'
import Link from 'next/link'

export default function ProduitsPage() {
  const { data: produitsData } = useProduits()
  const displayProducts = produitsData && produitsData.length > 0 ? produitsData : PRODUCTS_FALLBACK

  return (
    <>
      <InnerHero
        sup="Notre Catalogue"
        titre="Des produits"
        titrePart2="innovants"
        tagline="Découvrez notre gamme de solutions logicielles propriétaires, pensées et développées par nos experts pour répondre aux défis spécifiques de votre secteur."
        bgImage="/images/hero/hero_vision.png"
      />

      <section className="px-[5%] py-[80px] bg-background flex flex-col gap-16">
        {displayProducts.map((product, i) => {
          const reversed = i % 2 !== 0
          const couleurAccent = (product as any).couleurAccent || '#2DD4BF'
          
          return (
            <ScrollReveal key={product.id} delay={0.05}>
              <div
                className={`group relative grid grid-cols-1 lg:grid-cols-[1.2fr_1.5fr] bg-surface rounded-[40px] overflow-hidden border border-white/[0.06] transition-all duration-700 hover:shadow-[0_60px_120px_-20px_rgba(0,0,0,0.5)] hover:-translate-y-3 ${reversed ? 'lg:[&>*:first-child]:order-2 lg:[&>*:last-child]:order-1 px-4 lg:px-0' : ''}`}
              >
                {/* Visual Side - Highly Stylized Mockup */}
                <div className="relative min-h-[500px] bg-surface/60 flex items-center justify-center p-12 lg:p-20 overflow-hidden border-r border-white/[0.04] transition-colors duration-1000 group-hover:bg-surface">
                  {/* Accent Radial Mesh */}
                  <div
                    className="absolute w-[800px] h-[800px] rounded-full pointer-events-none opacity-20 blur-[120px] mix-blend-multiply transition-transform duration-1000 group-hover:scale-125"
                    style={{ background: `radial-gradient(circle, ${couleurAccent} 0%, rgba(255,255,255,0) 70%)` }}
                  />
                  
                  {/* Premium Browser Simulation */}
                  <div className="w-full max-w-[500px] aspect-[4/3] bg-surface border border-white/[0.08] rounded-[32px] shadow-[0_50px_100px_-30px_rgba(0,0,0,0.5)] relative z-10 flex flex-col overflow-hidden transition-all duration-700 group-hover:scale-[1.05] group-hover:-rotate-2">
                    <div className="h-[44px] bg-surface/80 border-b border-white/[0.06] flex items-center px-6 gap-3">
                      {['#ff5f56', '#ffbd2e', '#27c93f'].map((c) => (
                        <span key={c} className="w-3.5 h-3.5 rounded-full opacity-40 group-hover:opacity-100 transition-opacity" style={{ background: c }} />
                      ))}
                    </div>
                    <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-gradient-to-br from-surface to-background/40">
                      <div className="w-24 h-1.5 bg-sky/20 rounded-full mb-10 group-hover:w-32 transition-all duration-700" />
                      <h3
                        className="font-condensed font-black text-[42px] lg:text-[54px] tracking-[1px] uppercase leading-[0.8] mb-6"
                        style={{ fontFamily: 'var(--font-condensed)', color: couleurAccent }}
                      >
                        {product.nom}
                      </h3>
                      <div className="mt-8 flex flex-col gap-3 w-full max-w-[200px] opacity-60">
                        <div className="h-2 bg-white/[0.06] rounded-full w-full" />
                        <div className="h-2 bg-white/[0.06] rounded-full w-4/5" />
                        <div className="h-2 bg-white/[0.06] rounded-full w-3/5" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content Side */}
                <div className="p-12 lg:p-20 flex flex-col justify-center">
                  {(product as any).badge && (
                    <div className="inline-flex items-center gap-2 mb-8 bg-sky/5 px-4 py-1.5 rounded-full border border-sky/10 w-fit shadow-sm">
                      <span className="w-2 h-2 rounded-full bg-teal animate-pulse shadow-[0_0_10px_rgba(45,212,191,1)]" />
                      <span className="text-[12px] font-black uppercase tracking-[4px] text-sky">
                        {(product as any).badge}
                      </span>
                    </div>
                  )}
                  
                  <h2
                    className="font-condensed font-black text-[56px] lg:text-[76px] text-foreground tracking-[-4px] mb-8 leading-[0.82] group-hover:text-stroke-sky transition-all duration-500 will-change-transform drop-shadow-sm"
                    style={{ fontFamily: 'var(--font-condensed)' }}
                  >
                    {product.nom}
                  </h2>
                  
                  <p className="text-[18px] text-muted-2 font-medium leading-[1.6] mb-12 max-w-[500px]">
                    {product.description}
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6 mb-16">
                    {product.features.map((f) => (
                      <div key={f} className="flex items-center gap-4 text-[15px] font-bold text-muted-2 group/feat">
                        <div className="w-6 h-6 rounded-lg bg-teal/10 flex items-center justify-center border border-teal/20 group-hover/feat:bg-teal group-hover/feat:text-navy transition-all duration-300">
                          <svg viewBox="0 0 20 20" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3">
                            <path d="M2 10l5 5 11-10" />
                          </svg>
                        </div>
                        {f}
                      </div>
                    ))}
                  </div>

                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center bg-gradient-to-br from-teal to-violet hover:brightness-110 text-navy px-12 py-5 rounded-2xl font-black text-[16px] uppercase tracking-[2px] no-underline transition-all duration-500 shadow-[0_30px_60px_-15px_rgba(45,212,191,0.4)] hover:-translate-y-2 hover:shadow-[0_40px_80px_-20px_rgba(45,212,191,0.6)]"
                  >
                    Réserver une démonstration →
                  </Link>
                </div>
              </div>
            </ScrollReveal>
          )
        })}
      </section>

      <CtaSection />
    </>
  )
}
