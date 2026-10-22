import { CLASSIFICATIONS } from '../utils/constants'

const ORDERED_KEYS = Object.keys(CLASSIFICATIONS).sort(
  (a, b) => CLASSIFICATIONS[a].order - CLASSIFICATIONS[b].order,
)

export function ColorBar({ counts }) {
  const label = ORDERED_KEYS.map((key) => `${counts[key]} ${CLASSIFICATIONS[key].label}`).join(', ')

  return (
    <div className="color-bar" role="img" aria-label={label}>
      {ORDERED_KEYS.filter((key) => counts[key] > 0).map((key) => (
        <div
          key={key}
          className={`color-bar__segment color-bar__segment--${key.toLowerCase()}`}
          style={{ flexGrow: counts[key] }}
        />
      ))}
    </div>
  )
}
