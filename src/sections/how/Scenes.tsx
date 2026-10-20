import { useState, type CSSProperties } from "react"
import { AnimatePresence, LayoutGroup, motion } from "framer-motion"
import { CaptureBar } from "../../components/portable/CaptureBar"
import { PROJECTS, PRIORITY_LABEL, formatMinutes, projectById, type Priority, type ProjectId } from "../../lib/data"
import type { ParsedThought } from "../../lib/parse"
import { fadeUp, layoutSpring } from "../../lib/motion"

const Dot = ({ id }: { id: ProjectId | null }) => (
  <span className="pdot" style={{ "--c": projectById(id)?.color } as CSSProperties} />
)

/* ------------------------------------------------------------------ */
/* 01 — Capture: plain words in, structure out                         */
/* ------------------------------------------------------------------ */

export function CaptureScene() {
  const [items, setItems] = useState<(ParsedThought & { id: string })[]>([])

  return (
    <div className="scene scene--capture">
      <CaptureBar
        projects={PROJECTS}
        autoDemo
        demoPhrases={["call Mira about the homepage tomorrow #ora !", "draft methods section friday #thesis"]}
        demoStartDelay={500}
        onCapture={(t) => setItems((all) => [{ ...t, id: `${Date.now()}` }, ...all].slice(0, 3))}
      />
      <p className="scene__label">Kiwi read</p>
      <ul className="readout">
        {items.length === 0 && <li className="readout__empty">Captured thoughts appear here, already sorted.</li>}
        {items.map((t) => (
          <li key={t.id} className="readout__item">
            <span className="readout__title">{t.title}</span>
            <dl className="readout__grid">
              <div>
                <dt>Project</dt>
                <dd>
                  <Dot id={t.project as ProjectId | null} /> {projectById(t.project as ProjectId)?.name ?? "Inbox"}
                </dd>
              </div>
              <div>
                <dt>When</dt>
                <dd>{t.due ?? "Someday"}</dd>
              </div>
              <div>
                <dt>Priority</dt>
                <dd>{PRIORITY_LABEL[t.priority]}</dd>
              </div>
            </dl>
          </li>
        ))}
      </ul>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* 02 — Shape: every thought finds its project                         */
/* ------------------------------------------------------------------ */

type ShapeItem = { id: string; title: string; project: ProjectId | null; suggest: ProjectId }

const SHAPE_START: ShapeItem[] = [
  { id: "a", title: "Call Mira about the homepage", project: null, suggest: "ora" },
  { id: "b", title: "Draft methods section", project: null, suggest: "thesis" },
  { id: "c", title: "New about-page photo", project: null, suggest: "portfolio" },
  { id: "d", title: "Replace hero shot", project: "portfolio", suggest: "portfolio" },
  { id: "e", title: "Outline chapter 3", project: "thesis", suggest: "thesis" },
  { id: "f", title: "Send moodboard", project: "ora", suggest: "ora" },
]

export function ShapeScene() {
  const [items, setItems] = useState(SHAPE_START)

  const inbox = items.filter((i) => !i.project)
  const accept = (id?: string) =>
    setItems((all) => all.map((i) => (!i.project && (!id || i.id === id) ? { ...i, project: i.suggest } : i)))

  return (
    <LayoutGroup id="shape">
      <div className="scene scene--shape">
        <motion.div layout transition={layoutSpring} className="inbox">
          <motion.div layout="position" transition={layoutSpring} className="inbox__head">
            <span className="scene__label">Inbox · {inbox.length}</span>
            {inbox.length > 0 ? (
              <button type="button" className="textbtn" onClick={() => accept()}>
                Accept all
              </button>
            ) : (
              <button type="button" className="textbtn" onClick={() => setItems(SHAPE_START)}>
                Reset demo
              </button>
            )}
          </motion.div>
          <AnimatePresence initial={false} mode="popLayout">
            {inbox.length === 0 && (
              <motion.p key="zero" className="inbox__empty" {...fadeUp}>
                Inbox zero. Everything has a home.
              </motion.p>
            )}
          </AnimatePresence>
          <ul className="inbox__list">
            {inbox.map((i) => (
              <motion.li key={i.id} layoutId={i.id} transition={layoutSpring} className="chip-task chip-task--inbox">
                <motion.span layout="position" transition={layoutSpring} className="chip-task__title">
                  {i.title}
                </motion.span>
                <button type="button" className="suggest" onClick={() => accept(i.id)}>
                  <span className="suggest__hint">Move to</span> <Dot id={i.suggest} /> {projectById(i.suggest)?.short}
                </button>
              </motion.li>
            ))}
          </ul>
        </motion.div>
        <motion.div layout="position" transition={layoutSpring} className="cols">
          {PROJECTS.map((p) => (
            <div className="col" key={p.id}>
              <p className="col__head">
                <Dot id={p.id} /> {p.short}
              </p>
              <ul>
                {items
                  .filter((i) => i.project === p.id)
                  .map((i) => (
                    <motion.li
                      key={i.id}
                      layoutId={i.id}
                      transition={layoutSpring}
                      className="chip-task"
                      style={{ "--c": p.color } as CSSProperties}
                    >
                      <motion.span layout="position" transition={layoutSpring} className="chip-task__title">
                        {i.title}
                      </motion.span>
                    </motion.li>
                  ))}
              </ul>
            </div>
          ))}
        </motion.div>
      </div>
    </LayoutGroup>
  )
}

/* ------------------------------------------------------------------ */
/* 03 — Focus: the short list for today                                */
/* ------------------------------------------------------------------ */

type FocusItem = { id: string; title: string; project: ProjectId; priority: Priority; due: string; est: number }

const FOCUS_ITEMS: FocusItem[] = [
  { id: "1", title: "Prepare Ora invoice #014", project: "ora", priority: "later", due: "Fri", est: 15 },
  { id: "2", title: "Outline chapter 3 argument", project: "thesis", priority: "now", due: "Today", est: 90 },
  { id: "3", title: "Collect testimonials", project: "portfolio", priority: "later", due: "Thu", est: 25 },
  { id: "4", title: "Send Ora the moodboard", project: "ora", priority: "now", due: "Fri", est: 45 },
  { id: "5", title: "Read Ahmed (2019), ch. 2", project: "thesis", priority: "later", due: "Thu", est: 40 },
  { id: "6", title: "Book supervisor call", project: "thesis", priority: "soon", due: "Tomorrow", est: 10 },
]

const RANK: Record<Priority, number> = { now: 0, soon: 1, later: 2 }
const PLAN = [...FOCUS_ITEMS]
  .sort((a, b) => RANK[a.priority] - RANK[b.priority] || (a.due === "Today" ? -1 : 0))
  .slice(0, 3)
  .map((i) => i.id)

export function FocusScene() {
  const [planned, setPlanned] = useState(false)

  const today = FOCUS_ITEMS.filter((i) => PLAN.includes(i.id)).sort((a, b) => PLAN.indexOf(a.id) - PLAN.indexOf(b.id))
  const later = FOCUS_ITEMS.filter((i) => !PLAN.includes(i.id))
  const total = today.reduce((a, i) => a + i.est, 0)

  const row = (i: FocusItem, muted?: boolean) => {
    const meta = planned && !muted ? formatMinutes(i.est) : i.due
    return (
      <motion.li key={i.id} layoutId={`r${i.id}`} transition={layoutSpring} className="frow" data-muted={muted}>
        <Dot id={i.project} />
        <span className="frow__title">{i.title}</span>
        <span className="prio" data-p={i.priority} aria-label={PRIORITY_LABEL[i.priority]}><i /><i /><i /></span>
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span key={meta} className="frow__due" {...fadeUp}>
            {meta}
          </motion.span>
        </AnimatePresence>
      </motion.li>
    )
  }

  return (
    <LayoutGroup id="focus">
      <div className="scene scene--focus">
        <div className="focus__top">
          <span className="scene__label">{planned ? "Today's plan" : "6 open tasks"}</span>
          <button type="button" className="planbtn" data-on={planned} onClick={() => setPlanned((p) => !p)} aria-pressed={planned}>
            {planned ? "Undo" : "Plan my day"}
          </button>
        </div>
        <AnimatePresence mode="popLayout" initial={false}>
          {planned && (
            <motion.p key="h-today" layout="position" className="focus__group-h" {...fadeUp}>
              <b>Today</b> <span className="muted">· about {formatMinutes(total)} of focus</span>
            </motion.p>
          )}
        </AnimatePresence>
        <ul className={planned ? "focus__list focus__list--today" : "focus__list"}>
          {(planned ? today : FOCUS_ITEMS).map((i) => row(i))}
        </ul>
        <AnimatePresence mode="popLayout" initial={false}>
          {planned && (
            <motion.p key="h-later" layout="position" className="focus__group-h" {...fadeUp}>
              <b>Later this week</b> <span className="muted">· {later.length}</span>
            </motion.p>
          )}
        </AnimatePresence>
        <ul className="focus__list">{planned && later.map((i) => row(i, true))}</ul>
      </div>
    </LayoutGroup>
  )
}
