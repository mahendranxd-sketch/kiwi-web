import { Reveal } from "../components/portable/Reveal"
import { PROOF } from "../lib/config"
import "./proof.css"

const DOES = [
  "Keep every loose thought in one place, the moment you have it.",
  "Turn plain sentences into tasks with a project, a day and a priority.",
  "Suggest a short, realistic list for today — and show the time it takes.",
  "Stay out of the way when you just need to write something down.",
]

const DOESNT = [
  "Ask you to design a workflow before you can write a to-do.",
  "Turn your week into a Gantt chart.",
  "Bury today's work under everything else you could be doing.",
  "Pretend a busy list is the same as a clear one.",
]

/**
 * Honest proof. With no verified customers yet, the section explains
 * exactly what Kiwi does. Add entries to PROOF in lib/config.ts and
 * they render here automatically.
 */
export function Proof() {
  const { testimonials, logos } = PROOF
  return (
    <section className="section proof theme-dark" id="proof">
      <div className="container">
        <Reveal className="proof__head" stagger={0.08}>
          <p className="kicker">In plain terms</p>
          <h2 className="h2">
            No borrowed logos.
            <br />
            <span className="muted">Just what Kiwi does — and doesn't.</span>
          </h2>
        </Reveal>

        <div className="proof__grid">
          <Reveal as="div" className="proof__col" stagger={0.06}>
            <h3 className="proof__label">Kiwi will</h3>
            {DOES.map((d) => (
              <p key={d} className="proof__item proof__item--yes">
                <span aria-hidden="true" className="proof__mark">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2.5 6.2 5 8.5l4.5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </span>
                {d}
              </p>
            ))}
          </Reveal>
          <Reveal as="div" className="proof__col" stagger={0.06} delay={0.1}>
            <h3 className="proof__label">Kiwi won't</h3>
            {DOESNT.map((d) => (
              <p key={d} className="proof__item">
                <span aria-hidden="true" className="proof__mark proof__mark--no" />
                {d}
              </p>
            ))}
          </Reveal>
        </div>

        {logos.length > 0 && (
          <ul className="proof__logos" aria-label="Teams using Kiwi">
            {logos.map((l) => (
              <li key={l.name}>
                <img src={l.src} alt={l.name} loading="lazy" height={28} />
              </li>
            ))}
          </ul>
        )}

        {testimonials.length > 0 && (
          <div className="proof__quotes">
            {testimonials.map((t) => (
              <figure key={t.name} className="proof__quote">
                <blockquote>“{t.quote}”</blockquote>
                <figcaption>
                  {t.name} · <span className="muted">{t.role}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
