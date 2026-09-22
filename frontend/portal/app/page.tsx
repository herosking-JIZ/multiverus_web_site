import HeroSection from '@/components/home/HeroSection'
import TickerBanner from '@/components/home/TickerBanner'
import ServicesPreview from '@/components/home/ServicesPreview'
import ValuesSection from '@/components/home/ValuesSection'
import ProductsTeaser from '@/components/home/ProductsTeaser'
import CtaSection from '@/components/home/CtaSection'

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <TickerBanner />
      <ServicesPreview />
      <ValuesSection />
      <ProductsTeaser />
      <CtaSection />
    </>
  )
}
