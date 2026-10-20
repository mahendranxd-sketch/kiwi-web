/**
 * Sample workspace used across every product demo on the page, so
 * the same projects and tasks appear from the hero to the showcase.
 */

import type { Priority } from "./parse"

export type { Priority }
export type ProjectId = "portfolio" | "thesis" | "ora"

export type Project = { id: ProjectId; name: string; color: string; short: string }

export const PROJECTS: Project[] = [
  { id: "portfolio", name: "Portfolio refresh", short: "Portfolio", color: "var(--p-kiwi)" },
  { id: "thesis", name: "Thesis — chapter 3", short: "Thesis", color: "var(--p-slate)" },
  { id: "ora", name: "Studio Ora website", short: "Studio Ora", color: "var(--p-clay)" },
]

export const projectById = (id: ProjectId | null) => PROJECTS.find((p) => p.id === id)

export const PRIORITY_LABEL: Record<Priority, string> = {
  now: "Urgent",
  soon: "High",
  later: "Normal",
}

export type Subtask = { id: string; title: string; done: boolean }

export type Task = {
  id: string
  title: string
  project: ProjectId | null
  priority: Priority
  due: string | null
  estimate: number // minutes
  done: boolean
  source: string
  captured?: string
  status?: "todo" | "doing" | "done"
  subtasks?: Subtask[]
}

export const SHOWCASE_TASKS: Task[] = [
  {
    id: "t1",
    title: "Send Ora the homepage moodboard",
    project: "ora",
    priority: "now",
    due: "Today",
    estimate: 45,
    done: false,
    status: "doing",
    source: "Captured from an email · Sat",
    captured: "re: moodboard?? need it by fri latest — M",
    subtasks: [
      { id: "s1", title: "Pick 3 type directions", done: true },
      { id: "s2", title: "Export board as PDF", done: false },
      { id: "s3", title: "Write a two-line rationale", done: false },
    ],
  },
  {
    id: "t2",
    title: "Outline chapter 3 argument",
    project: "thesis",
    priority: "now",
    due: "Today",
    estimate: 90,
    done: false,
    status: "todo",
    source: "Captured from a voice memo · Sun",
    captured: "ch3 — start from the interviews, not the theory",
    subtasks: [
      { id: "s4", title: "List the four interview themes", done: false },
      { id: "s5", title: "Pick the opening case", done: false },
    ],
  },
  {
    id: "t3",
    title: "Replace hero shot on case study",
    project: "portfolio",
    priority: "soon",
    due: "Today",
    estimate: 30,
    done: true,
    status: "done",
    source: "Captured from a sticky note · Fri",
    captured: "hero img on the Halden case study looks dated",
  },
  {
    id: "t4",
    title: "Book feedback call with supervisor",
    project: "thesis",
    priority: "soon",
    due: "Today",
    estimate: 10,
    done: false,
    status: "todo",
    source: "Captured from a calendar note · Mon",
    captured: "ask Dr. Reyes re: methods section",
  },
  {
    id: "t5",
    title: "Collect testimonials for About page",
    project: "portfolio",
    priority: "later",
    due: "Thu",
    estimate: 25,
    done: false,
    status: "todo",
    source: "Captured from Notes · last week",
    captured: "about page feels thin — ask past clients for a line?",
  },
  {
    id: "t6",
    title: "Prepare Ora invoice #014",
    project: "ora",
    priority: "later",
    due: "Fri",
    estimate: 15,
    done: false,
    status: "todo",
    source: "Captured from a browser tab · Tue",
    captured: "invoice ora after handoff",
  },
]

export const formatMinutes = (m: number) => {
  const h = Math.floor(m / 60)
  const r = m % 60
  if (!h) return `${r}m`
  return r ? `${h}h ${r}m` : `${h}h`
}
