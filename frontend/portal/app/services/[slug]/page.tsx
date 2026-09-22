'use client'

import React, { use } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import InnerHero from '@/components/shared/InnerHero'
import CtaSection from '@/components/home/CtaSection'
import { SERVICES_FALLBACK } from '@/constants/services.constants'
import { useServices } from '@/hooks/api.hooks'

interface PageProps {
  params: Promise<{ slug: string }>
}

export default function ServiceDetailPage({ params }: PageProps) {
  const { slug } = use(params)
  const { data: servicesData, isLoading } = useServices()
  
  // Combine API data and fallback for searching
  const displayServices = servicesData && servicesData.length > 0 ? servicesData : SERVICES_FALLBACK
  const apiService = servicesData?.find((s) => s.slug === slug)
  const localFallback = SERVICES_FALLBACK.find((s) => s.slug === slug)
  
  // Merge: Prioritize API data but keep fallback features/descriptionLong if missing
  const service = apiService ? {
    ...apiService,
    features: apiService.features?.length > 0 ? apiService.features : (localFallback?.features || []),
    descriptionLong: (apiService as any).descriptionLong || localFallback?.descriptionLong || apiService.description
  } : localFallback

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-12 h-12 border-4 border-sky/20 border-t-sky rounded-full animate-spin" />
      </div>
    )
  }

  if (!service) notFound()

  const apiImage = (service as any).image?.url ||
    service.imageUrl ||
    service.backgroundImage ||
    (service as any).image?.cdnUrl

  const fallbackImage = SERVICES_FALLBACK.find(s => s.slug === slug)?.backgroundImage ||
    SERVICES_FALLBACK[service.ordre % SERVICES_FALLBACK.length].backgroundImage

  const finalHeroImage = apiImage || fallbackImage

  return (
    <>
      <InnerHero
        sup={`Service · ${service.ordre.toString().padStart(2, '0')}`}
        titre={service.titre}
        tagline={service.descriptionLong ?? service.description}
        bgImage={finalHeroImage}
      />

      <section className="px-[5%] py-[80px] bg-background">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumb - refined */}
          <div className="flex items-center gap-3 text-[13px] font-bold text-faint mb-12">
            <Link href="/services" className="text-teal no-underline hover:text-foreground transition-colors">Expertises</Link>
            <span className="text-faint">/</span>
            <span className="text-faint">{service.titre}</span>
          </div>

          {/* Features grid */}
          <h2 className="font-condensed font-black text-[32px] text-foreground tracking-[-1px] mb-8"
            style={{ fontFamily: 'var(--font-condensed)' }}
          >
            Périmètre d'intervention
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-16">
            {service.features?.map((f) => (
              <div
                key={f}
                className="flex items-start gap-4 p-6 bg-surface rounded-2xl border border-white/[0.06] hover:border-teal/20 hover:shadow-sm transition-all duration-300"
              >
                <div className="w-2.5 h-2.5 rounded-full bg-teal mt-2 flex-shrink-0 shadow-[0_0_8px_rgba(45,212,191,0.3)]" />
                <span className="text-[15px] font-semibold text-muted-2 leading-relaxed">{f}</span>
              </div>
            ))}
          </div>

          {/* CTA inline - Bright & Airy */}
          <div className="bg-surface rounded-[32px] p-12 text-center border-2 border-dashed border-teal/20 shadow-[0_20px_60px_rgba(0,0,0,0.3)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-sky/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-vivid/5 rounded-full blur-3xl pointer-events-none" />
            
            <h3 className="font-condensed font-black text-[34px] text-foreground tracking-[-1px] mb-4 relative z-10"
              style={{ fontFamily: 'var(--font-condensed)' }}
            >
              Prêt à explorer cette solution ?
            </h3>
            <p className="text-[15px] text-muted-2 font-medium mb-8 max-w-md mx-auto relative z-10">
              Nos architectes solutions sont à votre disposition pour prototyper votre futur environnement technologique.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-3 bg-gradient-to-br from-teal to-violet hover:brightness-110 text-navy px-10 py-4 rounded-xl font-black text-[15px] uppercase tracking-[1px] no-underline transition-all duration-500 hover:shadow-[0_20px_40px_-10px_rgba(45,212,191,0.4)] hover:-translate-y-1 relative z-10"
            >
              Lancer une discussion →
            </Link>
          </div>
        </div>
      </section>

      <CtaSection />
    </>
  )
}
