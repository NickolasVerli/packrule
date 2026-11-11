import { CLASSIFICATIONS } from '../utils/constants'

export function ClassificationBadge({ classification }) {
  return (
    <span className={`status status--${classification.toLowerCase()}`}>
      <i className="marker" aria-hidden="true" />
      {CLASSIFICATIONS[classification].label}
    </span>
  )
}
