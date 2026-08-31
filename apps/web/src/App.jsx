import React, { useState, lazy, Suspense } from 'react';
import { Route, Routes, BrowserRouter as Router } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Toaster } from '@/components/ui/sonner.jsx';
import { AuthProvider } from '@/contexts/AuthContext.jsx';
import { CartProvider } from '@/hooks/useCart.jsx';
import ScrollToTop from '@/components/ScrollToTop.jsx';
import TrustBar from '@/components/TrustBar.jsx';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import FloatingWhatsAppButton from '@/components/FloatingWhatsAppButton.jsx';
import ShoppingCart from '@/components/ShoppingCart.jsx';
import MobileStickyCTA from '@/components/MobileStickyCTA.jsx';
import ProtectedRoute from '@/components/ProtectedRoute.jsx';

import HomePage from '@/pages/HomePage.jsx';
import ApostilasPage from '@/pages/ApostilasPage.jsx';
import MateriaisGratuitosPage from '@/pages/MateriaisGratuitosPage.jsx';
import SobreNortisPage from '@/pages/SobreNortisPage.jsx';
import ContatoPage from '@/pages/ContatoPage.jsx';
import PoliticaPrivacidadePage from '@/pages/PoliticaPrivacidadePage.jsx';
import TermosUsoPage from '@/pages/TermosUsoPage.jsx';
import LoginPage from '@/pages/LoginPage.jsx';
import SignupPage from '@/pages/SignupPage.jsx';
import ForgotPasswordPage from '@/pages/ForgotPasswordPage.jsx';
import ResetPasswordPage from '@/pages/ResetPasswordPage.jsx';
import MyAccountPage from '@/pages/MyAccountPage.jsx';
import SyllabusPage from '@/pages/SyllabusPage.jsx';
import QuestionBankPage from '@/pages/QuestionBankPage.jsx';
import ObjectiveDiagnosticPage from '@/pages/ObjectiveDiagnosticPage.jsx';
import SimulationsPage from '@/pages/SimulationsPage.jsx';
import ProgressPage from '@/pages/ProgressPage.jsx';
import FlashcardsPage from '@/pages/FlashcardsPage.jsx';
import StudyPlanPage from '@/pages/StudyPlanPage.jsx';
import CommunityPage from '@/pages/CommunityPage.jsx';
import StudyTutorPage from '@/pages/StudyTutorPage.jsx';
import EssayThemesPage from '@/pages/EssayThemesPage.jsx';
import EssayEditorPage from '@/pages/EssayEditorPage.jsx';
import ProductDetailPage from '@/pages/ProductDetailPage.jsx';
import SedesDfHubPage from '@/pages/SedesDfHubPage.jsx';
import SprintDiscursivaPage from '@/pages/SprintDiscursivaPage.jsx';
import ConcursosPage from '@/pages/ConcursosPage.jsx';
import ConcursoDetailPage from '@/pages/ConcursoDetailPage.jsx';
import ComeceAquiPage from '@/pages/ComeceAquiPage.jsx';
import SuccessPage from '@/pages/SuccessPage.jsx';
import PedidoSucessoPage from '@/pages/PedidoSucessoPage.jsx';
import PedidoPendentePage from '@/pages/PedidoPendentePage.jsx';
import PedidoErroPage from '@/pages/PedidoErroPage.jsx';

// Carregada sob demanda (React.lazy) e só existe como rota em modo dev,
// para não inflar o bundle principal de produção nem ficar acessível
// para visitantes reais do site.
const SupabaseProductsCheckPage = lazy(() => import('@/pages/dev/SupabaseProductsCheckPage.jsx'));
const SupabaseProductsAdaptedCheckPage = lazy(() =>
  import('@/pages/dev/SupabaseProductsAdaptedCheckPage.jsx')
);

// Rota de comparação dev-only — carregada sob demanda, sem link no
// menu principal, sem addToCart, sem afetar /apostilas, e sem ficar
// exposta em produção (mesmo padrão das outras rotas /dev/*).
const ApostilasSupabasePreviewPage = lazy(() =>
  import('@/pages/ApostilasSupabasePreviewPage.jsx')
);

