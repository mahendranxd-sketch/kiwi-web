/**
 * Site configuration. Everything here is a placeholder until real
 * information exists — replace values, don't invent new ones.
 */

/** Where "Get started" should go. `null` = not connected yet (shows a placeholder notice). */
export const SIGNUP_URL: string | null = null

export type Testimonial = { quote: string; name: string; role: string }
export type Logo = { name: string; src: string }

/**
 * Social proof. Leave empty until you have verified, permissioned
 * quotes and logos. The Proof section adapts to whatever is here.
 */
export const PROOF: { testimonials: Testimonial[]; logos: Logo[] } = {
  testimonials: [],
  logos: [],
}

/** Footer links. `href: null` renders as a muted "soon" label instead of a dead link. */
export const LEGAL_LINKS: { label: string; href: string | null }[] = [
  { label: "Privacy", href: null },
  { label: "Terms", href: null },
]

export const SOCIAL_LINKS: { label: string; href: string | null }[] = [
  { label: "X / Twitter", href: null },
  { label: "Instagram", href: null },
]
