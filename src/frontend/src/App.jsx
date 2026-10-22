import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/AppLayout'
import { ToastProvider } from './context/ToastProvider'
import { AnalysisHistoryPage } from './pages/analyses/AnalysisHistoryPage'
import { AnalysisResultPage } from './pages/analyses/AnalysisResultPage'
import { NewAnalysisPage } from './pages/analyses/NewAnalysisPage'
import { DashboardPage } from './pages/DashboardPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { PackagingDetailPage } from './pages/products/PackagingDetailPage'
import { PackagingFormPage } from './pages/products/PackagingFormPage'
import { ProductDetailPage } from './pages/products/ProductDetailPage'
import { ProductFormPage } from './pages/products/ProductFormPage'
import { ProductListPage } from './pages/products/ProductListPage'
import { RuleFormPage } from './pages/rules/RuleFormPage'
import { RuleListPage } from './pages/rules/RuleListPage'

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="products" element={<ProductListPage />} />
            <Route path="products/new" element={<ProductFormPage />} />
            <Route path="products/:id" element={<ProductDetailPage />} />
            <Route path="products/:id/edit" element={<ProductFormPage />} />
            <Route path="products/:productId/versions/new" element={<PackagingFormPage />} />
            <Route path="versions/:id" element={<PackagingDetailPage />} />
            <Route path="rules" element={<RuleListPage />} />
            <Route path="rules/new" element={<RuleFormPage />} />
            <Route path="rules/:id/edit" element={<RuleFormPage />} />
            <Route path="analyses" element={<AnalysisHistoryPage />} />
            <Route path="analyses/new" element={<NewAnalysisPage />} />
            <Route path="analyses/:id" element={<AnalysisResultPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </ToastProvider>
    </BrowserRouter>
  )
}
