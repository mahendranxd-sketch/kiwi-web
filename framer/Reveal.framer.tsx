// Framer Code Component — paste next to Reveal.tsx in your Framer project.
import type { ReactNode } from "react"
import { addPropertyControls, ControlType } from "framer"
import { Reveal } from "./Reveal"

type Props = {
  children: ReactNode
  y: number
  duration: number
  delay: number
  stagger: number
  start: string
}

/**
 * Wrap any layer: connect it to the "Content" slot.
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 */
export default function KiwiReveal({ children, ...rest }: Props) {
  return (
    <Reveal {...rest} style={{ width: "100%", height: "100%" }}>
      {children}
    </Reveal>
  )
}

KiwiReveal.defaultProps = { y: 18, duration: 0.7, delay: 0, stagger: 0, start: "top 86%" }

addPropertyControls(KiwiReveal, {
  children: { type: ControlType.ComponentInstance, title: "Content" },
  y: { type: ControlType.Number, title: "Rise", min: 0, max: 80, unit: "px" },
  duration: { type: ControlType.Number, title: "Duration", min: 0.2, max: 2, step: 0.05, unit: "s" },
  delay: { type: ControlType.Number, title: "Delay", min: 0, max: 2, step: 0.05, unit: "s" },
  stagger: { type: ControlType.Number, title: "Stagger children", min: 0, max: 0.4, step: 0.02, unit: "s" },
  start: { type: ControlType.String, title: "Start", placeholder: "top 86%" },
})
