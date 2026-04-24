import { HeroSection } from './components/HeroSection'
import { SocialProofSection } from './components/SocialProofSection'
import { BenefitsSection } from './components/BenefitsSection'
import { ClientLogosSection } from './components/ClientLogosSection'
import { ProductDetailSection } from './components/ProductDetailSection'
import { TestimonialsSection } from './components/TestimonialsSection'
import { MetricsSection } from './components/MetricsSection'
import { SupportSection } from './components/SupportSection'
import { FooterCTASection } from './components/FooterCTASection'

export function LandingPage() {
  return (
    <>
      <HeroSection />
      <SocialProofSection />
      <BenefitsSection />
      <ClientLogosSection />
      <ProductDetailSection />
      <TestimonialsSection />
      <MetricsSection />
      <SupportSection />
      <FooterCTASection />
    </>
  )
}
