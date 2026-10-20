import { useLayoutEffect, useRef, type CSSProperties, type MouseEvent, type ReactNode } from "react"
import { gsap } from "gsap"

/**
 * Portable: single file, no global CSS. Works in the site and as a
 * Framer Code Component (see /framer/MagneticButton.framer.tsx).
 */

export type MagneticButtonProps = {
  label: string
  href?: string
  onClick?: (e: MouseEvent<HTMLElement>) => void
  variant?: "primary" | "ghost"
  /** How far (px) the button leans toward the cursor. 0 disables. */
  strength?: number
  showArrow?: boolean
  ink?: string
  paper?: string
  accent?: string
  className?: string
  style?: CSSProperties
  ariaLabel?: string
  /** Optional mark shown in the chip; it rolls away like a wheel as the arrow rolls in */
  icon?: ReactNode
  onHoverChange?: (hovered: boolean) => void
}

const CSS = `
.kw-mag{--ink:var(--kw-ink,#171713);--paper:var(--kw-paper,#f5f2ea);--acc:var(--kw-accent,#6a9334);
  position:relative;display:inline-flex;align-items:center;gap:12px;height:50px;padding:0 8px 0 22px;
  border-radius:999px;font:500 15px/1 var(--font,"Geist",system-ui,sans-serif);letter-spacing:-.01em;
  text-decoration:none;cursor:pointer;border:1px solid transparent;white-space:nowrap;
  transition:background-color .2s,color .2s,border-color .2s;-webkit-tap-highlight-color:transparent;will-change:transform}
.kw-mag__inner{display:inline-flex;align-items:center;gap:12px;transition:transform .18s cubic-bezier(.22,1,.36,1)}
.kw-mag:active .kw-mag__inner{transform:scale(.97)}
.kw-mag--primary{background:var(--ink);color:var(--paper)}
.kw-mag--primary:hover{background:#000}
.kw-mag--ghost{background:transparent;color:var(--ink);border-color:color-mix(in srgb,var(--ink) 16%,transparent);padding-right:22px}
.kw-mag--ghost:hover{border-color:color-mix(in srgb,var(--ink) 40%,transparent);background:color-mix(in srgb,var(--ink) 3%,transparent)}
.kw-mag--ghost.kw-mag--arrow{padding-right:8px}
.kw-mag:focus-visible{outline:2px solid var(--acc);outline-offset:3px}
.kw-mag__chip{position:relative;width:34px;height:34px;border-radius:50%;overflow:hidden;display:grid;place-items:center;
  background:var(--acc);color:var(--ink);transition:transform .34s cubic-bezier(.22,1,.36,1)}
.kw-mag--ghost .kw-mag__chip{background:color-mix(in srgb,var(--ink) 6%,transparent)}
.kw-mag__chip>svg{grid-area:1/1;transition:transform .34s cubic-bezier(.22,1,.36,1)}
.kw-mag__chip>svg:last-child{transform:translateX(-160%)}
.kw-mag:hover .kw-mag__chip{transform:scale(1.06)}
.kw-mag:hover .kw-mag__chip>svg:first-child{transform:translateX(160%)}
.kw-mag:hover .kw-mag__chip>svg:last-child{transform:translateX(0)}
.kw-mag--down .kw-mag__chip>svg:last-child{transform:translateY(-160%)}
.kw-mag--down:hover .kw-mag__chip>svg:first-child{transform:translateY(160%)}
.kw-mag--down:hover .kw-mag__chip>svg:last-child{transform:translateY(0)}
.kw-mag--roll .kw-mag__chip{background:var(--paper)}
.kw-mag__icon{grid-area:1/1;display:grid;place-items:center;transition:transform .55s cubic-bezier(.22,1,.36,1)}
.kw-mag--roll:hover .kw-mag__icon{transform:translateX(170%) rotate(220deg)}
.kw-mag--roll .kw-mag__chip>svg:last-child{transform:translateX(-260%) rotate(-220deg)}
.kw-mag--roll:hover .kw-mag__chip>svg:last-child{transform:none}
@media (prefers-reduced-motion:reduce){.kw-mag__chip>svg,.kw-mag__chip,.kw-mag__icon{transition:none}}
`

function injectStyle(id: string, css: string) {
  if (typeof document === "undefined" || document.getElementById(id)) return
  const el = document.createElement("style")
  el.id = id
  el.textContent = css
  document.head.appendChild(el)
}

const Arrow = ({ down }: { down?: boolean }) => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"
    style={down ? { rotate: "90deg" } : undefined}>
    <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

export function MagneticButton({
  label,
  href,
  onClick,
  variant = "primary",
  strength = 6,
  showArrow = true,
  ink,
  paper,
  accent,
  className = "",
  style,
  ariaLabel,
  icon,
  onHoverChange,
}: MagneticButtonProps) {
  const ref = useRef<HTMLAnchorElement & HTMLButtonElement>(null)
  injectStyle("kw-mag-style", CSS)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el || !strength) return
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (!fine || reduced) return

    const inner = el.querySelector<HTMLElement>(".kw-mag__inner")
    const xTo = gsap.quickTo(el, "x", { duration: 0.5, ease: "power3.out" })
    const yTo = gsap.quickTo(el, "y", { duration: 0.5, ease: "power3.out" })
    const ixTo = inner && gsap.quickTo(inner, "x", { duration: 0.5, ease: "power3.out" })

    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2)
      const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2)
      xTo(dx * strength)
      yTo(dy * strength * 0.6)
      ixTo?.(dx * strength * 0.35)
    }
    const leave = () => {
      xTo(0)
      yTo(0)
      ixTo?.(0)
    }
    el.addEventListener("pointermove", move)
    el.addEventListener("pointerleave", leave)
    return () => {
      el.removeEventListener("pointermove", move)
      el.removeEventListener("pointerleave", leave)
      gsap.killTweensOf(el)
      if (inner) gsap.killTweensOf(inner)
      gsap.set([el, inner], { clearProps: "x,y" })
    }
  }, [strength])

  const down = href?.startsWith("#") && variant === "ghost"
  const vars = {
    ...(ink ? { "--kw-ink": ink } : {}),
    ...(paper ? { "--kw-paper": paper } : {}),
    ...(accent ? { "--kw-accent": accent } : {}),
    ...style,
  } as CSSProperties
  const cls = `kw-mag kw-mag--${variant}${showArrow ? " kw-mag--arrow" : ""}${down ? " kw-mag--down" : ""}${icon ? " kw-mag--roll" : ""} ${className}`

  const hover = onHoverChange
    ? {
        onPointerEnter: () => onHoverChange(true),
        onPointerLeave: () => onHoverChange(false),
        onFocus: () => onHoverChange(true),
        onBlur: () => onHoverChange(false),
      }
    : {}

  const content = (
    <span className="kw-mag__inner">
      <span>{label}</span>
      {showArrow && (
        <span className="kw-mag__chip" aria-hidden="true">
          {icon ? <span className="kw-mag__icon">{icon}</span> : <Arrow down={down} />}
          <Arrow down={down} />
        </span>
      )}
    </span>
  )

  return href ? (
    <a ref={ref} href={href} onClick={onClick} className={cls} style={vars} aria-label={ariaLabel} {...hover}>
      {content}
    </a>
  ) : (
    <button ref={ref} type="button" onClick={onClick} className={cls} style={vars} aria-label={ariaLabel} {...hover}>
      {content}
    </button>
  )
}

export default MagneticButton
