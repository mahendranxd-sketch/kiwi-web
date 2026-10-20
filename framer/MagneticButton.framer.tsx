// Framer Code Component — paste next to MagneticButton.tsx in your Framer project.
import { addPropertyControls, ControlType } from "framer"
import { MagneticButton, type MagneticButtonProps } from "./MagneticButton"

/**
 * @framerSupportedLayoutWidth auto
 * @framerSupportedLayoutHeight auto
 */
export default function KiwiMagneticButton(props: MagneticButtonProps) {
  return <MagneticButton {...props} />
}

KiwiMagneticButton.defaultProps = {
  label: "Get started",
  href: "",
  variant: "primary",
  strength: 6,
  showArrow: true,
  ink: "#171713",
  paper: "#F5F2EA",
  accent: "#6A9334",
}

addPropertyControls(KiwiMagneticButton, {
  label: { type: ControlType.String, title: "Label" },
  href: { type: ControlType.Link, title: "Link" },
  variant: {
    type: ControlType.Enum,
    title: "Variant",
    options: ["primary", "ghost"],
    optionTitles: ["Primary", "Ghost"],
    displaySegmentedControl: true,
  },
  showArrow: { type: ControlType.Boolean, title: "Arrow" },
  strength: { type: ControlType.Number, title: "Magnetism", min: 0, max: 16, step: 1, unit: "px" },
  ink: { type: ControlType.Color, title: "Ink" },
  paper: { type: ControlType.Color, title: "Paper" },
  accent: { type: ControlType.Color, title: "Accent" },
})
