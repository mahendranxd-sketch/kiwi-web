import { useEffect, useMemo, useRef, useState, type CSSProperties, type FormEvent } from "react"
import { parseThought, type ParseProject, type ParsedThought } from "../../lib/parse"

/**
 * Portable: the only dependency is lib/parse.ts (copy both into Framer).
 * Type a thought; Kiwi reads #project, a day, and ! priority as you type.
 */

export type CaptureBarProps = {
  placeholder?: string
  projects?: ParseProject[]
  /** Phrases typed automatically once the bar scrolls into view. Stops as soon as the visitor interacts. */
  demoPhrases?: string[]
  autoDemo?: boolean
  demoStartDelay?: number
  submitLabel?: string
  hint?: string
  size?: "md" | "lg"
  ink?: string
  accent?: string
  surface?: string
  onCapture?: (thought: ParsedThought, raw: string) => void
  className?: string
  style?: CSSProperties
}

const CSS = `
.kw-cap{--ink:var(--kw-ink,#171713);--acc:var(--kw-accent,#6a9334);--surf:var(--kw-surface,#fcfbf7);
  --line:var(--kw-line,#e2ddd0);--mut:var(--kw-muted,#6b695f);font-family:var(--font,"Geist",system-ui,sans-serif);color:var(--ink);width:100%}
.kw-cap__field{display:flex;align-items:center;gap:12px;height:56px;padding:0 8px 0 16px;background:var(--surf);
  border:1px solid var(--line);border-radius:14px;transition:border-color .2s,box-shadow .2s;position:relative}
.kw-cap--lg .kw-cap__field{height:64px;border-radius:16px;padding-left:20px}
.kw-cap__field:focus-within{border-color:color-mix(in srgb,var(--acc) 70%,var(--line));box-shadow:0 0 0 4px color-mix(in srgb,var(--acc) 14%,transparent)}
.kw-cap__field.is-sent{animation:kw-cap-sent .6s cubic-bezier(.22,1,.36,1)}
@keyframes kw-cap-sent{0%{box-shadow:0 0 0 0 color-mix(in srgb,var(--acc) 40%,transparent)}100%{box-shadow:0 0 0 10px transparent}}
.kw-cap__seed{flex:none;width:18px;height:18px;border-radius:50%;background:var(--acc);position:relative}
.kw-cap__seed::after{content:"";position:absolute;inset:5px;border-radius:50%;background:var(--surf)}
.kw-cap--typing .kw-cap__seed{animation:kw-cap-pulse 1s ease-in-out infinite}
@keyframes kw-cap-pulse{50%{transform:scale(.82)}}
.kw-cap__input{flex:1;min-width:0;height:100%;border:0;outline:0;background:transparent;font:inherit;font-size:16px;letter-spacing:-.01em;color:var(--ink)}
.kw-cap--lg .kw-cap__input{font-size:18px}
.kw-cap__input::placeholder{color:var(--mut);opacity:.8}
.kw-cap__go{flex:none;display:grid;place-items:center;width:40px;height:40px;border-radius:10px;border:0;cursor:pointer;
  background:color-mix(in srgb,var(--ink) 6%,transparent);color:var(--mut);transition:background-color .2s,color .2s,transform .18s}
.kw-cap--lg .kw-cap__go{width:46px;height:46px;border-radius:12px}
.kw-cap--ready .kw-cap__go{background:var(--ink);color:var(--surf)}
.kw-cap__go:active{transform:scale(.94)}
.kw-cap__go:focus-visible{outline:2px solid var(--acc);outline-offset:2px}
.kw-cap__meta{min-height:30px;margin-top:10px;display:flex;flex-wrap:wrap;align-items:center;gap:6px;font-size:13px;color:var(--mut)}
.kw-cap__chip{display:inline-flex;align-items:center;gap:6px;height:26px;padding:0 10px;border-radius:999px;background:var(--surf);
  border:1px solid var(--line);color:var(--ink);font-size:12.5px;white-space:nowrap;animation:kw-cap-chip .34s cubic-bezier(.22,1,.36,1) both}
.kw-cap__chip i{width:7px;height:7px;border-radius:50%;background:var(--c,var(--acc))}
.kw-cap__chip svg{color:var(--mut)}
@keyframes kw-cap-chip{from{opacity:0;transform:translateY(4px) scale(.96)}}
.kw-cap__hint code{font-family:var(--mono,ui-monospace,monospace);font-size:12px;padding:1px 5px;border-radius:5px;background:color-mix(in srgb,var(--ink) 5%,transparent);color:var(--ink)}
.kw-cap__done{display:inline-flex;align-items:center;gap:6px;color:var(--ink);animation:kw-cap-chip .34s cubic-bezier(.22,1,.36,1) both}
.kw-cap__done b{display:grid;place-items:center;width:16px;height:16px;border-radius:50%;background:var(--acc);color:var(--surf)}
@media (prefers-reduced-motion:reduce){.kw-cap__chip,.kw-cap__done,.kw-cap__field.is-sent,.kw-cap--typing .kw-cap__seed{animation:none}}
`

function injectStyle(id: string, css: string) {
  if (typeof document === "undefined" || document.getElementById(id)) return
  const el = document.createElement("style")
  el.id = id
  el.textContent = css
  document.head.appendChild(el)
}

const CalendarIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
    <rect x="1.5" y="2.5" width="9" height="8" rx="1.5" stroke="currentColor" />
    <path d="M1.5 5h9M4 1v2.5M8 1v2.5" stroke="currentColor" strokeLinecap="round" />
  </svg>
)
const FlagIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
    <path d="M2.5 11V1.5M2.5 2h7l-1.6 2.5L9.5 7h-7" stroke="currentColor" strokeLinejoin="round" strokeLinecap="round" />
  </svg>
)

