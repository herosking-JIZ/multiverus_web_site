import { CONTACT_INFO } from '@/constants/nav.constants'

export default function ContactInfo() {
  return (
    <div className="flex flex-col gap-10">
      {/* Coordonnées */}
      <div className="glass rounded-[32px] p-10 transition-all duration-500 group">
        <h3 className="text-[17px] font-bold text-foreground mb-8 flex items-center gap-4">
          <div className="w-12 h-12 bg-teal/10 rounded-xl grid place-items-center text-teal group-hover:bg-teal group-hover:text-navy transition-colors duration-500">
            <svg viewBox="0 0 24 24" className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
          </div>
          Coordonnées
        </h3>
        <div className="flex flex-col gap-5">
          {[
            { label: 'Email', value: CONTACT_INFO.email, highlight: true },
            { label: 'Ville', value: CONTACT_INFO.address },
          ].map(({ label, value, highlight }) => (
            <div key={label} className="flex items-start gap-5 text-[15px] text-muted-2 leading-relaxed">
              <strong className="text-foreground w-[100px] flex-shrink-0 font-bold uppercase text-[11px] tracking-[1px] mt-1">{label}</strong>
              <span className={highlight ? 'text-teal font-bold break-all' : 'font-medium'}>
                {value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Réseaux */}
      <div className="glass rounded-[32px] p-10 transition-all duration-500 group">
        <h3 className="text-[17px] font-bold text-foreground mb-8 flex items-center gap-4">
          <div className="w-12 h-12 bg-teal/10 rounded-xl grid place-items-center text-teal group-hover:bg-teal group-hover:text-navy transition-colors duration-500">
            <svg viewBox="0 0 24 24" className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M2 12h20M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20z" />
            </svg>
          </div>
          Réseaux
        </h3>
        <div className="flex flex-col gap-3">
          {[
            { label: 'YouTube', value: CONTACT_INFO.youtube },
          ].map(({ label, value }) => (
            <a
              key={label}
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-sm text-muted-2 hover:text-teal transition-colors no-underline"
            >
              <strong className="text-foreground w-[80px] flex-shrink-0">{label}</strong>
              <span className="truncate">{value.replace('https://', '')}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
