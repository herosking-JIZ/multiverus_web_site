'use client'

import Link from 'next/link'
import ScrollReveal from '@/components/shared/ScrollReveal'
import { SERVICES_FALLBACK } from '@/constants/services.constants'
import { useServices } from '@/hooks/api.hooks'

export default function ServicesPreview() {
  const { data: servicesData } = useServices()
  const displayServices = (servicesData && (servicesData as any).length > 0) ? servicesData : SERVICES_FALLBACK

  return (
    <section className="px-[5%] py-[120px] bg-background relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-violet/[0.06] rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-teal/[0.06] rounded-full blur-[120px] pointer-events-none" />

      <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-16 relative z-10">
        <div>
          <div className="inline-block px-4 py-1.5 rounded-full bg-teal/10 border border-teal/20 font-mono text-[11px] font-semibold uppercase tracking-[4px] text-teal mb-6">
            Nos expertises
          </div>
          <h2 className="text-[45px] lg:text-[72px] font-black text-foreground tracking-[-2.5px] leading-[0.9]">
            Nos <span className="text-gradient">services</span>
          </h2>
        </div>
        <Link href="/services" className="mt-8 md:mt-0 group flex items-center gap-3 text-[14px] font-bold text-muted-2 hover:text-teal no-underline transition-colors">
          <span className="border-b-2 border-teal pb-1">Tout voir en détail</span>
          <span className="w-8 h-8 rounded-full border border-white/[0.1] grid place-items-center group-hover:bg-teal group-hover:text-navy transition-all">→</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
        {displayServices.map((service, i) => (
          <ScrollReveal key={service.id} delay={i * 0.08}>
            <Link
              href={`/services/${service.slug}`}
              className="block glass rounded-3xl p-8 relative overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:border-teal/30 no-underline group h-full flex flex-col"
            >
              <div className="absolute -top-16 -right-16 w-40 h-40 bg-teal/[0.08] rounded-full blur-[60px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-center justify-between mb-6">
                <div className="w-14 h-14 rounded-2xl bg-teal/10 border border-teal/20 grid place-items-center">
                  <ServiceIcon name={(service as any).iconeCategorie || service.icone} />
                </div>
                <span className="font-mono text-[12px] text-faint">{String(service.ordre).padStart(2, '0')}</span>
              </div>
              <h3 className="text-[24px] font-black mb-2 text-foreground leading-tight">{service.titre}</h3>
              <p className="text-[15px] text-muted-2 leading-[1.7] mb-6 flex-1">{service.description}</p>
              <div className="flex flex-wrap gap-2">
                {service.features?.slice(0, 3).map((f) => (
                  <span key={f} className="font-mono text-[11px] text-muted-2 px-3 py-1 rounded-lg border border-white/[0.08] bg-white/[0.03]">{f}</span>
                ))}
              </div>
            </Link>
          </ScrollReveal>
        ))}
      </div>
    </section>
  )
}

function ServiceIcon({ name }: { name: string }) {
  const stroke = '#2DD4BF'
  const icons: Record<string, React.ReactNode> = {
    smartphone: <svg viewBox="0 0 20 20" fill="none" stroke={stroke} strokeWidth="1.5" className="w-6 h-6"><rect x="5" y="2" width="10" height="16" rx="2" /><path d="M10 15h.01" /></svg>,
    lightbulb: <svg viewBox="0 0 20 20" fill="none" stroke={stroke} strokeWidth="1.5" className="w-6 h-6"><path d="M10 3a6 6 0 00-6 6c0 2.5 2 4.5 4 5.5v2.5h4v-2.5c2-1 4-3 4-5.5a6 6 0 00-6-6z" /><path d="M8 17h4" /></svg>,
    'bar-chart': <svg viewBox="0 0 20 20" fill="none" stroke={stroke} strokeWidth="1.5" className="w-6 h-6"><path d="M16 17H4V3" /><path d="M7 14v-3" /><path d="M10 14V8" /><path d="M13 14V5" /></svg>,
    shield: <svg viewBox="0 0 20 20" fill="none" stroke={stroke} strokeWidth="1.5" className="w-6 h-6"><path d="M10 2l7 3v6c0 4-3 6.5-7 8-4-1.5-7-4-7-8V5l7-3z" /><path d="M7.5 10l1.8 1.8 3.2-3.4" /></svg>,
    cloud: <svg viewBox="0 0 20 20" fill="none" stroke={stroke} strokeWidth="1.5" className="w-6 h-6"><ellipse cx="10" cy="7" rx="7" ry="4" /><path d="M3 7v6c0 2.2 3.1 4 7 4s7-1.8 7-4V7" /><path d="M3 10c0 2.2 3.1 4 7 4s7-1.8 7-4" /></svg>,
    chart: <svg viewBox="0 0 20 20" fill="none" stroke={stroke} strokeWidth="1.5" className="w-6 h-6"><polyline points="4,14 8,9 11,12 14,7 17,10" /><rect x="2" y="2" width="16" height="16" rx="2" /></svg>,
    code: <svg viewBox="0 0 20 20" fill="none" stroke={stroke} strokeWidth="1.5" className="w-6 h-6"><rect x="2" y="5" width="16" height="10" rx="2" /><path d="M6 9l2 1-2 1M14 9l-2 1 2 1" /></svg>,
    grid: <svg viewBox="0 0 20 20" fill="none" stroke={stroke} strokeWidth="1.5" className="w-6 h-6"><rect x="2" y="2" width="7" height="7" rx="1.5" /><rect x="11" y="2" width="7" height="7" rx="1.5" /><rect x="2" y="11" width="7" height="7" rx="1.5" /><rect x="11" y="11" width="7" height="7" rx="1.5" /></svg>,
    network: <svg viewBox="0 0 20 20" fill="none" stroke={stroke} strokeWidth="1.5" className="w-6 h-6"><circle cx="4" cy="10" r="2" /><circle cx="16" cy="4" r="2" /><circle cx="16" cy="16" r="2" /><path d="M6 10h6l4-6M12 10l4 6" /></svg>,
    zap: <svg viewBox="0 0 20 20" fill="none" stroke={stroke} strokeWidth="1.5" className="w-6 h-6"><path d="M11 2L4 12h5l-1 6 7-10h-5l1-6z" /></svg>,
    clock: <svg viewBox="0 0 20 20" fill="none" stroke={stroke} strokeWidth="1.5" className="w-6 h-6"><circle cx="10" cy="10" r="7" /><path d="M10 6v4l3 3" /></svg>,
  }
  return <>{icons[name] ?? icons.shield}</>
}