export function CaptureBar({
  placeholder = "What's on your mind?",
  projects = [],
  demoPhrases = [],
  autoDemo = false,
  demoStartDelay = 600,
  submitLabel = "Capture",
  hint = "Try a #project, a day, or ! for priority",
  size = "md",
  ink,
  accent,
  surface,
  onCapture,
  className = "",
  style,
}: CaptureBarProps) {
  injectStyle("kw-cap-style", CSS)
  const [value, setValue] = useState("")
  const [typing, setTyping] = useState(false)
  const [sent, setSent] = useState<string | null>(null)
  const [pulse, setPulse] = useState(0)
  const rootRef = useRef<HTMLDivElement>(null)
  const fieldRef = useRef<HTMLFormElement>(null)
  const timers = useRef<number[]>([])
  const demoActive = useRef(false)
  const touched = useRef(false)
  const onCaptureRef = useRef(onCapture)
  onCaptureRef.current = onCapture

  const parsed = useMemo(() => parseThought(value, projects), [value, projects])

  const clearTimers = () => {
    timers.current.forEach((t) => window.clearTimeout(t))
    timers.current = []
  }
  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms))
  }

  const submit = (raw: string) => {
    const thought = parseThought(raw, projects)
    if (!thought.title) return
    onCaptureRef.current?.(thought, raw)
    const where = thought.tokens.find((t) => t.kind === "project")?.label ?? "Inbox"
    setSent(`Added to ${where}${thought.due ? ` · ${thought.due}` : ""}`)
    setPulse((p) => p + 1)
    setValue("")
    const field = fieldRef.current
    if (field) {
      field.classList.remove("is-sent")
      void field.offsetWidth // restart the confirmation ring
      field.classList.add("is-sent")
    }
  }

  // Auto-demo: types each phrase like a person would, then captures it.
  useEffect(() => {
    const el = rootRef.current
    if (!autoDemo || !demoPhrases.length || !el) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    const typePhrase = (i: number) => {
      if (!demoActive.current || i >= demoPhrases.length) {
        demoActive.current = false
        setTyping(false)
        return
      }
      const phrase = demoPhrases[i]
      setTyping(true)
      let n = 0
      const step = () => {
        if (!demoActive.current) return
        n++
        setValue(phrase.slice(0, n))
        if (n < phrase.length) {
          const ch = phrase[n - 1]
          later(step, ch === " " ? 70 : 34 + ((n * 37) % 40))
        } else {
          later(() => {
            if (!demoActive.current) return
            submit(phrase)
            setTyping(false)
            later(() => typePhrase(i + 1), 1400)
          }, 700)
        }
      }
      step()
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !touched.current && !demoActive.current) {
          demoActive.current = true
          later(() => typePhrase(0), demoStartDelay)
          io.disconnect()
        }
      },
      { threshold: 0.6 }
    )
    io.observe(el)
    return () => {
      io.disconnect()
      demoActive.current = false
      clearTimers()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoDemo, demoPhrases.join("|")])

  // Any real interaction takes over from the demo.
  const takeOver = () => {
    touched.current = true
    if (demoActive.current) {
      demoActive.current = false
      clearTimers()
      setTyping(false)
      setValue("")
    }
  }

  useEffect(() => {
    if (!sent) return
    const t = window.setTimeout(() => setSent(null), 2600)
    return () => window.clearTimeout(t)
  }, [sent, pulse])

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    takeOver()
    submit(value)
  }

  const vars = {
    ...(ink ? { "--kw-ink": ink } : {}),
    ...(accent ? { "--kw-accent": accent } : {}),
    ...(surface ? { "--kw-surface": surface } : {}),
    ...style,
  } as CSSProperties

  const cls = [
    "kw-cap",
    `kw-cap--${size}`,
    parsed.title ? "kw-cap--ready" : "",
    typing ? "kw-cap--typing" : "",
    className,
  ].join(" ")

  return (
    <div ref={rootRef} className={cls} style={vars}>
      <form ref={fieldRef} className="kw-cap__field" onSubmit={onSubmit}>
        <span className="kw-cap__seed" aria-hidden="true" />
        <input
          className="kw-cap__input"
          value={value}
          placeholder={placeholder}
          aria-label="Capture a thought"
          autoComplete="off"
          spellCheck={false}
          onChange={(e) => setValue(e.target.value)}
          onFocus={takeOver}
          onPointerDown={takeOver}
          onKeyDown={takeOver}
          readOnly={typing}
        />
        <button className="kw-cap__go" type="submit" aria-label={submitLabel} title={`${submitLabel} (Enter)`}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M13 3v5a2 2 0 0 1-2 2H3m0 0 3-3m-3 3 3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </form>
      <div className="kw-cap__meta" aria-live="polite">
        {parsed.tokens.length > 0 ? (
          parsed.tokens.map((t) => (
            <span className="kw-cap__chip" key={t.kind + t.label}>
              {t.kind === "project" && <i style={{ "--c": t.color } as CSSProperties} />}
              {t.kind === "due" && <CalendarIcon />}
              {t.kind === "priority" && <FlagIcon />}
              {t.label}
            </span>
          ))
        ) : sent ? (
          <span className="kw-cap__done" key={pulse}>
            <b aria-hidden="true">
              <svg width="9" height="9" viewBox="0 0 10 10" fill="none"><path d="M2 5.2 4 7l4-4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </b>
            {sent}
          </span>
        ) : (
          <span className="kw-cap__hint">{hint}</span>
        )}
      </div>
    </div>
  )
}

export default CaptureBar
