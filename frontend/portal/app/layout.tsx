'use client'

import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/queryClient'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import PageTransition from '@/components/layout/PageTransition'
import DataPreloader from '@/components/layout/DataPreloader'
import { useCsrfToken } from '@/hooks/api.hooks'
import './globals.css'

function CsrfInitializer() {
  useCsrfToken()
  return null
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="fr"
      data-scroll-behavior="smooth"
      className="h-full antialiased font-sans"
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
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
