import lockup from '../assets/logo-lockup.png'
import mark from '../assets/logo-mark.png'

export function Logo({ variant = 'lockup', height = 30 }) {
  const isLockup = variant === 'lockup'

  return (
    <img
      src={isLockup ? lockup : mark}
      alt="PackRule"
      height={height}
      style={{ height, width: 'auto', display: 'block' }}
    />
  )
}
