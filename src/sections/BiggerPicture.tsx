import { FocusDay } from "../components/portable/FocusDay"
import { Reveal } from "../components/portable/Reveal"
import "./bigger.css"

const OUTCOMES = [
  { n: "Mornings", t: "Start with the first thing — not with finding it." },
  { n: "Notes", t: "Become next steps instead of a quiet pile of guilt." },
  { n: "Evenings", t: "End knowing exactly what tomorrow starts with." },
]

export function BiggerPicture() {
  return (
    <section className="section bigger" id="outcome">
      <div className="container">
        <div className="bigger__head">
          <Reveal as="h2" className="bigger__title">
            Your day,
            <br />
            with room <em>in it.</em>
          </Reveal>
          <Reveal as="p" className="lead" delay={0.1}>
            When nothing important is hiding, work stops arriving in fragments. Same tasks, fewer switches —
            and space between them to actually think.
          </Reveal>
        </div>

        <div className="bigger__day">
          <FocusDay scrubTrigger=".bigger__day" scrubStart="top 85%" scrubEnd="bottom 40%" />
        </div>

        <Reveal as="ul" className="bigger__outcomes" stagger={0.08}>
          {OUTCOMES.map((o) => (
            <li key={o.n}>
              <span className="bigger__n">{o.n}</span>
              <p>{o.t}</p>
            </li>
          ))}
        </Reveal>
      </div>
    </section>
  )
}
