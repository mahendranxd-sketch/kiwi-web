import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent } from "react"
import { Check } from "../components/Check"
import { Reveal } from "../components/portable/Reveal"
import {
  PROJECTS, PRIORITY_LABEL, SHOWCASE_TASKS, formatMinutes, projectById,
  type Priority, type ProjectId, type Task,
} from "../lib/data"
import { LayoutGroup, motion } from "framer-motion"
import { FINE_POINTER, gsap, layoutSpring, timing, prefersReducedMotion, useMediaQuery } from "../lib/motion"
import "./showcase.css"

type Tab = "today" | "board" | "week"
const TABS: { id: Tab; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "board", label: "Board" },
  { id: "week", label: "Week" },
]
const NEXT_P: Record<Priority, Priority> = { now: "soon", soon: "later", later: "now" }
const RANK: Record<Priority, number> = { now: 0, soon: 1, later: 2 }
const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

/* Week view: a few more commitments so the week reads as real. */
const WEEK_EXTRA: { day: number; title: string; project: ProjectId; est: number }[] = [
  { day: 1, title: "Studio Ora review call", project: "ora", est: 45 },
  { day: 2, title: "Methods section, first pass", project: "thesis", est: 120 },
  { day: 3, title: "Portfolio: rewrite intro", project: "portfolio", est: 40 },
  { day: 4, title: "Thesis reading group", project: "thesis", est: 60 },
]

const now = new Date()
const todayIdx = (now.getDay() + 6) % 7
const dateLabel = now.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })

function dueToDay(due: string | null): number | null {
  if (!due) return null
  if (due === "Today") return todayIdx
  if (due === "Tomorrow") return (todayIdx + 1) % 7
  const i = DAY_NAMES.indexOf(due)
  return i >= 0 ? i : null
}

const sortTasks = (a: Task, b: Task) => Number(a.done) - Number(b.done) || RANK[a.priority] - RANK[b.priority]

