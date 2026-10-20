import "./kiwi-mark.css"

/** Kiwi slice + wordmark. The seeds turn a little on hover — the brand's one wink. */
export function KiwiMark({ size = 26, wordmark = true }: { size?: number; wordmark?: boolean }) {
  const seeds = Array.from({ length: 8 }, (_, i) => {
    const a = (i / 8) * Math.PI * 2
    return { cx: 16 + Math.cos(a) * 7.4, cy: 16 + Math.sin(a) * 7.4 }
  })
  return (
    <span className="kiwi-mark">
      <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
        <circle cx="16" cy="16" r="15" fill="var(--kiwi-skin)" />
        <circle cx="16" cy="16" r="12" fill="var(--kiwi-flesh)" />
        <circle cx="16" cy="16" r="4" fill="var(--kiwi-core)" />
        <g className="kiwi-mark__seeds">
          {seeds.map((s, i) => (
            <ellipse key={i} cx={s.cx} cy={s.cy} rx="0.9" ry="1.4" fill="var(--seed)"
              transform={`rotate(${(i / 8) * 360 + 90} ${s.cx} ${s.cy})`} />
          ))}
        </g>
      </svg>
      {wordmark && <span className="kiwi-mark__word">kiwi</span>}
    </span>
  )
}
