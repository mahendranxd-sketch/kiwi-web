import { useRef, useState, type CSSProperties } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { CaptureBar } from "../components/portable/CaptureBar"
import { MagneticButton } from "../components/portable/MagneticButton"
import { Check } from "../components/Check"
import { useSignup } from "../components/Signup"
import { PROJECTS, projectById, type ProjectId, type Priority } from "../lib/data"
import type { ParsedThought } from "../lib/parse"
import { gsap, layoutSpring, timing, prefersReducedMotion, useGsap } from "../lib/motion"
import "./hero.css"

type Row = { id: string; title: string; project: ProjectId | null; due: string | null; priority: Priority; done: boolean }

const START: Row[] = [
  { id: "h1", title: "Book feedback call with supervisor", project: "thesis", due: "Today", priority: "soon", done: false },
  { id: "h2", title: "Collect testimonials for About page", project: "portfolio", due: "Thu", priority: "later", done: false },
  { id: "h3", title: "Prepare Ora invoice #014", project: "ora", due: "Fri", priority: "later", done: true },
]

const DEMO = [
  "send Ora the moodboard by friday #ora !!",
  "outline chapter 3 tomorrow #thesis",
]

/* Each letter of "chaos" has its own small disorder. */
const CHAOS = [
  { ch: "c", x: -3, y: 8, r: -9 },
  { ch: "h", x: 2, y: -12, r: 7 },
  { ch: "a", x: -1, y: 6, r: -5 },
  { ch: "o", x: 5, y: -5, r: 12 },
  { ch: "s", x: -2, y: 12, r: -14 },
]

export function Hero() {
  const root = useRef<HTMLElement>(null)
  const [rows, setRows] = useState<Row[]>(START)
  const [tidy, setTidy] = useState(true)
  const [hoverTidy, setHoverTidy] = useState(false)
  const signup = useSignup()

  useGsap(root, () => {
    if (prefersReducedMotion()) {
      setTidy(false)
      return
    }
    const tl = gsap.timeline({ defaults: { ease: timing.ease.expo } })
    tl.from(".hero__line > span", { yPercent: 105, duration: 1, stagger: 0.09 })
      .set(".hero__line", { overflow: "visible" })
      .call(() => setTidy(false), [], 0.75)
      .fromTo(".hero__underline path", { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.9, ease: timing.ease.inOut }, 0.85)
      .from(".hero__aside > *", { autoAlpha: 0, y: 14, duration: 0.8, stagger: 0.07, ease: timing.ease.out }, 0.35)
      .from(".hero__app", { autoAlpha: 0, y: 48, scale: 0.985, duration: 1.2 }, 0.45)
  })

  const onCapture = (t: ParsedThought) => {
    const id = `c${Date.now()}`
    setRows((r) =>
      [{ id, title: t.title, project: t.project as ProjectId | null, due: t.due, priority: t.priority, done: false }, ...r].slice(0, 5)
    )
  }

  const open = rows.filter((r) => !r.done).length
  const chaosTidy = tidy || hoverTidy

  return (
    <section className="hero" ref={root} id="top">
      <div className="container">
        <h1 className="hero__title">
          <span className="sr-only">A little less chaos. A lot more clarity.</span>
          <span className="hero__line" aria-hidden="true">
            <span>
              A little less{" "}
              <span className="nowrap">
              <span
                className="hero__chaos"
                data-tidy={chaosTidy}
                onPointerEnter={(e) => e.pointerType === "mouse" && setHoverTidy(true)}
                onPointerLeave={(e) => e.pointerType === "mouse" && setHoverTidy(false)}
                onClick={() => setHoverTidy((v) => !v)}
              >
                {CHAOS.map((c) => (
                  <span key={c.ch} style={{ "--x": `${c.x}px`, "--y": `${c.y}px`, "--r": `${c.r}deg` } as CSSProperties}>
                    {c.ch}
                  </span>
                ))}
              </span>
              .
              </span>
            </span>
          </span>
          <span className="hero__line hero__line--2" aria-hidden="true">
            <span>
              A lot more{" "}
              <span className="hero__clarity nowrap">
                clarity
                <svg className="hero__underline" viewBox="0 0 300 20" preserveAspectRatio="none">
                  <path d="M3 13c60-6 140-9 294-4" pathLength="1" />
                </svg>
              </span>
              .
            </span>
          </span>
        </h1>

        <div className="hero__grid">
          <div className="hero__aside">
            <p className="lead">
              Kiwi turns the notes, ideas and to-dos scattered across your day into one calm plan — so the next
              step is always obvious.
            </p>
            <div className="hero__ctas">
              <MagneticButton label="Get started" href={signup.href} onClick={signup.onClick} />
              <MagneticButton label="See how it works" href="#how" variant="ghost" />
            </div>
            <p className="hero__hint">
              <span aria-hidden="true">↳</span> Try it — type anything into the box. Add <code>#thesis</code>,{" "}
              <code>friday</code> or <code>!</code>
            </p>
          </div>

          <div className="hero__app window">
            <div className="window__bar">
              <span className="window__dots" aria-hidden="true"><span /><span /><span /></span>
              <span className="window__title">Kiwi — Up next</span>
            </div>
            <div className="hero__body">
              <CaptureBar
                projects={PROJECTS}
                autoDemo
                demoPhrases={DEMO}
                demoStartDelay={1400}
                onCapture={onCapture}
                placeholder="Capture a thought…"
              />
              <div className="hero__listhead">
                <span>Up next</span>
                <span className="muted">{open} open</span>
              </div>
              <ul className="hero__list" aria-label="Up next">
                <AnimatePresence initial={false} mode="popLayout">
                {rows.map((r) => {
                  const p = projectById(r.project)
                  return (
                    <motion.li
                      key={r.id}
                      layout
                      transition={layoutSpring}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, transition: { duration: 0.16 } }}
                      className="hrow"
                      data-done={r.done}
                      data-new={r.id.startsWith("c") || undefined}
                    >
                      <div className="hrow__inner">
                        <Check
                          checked={r.done}
                          label={`Mark "${r.title}" as done`}
                          onChange={(v) => setRows((all) => all.map((x) => (x.id === r.id ? { ...x, done: v } : x)))}
                        />
                        <span className="hrow__title">{r.title}</span>
                        <span className="hrow__meta">
                          {r.priority !== "later" && <span className="prio" data-p={r.priority} aria-label={r.priority === "now" ? "Urgent" : "High priority"}><i /><i /><i /></span>}
                          {r.due && <span className="hrow__due">{r.due}</span>}
                          <span className="tag">
                            <span className="pdot" style={{ "--c": p?.color } as CSSProperties} />
                            {p?.short ?? "Inbox"}
                          </span>
                        </span>
                      </div>
                    </motion.li>
                  )
                })}
                </AnimatePresence>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