export function Showcase() {
  const [tasks, setTasks] = useState<Task[]>(SHOWCASE_TASKS)
  const [tab, setTab] = useState<Tab>("today")
  const [filter, setFilter] = useState<ProjectId | null>(null)
  const [open, setOpen] = useState<string | null>(null)
  const [focusing, setFocusing] = useState(false)
  const frame = useRef<HTMLDivElement>(null)
  const panel = useRef<HTMLDivElement>(null)
  const fine = useMediaQuery(FINE_POINTER)

  const visible = useMemo(
    () => tasks.filter((t) => (!filter || t.project === filter)),
    [tasks, filter]
  )
  const today = visible.filter((t) => t.due === "Today").sort(sortTasks)
  const doneToday = today.filter((t) => t.done).length
  const next = today.find((t) => !t.done)

  const update = (id: string, patch: Partial<Task>) => {
    setTasks((all) =>
      all.map((t) => {
        if (t.id !== id) return t
        const n = { ...t, ...patch }
        if ("done" in patch) n.status = patch.done ? "done" : t.status === "done" ? "todo" : t.status
        if ("status" in patch) n.done = patch.status === "done"
        return n
      })
    )
  }

  const toggleSub = (id: string, sid: string) =>
    setTasks((all) =>
      all.map((t) =>
        t.id === id ? { ...t, subtasks: t.subtasks?.map((s) => (s.id === sid ? { ...s, done: !s.done } : s)) } : t
      )
    )

  // Tab content enters with the shared motion pattern.
  useLayoutEffect(() => {
    if (!panel.current || prefersReducedMotion()) return
    const tw = gsap.fromTo(panel.current, { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: timing.dur.base, ease: timing.ease.out, clearProps: "all" })
    return () => {
      tw.kill()
    }
  }, [tab])

  // A soft spotlight follows the cursor across the window (fine pointers only).
  useEffect(() => {
    const el = frame.current
    if (!el || !fine || prefersReducedMotion()) return
    let raf = 0
    const move = (e: PointerEvent) => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect()
        el.style.setProperty("--mx", `${e.clientX - r.left}px`)
        el.style.setProperty("--my", `${e.clientY - r.top}px`)
      })
    }
    el.addEventListener("pointermove", move)
    return () => {
      cancelAnimationFrame(raf)
      el.removeEventListener("pointermove", move)
    }
  }, [fine])

  const onTabKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    const i = TABS.findIndex((t) => t.id === tab)
    const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0
    if (!d) return
    e.preventDefault()
    const n = TABS[(i + d + TABS.length) % TABS.length]
    setTab(n.id)
    document.getElementById(`tab-${n.id}`)?.focus()
  }

  return (
    <section className="section showcase" id="product">
      <div className="container">
        <Reveal className="showcase__head" stagger={0.08}>
          <p className="kicker">The product</p>
          <h2 className="h2">
            A calm place
            <br />
            for everything you're carrying.
          </h2>
          <p className="lead">
            This is the real interface, running right here. Tick things off, open a task, cycle its priority,
            filter by project — or start a focus session.
          </p>
        </Reveal>

        <div className="showcase__frame window" ref={frame}>
          <aside className="sc-side" aria-label="Projects">
            <div className="sc-side__me">
              <span className="sc-avatar" aria-hidden="true">M</span>
              <span>My space</span>
            </div>
            <p className="sc-side__label">Projects</p>
            <ul className="sc-side__list">
              <li>
                <button type="button" aria-pressed={filter === null} onClick={() => setFilter(null)}>
                  <span className="pdot" style={{ "--c": "var(--ink)" } as CSSProperties} />
                  All projects
                  <span className="sc-count">{tasks.filter((t) => !t.done).length}</span>
                </button>
              </li>
              {PROJECTS.map((p) => {
                const all = tasks.filter((t) => t.project === p.id)
                const done = all.filter((t) => t.done).length
                return (
                  <li key={p.id}>
                    <button type="button" aria-pressed={filter === p.id} onClick={() => setFilter(filter === p.id ? null : p.id)}>
                      <span className="pdot" style={{ "--c": p.color } as CSSProperties} />
                      {p.short}
                      <span className="sc-meter" aria-label={`${done} of ${all.length} done`}>
                        <i style={{ width: `${(done / all.length) * 100}%`, background: p.color }} />
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </aside>

          <div className="sc-main">
            <header className="sc-head">
              <div>
                <p className="sc-date">{dateLabel}</p>
                <p className="sc-next">
                  {next ? (
                    <>
                      Next up: <b>{next.title}</b>
                    </>
                  ) : (
                    <b>All clear for today.</b>
                  )}
                </p>
              </div>
              <Ring done={doneToday} total={today.length} />
              <button type="button" className="sc-focus" onClick={() => setFocusing(true)} disabled={!next}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.4" />
                  <circle cx="7" cy="7" r="2" fill="currentColor" />
                </svg>
                Focus
              </button>
            </header>

            <div className="sc-tabs" role="tablist" aria-label="Views">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  id={`tab-${t.id}`}
                  role="tab"
                  type="button"
                  aria-selected={tab === t.id}
                  aria-controls="sc-panel"
                  tabIndex={tab === t.id ? 0 : -1}
                  onClick={() => setTab(t.id)}
                  onKeyDown={onTabKey}
                >
                  {t.label}
                </button>
              ))}
              <span className="sc-tabs__thumb" style={{ "--i": TABS.findIndex((t) => t.id === tab) } as CSSProperties} aria-hidden="true" />
            </div>

            <div className="sc-body">
              <div id="sc-panel" role="tabpanel" aria-labelledby={`tab-${tab}`} ref={panel} className="sc-panel">
                {tab === "today" && (
                  <TodayView
                    tasks={visible.slice().sort(sortTasks)}
                    open={open}
                    setOpen={setOpen}
                    update={update}
                    toggleSub={toggleSub}
                  />
                )}
                {tab === "board" && <BoardView tasks={visible} update={update} />}
                {tab === "week" && <WeekView tasks={visible} filter={filter} />}
              </div>
            </div>

            {focusing && next && (
              <FocusOverlay
                task={next}
                onDone={() => {
                  update(next.id, { done: true })
                  setFocusing(false)
                }}
                onExit={() => setFocusing(false)}
              />
            )}
          </div>
        </div>
        <p className="showcase__note muted">Sample workspace. Changes stay in this tab and reset on reload.</p>
      </div>
    </section>
  )
}

