import { useEffect, useLayoutEffect, useRef } from "react"
import { FINE_POINTER, gsap, prefersReducedMotion, ScrollTrigger } from "../lib/motion"
import "./kiwi-slice.css"

/**
 * The Kiwi mark at full size. It assembles once when scrolled into view
 * (skin draws, flesh grows, seeds pop into a ring), then stays still —
 * moving only in response to the visitor: seeds lean toward the cursor,
 * the slice bounces when `pulse` changes, and seeds spin when `hot`.
 */

const C = 100
const SEEDS = Array.from({ length: 14 }, (_, i) => {
  const a = (i / 14) * Math.PI * 2 - Math.PI / 2
  const r = i % 2 ? 37 : 33 // alternate radii so the ring looks grown, not stamped
  return { x: C + Math.cos(a) * r, y: C + Math.sin(a) * r, deg: (a * 180) / Math.PI + 90 }
})
const RAYS = Array.from({ length: 28 }, (_, i) => {
  const a = (i / 28) * Math.PI * 2
  const r0 = 46 + (i % 3) * 3
  const r1 = 76 + ((i * 7) % 5) * 2
  return `M${C + Math.cos(a) * r0} ${C + Math.sin(a) * r0}L${C + Math.cos(a) * r1} ${C + Math.sin(a) * r1}`
})

export function KiwiSlice({
  pulse = 0,
  hot = false,
  pointerScope,
}: {
  /** Increment to play the confirmation bounce */
  pulse?: number
  /** Spins the seeds a little (e.g. while the CTA is hovered) */
  hot?: boolean
  /** Element whose pointer movement the seeds follow */
  pointerScope?: React.RefObject<HTMLElement | null>
}) {
  const root = useRef<SVGSVGElement>(null)
  const built = useRef(false)

  // Assemble once, when the slice scrolls into view.
  useLayoutEffect(() => {
    const el = root.current
    if (!el) return
    if (prefersReducedMotion()) {
      built.current = true
      return
    }
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ paused: true, defaults: { ease: "expo.out" } })
      tl.fromTo(".ks__skin", { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.1, ease: "power2.inOut" })
        .fromTo(".ks__flesh", { scale: 0, svgOrigin: "100 100" }, { scale: 1, duration: 1 }, 0.25)
        .fromTo(".ks__ray", { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.7, stagger: { each: 0.012, from: "random" } }, 0.5)
        .fromTo(".ks__core", { scale: 0, svgOrigin: "100 100" }, { scale: 1, duration: 0.8 }, 0.55)
        .fromTo(".ks__seed", { scale: 0, transformOrigin: "50% 50%" }, { scale: 1, duration: 0.5, ease: "back.out(2.6)", stagger: 0.035 }, 0.75)
        .call(() => (built.current = true))
      ScrollTrigger.create({ trigger: el, start: "top 82%", once: true, onEnter: () => tl.play() })
    }, el)
    return () => ctx.revert()
  }, [])

  // Seeds lean toward the cursor — a few degrees, never a spin.
  useEffect(() => {
    const el = root.current
    const scope = pointerScope?.current
    if (!el || !scope || prefersReducedMotion() || !window.matchMedia(FINE_POINTER).matches) return
    const ring = el.querySelector(".ks__lean")
    const body = el.querySelector(".ks__body")
    gsap.set(ring, { svgOrigin: "100 100" })
    const rot = gsap.quickTo(ring, "rotation", { duration: 0.9, ease: "power3.out" })
    const tx = gsap.quickTo(body, "x", { duration: 0.9, ease: "power3.out" })
    const ty = gsap.quickTo(body, "y", { duration: 0.9, ease: "power3.out" })
    const move = (e: PointerEvent) => {
      if (!built.current) return
      const r = el.getBoundingClientRect()
      const dx = (e.clientX - (r.left + r.width / 2)) / window.innerWidth
      const dy = (e.clientY - (r.top + r.height / 2)) / window.innerHeight
      rot(gsap.utils.clamp(-18, 18, dx * 40))
      tx(dx * 10)
      ty(dy * 8)
    }
    const leave = () => {
      rot(0)
      tx(0)
      ty(0)
    }
    scope.addEventListener("pointermove", move)
    scope.addEventListener("pointerleave", leave)
    return () => {
      scope.removeEventListener("pointermove", move)
      scope.removeEventListener("pointerleave", leave)
      gsap.killTweensOf([ring, body])
    }
  }, [pointerScope])

  // Confirmation bounce when a thought is captured.
  useEffect(() => {
    const el = root.current
    if (!pulse || !el || prefersReducedMotion()) return
    const tl = gsap.timeline()
    tl.fromTo(el.querySelector(".ks__pop"), { scale: 0.94, svgOrigin: "100 100" }, { scale: 1, duration: 0.9, ease: "elastic.out(1, 0.45)" })
      .fromTo(el.querySelectorAll(".ks__seed"), { scale: 1.45, transformOrigin: "50% 50%" }, { scale: 1, duration: 0.6, ease: "power3.out", stagger: 0.015 }, 0)
    return () => {
      tl.progress(1).kill()
    }
  }, [pulse])

  return (
    <svg ref={root} className="ks" viewBox="0 0 200 200" data-hot={hot} aria-hidden="true">
      <defs>
        <radialGradient id="ks-flesh" cx="50%" cy="50%" r="50%">
          <stop offset="0%" className="ks__stop-in" />
          <stop offset="100%" className="ks__stop-out" />
        </radialGradient>
      </defs>
      <g className="ks__body">
        <g className="ks__pop">
          <circle className="ks__skin" cx={C} cy={C} r="94" pathLength={1} />
          <circle className="ks__flesh" cx={C} cy={C} r="88" fill="url(#ks-flesh)" />
          <g className="ks__rays">
            {RAYS.map((d, i) => (
              <path key={i} className="ks__ray" d={d} pathLength={1} />
            ))}
          </g>
          <ellipse className="ks__core" cx={C} cy={C} rx="21" ry="23" />
          <g className="ks__lean">
            <g className="ks__spin">
              {SEEDS.map((s, i) => (
                <ellipse
                  key={i}
                  className="ks__seed"
                  cx={s.x}
                  cy={s.y}
                  rx="2.6"
                  ry="4.6"
                  transform={`rotate(${s.deg} ${s.x} ${s.y})`}
                />
              ))}
            </g>
          </g>
        </g>
      </g>
    </svg>
  )
}
