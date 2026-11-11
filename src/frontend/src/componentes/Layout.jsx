import { Link, NavLink, Outlet } from 'react-router-dom'
import { Icone } from './Icone.jsx'
import { Logo } from './Logo.jsx'

const NAVEGACAO = [
  { to: '/', label: 'Painel', icon: 'dashboard', end: true },
  { to: '/products', label: 'Produtos', icon: 'box' },
  { to: '/rules', label: 'Regras', icon: 'rules' },
  { to: '/analyses', label: 'Histórico', icon: 'history', end: true },
]

const NAVEGACAO_CELULAR = [
  ...NAVEGACAO.slice(0, 3),
  { to: '/analyses/new', label: 'Analisar', icon: 'play' },
  NAVEGACAO[3],
]

function classeLink({ isActive }) {
  return isActive ? "ativo" : ''
}

export function Layout() {
  return (
    <>
      <header className="barra-topo">
        <div className="container barra-topo__conteudo">
          <Link to="/" className="marca" aria-label="PackRule, ir para o painel">
            <Logo />
          </Link>

          <nav className="menu-principal" aria-label="Principal">
            {NAVEGACAO.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.end} className={classeLink}>
                {item.label}
              </NavLink>
            ))}
          </nav>

          <Link to="/analyses/new" className="botao botao--pequeno">
            Nova análise
          </Link>
        </div>
      </header>

      <main className="conteudo">
        <div className="container">
          <Outlet />
        </div>
      </main>

      <nav className="menu-inferior" aria-label="Principal">
        {NAVEGACAO_CELULAR.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.end} className={classeLink}>
            <Icone nome={item.icon} tamanho={20} />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </>
  )
}
