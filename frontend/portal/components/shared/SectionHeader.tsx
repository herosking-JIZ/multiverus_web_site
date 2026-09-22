interface SectionHeaderProps {
  sup: string
  titre: string
  titrePart2?: string
  accentWord?: string
  dark?: boolean
}

export default function SectionHeader({ sup, titre, titrePart2, accentWord, dark = false }: SectionHeaderProps) {
  const supColor = 'text-teal'
  const h2Color = dark ? 'text-white' : 'text-foreground'

  const renderTitle = () => {
    if (!accentWord) return titre
    const parts = titre.split(accentWord)
    return (
      <>
        {parts[0]}
        <span className="text-teal">{accentWord}</span>
        {parts[1]}
      </>
    )
  }

  return (
    <div>
      <div className={`font-mono text-[10px] font-semibold uppercase tracking-[3px] mb-2.5 ${supColor}`}>
        {sup}
      </div>
      <h2
        className={`font-black text-[38px] tracking-[-0.5px] leading-[1.05] ${h2Color}`}
      >
        {renderTitle()}
        {titrePart2 && <><br />{titrePart2}</>}
      </h2>
    </div>
  )
}
