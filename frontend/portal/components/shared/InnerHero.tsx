'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'

interface InnerHeroProps {
  sup: string
  titre: string
  titrePart2?: string
  tagline: string
  bgImage?: string
}

export default function InnerHero({ sup, titre, titrePart2, tagline, bgImage }: InnerHeroProps) {
  return (
    <section className="bg-background px-[5%] pt-44 pb-24 relative overflow-hidden text-center flex flex-col items-center">
      {/* Background Image Layer */}
      {bgImage && (
        <div className="absolute inset-0 z-0">
          <div
            className="absolute inset-0"
            style={{ animation: 'ken-burns 30s linear infinite alternate', willChange: 'transform' }}
          >
            <Image
              src={bgImage}
              alt=""
              fill
              priority
              unoptimized={true}
              className="object-cover object-center scale-105"
              sizes="100vw"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-navy/85 via-navy/70 to-background" />
        </div>
      )}
      {!bgImage && <div className="absolute inset-0 mesh-gradient opacity-50" />}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-teal/[0.07] blur-[160px] rounded-full pointer-events-none" />

      {/* Content Island */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-20 max-w-[850px] glass-dark rounded-[60px] p-12 lg:p-16 border border-white/10 overflow-hidden"
      >
        <div className="absolute top-0 left-10 right-10 h-[1px] bg-gradient-to-r from-transparent via-teal to-transparent opacity-50" />
        <div className="relative z-10 flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center gap-3 bg-teal/10 border border-teal/20 px-6 py-2.5 rounded-full mb-8"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-teal shadow-[0_0_12px_rgba(45,212,191,0.9)]" />
            <span className="font-mono text-[12px] font-semibold text-teal uppercase tracking-[4px]">
              {sup}
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 1, ease: [0.33, 1, 0.68, 1] }}
            className="text-[54px] lg:text-[88px] font-black leading-[0.85] text-foreground tracking-[-3px] mb-8 mt-2.5"
          >
            <span className="block mb-2">{titre}</span>
            {titrePart2 && (
              <span className="block text-gradient">{titrePart2}</span>
            )}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 1, ease: [0.33, 1, 0.68, 1] }}
            className="text-[19px] font-medium text-muted-2 leading-[1.7] max-w-[700px] mx-auto border-x border-white/[0.08] px-8 pt-4"
          >
            {tagline}
          </motion.p>
        </div>
      </motion.div>
    </section>
  )
}
