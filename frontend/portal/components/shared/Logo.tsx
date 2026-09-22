'use client'

import Link from 'next/link'
import Image from 'next/image'

interface LogoProps {
  footer?: boolean
  className?: string
}

export default function Logo({ footer = false, className = '' }: LogoProps) {
  return (
    <Link
      href="/"
      className={`group relative h-full inline-flex items-center no-underline transition-all duration-500 hover:opacity-90 active:scale-95 ${className}`}
    >
      <div
        className={`relative h-full w-auto aspect-[26/9] ${footer ? 'opacity-80' : ''}`}
      >
        <Image
          src="/multiverus-horizontal.svg"
          alt="MULTIVERUS"
          fill
          className="object-contain transition-transform duration-700"
          priority
          sizes="(max-width: 768px) 240px, 380px"
        />
      </div>
    </Link>
  )
}
