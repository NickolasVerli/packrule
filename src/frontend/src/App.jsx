import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Layout } from './componentes/Layout.jsx'
import { Avisos } from './componentes/Avisos.jsx'
import { Historico } from './paginas/Historico.jsx'
import { ResultadoAnalise } from './paginas/ResultadoAnalise.jsx'
import { NovaAnalise } from './paginas/NovaAnalise.jsx'
import { Painel } from './paginas/Painel.jsx'
import { NaoEncontrada } from './paginas/NaoEncontrada.jsx'
import { DetalhesEmbalagem } from './paginas/DetalhesEmbalagem.jsx'
import { CadastroEmbalagem } from './paginas/CadastroEmbalagem.jsx'
import { DetalhesProduto } from './paginas/DetalhesProduto.jsx'
import { CadastroProduto } from './paginas/CadastroProduto.jsx'
import { Produtos } from './paginas/Produtos.jsx'
import { CadastroRegra } from './paginas/CadastroRegra.jsx'
import { Regras } from './paginas/Regras.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <Avisos>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Painel />} />
            <Route path="products" element={<Produtos />} />
            <Route path="products/new" element={<CadastroProduto />} />
            <Route path="products/:id" element={<DetalhesProduto />} />
            <Route path="products/:id/edit" element={<CadastroProduto />} />
            <Route path="products/:productId/versions/new" element={<CadastroEmbalagem />} />
            <Route path="versions/:id" element={<DetalhesEmbalagem />} />
            <Route path="rules" element={<Regras />} />
            <Route path="rules/new" element={<CadastroRegra />} />
            <Route path="rules/:id/edit" element={<CadastroRegra />} />
            <Route path="analyses" element={<Historico />} />
            <Route path="analyses/new" element={<NovaAnalise />} />
            <Route path="analyses/:id" element={<ResultadoAnalise />} />
            <Route path="*" element={<NaoEncontrada />} />
          </Route>
        </Routes>
      </Avisos>
    </BrowserRouter>
  )
}
