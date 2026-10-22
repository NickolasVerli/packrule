import { Icon } from './Icon'

export function EmptyState({ title, description, action }) {
  return (
    <div className="empty">
      <Icon name="empty" size={40} />
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {action}
    </div>
  )
}
