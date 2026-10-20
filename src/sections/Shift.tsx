import { useRef, useState, type CSSProperties } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { layoutSpring, ScrollTrigger, useGsap } from "../lib/motion"
import { PROJECTS, PRIORITY_LABEL, type Priority, type ProjectId } from "../lib/data"
import "./shift.css"

type Frag = {
  id: string
  source: string
  kind: "mail" | "memo" | "sticky" | "tab" | "note" | "shot" | "msg"
  raw: string
  title: string
  project: ProjectId
  due: string
  priority: Priority
  /** scattered position (% of stage) and tilt */
  x: number
  y: number
  r: number
}

const FRAGS: Frag[] = [
  { id: "f1", kind: "mail", source: "Mail", raw: "re: moodboard?? need it by fri latest", title: "Send Ora the homepage moodboard", project: "ora", due: "Fri", priority: "now", x: 4, y: 8, r: -3 },
  { id: "f2", kind: "memo", source: "Voice memo", raw: "ch3 — start from the interviews", title: "Outline chapter 3 argument", project: "thesis", due: "Today", priority: "now", x: 52, y: 2, r: 2 },
  { id: "f3", kind: "sticky", source: "Sticky note", raw: "hero img on Halden looks dated", title: "Replace hero shot on case study", project: "portfolio", due: "Wed", priority: "soon", x: 70, y: 40, r: 5 },
  { id: "f4", kind: "tab", source: "Browser tab", raw: "Invoice template — Docs", title: "Prepare Ora invoice #014", project: "ora", due: "Fri", priority: "later", x: 10, y: 56, r: 2 },
  { id: "f5", kind: "note", source: "Notes", raw: "ask Dr. Reyes re: methods", title: "Book feedback call with supervisor", project: "thesis", due: "Tomorrow", priority: "soon", x: 36, y: 34, r: -4 },
  { id: "f6", kind: "shot", source: "Screenshots", raw: "Screenshot 23.41 — about page.png", title: "Collect testimonials for About page", project: "portfolio", due: "Thu", priority: "later", x: 44, y: 74, r: -2 },
  { id: "f7", kind: "msg", source: "Messages", raw: "did u read ahmed ch2 yet", title: "Read Ahmed (2019), chapter 2", project: "thesis", due: "Thu", priority: "later", x: 76, y: 80, r: 3 },
]

const ORDER: Record<Priority, number> = { now: 0, soon: 1, later: 2 }
const SOURCES = new Set(FRAGS.map((f) => f.source)).size
const NEXT = [...FRAGS].sort((a, b) => ORDER[a.priority] - ORDER[b.priority] || (a.due === "Today" ? -1 : 1))[0]

/* Crossfade order: the incoming face arrives before the outgoing one leaves, so a card is never blank. */
const fadeIn = (i: number) => ({ duration: 0.24, delay: 0.04 + i * 0.03 })
const fadeOut = (i: number) => ({ duration: 0.12, delay: 0.12 + i * 0.03 })

