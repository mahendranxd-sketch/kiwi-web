/**
 * Kiwi's capture grammar — deliberately small, dependency-free
 * (it ships alongside the portable CaptureBar component):
 *   #tag              → project (matched by id or name prefix)
 *   today / tomorrow / weekday / next week → due date
 *   !  or  !!         → priority
 * Everything else is the task title.
 */

export type Priority = "now" | "soon" | "later"
export type ParseProject = { id: string; name: string; color?: string }

export type ParsedToken =
  | { kind: "project"; label: string; project: string; color?: string }
  | { kind: "due"; label: string }
  | { kind: "priority"; label: string; priority: Priority }

export type ParsedThought = {
  title: string
  project: string | null
  due: string | null
  priority: Priority
  tokens: ParsedToken[]
}

const DAYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]
const DAY_SHORT: Record<string, string> = {
  mon: "monday", tue: "tuesday", tues: "tuesday", wed: "wednesday",
  thu: "thursday", thur: "thursday", thurs: "thursday", fri: "friday",
  sat: "saturday", sun: "sunday",
}
const DAY_WORDS = [...DAYS, ...Object.keys(DAY_SHORT)].sort((a, b) => b.length - a.length)
const DUE_RE = new RegExp(
  `\\s(?:(?:by|on|due|this)\\s+)?(today|tonight|tomorrow|next week|${DAY_WORDS.join("|")})(?=[\\s.,!?])`,
  "i"
)

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
const squash = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "")

export function parseThought(raw: string, projects: ParseProject[] = []): ParsedThought {
  const tokens: ParsedToken[] = []
  const out: ParsedThought = { title: "", project: null, due: null, priority: "later", tokens }
  let text = ` ${raw} `

  text = text.replace(/\s#([\w-]+)/g, (m, tag: string) => {
    const t = squash(tag)
    const match = projects.find((p) => squash(p.id).startsWith(t) || squash(p.name).startsWith(t))
    if (!match || out.project) return m
    out.project = match.id
    tokens.push({ kind: "project", label: match.name, project: match.id, color: match.color })
    return " "
  })

  text = text.replace(/\s(!{1,2})(?=\s)/, (_m, bangs: string) => {
    out.priority = bangs.length > 1 ? "now" : "soon"
    tokens.push({ kind: "priority", label: bangs.length > 1 ? "Urgent" : "High", priority: out.priority })
    return " "
  })

  text = text.replace(DUE_RE, (_m, word: string) => {
    const w = word.toLowerCase()
    let label: string
    if (w === "today" || w === "tonight") label = "Today"
    else if (w === "tomorrow") label = "Tomorrow"
    else if (w === "next week") label = "Next week"
    else label = cap(DAY_SHORT[w] ?? w).slice(0, 3)
    out.due = label
    tokens.push({ kind: "due", label })
    return " "
  })

  out.title = cap(text.replace(/\s+/g, " ").trim().replace(/[\s,.;:-]+$/, ""))
  return out
}