/* ---------------------------------------------------------------- */

function Ring({ done, total }: { done: number; total: number }) {
  const ref = useRef<SVGCircleElement>(null)
  const r = 15
  const c = 2 * Math.PI * r
  const target = total ? done / total : 0
  const first = useRef(true)

  useLayoutEffect(() => {
    if (!ref.current) return
    const offset = c * (1 - target)
    if (first.current || prefersReducedMotion()) {
      first.current = false
      gsap.set(ref.current, { strokeDashoffset: offset })
      return
    }
    gsap.to(ref.current, { strokeDashoffset: offset, duration: 0.8, ease: timing.ease.out })
  }, [target, c])

  return (
    <div className="sc-ring" role="img" aria-label={`${done} of ${total} done today`}>
      <svg viewBox="0 0 36 36" width="40" height="40" aria-hidden="true">
        <circle cx="18" cy="18" r={r} className="sc-ring__bg" />
        <circle ref={ref} cx="18" cy="18" r={r} className="sc-ring__fg" strokeDasharray={c} />
      </svg>
      <span>
        <b>{done}</b>/{total}
      </span>
    </div>
  )
}

/* ---------------------------------------------------------------- */

function TodayView({
  tasks, open, setOpen, update, toggleSub,
}: {
  tasks: Task[]
  open: string | null
  setOpen: (id: string | null) => void
  update: (id: string, p: Partial<Task>) => void
  toggleSub: (id: string, sid: string) => void
}) {
  if (!tasks.length) return <p className="sc-empty">Nothing here. Enjoy the quiet.</p>
  return (
    <ul className="sc-list">
      {tasks.map((t) => {
        const p = projectById(t.project)
        const isOpen = open === t.id
        const subDone = t.subtasks?.filter((s) => s.done).length ?? 0
        return (
          <motion.li
            key={t.id}
            layout="position"
            transition={layoutSpring}
            className="trow"
            data-done={t.done}
            data-open={isOpen}
          >
            <div className="trow__main">
              <Check checked={t.done} label={`Mark "${t.title}" as done`} onChange={(v) => update(t.id, { done: v })} />
              <button
                type="button"
                className="trow__toggle"
                aria-expanded={isOpen}
                aria-controls={`d-${t.id}`}
                onClick={() => setOpen(isOpen ? null : t.id)}
              >
                <span className="trow__title">{t.title}</span>
                <span className="trow__src">{t.source}</span>
              </button>
              <div className="trow__meta">
                {t.subtasks && (
                  <span className="trow__subs" aria-label={`${subDone} of ${t.subtasks.length} steps done`}>
                    {subDone}/{t.subtasks.length}
                  </span>
                )}
                <button
                  type="button"
                  className="trow__prio"
                  onClick={() => update(t.id, { priority: NEXT_P[t.priority] })}
                  aria-label={`Priority: ${PRIORITY_LABEL[t.priority]}. Change priority`}
                  title={`${PRIORITY_LABEL[t.priority]} — click to change`}
                >
                  <span className="prio" data-p={t.priority}><i /><i /><i /></span>
                </button>
                <span className="trow__due">{t.due}</span>
                <span className="tag trow__tag">
                  <span className="pdot" style={{ "--c": p?.color } as CSSProperties} />
                  {p?.short}
                </span>
              </div>
            </div>
            <div className="trow__detail" id={`d-${t.id}`} inert={!isOpen}>
              <div className="trow__detail-inner">
                {t.captured && (
                  <figure className="trow__quote">
                    <figcaption>Captured as</figcaption>
                    <blockquote>“{t.captured}”</blockquote>
                  </figure>
                )}
                {t.subtasks && (
                  <ul className="trow__steps">
                    {t.subtasks.map((s) => (
                      <li key={s.id} data-done={s.done}>
                        <Check size={16} checked={s.done} label={s.title} onChange={() => toggleSub(t.id, s.id)} />
                        {s.title}
                      </li>
                    ))}
                  </ul>
                )}
                <p className="trow__facts">
                  <span>Estimate · {formatMinutes(t.estimate)}</span>
                  <span>{p?.name}</span>
                </p>
              </div>
            </div>
          </motion.li>
        )
      })}
    </ul>
  )
}

