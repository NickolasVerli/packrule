import lockup from '../assets/logo-lockup.png'
import lockupWhite from '../assets/logo-lockup-white.png'
import mark from '../assets/logo-mark.png'
import markWhite from '../assets/logo-mark-white.png'

const SOURCES = {
  lockup: { dark: lockup, light: lockupWhite },
  mark: { dark: mark, light: markWhite },
}

export function Logo({ variant = 'lockup', tone = 'dark', height = 30 }) {
  return (
    <img
      src={SOURCES[variant][tone]}
      alt="PackRule"
      height={height}
      style={{ height, width: 'auto', display: 'block' }}
    />
  )
}
