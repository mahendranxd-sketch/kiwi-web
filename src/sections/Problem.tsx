import { useEffect, useId, useRef, useState, type ReactNode } from "react"
import { gsap, prefersReducedMotion, useGsap } from "../lib/motion"
import "./problem.css"

type Place = { key: string; label: string; preview: ReactNode }

const PLACES: Record<string, Place> = {
  tabs: {
    key: "tabs",
    label: "fourteen open tabs",
    preview: (
      <span className="pv pv--tabs">
        {["Halden case study – Figma", "Invoice template", "Ahmed (2019) – ch. 2", "Inbox (38)", "…"].map((t, i) => (
          <span key={t} data-active={i === 2}>{t}</span>
        ))}
      </span>
    ),
  },
  sticky: {
    key: "sticky",
    label: "a sticky on your monitor",
    preview: (
      <span className="pv pv--sticky">
        hero img on Halden
        <br />
        looks dated??
      </span>
    ),
  },
  memo: {
    key: "memo",
    label: "a voice memo you never replayed",
    preview: (
      <span className="pv pv--memo">
        <span className="pv__play" aria-hidden="true">▶</span>
        <span className="pv__wave" aria-hidden="true">
          {Array.from({ length: 22 }, (_, i) => (
            <i key={i} style={{ height: `${30 + ((i * 47) % 70)}%` }} />
          ))}
        </span>
        <span className="pv__time">0:47</span>
        <span className="pv__cap">“ch3 — start from the interviews, not the theory”</span>
      </span>
    ),
  },
  thread: {
    key: "thread",
    label: "an email thread",
    preview: (
      <span className="pv pv--mail">
        <span className="pv__from">Mira · Studio Ora</span>
        <span className="pv__subj">re: re: homepage</span>
        <span className="pv__body">…also the moodboard?? need it by <mark>fri</mark> latest</span>
      </span>
    ),
  },
  file: {
    key: "file",
    label: "final_v3_REAL.pdf",
    preview: (
      <span className="pv pv--file">
        <span className="pv__doc" aria-hidden="true" />
        <span>
          final_v3_REAL.pdf
          <small>Downloads · 2.4 MB · 3 weeks ago</small>
        </span>
      </span>
    ),
  },
}

function Fragment({ place }: { place: Place }) {
  const [open, setOpen] = useState(false)
  const id = useId()
  const ref = useRef<HTMLSpanElement>(null)
  const pointer = useRef("")

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false)
    const onDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    window.addEventListener("keydown", onKey)
    window.addEventListener("pointerdown", onDown)
    return () => {
      window.removeEventListener("keydown", onKey)
      window.removeEventListener("pointerdown", onDown)
    }
  }, [open])

  return (
    <span
      ref={ref}
      className="frag"
      data-open={open}
      onPointerEnter={(e) => e.pointerType === "mouse" && setOpen(true)}
      onPointerLeave={(e) => e.pointerType === "mouse" && setOpen(false)}
    >
      {/* A span (not <button>) so the phrase can wrap across lines like the text around it */}
      <span
        role="button"
        tabIndex={0}
        className="frag__btn w"
        aria-expanded={open}
        aria-describedby={open ? id : undefined}
        onPointerDown={(e) => (pointer.current = e.pointerType)}
        // a mouse already opened it on hover, so a click shouldn't close it again
        onClick={() => setOpen((o) => (pointer.current === "mouse" ? true : !o))}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            setOpen((o) => !o)
          }
        }}
        onBlur={() => setOpen(false)}
      >
        {place.label}
      </span>
      <span role="tooltip" id={id} className="frag__pop" aria-hidden={!open}>
        {place.preview}
      </span>
    </span>
  )
}

/** Splits plain text into word spans for the scroll "ink" reveal. */
const W = ({ children }: { children: string }) => (
  <>
    {children.split(/(\s+)/).map((w, i) => (w.trim() ? <span key={i} className="w">{w}</span> : w))}
  </>
)

export function Problem() {
  const root = useRef<HTMLElement>(null)

  useGsap(root, () => {
    if (prefersReducedMotion()) return
    gsap.fromTo(
      ".problem__story .w",
      { opacity: 0.16 },
      {
        opacity: 1,
        ease: "none",
        stagger: 0.1,
        scrollTrigger: { trigger: ".problem__story", start: "top 78%", end: "bottom 52%", scrub: 0.4 },
      }
    )
  })

  return (
    <section className="section problem" id="problem" ref={root}>
      <div className="container">
        <p className="kicker">Right now</p>
        <p className="problem__story">
          <W>Your plan isn't missing. It's in a note from Tuesday,</W> <Fragment place={PLACES.tabs} />
          <W>,</W> <Fragment place={PLACES.sticky} /><W>,</W> <Fragment place={PLACES.memo} />
          <W>, the real deadline buried in</W> <Fragment place={PLACES.thread} />
          <W>, and a file called</W> <Fragment place={PLACES.file} />
          <W>.</W>
        </p>
        <div className="problem__coda">
          <p className="h3">
            So every morning starts with the same question: <span className="accent">where was I?</span>
          </p>
          <p className="muted problem__note">
            Hover or tap the highlighted places — each one is a real-looking fragment of a plan that already
            exists, just not anywhere you'd look first.
          </p>
        </div>
      </div>
    </section>
  )
}
