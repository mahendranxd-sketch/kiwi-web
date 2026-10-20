import { useLayoutEffect, useMemo, useRef, type CSSProperties } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

/**
 * Portable: a working day drawn as a single track. The same amount of
 * work starts as scattered slivers (context switching) and gathers into
 * a few focus blocks. Total work is conserved — only fragmentation changes.
 */

export type FocusBlock = { label: string; color: string; start: number; end: number }

export type FocusDayProps = {
  blocks?: FocusBlock[]
  /** "scroll" scrubs with page scroll, "loop" plays back and forth, "static" shows the focused day */
  mode?: "scroll" | "loop" | "static"
  /** Pieces each block is broken into before it's organized */
  fragments?: number
  dayStart?: number
  dayEnd?: number
  beforeCaption?: string
  afterCaption?: string
  /** Element whose scroll drives the scrub (defaults to the component itself) */
  scrubTrigger?: string | Element | null
  scrubStart?: string
  scrubEnd?: string
  ink?: string
  line?: string
  className?: string
  style?: CSSProperties
}

const DEFAULT_BLOCKS: FocusBlock[] = [
  { label: "Thesis · deep work", color: "#557590", start: 9.5, end: 11.75 },
  { label: "Studio Ora handoff", color: "#b4683f", start: 13, end: 14.5 },
  { label: "Portfolio", color: "#6a9334", start: 15.5, end: 16.5 },
]

const CSS = `
.kw-day{--ink:var(--kw-ink,#171713);--line:var(--kw-line,#e2ddd0);--mut:var(--kw-muted,#6b695f);
  font-family:var(--font,"Geist",system-ui,sans-serif);color:var(--ink);width:100%}
.kw-day__cap{position:relative;height:22px;margin-bottom:14px;font-size:13px;color:var(--mut)}
.kw-day__cap span{position:absolute;left:0;top:0;display:inline-flex;gap:8px;align-items:center;white-space:nowrap}
.kw-day__cap b{font-weight:500;color:var(--ink);font-variant-numeric:tabular-nums}
.kw-day__track{position:relative;height:76px;border-radius:14px;
  background:repeating-linear-gradient(90deg,transparent 0 calc(var(--hour) - 1px),var(--line) calc(var(--hour) - 1px) var(--hour));
  border:1px solid var(--line)}
.kw-day__sliver{position:absolute;top:12px;bottom:12px;border-radius:5px;background:var(--c);will-change:left,width}
.kw-day__block{position:absolute;top:12px;bottom:12px;border-radius:7px;background:var(--c);opacity:0;display:flex;align-items:flex-end;
  padding:0 10px 8px;color:#fff;font-size:12px;font-weight:500;letter-spacing:-.005em;overflow:hidden;white-space:nowrap}
.kw-day__block span{overflow:hidden;text-overflow:ellipsis}
.kw-day__hours{position:relative;height:20px;margin-top:8px;font-family:var(--mono,ui-monospace,monospace);font-size:11px;color:var(--mut)}
.kw-day__hours span{position:absolute;transform:translateX(-50%)}
.kw-day__hours span:first-child{transform:none}
.kw-day__hours span:last-child{transform:translateX(-100%)}
@media (max-width:640px){.kw-day__hours span:nth-child(even){display:none}.kw-day__block{font-size:0}}
`

function injectStyle(id: string, css: string) {
  if (typeof document === "undefined" || document.getElementById(id)) return
  const el = document.createElement("style")
  el.id = id
  el.textContent = css
  document.head.appendChild(el)
}

type Sliver = { color: string; from: [number, number]; to: [number, number] }

/** Deterministic layout: interleave fragments of every block across the day. */
function layout(blocks: FocusBlock[], k: number, d0: number, d1: number): Sliver[] {
  const span = d1 - d0
  const pieces: { b: number; i: number }[] = []
  for (let i = 0; i < k; i++) blocks.forEach((_, b) => pieces.push({ b, i }))
  // a fixed shuffle so it reads as messy but never changes between renders
  for (let j = pieces.length - 1; j > 0; j--) {
    const r = (j * 7 + 3) % (j + 1)
    ;[pieces[j], pieces[r]] = [pieces[r], pieces[j]]
  }
  const lens = pieces.map(({ b }) => (blocks[b].end - blocks[b].start) / k)
  const work = lens.reduce((a, c) => a + c, 0)
  const weights = pieces.map((_, j) => 0.55 + ((j * 13) % 9) / 9)
  weights.push(0.8)
  const wsum = weights.reduce((a, c) => a + c, 0)
  const free = Math.max(0, span - work)
  let x = d0
  return pieces.map(({ b, i }, j) => {
    x += (weights[j] / wsum) * free
    const from: [number, number] = [x, lens[j]]
    x += lens[j]
    const blk = blocks[b]
    const to: [number, number] = [blk.start + i * lens[j], lens[j]]
    return { color: blk.color, from, to }
  })
}

