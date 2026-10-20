import { useLayoutEffect, useEffect, useState, type RefObject } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

export { gsap, ScrollTrigger }

/**
 * The motion system. Every animation on the site draws from these
 * values so timing feels like one hand made it.
 */
export const timing = {
  dur: { fast: 0.18, base: 0.34, slow: 0.6, story: 0.9 },
  ease: {
    out: "power3.out",
    inOut: "power3.inOut",
    expo: "expo.out",
    soft: "sine.inOut",
  },
  stagger: 0.06,
} as const

export const REDUCED = "(prefers-reduced-motion: reduce)"
export const FINE_POINTER = "(hover: hover) and (pointer: fine)"

export function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia(REDUCED).matches
}

export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() =>
    typeof window === "undefined" ? false : window.matchMedia(query).matches
  )
  useEffect(() => {
    const mql = window.matchMedia(query)
    const onChange = () => setMatches(mql.matches)
    onChange()
    mql.addEventListener("change", onChange)
    return () => mql.removeEventListener("change", onChange)
  }, [query])
  return matches
}

export const useReducedMotion = () => useMediaQuery(REDUCED)

/**
 * Framer Motion presets — used for layout changes driven by React state
 * (lists reordering, items moving between groups). GSAP stays in charge
 * of scroll-linked storytelling.
 */
export const layoutSpring = { type: "spring", stiffness: 520, damping: 44, mass: 0.9 } as const

/** Enter slower than exit, so the eye follows what arrives. */
export const fadeUp = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: -4, transition: { duration: 0.16, ease: [0.4, 0, 1, 1] } },
} as const

/**
 * Runs GSAP code scoped to a container and reverts every tween,
 * ScrollTrigger and inline style it created on cleanup.
 */
export function useGsap(
  scope: RefObject<HTMLElement | null>,
  setup: (ctx: gsap.Context) => void | (() => void),
  deps: unknown[] = []
) {
  useLayoutEffect(() => {
    if (!scope.current) return
    let extra: void | (() => void)
    const ctx = gsap.context((self) => {
      extra = setup(self)
    }, scope.current)
    return () => {
      extra?.()
      ctx.revert()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}
