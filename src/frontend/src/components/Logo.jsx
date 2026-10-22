export function Logo({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <circle cx="16" cy="16" r="8" fill="none" stroke="#f2f3f0" strokeWidth="2" />
      <path d="M16 3v26M3 16h26" stroke="#e5006d" strokeWidth="2" />
      <circle cx="16" cy="16" r="2.5" fill="#f2f3f0" />
    </svg>
  )
}
