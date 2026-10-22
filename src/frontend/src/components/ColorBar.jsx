import { CLASSIFICATIONS } from '../utils/constants'

const ORDERED_KEYS = Object.keys(CLASSIFICATIONS).sort(
  (a, b) => CLASSIFICATIONS[a].order - CLASSIFICATIONS[b].order,
)

export function ColorBar({ counts }) {
  const total = ORDERED_KEYS.reduce((sum, key) => sum + counts[key], 0)

  return (
    <div>
      <div
        className="color-bar"
        role="img"
        aria-label={ORDERED_KEYS.map((key) => `${counts[key]} ${CLASSIFICATIONS[key].label}`).join(', ')}
      >
        {total > 0 &&
          ORDERED_KEYS.filter((key) => counts[key] > 0).map((key) => (
            <div
              key={key}
              className={`color-bar__segment color-bar__segment--${key.toLowerCase()}`}
              style={{ flexGrow: counts[key] }}
            />
          ))}
      </div>
      <ul className="legend">
        {ORDERED_KEYS.map((key) => (
          <li key={key} className="legend__item">
            <strong className="legend__count">{counts[key]}</strong>
            <span>{CLASSIFICATIONS[key].label}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
