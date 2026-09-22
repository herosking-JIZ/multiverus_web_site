const TICKER_ITEMS = [
  'Backend & Architecture',
  'Fintech & Conformité',
  'Build in Public',
  'NestJS',
  'React',
  'Keycloak',
  'Prisma',
  'RabbitMQ',
  'PostgreSQL',
  'Parcours Tech en Afrique',
  'Apprendre & Progresser',
  'Ouagadougou',
]

export default function TickerBanner() {
  const doubled = [...TICKER_ITEMS, ...TICKER_ITEMS]

  return (
    <div className="bg-white/[0.02] overflow-hidden py-5 border-y border-white/[0.06]">
      <div
        className="inline-flex whitespace-nowrap"
        style={{ animation: 'tick 20s linear infinite' }}
      >
        {doubled.map((item, i) => (
          <span
            key={i}
            className={`font-mono font-semibold text-[12px] uppercase tracking-[3px] px-10 flex items-center gap-3 ${i % 2 === 0 ? 'text-teal' : 'text-amber'}`}
          >
            {item}
            <span className={`w-1.5 h-1.5 rounded-full ${i % 2 === 0 ? 'bg-teal/30' : 'bg-amber/30'}`} />
          </span>
        ))}
      </div>
    </div>
  )
}
