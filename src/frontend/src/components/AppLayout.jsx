import { useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { Icon } from './Icon'
import { Logo } from './Logo'

const NAVIGATION = [
  { to: '/', label: 'Painel', icon: 'dashboard', end: true },
  { to: '/products', label: 'Produtos', icon: 'box' },
  { to: '/rules', label: 'Regras', icon: 'rules' },
  { to: '/analyses/new', label: 'Nova análise', icon: 'play' },
  { to: '/analyses', label: 'Histórico', icon: 'history', end: true },
]

export function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const [lastPath, setLastPath] = useState(location.pathname)

  if (lastPath !== location.pathname) {
    setLastPath(location.pathname)
    setMenuOpen(false)
  }

  return (
    <div className="app">
      <header className="topbar">
        <button
          type="button"
          className="btn btn--ghost btn--small"
          style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.3)' }}
          onClick={() => setMenuOpen(true)}
          aria-label="Abrir menu"
        >
          <Icon name="menu" />
        </button>
        <Logo size={26} />
        <span className="topbar__name">PackRule</span>
      </header>

      <div
        className={`scrim ${menuOpen ? 'scrim--visible' : ''}`}
        onClick={() => setMenuOpen(false)}
        aria-hidden="true"
      />

      <aside className={`sidebar ${menuOpen ? 'sidebar--open' : ''}`}>
        <Link to="/" className="sidebar__brand">
          <Logo />
          <span className="sidebar__brand-name">PackRule</span>
        </Link>

        <p className="sidebar__section">Navegação</p>
        <nav className="sidebar__nav" aria-label="Principal">
          {NAVIGATION.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `nav-link ${isActive ? 'nav-link--active' : ''}`}
            >
              <Icon name={item.icon} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <p className="sidebar__footer">
          Ferramenta de apoio. Um resultado Passed não é certificação nem garantia jurídica.
        </p>
      </aside>

      <main className="main">
        <div className="main__inner">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
