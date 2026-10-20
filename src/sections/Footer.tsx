import { KiwiMark } from "../components/KiwiMark"
import { LEGAL_LINKS, SOCIAL_LINKS } from "../lib/config"
import "./footer.css"

const SITE = [
  { href: "#problem", label: "Why Kiwi" },
  { href: "#how", label: "How it works" },
  { href: "#product", label: "Product" },
  { href: "#get-started", label: "Get started" },
]

const LinkOrSoon = ({ label, href }: { label: string; href: string | null }) =>
  href ? (
    <a href={href} className="footer__link">
      {label}
    </a>
  ) : (
    <span className="footer__link footer__link--soon">
      {label} <small>soon</small>
    </span>
  )

export function Footer() {
  return (
    <footer className="footer theme-dark">
      <div className="container">
        <div className="footer__top">
          <div className="footer__brand">
            <KiwiMark size={30} />
            <p className="muted">A little less chaos. A lot more clarity.</p>
          </div>
          <nav className="footer__cols" aria-label="Footer">
            <div>
              <p className="footer__h">Site</p>
              {SITE.map((l) => (
                <LinkOrSoon key={l.href} {...l} />
              ))}
            </div>
            <div>
              <p className="footer__h">Legal</p>
              {LEGAL_LINKS.map((l) => (
                <LinkOrSoon key={l.label} {...l} />
              ))}
            </div>
            <div>
              <p className="footer__h">Social</p>
              {SOCIAL_LINKS.map((l) => (
                <LinkOrSoon key={l.label} {...l} />
              ))}
            </div>
          </nav>
        </div>
        <div className="footer__bottom">
          <span>© {new Date().getFullYear()} Kiwi</span>
          <a href="#top" className="footer__link">
            Back to top ↑
          </a>
        </div>
      </div>
    </footer>
  )
}
