// Framer Code Component — paste next to FocusDay.tsx in your Framer project.
import { addPropertyControls, ControlType } from "framer"
import { FocusDay, type FocusBlock } from "./FocusDay"

type Props = {
  mode: "scroll" | "loop" | "static"
  blocks: FocusBlock[]
  fragments: number
  dayStart: number
  dayEnd: number
  beforeCaption: string
  afterCaption: string
  ink: string
  line: string
}

/**
 * Use "Loop" to preview on the canvas; "Scroll" scrubs on the published site.
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight auto
 * @framerIntrinsicWidth 900
 */
export default function KiwiFocusDay(p: Props) {
  return <FocusDay {...p} />
}

KiwiFocusDay.defaultProps = {
  mode: "scroll",
  fragments: 5,
  dayStart: 9,
  dayEnd: 18,
  beforeCaption: "Context switches",
  afterCaption: "Focus blocks",
  ink: "#171713",
  line: "#E2DDD0",
  blocks: [
    { label: "Thesis · deep work", color: "#557590", start: 9.5, end: 11.75 },
    { label: "Studio Ora handoff", color: "#B4683F", start: 13, end: 14.5 },
    { label: "Portfolio", color: "#6A9334", start: 15.5, end: 16.5 },
  ],
}

addPropertyControls(KiwiFocusDay, {
  mode: {
    type: ControlType.Enum,
    title: "Mode",
    options: ["scroll", "loop", "static"],
    optionTitles: ["Scroll", "Loop", "Static"],
    displaySegmentedControl: true,
  },
  blocks: {
    type: ControlType.Array,
    title: "Focus blocks",
    maxCount: 5,
    control: {
      type: ControlType.Object,
      controls: {
        label: { type: ControlType.String, title: "Label" },
        color: { type: ControlType.Color, title: "Color" },
        start: { type: ControlType.Number, title: "Start (h)", min: 0, max: 24, step: 0.25 },
        end: { type: ControlType.Number, title: "End (h)", min: 0, max: 24, step: 0.25 },
      },
    },
  },
  fragments: { type: ControlType.Number, title: "Fragments", min: 1, max: 8, step: 1 },
  dayStart: { type: ControlType.Number, title: "Day start", min: 0, max: 23, step: 1 },
  dayEnd: { type: ControlType.Number, title: "Day end", min: 1, max: 24, step: 1 },
  beforeCaption: { type: ControlType.String, title: "Before caption" },
  afterCaption: { type: ControlType.String, title: "After caption" },
  ink: { type: ControlType.Color, title: "Ink" },
  line: { type: ControlType.Color, title: "Grid lines" },
})
