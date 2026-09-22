import type { TopPage } from '@/types/analytics.types'

interface TopPagesTableProps {
  data?: TopPage[]
}

export default function TopPagesTable({ data }: TopPagesTableProps) {
  const pages = data ?? []

  if (pages.length === 0) {
    return <div className="py-12 text-center text-[13px] text-navy/30 font-bold">Aucune donnée disponible.</div>
  }

  const maxViews = Math.max(...pages.map((p) => p.views), 1)

  return (
    <div className="w-full">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-navy/5">
            {['Page', 'Vues', ''].map((h) => (
              <th key={h} className="text-[11px] font-black text-navy/40 uppercase tracking-[0.1em] px-2 py-4">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-navy/5">
          {pages.map(({ path, views }) => (
            <tr key={path} className="group hover:bg-white/50 transition-colors duration-150">
              <td className="py-4 px-2 text-[13px] font-bold text-navy group-hover:text-vivid transition-colors">{path}</td>
              <td className="py-4 px-2 text-[13px] font-mono text-navy/60">{views.toLocaleString('fr-FR')}</td>
              <td className="py-4 px-2 w-24">
                <div className="w-full h-2 rounded-full bg-navy/5 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-vivid transition-all"
                    style={{ width: `${(views / maxViews) * 100}%` }}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