const pct = (h: number, d0: number, span: number) => `${((h - d0) / span) * 100}%`
const pctLen = (len: number, span: number) => `${(len / span) * 100}%`

export function FocusDay({
  blocks = DEFAULT_BLOCKS,
  mode = "scroll",
  fragments = 5,
  dayStart = 9,
  dayEnd = 18,
  beforeCaption = "Context switches",
  afterCaption = "Focus blocks",
  scrubTrigger,
  scrubStart = "top 80%",
  scrubEnd = "center 45%",
  ink,
  line,
  className = "",
  style,
}: FocusDayProps) {
  injectStyle("kw-day-style", CSS)
  const root = useRef<HTMLDivElement>(null)
  const span = dayEnd - dayStart
  const slivers = useMemo(
    () => layout(blocks, Math.max(1, fragments), dayStart, dayEnd),
    [blocks, fragments, dayStart, dayEnd]
  )
  const switches = slivers.length - 1

  useLayoutEffect(() => {
    const el = root.current
    if (!el) return
    const sl = Array.from(el.querySelectorAll<HTMLElement>(".kw-day__sliver"))
    const bl = Array.from(el.querySelectorAll<HTMLElement>(".kw-day__block"))
    const [capBefore, capAfter] = Array.from(el.querySelectorAll<HTMLElement>(".kw-day__cap span"))
    const n = sl.length
    const ease = gsap.parseEase("power2.inOut")
    const clamp = gsap.utils.clamp(0, 1)

    const apply = (p: number) => {
      sl.forEach((node, j) => {
        const s = slivers[j]
        const local = ease(clamp((p - (j / n) * 0.25) / 0.6))
        const left = s.from[0] + (s.to[0] - s.from[0]) * local
        // small gaps while scattered, seamless once gathered
        const gap = (1 - local) * 0.05
        node.style.left = pct(left + gap / 2, dayStart, span)
        node.style.width = pctLen(Math.max(0.02, s.from[1] - gap), span)
      })
      const b = clamp((p - 0.82) / 0.18)
      bl.forEach((node) => (node.style.opacity = String(b)))
      if (capBefore && capAfter) {
        capBefore.style.opacity = String(1 - clamp((p - 0.4) / 0.2))
        capAfter.style.opacity = String(clamp((p - 0.6) / 0.2))
      }
    }

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (mode === "static" || reduced) {
      apply(1)
      return
    }

    const state = { p: 0 }
    apply(0)
    let tween: gsap.core.Tween
    if (mode === "loop") {
      tween = gsap.to(state, {
        p: 1, duration: 2.4, ease: "none", repeat: -1, yoyo: true, repeatDelay: 1.2,
        onUpdate: () => apply(state.p),
      })
    } else {
      tween = gsap.to(state, {
        p: 1,
        ease: "none",
        onUpdate: () => apply(state.p),
        scrollTrigger: {
          trigger: scrubTrigger ?? el,
          start: scrubStart,
          end: scrubEnd,
          scrub: 0.6,
        },
      })
    }
    return () => {
      tween.scrollTrigger?.kill()
      tween.kill()
    }
  }, [slivers, mode, scrubTrigger, scrubStart, scrubEnd, dayStart, span])

  const hours = Array.from({ length: Math.floor(span) + 1 }, (_, i) => dayStart + i)
  const vars = {
    "--hour": `${100 / span}%`,
    ...(ink ? { "--kw-ink": ink } : {}),
    ...(line ? { "--kw-line": line } : {}),
    ...style,
  } as CSSProperties

  return (
    <div ref={root} className={`kw-day ${className}`} style={vars}>
      <div className="kw-day__cap" aria-hidden="true">
        <span>{beforeCaption} <b>{switches}</b></span>
        <span style={{ opacity: 0 }}>{afterCaption} <b>{blocks.length}</b></span>
      </div>
      <div
        className="kw-day__track"
        role="img"
        aria-label={`A working day from ${dayStart}:00 to ${dayEnd}:00. The same work, first split into ${slivers.length} scattered pieces, then gathered into ${blocks.length} focus blocks: ${blocks.map((b) => b.label).join(", ")}.`}
      >
        {slivers.map((s, j) => (
          <i key={j} className="kw-day__sliver" style={{ "--c": s.color } as CSSProperties} />
        ))}
        {blocks.map((b) => (
          <div
            key={b.label}
            className="kw-day__block"
            style={{ "--c": b.color, left: pct(b.start, dayStart, span), width: pctLen(b.end - b.start, span) } as CSSProperties}
          >
            <span>{b.label}</span>
          </div>
        ))}
      </div>
      <div className="kw-day__hours" aria-hidden="true">
        {hours.map((h) => (
          <span key={h} style={{ left: pct(h, dayStart, span) }}>
            {String(h).padStart(2, "0")}:00
          </span>
        ))}
      </div>
    </div>
  )
}

export default FocusDay
