import { CLASSIFICATIONS } from '../utils/constants'

export function ClassificationBadge({ classification }) {
  return (
    <span className={`badge badge--${classification.toLowerCase()}`}>
      {CLASSIFICATIONS[classification].label}
    </span>
  )
}
