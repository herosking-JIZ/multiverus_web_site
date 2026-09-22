import InnerHero from '@/components/shared/InnerHero'
import ContactForm from '@/components/contact/ContactForm'
import ContactInfo from '@/components/contact/ContactInfo'

export default function ContactPage() {
  return (
    <>
      <InnerHero
        sup="Travaillons ensemble"
        titre="Discutons de"
        titrePart2="votre projet"
        tagline="Backend, architecture, fintech, frontend ou collaboration contenu — décrivez votre besoin et nous revenons vers vous rapidement."
        bgImage="/images/hero/hero_global_connection.png"
      />

      <section className="px-[5%] py-[80px] bg-background grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-16 items-start">
        <ContactInfo />
        <ContactForm />
      </section>
    </>
  )
}
