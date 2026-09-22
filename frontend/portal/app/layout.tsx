'use client'

import { Inter, JetBrains_Mono } from 'next/font/google'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/queryClient'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import PageTransition from '@/components/layout/PageTransition'
import DataPreloader from '@/components/layout/DataPreloader'
import { useCsrfToken } from '@/hooks/api.hooks'
import './globals.css'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  display: 'swap',
})

const jbMono = JetBrains_Mono({
  variable: '--font-jbmono',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

function CsrfInitializer() {
  useCsrfToken()
  return null
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="fr"
      data-scroll-behavior="smooth"
      className={`${inter.variable} ${jbMono.variable} h-full antialiased`}
    >
      <head>
        <title>MULTIVERUS — Studio tech & fintech · Développement & Contenu</title>
        <meta
          name="description"
          content="MULTIVERUS — une équipe de développeurs full-stack, architectes backend et créateurs de contenu tech & fintech. Construire, apprendre, partager."
        />
        <meta
          name="keywords"
          content="MULTIVERUS, développeur, backend, fintech, architecture, NestJS, React, Burkina Faso"
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <QueryClientProvider client={queryClient}>
          <DataPreloader />
          <CsrfInitializer />
          <Navbar />
          <main className="flex-1 w-full">
            <PageTransition>
              {children}
            </PageTransition>
          </main>
          <Footer />
        </QueryClientProvider>
      </body>
    </html>
  )
}
