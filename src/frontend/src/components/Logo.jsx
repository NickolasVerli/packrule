export function Logo({ size = 26 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" fill="#111" />
      <path d="M8 8h11l5 5v11H8z" fill="#fff" />
      <path d="M19 8v5h5z" fill="#e8381a" />
    </svg>
  )
}