/* ---------------------------------------------------------------- */

const COLS: { id: NonNullable<Task["status"]>; label: string; next?: NonNullable<Task["status"]> }[] = [
  { id: "todo", label: "To do", next: "doing" },
  { id: "doing", label: "Doing", next: "done" },
  { id: "done", label: "Done" },
]

function BoardView({ tasks, update }: { tasks: Task[]; update: (id: string, p: Partial<Task>) => void }) {
  return (
    <LayoutGroup id="board">
    <div className="board">
      {COLS.map((c) => {
        const items = tasks.filter((t) => (t.status ?? "todo") === c.id).sort(sortTasks)
        return (
          <section className="board__col" key={c.id} aria-label={c.label}>
            <h4 className="board__head">
              {c.label} <span>{items.length}</span>
            </h4>
            <ul>
              {items.map((t) => {
                const p = projectById(t.project)
                return (
                  <motion.li
                    key={t.id}
                    layoutId={`b-${t.id}`}
                    transition={layoutSpring}
                    className="bcard"
                    data-done={t.done}
                    style={{ "--c": p?.color } as CSSProperties}
                  >
                    <span className="bcard__title">{t.title}</span>
                    <span className="bcard__meta">
                      <span className="tag">
                        <span className="pdot" />
                        {p?.short}
                      </span>
                      <span className="trow__due">{t.due}</span>
                      {c.next ? (
                        <button
                          type="button"
                          className="bcard__move"
                          onClick={() => update(t.id, { status: c.next })}
                          aria-label={`Move "${t.title}" to ${COLS.find((x) => x.id === c.next)?.label}`}
                        >
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                            <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="bcard__move"
                          onClick={() => update(t.id, { status: "todo" })}
                          aria-label={`Reopen "${t.title}"`}
                        >
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                            <path d="M3 5h6.5a2.5 2.5 0 0 1 0 5H6M3 5l2.5-2.5M3 5l2.5 2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                      )}
                    </span>
                  </motion.li>
                )
              })}
            </ul>
          </section>
        )
      })}
    </div>
    </LayoutGroup>
  )
}

/* ---------------------------------------------------------------- */

function WeekView({ tasks, filter }: { tasks: Task[]; filter: ProjectId | null }) {
  const [day, setDay] = useState(todayIdx)
  const fine = useMediaQuery(FINE_POINTER)

  const days = useMemo(() => {
    const out = DAY_NAMES.map(() => [] as { title: string; project: ProjectId | null; est: number; done: boolean }[])
    tasks.forEach((t) => {
      const d = dueToDay(t.due)
      if (d !== null) out[d].push({ title: t.title, project: t.project, est: t.estimate, done: t.done })
    })
    WEEK_EXTRA.filter((e) => !filter || e.project === filter).forEach((e) =>
      out[(todayIdx + e.day) % 7].push({ title: e.title, project: e.project, est: e.est, done: false })
    )
    return out
  }, [tasks, filter])

  const max = Math.max(240, ...days.map((d) => d.reduce((a, t) => a + t.est, 0)))
  const list = days[day]

  return (
    <div className="week">
      <div className="week__chart" role="group" aria-label="Planned time per day">
        {days.map((d, i) => {
          const mins = d.reduce((a, t) => a + t.est, 0)
          return (
            <button
              type="button"
              key={i}
              className="week__day"
              aria-pressed={day === i}
              data-today={i === todayIdx}
              onClick={() => setDay(i)}
              onPointerEnter={() => fine && setDay(i)}
              aria-label={`${DAY_NAMES[i]}: ${d.length} tasks, ${formatMinutes(mins)} planned`}
            >
              <span className="week__bar">
                {PROJECTS.map((p) => {
                  const m = d.filter((t) => t.project === p.id).reduce((a, t) => a + t.est, 0)
                  return m ? <i key={p.id} style={{ height: `${(m / max) * 100}%`, background: p.color }} /> : null
                })}
              </span>
              <span className="week__name">{i === todayIdx ? "Today" : DAY_NAMES[i]}</span>
              <span className="week__mins">{mins ? formatMinutes(mins) : "—"}</span>
            </button>
          )
        })}
      </div>
      <div className="week__list" aria-live="polite">
        <p className="scene__label">
          {day === todayIdx ? "Today" : DAY_NAMES[day]} · {list.length ? `${list.length} planned` : "nothing planned"}
        </p>
        <ul>
          {list.map((t) => (
            <li key={t.title} data-done={t.done}>
              <span className="pdot" style={{ "--c": projectById(t.project)?.color } as CSSProperties} />
              <span>{t.title}</span>
              <span className="trow__due">{formatMinutes(t.est)}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------- */

function FocusOverlay({ task, onDone, onExit }: { task: Task; onDone: () => void; onExit: () => void }) {
  const [left, setLeft] = useState(25 * 60)
  const [running, setRunning] = useState(true)
  const root = useRef<HTMLDivElement>(null)
  const exitBtn = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!running) return
    const t = window.setInterval(() => setLeft((s) => Math.max(0, s - 1)), 1000)
    return () => window.clearInterval(t)
  }, [running])

  useEffect(() => exitBtn.current?.focus(), [])

  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => e.key === "Escape" && onExit()
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onExit])

  useLayoutEffect(() => {
    if (!root.current || prefersReducedMotion()) return
    const tw = gsap.fromTo(root.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 })
    const tw2 = gsap.fromTo(root.current.querySelector(".fo__card"), { y: 16, scale: 0.98 }, { y: 0, scale: 1, duration: 0.5, ease: timing.ease.out })
    return () => {
      tw.kill()
      tw2.kill()
    }
  }, [])

  const mm = String(Math.floor(left / 60)).padStart(2, "0")
  const ss = String(left % 60).padStart(2, "0")
  const p = projectById(task.project)

  return (
    <div className="fo" ref={root} role="dialog" aria-modal="false" aria-label="Focus session">
      <div className="fo__card">
        <p className="scene__label">Focusing on</p>
        <p className="fo__title">{task.title}</p>
        <p className="fo__proj">
          <span className="pdot" style={{ "--c": p?.color } as CSSProperties} /> {p?.name}
        </p>
        <p className="fo__time" aria-live="off">
          {mm}:{ss}
        </p>
        <div className="fo__bar" aria-hidden="true">
          <i style={{ transform: `scaleX(${1 - left / 1500})` }} />
        </div>
        <div className="fo__actions">
          <button type="button" className="planbtn" onClick={onDone}>
            Mark done
          </button>
          <button type="button" className="fo__ghost" onClick={() => setRunning((r) => !r)}>
            {running ? "Pause" : "Resume"}
          </button>
          <button type="button" className="fo__ghost" onClick={onExit} ref={exitBtn}>
            Exit
          </button>
        </div>
      </div>
    </div>
  )
}
