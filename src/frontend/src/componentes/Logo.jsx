import logoCompleto from '../assets/logo-lockup.png'
import logoCompletoBranco from '../assets/logo-lockup-white.png'
import simbolo from '../assets/logo-mark.png'
import simboloBranco from '../assets/logo-mark-white.png'

const IMAGENS = {
  lockup: { dark: logoCompleto, light: logoCompletoBranco },
  mark: { dark: simbolo, light: simboloBranco },
}

export function Logo({ variante = 'lockup', tom = 'dark', altura = 30 }) {
  return (
    <img
      src={IMAGENS[variante][tom]}
      alt="PackRule"
      height={altura}
      style={{ height: altura, width: 'auto', display: 'block' }}
    />
  )
}
