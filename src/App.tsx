import { useEffect } from "react"
import { MotionConfig } from "framer-motion"
import { SignupProvider } from "./components/Signup"
import { ScrollTrigger } from "./lib/motion"
import { Nav } from "./sections/Nav"
import { Hero } from "./sections/Hero"
import { Problem } from "./sections/Problem"
import { Shift } from "./sections/Shift"
import { HowItWorks } from "./sections/HowItWorks"
import { Showcase } from "./sections/Showcase"
import { Proof } from "./sections/Proof"
import { BiggerPicture } from "./sections/BiggerPicture"
import { FinalCta } from "./sections/FinalCta"
import { Footer } from "./sections/Footer"

export default function App() {
  // Web fonts change line lengths; re-measure scroll positions once they land.
  useEffect(() => {
    document.fonts?.ready.then(() => ScrollTrigger.refresh())
  }, [])

  return (
    <MotionConfig reducedMotion="user">
    <SignupProvider>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <Nav />
      <main id="main">
        {/* scattered thoughts → a moment of clarity → an organized workspace → a more focused day */}
        <Hero />
        <Problem />
        <Shift />
        <HowItWorks />
        <Showcase />
        <Proof />
        <BiggerPicture />
        <FinalCta />
      </main>
      <Footer />
    </SignupProvider>
    </MotionConfig>
  )
}
