import { createContext, useCallback, useContext, useEffect, useState, type MouseEvent, type ReactNode } from "react"
import { SIGNUP_URL } from "../lib/config"

type SignupCtx = { href: string; onClick?: (e: MouseEvent<HTMLElement>) => void }

const Ctx = createContext<SignupCtx>({ href: SIGNUP_URL ?? "#get-started" })

/**
 * Every "Get started" goes through here. Until SIGNUP_URL is set,
 * the button explains that the destination is a placeholder instead
 * of pretending to sign anyone up.
 */
export function SignupProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)

  const onClick = useCallback((e: MouseEvent<HTMLElement>) => {
    if (SIGNUP_URL) return
    e.preventDefault()
    setOpen(true)
  }, [])

  useEffect(() => {
    if (!open) return
    const t = window.setTimeout(() => setOpen(false), 6000)
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false)
    window.addEventListener("keydown", onKey)
    return () => {
      window.clearTimeout(t)
      window.removeEventListener("keydown", onKey)
    }
  }, [open])

  return (
    <Ctx.Provider value={{ href: SIGNUP_URL ?? "#get-started", onClick: SIGNUP_URL ? undefined : onClick }}>
      {children}
      <div aria-live="polite">
        {open && (
          <div className="toast" role="status">
            <span>
              <strong>Placeholder:</strong> sign-up isn't connected yet. Set <code>SIGNUP_URL</code> in{" "}
              <code>src/lib/config.ts</code>.
            </span>
            <button type="button" onClick={() => setOpen(false)} aria-label="Dismiss">
              ✕
            </button>
          </div>
        )}
      </div>
    </Ctx.Provider>
  )
}

export const useSignup = () => useContext(Ctx)
