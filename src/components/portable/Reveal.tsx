import { createElement, useLayoutEffect, useRef, type CSSProperties, type ReactNode } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

/**
 * Portable: the site's single entrance pattern — a short rise and fade,
 * triggered once when the element enters the viewport. Content is
 * visible without JS and with reduced motion.
 */

export type RevealProps = {
  children?: ReactNode
  as?: keyof HTMLElementTagNameMap
  /** Rise distance in px */
  y?: number
  duration?: number
  delay?: number
  /** > 0 reveals direct children one after another instead of the whole block */
  stagger?: number
  /** ScrollTrigger start, e.g. "top 85%" */
  start?: string
  className?: string
  style?: CSSProperties
  id?: string
}

export function Reveal({
  children,
  as = "div",
  y = 18,
  duration = 0.7,
  delay = 0,
  stagger = 0,
  start = "top 86%",
  className,
  style,
  id,
}: RevealProps) {
  const ref = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const ctx = gsap.context(() => {
      const targets = stagger > 0 ? Array.from(el.children) : el
      gsap.fromTo(
        targets,
        { autoAlpha: 0, y },
        {
          autoAlpha: 1,
          y: 0,
          duration,
          delay,
          stagger,
          ease: "power3.out",
          clearProps: "transform,opacity,visibility",
          scrollTrigger: { trigger: el, start, once: true },
        }
      )
    }, el)
    return () => ctx.revert()
  }, [y, duration, delay, stagger, start])

  return createElement(as, { ref, className, style, id }, children)
}

export default Reveal
