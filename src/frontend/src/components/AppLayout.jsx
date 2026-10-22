import { Link, NavLink, Outlet } from 'react-router-dom'
import { Icon } from './Icon'
import { Logo } from './Logo'

const NAVIGATION = [
  { to: '/', label: 'Painel', icon: 'dashboard', end: true },
  { to: '/products', label: 'Produtos', icon: 'box' },
  { to: '/rules', label: 'Regras', icon: 'rules' },
  { to: '/analyses', label: 'Histórico', icon: 'history', end: true },
]

const MOBILE_NAVIGATION = [
  ...NAVIGATION.slice(0, 3),
  { to: '/analyses/new', label: 'Analisar', icon: 'play' },
  NAVIGATION[3],
]

function linkClass({ isActive }) {
  return isActive ? 'is-active' : ''
}

export function AppLayout() {
  return (
    <>
      <header className="topbar">
        <div className="container topbar__inner">
          <Link to="/" className="brand">
            <Logo />
            PackRule
          </Link>

          <nav className="topnav" aria-label="Principal">
            {NAVIGATION.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.end} className={linkClass}>
                {item.label}
              </NavLink>
            ))}
          </nav>

          <Link to="/analyses/new" className="btn btn--small">
            Nova análise
          </Link>
        </div>
      </header>

      <main className="main">
        <div className="container">
          <Outlet />
        </div>
      </main>

      <nav className="bottomnav" aria-label="Principal">
        {MOBILE_NAVIGATION.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.end} className={linkClass}>
            <Icon name={item.icon} size={20} />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </>
  )
}
