import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './estilos/base.css'
import './estilos/layout.css'
import './estilos/componentes.css'
import './estilos/paginas.css'
import './estilos/guia.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