function App() {
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <ScrollToTop />
          <Helmet>
            <meta name="description" content="Apostilas digitais com organização estratégica, foco em banca e preparação objetiva para concursos públicos." />
            <link rel="canonical" href="https://www.nortisconcursos.com.br/" />
            <meta property="og:site_name" content="Nortis Concursos" />
            <meta property="og:type" content="website" />
            <meta property="og:title" content="Nortis Concursos | Apostilas digitais para concursos" />
            <meta property="og:description" content="Apostilas digitais com organização estratégica, foco em banca e preparação objetiva para concursos públicos." />
            <meta property="og:url" content="https://www.nortisconcursos.com.br/" />
            <meta property="og:image" content="https://www.nortisconcursos.com.br/nortis-banner-institucional.png" />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content="Nortis Concursos | Apostilas digitais para concursos" />
            <meta name="twitter:description" content="Apostilas digitais com organização estratégica, foco em banca e preparação objetiva para concursos públicos." />
          </Helmet>

          <div className="flex flex-col min-h-screen bg-background">
            <TrustBar />
            <Header setIsCartOpen={setIsCartOpen} />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/apostilas" element={<ApostilasPage />} />
                <Route path="/materiais-gratuitos" element={<MateriaisGratuitosPage />} />
                <Route path="/sobre" element={<SobreNortisPage />} />
                <Route path="/contato" element={<ContatoPage />} />
                <Route path="/politica-privacidade" element={<PoliticaPrivacidadePage />} />
                <Route path="/termos-uso" element={<TermosUsoPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/esqueci-senha" element={<ForgotPasswordPage />} />
                <Route path="/redefinir-senha" element={<ResetPasswordPage />} />
                <Route path="/product/:id" element={<ProductDetailPage />} />
                <Route path="/sedes-df-2026" element={<SedesDfHubPage />} />
                <Route path="/sprint-discursiva-sedes-df" element={<SprintDiscursivaPage />} />
                <Route path="/concursos" element={<ConcursosPage />} />
                <Route path="/concursos/:slug" element={<ConcursoDetailPage />} />
                <Route path="/comece-aqui" element={<ComeceAquiPage />} />
                <Route path="/success" element={<SuccessPage />} />
                <Route path="/pedido/sucesso" element={<PedidoSucessoPage />} />
                <Route path="/pedido/pendente" element={<PedidoPendentePage />} />
                <Route path="/pedido/erro" element={<PedidoErroPage />} />
                {import.meta.env.DEV && (
                  <Route
                    path="/dev/supabase-products"
                    element={
                      <Suspense fallback={<div className="p-8">Carregando...</div>}>
                        <SupabaseProductsCheckPage />
                      </Suspense>
                    }
                  />
                )}
                {import.meta.env.DEV && (
                  <Route
                    path="/dev/supabase-products-adapted"
                    element={
                      <Suspense fallback={<div className="p-8">Carregando...</div>}>
                        <SupabaseProductsAdaptedCheckPage />
                      </Suspense>
                    }
                  />
                )}
                {import.meta.env.DEV && (
                  <Route
                    path="/dev/apostilas-supabase-preview"
                    element={
                      <Suspense fallback={<div className="p-8">Carregando...</div>}>
                        <ApostilasSupabasePreviewPage />
                      </Suspense>
                    }
                  />
                )}
                <Route 
                  path="/minha-conta" 
                  element={
                    <ProtectedRoute>
                      <MyAccountPage />
                    </ProtectedRoute>
                  } 
                />
                <Route
                  path="/minha-conta/edital"
                  element={
                    <ProtectedRoute>
                      <SyllabusPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/minha-conta/questoes"
                  element={
                    <ProtectedRoute>
                      <QuestionBankPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/minha-conta/diagnostico"
                  element={
                    <ProtectedRoute>
                      <ObjectiveDiagnosticPage />
                    </ProtectedRoute>
                  }
                />
                <Route path="/minha-conta/simulados" element={<ProtectedRoute><SimulationsPage /></ProtectedRoute>} />
                <Route path="/minha-conta/progresso" element={<ProtectedRoute><ProgressPage /></ProtectedRoute>} />
                <Route path="/minha-conta/flashcards" element={<ProtectedRoute><FlashcardsPage /></ProtectedRoute>} />
                <Route path="/minha-conta/plano" element={<ProtectedRoute><StudyPlanPage /></ProtectedRoute>} />
                <Route path="/minha-conta/comunidade" element={<ProtectedRoute><CommunityPage /></ProtectedRoute>} />
                <Route path="/minha-conta/tutor" element={<ProtectedRoute><StudyTutorPage /></ProtectedRoute>} />
                <Route path="/minha-conta/tutor/redacao" element={<ProtectedRoute><EssayThemesPage /></ProtectedRoute>} />
                <Route path="/minha-conta/tutor/redacao/:submissionId" element={<ProtectedRoute><EssayEditorPage /></ProtectedRoute>} />
                <Route path="*" element={
                  <div className="min-h-screen flex items-center justify-center bg-background">
                    <div className="text-center">
                      <h1 className="text-6xl font-bold font-heading text-foreground mb-4">404</h1>
                      <p className="text-xl text-muted-foreground mb-8">Página não encontrada</p>
                      <a href="/" className="text-[hsl(var(--primary))] hover:text-[hsl(var(--secondary))] font-bold underline transition-colors">
                        Voltar para o início
                      </a>
                    </div>
                  </div>
                } />
              </Routes>
            </main>
            <Footer />
            <FloatingWhatsAppButton />
            <ShoppingCart isCartOpen={isCartOpen} setIsCartOpen={setIsCartOpen} />
            <MobileStickyCTA isCartOpen={isCartOpen} />
          </div>
          <Toaster />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
