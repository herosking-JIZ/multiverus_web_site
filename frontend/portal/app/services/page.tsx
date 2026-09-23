'use client'

import React from 'react'

import InnerHero from '@/components/shared/InnerHero'
import CtaSection from '@/components/home/CtaSection'
import ScrollReveal from '@/components/shared/ScrollReveal'
import { SERVICES_FALLBACK } from '@/constants/services.constants'
import { useServices } from '@/hooks/api.hooks'
import Link from 'next/link'
import Image from 'next/image'

const BADGE_STYLE: Record<string, string> = {
  Prioritaire: 'bg-sky/10 text-sky',
  Populaire:   'bg-vivid/8 text-vivid',
  Nouveau:     'bg-vivid/8 text-vivid',
}

export default function ServicesPage() {
  const { data: servicesData } = useServices()
  const displayServices = servicesData && servicesData.length > 0 ? servicesData : SERVICES_FALLBACK
  const [failedImages, setFailedImages] = React.useState<Record<string, boolean>>({})

  return (
    <>
      <InnerHero
        sup="Nos Expertises"
        titre="Des solutions"
        titrePart2="sur mesure"
        tagline="De la cybersécurité à l'ingénierie logicielle, nous vous accompagnons à chaque étape de votre transformation numérique avec rigueur et innovation."
        bgImage="/images/hero/hero_data_center.png"
      />

      <section className="px-[5%] py-[80px] bg-background flex flex-col gap-10">
        {displayServices.map((service, i) => {
          let apiImage = (service as any).image?.url ||
            service.imageUrl ||
            service.backgroundImage ||
            (service as any).image?.cdnUrl ||
            (typeof (service as any).image === 'string' ? (service as any).image : null)

          if (apiImage && typeof apiImage === 'string') {
            apiImage = apiImage.replace(/10\.3\.3\.[0-9]+|100\.119\.90\.39/g, '100.119.90.39')
          }

          const fallbackImage = SERVICES_FALLBACK.find(s => s.slug === service.slug)?.backgroundImage ||
            SERVICES_FALLBACK[i % SERVICES_FALLBACK.length].backgroundImage

          const finalImage = (!failedImages[service.id] && apiImage) ? apiImage : fallbackImage

          return (
            <ScrollReveal key={service.id} delay={i * 0.04}>
              <div
                className="group relative grid grid-cols-1 md:grid-cols-[1fr_1.5fr] gap-0 rounded-[32px] overflow-hidden border border-white/[0.06] bg-surface transition-all duration-700 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.5)] hover:-translate-y-2"
              >
                {/* Visual Side */}
                <div className="relative min-h-[300px] bg-surface/60 overflow-hidden border-r border-white/[0.04] flex items-center justify-center p-12">
                  {/* Background Image Container - Highly Visible */}
                  <div className="absolute inset-0 z-0 transition-transform duration-1000 group-hover:scale-110">
                    {finalImage ? (
                      finalImage.includes('100.119.90.39') ? (
                        <img
                          src={finalImage}
                          alt={service.titre}
                          className="absolute inset-0 w-full h-full object-cover"
                          onError={() => setFailedImages(prev => ({ ...prev, [service.id]: true }))}
                        />
                      ) : (
                        <Image
                          src={finalImage}
                          alt={service.titre}
                          fill
                          priority={i < 2}
                          unoptimized={true}
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 40vw"
                          onError={() => setFailedImages(prev => ({ ...prev, [service.id]: true }))}
                        />
                      )
                    ) : (
                      <div className="absolute inset-0 bg-surface animate-pulse" />
                    )}
                    {/* Overlay for depth and branding */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-navy/80 via-navy/30 to-navy/10" />
                  </div>

                {/* Glass Icon Box (Active on Mobile, Hover on Desktop) */}
                <div className="relative z-10 w-24 h-24 bg-white/20 backdrop-blur-2xl border border-white/40 rounded-[24px] shadow-2xl flex items-center justify-center transition-transform duration-500
                  rotate-[10deg] scale-110 lg:rotate-0 lg:scale-100 lg:group-hover:rotate-[10deg] lg:group-hover:scale-110"
                >
                  <svg viewBox="0 0 20 20" fill="none"
                    stroke="#2DD4BF"
                    strokeWidth="1.5" className="w-10 h-10 drop-shadow-[0_0_8px_rgba(45,212,191,0.4)]"
                  >
                    <ServicePath name={(service as any).iconeCategorie || service.icone} />
                  </svg>
                </div>
              </div>

              {/* Content Side */}
              <div className="p-12 flex flex-col justify-center">
                {(service as any).badge && (
                  <div className="inline-flex items-center gap-2 mb-6">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky animate-ping" />
                    <span className="text-[11px] font-black uppercase tracking-[3px] text-sky">
                      {(service as any).badge}
                    </span>
                  </div>
                )}
                
                <h2
                  className="font-condensed font-black text-[42px] leading-[0.95] tracking-[-2px] text-foreground mb-6 group-hover:text-stroke-sky transition-all duration-500 will-change-transform"
                  style={{ fontFamily: 'var(--font-condensed)' }}
                >
                  {service.titre}
                </h2>
                
                <p className="text-[16px] text-muted-2 font-medium leading-[1.8] mb-8 max-w-[500px]">
                  {(service as any).descriptionLong ?? service.description}
                </p>
                
                <div className="grid grid-cols-2 gap-4 mb-10">
                  {(service as any).features?.slice(0, 4).map((f: string) => (
                    <div key={f} className="flex items-center gap-3 text-[13px] font-bold text-muted-2">
                      <span className="w-1 h-1 rounded-full bg-teal" />
                      {f}
                    </div>
                  ))}
                </div>

                <div className="flex">
                  <Link
                    href={`/services/${service.slug}`}
                    className="bg-gradient-to-br from-teal to-violet hover:brightness-110 text-navy px-10 py-4 rounded-xl text-[15px] font-black uppercase tracking-[2px] transition-all duration-500 shadow-[0_20px_40px_-10px_rgba(45,212,191,0.4)] hover:-translate-y-1 block no-underline"
                  >
                    Explorer l'expertise →
                  </Link>
                </div>
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

function ServicePath({ name }: { name: string }) {
  const paths: Record<string, React.ReactNode> = {
    shield:     <><rect x="3" y="3" width="14" height="14" rx="3" /><path d="M7 10l2 2 4-4" /></>,
    cloud:      <><ellipse cx="10" cy="7" rx="7" ry="4" /><path d="M3 7v6c0 2.2 3.1 4 7 4s7-1.8 7-4V7" /><path d="M3 10c0 2.2 3.1 4 7 4s7-1.8 7-4" /></>,
    chart:      <><polyline points="4,14 8,9 11,12 14,7 17,10" /><rect x="2" y="2" width="16" height="16" rx="2" /></>,
    'bar-chart': <><path d="M16 17H4V3" /><path d="M7 14v-3" /><path d="M10 14V8" /><path d="M13 14V5" /></>,
    code:       <><rect x="2" y="5" width="16" height="10" rx="2" /><path d="M6 9h8M6 12h4" /></>,
    smartphone: <><rect x="5" y="2" width="10" height="16" rx="2" /><path d="M10 15h.01" /></>,
    lightbulb:  <><path d="M10 3a6 6 0 00-6 6c0 2.5 2 4.5 4 5.5v2.5h4v-2.5c2-1 4-3 4-5.5a6 6 0 00-6-6z" /><path d="M8 17h4" /></>,
    grid:       <><rect x="2" y="2" width="7" height="7" rx="1.5" /><rect x="11" y="2" width="7" height="7" rx="1.5" /><rect x="2" y="11" width="7" height="7" rx="1.5" /><rect x="11" y="11" width="7" height="7" rx="1.5" /></>,
    network:    <><circle cx="4" cy="10" r="2" /><circle cx="16" cy="4" r="2" /><circle cx="16" cy="16" r="2" /><path d="M6 10h6l4-6M12 10l4 6" /></>,
    zap:        <><path d="M10 3v14M7 6l3-3 3 3M5 17h10" /></>,
    clock:      <><circle cx="10" cy="10" r="7" /><path d="M10 6v4l3 3" /></>,
  }
  return <>{paths[name] ?? paths.shield}</>
}
