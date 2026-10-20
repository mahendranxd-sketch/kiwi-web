import { useRef } from "react"
import { gsap, prefersReducedMotion } from "../lib/motion"
import "./check.css"

/**
 * The checkbox people will press most — so it gets the most care:
 * a filled circle, a drawn tick, and a tiny burst of kiwi seeds.
 */
export function Check({
  checked,
  onChange,
  label,
  size = 20,
}: {
  checked: boolean
  onChange: (next: boolean) => void
  label: string
  size?: number
}) {
  const burst = useRef<HTMLSpanElement>(null)

  const toggle = () => {
    const next = !checked
    onChange(next)
    if (next && burst.current && !prefersReducedMotion()) {
      const seeds = burst.current.children
      gsap.killTweensOf(seeds)
      gsap.fromTo(
        seeds,
        { x: 0, y: 0, scale: 1, autoAlpha: 1 },
        {
          x: (i) => Math.cos((i / seeds.length) * Math.PI * 2) * size * 0.95,
          y: (i) => Math.sin((i / seeds.length) * Math.PI * 2) * size * 0.95,
          scale: 0.4,
          autoAlpha: 0,
          duration: 0.55,
          ease: "power3.out",
        }
      )
    }
  }

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      className="check"
      data-checked={checked}
      style={{ ["--size" as string]: `${size}px` }}
      onClick={(e) => {
        e.stopPropagation()
        toggle()
      }}
    >
      <span className="check__burst" ref={burst} aria-hidden="true">
        {Array.from({ length: 6 }, (_, i) => (
          <i key={i} />
        ))}
      </span>
      <svg viewBox="0 0 20 20" aria-hidden="true">
        <circle className="check__ring" cx="10" cy="10" r="8.5" />
        <circle className="check__fill" cx="10" cy="10" r="9.25" />
        <path className="check__tick" d="M6 10.4 8.7 13 14 7.4" pathLength="1" />
      </svg>
    </button>
  )
}