export function Shift() {
  const root = useRef<HTMLElement>(null)
  const [sorted, setSorted] = useState(false)
  const touched = useRef(false)

  // Sort automatically the first time the stage is centered — unless the visitor already chose.
  useGsap(root, () => {
    ScrollTrigger.create({
      trigger: ".shift__stage",
      start: "center 62%",
      once: true,
      onEnter: () => {
        if (!touched.current) document.querySelector<HTMLButtonElement>("#shift-after")?.click()
      },
    })
  })

  const choose = (next: boolean) => {
    touched.current = true
    setSorted(next)
  }

  return (
    <section className="section shift" id="shift" ref={root}>
      <div className="container">
        <div className="shift__head">
          <div>
            <p className="kicker">The shift</p>
            <h2 className="h2">
              Drop it all in.
              <br />
              <span className="muted">Kiwi sorts it out.</span>
            </h2>
          </div>
          <p className="lead">
            Same seven fragments. Kiwi reads each one, turns it into a task you can act on, and files it under
            the project it belongs to.
          </p>
        </div>

        <div className="shift__panel window">
          <div className="shift__bar">
            <div className="seg" role="group" aria-label="View">
              <button type="button" aria-pressed={!sorted} onClick={() => choose(false)}>
                Before
              </button>
              <button type="button" id="shift-after" aria-pressed={sorted} onClick={() => choose(true)}>
                With Kiwi
              </button>
              <span className="seg__thumb" data-on={sorted} aria-hidden="true" />
            </div>
            <p className="shift__status" aria-live="polite">
              {sorted ? (
                <>
                  <b>{FRAGS.length} tasks</b> · {PROJECTS.length} projects · next up:{" "}
                  <span className="accent">{NEXT.title}</span>
                </>
              ) : (
                <>
                  <b>{FRAGS.length} loose ends</b> across {SOURCES} places · next step unclear
                </>
              )}
            </p>
          </div>

          <div className="shift__stage" data-sorted={sorted}>
            <AnimatePresence initial={false}>
              {sorted &&
                PROJECTS.map((p, gi) => (
                  <motion.div
                    key={p.id}
                    className="sg"
                    style={{ "--col": gi + 1, "--c": p.color } as CSSProperties}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0, transition: { duration: 0.35, delay: 0.3 + gi * 0.06 } }}
                    exit={{ opacity: 0, transition: { duration: 0.12 } }}
                  >
                    <span className="pdot" />
                    {p.name}
                    <span className="sg__n">{FRAGS.filter((f) => f.project === p.id).length}</span>
                  </motion.div>
                ))}
            </AnimatePresence>
            {FRAGS.map((f, i) => {
              const gi = PROJECTS.findIndex((p) => p.id === f.project)
              return (
                <motion.article
                  key={f.id}
                  layout
                  initial={false}
                  animate={{ rotate: sorted ? 0 : f.r }}
                  transition={{ ...layoutSpring, delay: i * 0.03 }}
                  className={`sf sf--${f.kind}`}
                  style={
                    {
                      "--x": `${f.x}%`,
                      "--y": `${f.y}%`,
                      "--mx": i % 2 ? "38%" : "2%",
                      "--my": `${2 + i * 13.6}%`,
                      "--col": gi + 1,
                      "--c": PROJECTS[gi].color,
                      "--order": gi * 10 + ORDER[f.priority] + 1,
                    } as CSSProperties
                  }
                  aria-label={sorted ? `${f.title} — ${f.due}, ${PRIORITY_LABEL[f.priority]}` : `${f.source}: ${f.raw}`}
                >
                  {/* the card morphs while it travels: raw note out, clean task in */}
                  <motion.div
                    layout
                    className="sf__raw"
                    aria-hidden={sorted}
                    initial={false}
                    animate={{ opacity: sorted ? 0 : 1 }}
                    transition={{ ...layoutSpring, opacity: sorted ? fadeOut(i) : fadeIn(i) }}
                  >
                    <span className="sf__src">{f.source}</span>
                    <span className="sf__txt">{f.raw}</span>
                  </motion.div>
                  <motion.div
                    layout
                    className="sf__clean"
                    aria-hidden={!sorted}
                    initial={false}
                    animate={{ opacity: sorted ? 1 : 0 }}
                    transition={{ ...layoutSpring, opacity: sorted ? fadeIn(i) : fadeOut(i) }}
                  >
                    <span className="sf__box" aria-hidden="true" />
                    <span className="sf__text">
                      <span className="sf__title">{f.title}</span>
                      <span className="sf__from">from {f.source}</span>
                    </span>
                    <span className="prio" data-p={f.priority} aria-hidden="true"><i /><i /><i /></span>
                    <span className="sf__due">{f.due}</span>
                  </motion.div>
                </motion.article>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
