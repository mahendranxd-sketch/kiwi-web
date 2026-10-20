import { useRef, useState, type CSSProperties } from "react"
import { CaptureBar } from "../components/portable/CaptureBar"
import { MagneticButton } from "../components/portable/MagneticButton"
import { Check } from "../components/Check"
import { KiwiMark } from "../components/KiwiMark"
import { KiwiSlice } from "../components/KiwiSlice"
import { useSignup } from "../components/Signup"
import { PROJECTS, projectById, type ProjectId } from "../lib/data"
import type { ParsedThought } from "../lib/parse"
import { prefersReducedMotion, ScrollTrigger, useGsap } from "../lib/motion"
import "./final.css"

const CHAOS = [
  { ch: "c", x: -3, y: 8, r: -9 },
  { ch: "h", x: 2, y: -12, r: 7 },
  { ch: "a", x: -1, y: 6, r: -5 },
  { ch: "o", x: 5, y: -5, r: 12 },
  { ch: "s", x: -2, y: 12, r: -14 },
]

export function FinalCta() {
  const root = useRef<HTMLElement>(null)
  const [tidy, setTidy] = useState(false)
  const [first, setFirst] = useState<(ParsedThought & { done: boolean }) | null>(null)
  const [pulse, setPulse] = useState(0)
  const [hot, setHot] = useState(false)
  const signup = useSignup()

  // Callback to the hero: the letters that fell apart at the top finally line up.
  useGsap(root, () => {
    if (prefersReducedMotion()) {
      setTidy(true)
      return
    }
    ScrollTrigger.create({
      trigger: ".final__title",
      start: "top 70%",
      once: true,
      onEnter: () => setTidy(true),
    })
  })

  const p = first ? projectById(first.project as ProjectId) : undefined

  return (
    <section className="section final" id="get-started" ref={root}>
      <div className="container final__inner">
        <div className="final__mark">
          <KiwiSlice pulse={pulse} hot={hot} pointerScope={root} />
        </div>
        <h2 className="final__title">
          <span className="sr-only">Less chaos. Start with one thought.</span>
          <span aria-hidden="true">
            Less{" "}
            <span className="final__chaos" data-tidy={tidy}>
              {CHAOS.map((c) => (
                <span key={c.ch} style={{ "--x": `${c.x}px`, "--y": `${c.y}px`, "--r": `${c.r}deg` } as CSSProperties}>
                  {c.ch}
                </span>
              ))}
            </span>
            .
            <br />
            <span className="muted">Start with one thought.</span>
          </span>
        </h2>

        <div className="final__try">
          <CaptureBar
            size="lg"
            projects={PROJECTS}
            placeholder="What's the one thing on your mind?"
            hint="Nothing is saved — this is just to feel it."
            onCapture={(t) => {
              setFirst({ ...t, done: false })
              setPulse((n) => n + 1)
            }}
          />
          {first && (
            <div className="final__first" data-done={first.done}>
              <p className="scene__label">Your first task</p>
              <div className="final__task">
                <Check
                  checked={first.done}
                  label={`Mark "${first.title}" as done`}
                  onChange={(v) => {
                    setFirst({ ...first, done: v })
                    if (v) setPulse((n) => n + 1)
                  }}
                />
                <span className="final__task-title">{first.title}</span>
                {first.due && <span className="trow__due">{first.due}</span>}
                <span className="tag">
                  <span className="pdot" style={{ "--c": p?.color } as CSSProperties} />
                  {p?.short ?? "Inbox"}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="final__cta">
          <MagneticButton
            label="Get started with Kiwi"
            href={signup.href}
            onClick={signup.onClick}
            strength={8}
            icon={<KiwiMark size={22} wordmark={false} />}
            onHoverChange={setHot}
            className="final__btn"
          />
          <p className="muted final__reassure">No setup, no templates. Your first thought is the whole onboarding.</p>
        </div>
      </div>
    </section>
  )
}
