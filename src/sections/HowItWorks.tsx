import { useRef, useState } from "react"
import { ScrollTrigger, useGsap, useMediaQuery } from "../lib/motion"
import { CaptureScene, FocusScene, ShapeScene } from "./how/Scenes"
import "./how.css"

const STEPS = [
  {
    n: "01",
    verb: "Capture",
    title: "Write it the way you think it.",
    body: "Type a thought in plain words. Kiwi picks out the project, the day and how urgent it is — no forms, no fields to fill.",
    try: "Type in the box. Add #ora, a weekday, or ! for priority.",
    Scene: CaptureScene,
  },
  {
    n: "02",
    verb: "Shape",
    title: "Every thought finds its place.",
    body: "Loose captures land in your inbox with a suggested home. One click files them under the right project — you stay in charge.",
    try: "Accept a suggestion and watch it move.",
    Scene: ShapeScene,
  },
  {
    n: "03",
    verb: "Focus",
    title: "Your day, decided in a second.",
    body: "Kiwi weighs deadlines and priority and proposes a short list for today, with an honest estimate of the time it takes.",
    try: "Press “Plan my day”.",
    Scene: FocusScene,
  },
]

export function HowItWorks() {
  const root = useRef<HTMLElement>(null)
  const [active, setActive] = useState(0)
  const desktop = useMediaQuery("(min-width: 1000px)")

  useGsap(
    root,
    () => {
      if (!desktop) return
      const steps = root.current!.querySelectorAll<HTMLElement>(".how__step")
      steps.forEach((step, i) =>
        ScrollTrigger.create({
          trigger: step,
          start: "top 55%",
          end: "bottom 55%",
          onToggle: (self) => self.isActive && setActive(i),
        })
      )
    },
    [desktop]
  )

  return (
    <section className="section how" id="how" ref={root}>
      <div className="container">
        <div className="how__intro">
          <p className="kicker">How Kiwi works</p>
          <h2 className="h2">
            Three moves.
            <br />
            <span className="muted">From thought to plan.</span>
          </h2>
        </div>

        <div className="how__grid">
          <ol className="how__steps">
            {STEPS.map((s, i) => (
              <li key={s.n} className="how__step" data-active={!desktop || active === i}>
                <div className="how__text">
                  <p className="how__n">
                    <span>{s.n}</span> {s.verb}
                  </p>
                  <h3 className="h3">{s.title}</h3>
                  <p className="how__body">{s.body}</p>
                  <p className="how__try">
                    <span aria-hidden="true">↳</span> {s.try}
                  </p>
                </div>
                {!desktop && (
                  <div className="how__inline window">
                    <s.Scene />
                  </div>
                )}
              </li>
            ))}
          </ol>

          {desktop && (
            <div className="how__sticky">
              <div className="how__panel window">
                <div className="window__bar">
                  <span className="window__dots" aria-hidden="true"><span /><span /><span /></span>
                  <span className="window__title">Kiwi — {STEPS[active].verb}</span>
                </div>
                <div className="how__progress" aria-hidden="true">
                  {STEPS.map((s, i) => (
                    <span key={s.n} data-on={i <= active} />
                  ))}
                </div>
                <div className="how__scenes">
                  {STEPS.map((s, i) => (
                    <div
                      key={s.n}
                      className="how__scene"
                      data-state={i === active ? "on" : i < active ? "past" : "next"}
                      aria-hidden={i !== active}
                      inert={i !== active}
                    >
                      <s.Scene />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
