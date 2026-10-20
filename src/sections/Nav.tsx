import { useEffect, useState } from "react"
import { KiwiMark } from "../components/KiwiMark"
import { MagneticButton } from "../components/portable/MagneticButton"
import { useSignup } from "../components/Signup"
import "./nav.css"

const LINKS = [
  { href: "#problem", label: "Why Kiwi" },
  { href: "#how", label: "How it works" },
  { href: "#product", label: "Product" },
]

export function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const signup = useSignup()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header className="nav" data-scrolled={scrolled}>
      <div className="container nav__inner">
        <a href="#top" className="nav__brand" aria-label="Kiwi — back to top">
          <KiwiMark />
        </a>
        <nav aria-label="Primary" className="nav__links">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="nav__link">
              {l.label}
            </a>
          ))}
        </nav>
        <MagneticButton
          label="Get started"
          href={signup.href}
          onClick={signup.onClick}
          showArrow={false}
          strength={4}
          className="nav__cta"
        />
      </div>
    </header>
  )
}
