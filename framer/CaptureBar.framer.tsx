// Framer Code Component — paste next to CaptureBar.tsx and parse.ts
// (update CaptureBar's import to "./parse" when you do).
import { addPropertyControls, ControlType } from "framer"
import { CaptureBar } from "./CaptureBar"

type Props = {
  placeholder: string
  hint: string
  submitLabel: string
  size: "md" | "lg"
  autoDemo: boolean
  demoPhrases: string[]
  projectNames: string[]
  projectColors: string[]
  ink: string
  accent: string
  surface: string
}

/**
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight auto
 * @framerIntrinsicWidth 560
 */
export default function KiwiCaptureBar(p: Props) {
  const projects = p.projectNames.map((name, i) => ({
    id: name.toLowerCase().replace(/[^a-z0-9]+/g, ""),
    name,
    color: p.projectColors[i] ?? p.accent,
  }))
  return (
    <CaptureBar
      placeholder={p.placeholder}
      hint={p.hint}
      submitLabel={p.submitLabel}
      size={p.size}
      autoDemo={p.autoDemo}
      demoPhrases={p.demoPhrases}
      projects={projects}
      ink={p.ink}
      accent={p.accent}
      surface={p.surface}
    />
  )
}

KiwiCaptureBar.defaultProps = {
  placeholder: "What's on your mind?",
  hint: "Try a #project, a day, or ! for priority",
  submitLabel: "Capture",
  size: "md",
  autoDemo: true,
  demoPhrases: ["send Ora the moodboard by friday #ora !!", "outline chapter 3 tomorrow #thesis"],
  projectNames: ["Portfolio", "Thesis", "Ora"],
  projectColors: ["#6A9334", "#557590", "#B4683F"],
  ink: "#171713",
  accent: "#6A9334",
  surface: "#FCFBF7",
}

addPropertyControls(KiwiCaptureBar, {
  placeholder: { type: ControlType.String, title: "Placeholder" },
  hint: { type: ControlType.String, title: "Hint" },
  submitLabel: { type: ControlType.String, title: "Submit label" },
  size: {
    type: ControlType.Enum,
    title: "Size",
    options: ["md", "lg"],
    optionTitles: ["Medium", "Large"],
    displaySegmentedControl: true,
  },
  autoDemo: { type: ControlType.Boolean, title: "Auto demo" },
  demoPhrases: {
    type: ControlType.Array,
    title: "Demo phrases",
    control: { type: ControlType.String },
    hidden: (p: Props) => !p.autoDemo,
  },
  projectNames: { type: ControlType.Array, title: "Projects", control: { type: ControlType.String } },
  projectColors: { type: ControlType.Array, title: "Project colors", control: { type: ControlType.Color } },
  ink: { type: ControlType.Color, title: "Ink" },
  accent: { type: ControlType.Color, title: "Accent" },
  surface: { type: ControlType.Color, title: "Surface" },
})
