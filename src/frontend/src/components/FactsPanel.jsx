import { CLASSIFICATIONS } from '../utils/constants'
import { ClassificationBadge } from './ClassificationBadge'
import { ColorBar } from './ColorBar'

const ORDERED_KEYS = Object.keys(CLASSIFICATIONS).sort(
  (a, b) => CLASSIFICATIONS[a].order - CLASSIFICATIONS[b].order,
)

export function FactsPanel({ title, subtitle, counts, selected, onSelect, note }) {
  const interactive = Boolean(onSelect)

  return (
    <aside className="facts" aria-label={title}>
      <h2 className="facts__title">{title}</h2>
      {subtitle && <p className="facts__subtitle">{subtitle}</p>}
      <div className="facts__thick" />

      <ul className="facts__rows">
        {ORDERED_KEYS.map((key) => {
          const content = (
            <>
              <ClassificationBadge classification={key} />
              <span className="facts__value">{counts[key]}</span>
            </>
          )

          return (
            <li key={key}>
              {interactive ? (
                <button
                  type="button"
                  className="facts__row"
                  aria-pressed={selected === key}
                  onClick={() => onSelect(selected === key ? '' : key)}
                >
                  {content}
                </button>
              ) : (
                <div className="facts__row">{content}</div>
              )}
            </li>
          )
        })}
      </ul>

      <div className="facts__bar">
        <ColorBar counts={counts} />
      </div>
      {note && <p className="facts__note">{note}</p>}
    </aside>
  )
}
