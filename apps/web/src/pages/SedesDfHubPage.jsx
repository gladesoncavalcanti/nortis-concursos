import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Scale,
  Users,
  Accessibility,
  HeartHandshake,
  ShieldAlert,
  Building2,
  MapPin,
  Target,
  BookOpen,
  AlertTriangle,
  MessageSquare,
  Brain,
  Table2,
  FileText,
  ClipboardCheck,
  CheckCircle2,
  ShoppingCart,
  Eye,
  Download,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import FreeSampleModal from '@/components/FreeSampleModal.jsx';
import ExamCountdown from '@/components/ExamCountdown.jsx';
import ContestTimeline from '@/components/ContestTimeline.jsx';
import StudyPlanner from '@/components/StudyPlanner.jsx';
import { SEDES_DF_2026_EXAM_DATE } from '@/config/contestDates.js';

/**
 * Hub SEDES-DF 2026 (Fase 7) — página de conteúdo/conversão dedicada ao
 * concurso, estilo Executive Minimal Dark. Reaproveita o fluxo de
 * amostra grátis da Fase 5 (FreeSampleModal, sem alterar o componente
 * nem a migration) e o link para /apostilas (mesmo padrão do resto do
 * site) — nenhuma lógica nova de checkout ou carrinho.
 *
 * Nenhuma data de edital/inscrição/prova/resultado é mencionada —
 * apenas informações já confirmadas em outras partes do site (banca,
 * páginas, preço).
 */
const STUDY_TOPICS = [
  { icon: Scale, title: 'LOAS / SUAS' },
  { icon: Users, title: 'ECA' },
  { icon: Accessibility, title: 'Lei Brasileira de Inclusão' },
  { icon: HeartHandshake, title: 'Estatuto da Pessoa Idosa' },
  { icon: ShieldAlert, title: 'Lei Maria da Penha' },
  { icon: Building2, title: 'Programas Sociais do DF' },
  { icon: MapPin, title: 'Conhecimentos Distritais' },
  { icon: Target, title: 'Banca Quadrix' },
];

const QUADRIX_POINTS = [
  'Interpretação literal da legislação',
  'Atenção a detalhes do enunciado',
  'Conceitos próximos, fáceis de confundir',
  'Competências e atribuições de cada órgão',
  'Pegadinhas recorrentes em enunciados',
];

const HELPS = [
  { icon: BookOpen, title: 'Conteúdo organizado por módulos' },
  { icon: AlertTriangle, title: 'Pegadinhas e pontos de atenção' },
  { icon: MessageSquare, title: 'Questões comentadas' },
  { icon: Brain, title: 'Mapas mentais' },
  { icon: Table2, title: 'Quadros comparativos' },
  { icon: FileText, title: 'Resumos executivos' },
  { icon: ClipboardCheck, title: 'Simulado final integrado' },
];

const NAVY_BG =
  'radial-gradient(circle at 88% 14%, rgba(211,165,47,0.09) 0%, transparent 32%), linear-gradient(90deg, #071622 0%, #071522 45%, #06121f 100%)';

const SedesDfHubPage = () => {
  const [isSampleModalOpen, setIsSampleModalOpen] = useState(false);

  return (
    <>
      <Helmet>
        <title>SEDES-DF 2026 - NORTIS CONCURSOS</title>
        <meta
          name="description"
          content="Guia estratégico para o concurso SEDES-DF 2026: banca Quadrix, conteúdos essenciais e a apostila Nexo Social, com 741 páginas e questões comentadas."
        />
      </Helmet>

      {/* 1. Hero do concurso */}
      <section className="relative overflow-hidden section-seamless" style={{ background: NAVY_BG }}>
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 lg:py-24 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] mb-3" style={{ color: '#f1c85b' }}>
              Guia do concurso
            </p>
            <h1
              className="uppercase text-4xl sm:text-5xl lg:text-6xl font-medium leading-[0.98] tracking-tight mb-5"
              style={{ fontFamily: 'Georgia, "Times New Roman", serif', color: '#f4efe4' }}
            >
              SEDES-DF 2026
            </h1>
            <p className="text-base md:text-lg text-[#f4efe4]/80 leading-relaxed max-w-2xl mx-auto mb-8">
              Prepare-se com direção para o concurso da Secretaria de Desenvolvimento Social do
              Distrito Federal.
            </p>

            <div className="flex flex-wrap justify-center gap-2 mb-9">
              {['Banca Quadrix', 'Apostila Nexo Social', '741 páginas', 'PDF digital', 'Atualizações até a prova'].map(
                (chip) => (
                  <span
                    key={chip}
                    className="text-xs font-semibold uppercase tracking-wide px-3.5 py-1.5 rounded-full"
                    style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(244,239,228,0.85)', border: '1px solid rgba(255,255,255,0.15)' }}
                  >
                    {chip}
                  </span>
                )
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/apostilas">
                <Button
                  className="w-full sm:w-auto h-12 px-9 font-bold text-sm uppercase tracking-wide rounded-sm text-[#f1c85b] hover:text-[#f1c85b] transition-premium"
                  style={{ border: '1px solid #d3a52f', background: 'rgba(211,165,47,0.08)' }}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Quero a apostila
                </Button>
              </Link>
              <Link to="/#preview-apostila">
                <Button
                  variant="outline"
                  className="w-full sm:w-auto h-12 px-9 font-semibold text-sm border-white/25 text-[#f4efe4] bg-transparent hover:bg-white/10 hover:text-[#f4efe4] transition-premium"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Ver amostra gratuita
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contagem regressiva (Fase 8) — sem data oficial configurada
          ainda (ver apps/web/src/config/contestDates.js), então mostra
          "Data da prova a confirmar", nunca uma contagem inventada. */}
      <ExamCountdown examDate={SEDES_DF_2026_EXAM_DATE} />

      {/* Linha do tempo do concurso (Fase 9) — todas as etapas com
          dateLabel "A confirmar" por padrão, sem nenhuma data oficial
          inventada. Independente do ExamCountdown acima. */}
      <ContestTimeline />

      {/* 2. Sobre o concurso */}
      <section className="py-16 lg:py-20 bg-background section-seamless">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold font-heading text-foreground mb-5">Sobre o concurso</h2>
          <p className="text-muted-foreground leading-relaxed">
            Esta página reúne informações estratégicas para quem pretende estudar para o concurso
            SEDES-DF 2026, com foco na banca Quadrix e nos conteúdos mais relevantes para a
            preparação.
          </p>
        </div>
      </section>

      {/* 3. O que estudar */}
      <section className="py-16 lg:py-20 bg-muted/40 section-seamless">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold font-heading text-foreground">O que estudar</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {STUDY_TOPICS.map((topic, index) => (
              <motion.div
                key={topic.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: index * 0.04 }}
                className="bg-card p-5 rounded-xl border border-border shadow-sm text-center"
              >
                <div className="w-10 h-10 rounded-lg bg-[hsl(var(--primary))] flex items-center justify-center mb-3 mx-auto text-[hsl(var(--accent))]">
                  <topic.icon className="w-5 h-5" />
                </div>
                <p className="text-sm font-semibold text-card-foreground leading-snug">{topic.title}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Plano semanal de estudos (Fase 10) — roteiro sugerido, 100%
          estático/visual. Sem progresso real, sem login, sem Supabase. */}
      <StudyPlanner />

      {/* 4. Por que a banca Quadrix exige atenção */}
      <section className="relative overflow-hidden section-seamless" style={{ background: NAVY_BG }}>
        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <h2
            className="text-2xl md:text-3xl font-bold mb-3 text-center"
            style={{ fontFamily: 'Georgia, "Times New Roman", serif', color: '#f4efe4' }}
          >
            Por que a banca Quadrix exige atenção
          </h2>
          <p className="text-[#f4efe4]/60 text-center leading-relaxed mb-9 max-w-xl mx-auto">
            A Quadrix tem um estilo próprio de cobrança. Conhecer esse padrão ajuda a estudar com
            mais direção — não é garantia de aprovação, mas reduz surpresas na prova.
          </p>
          <ul className="space-y-3 max-w-xl mx-auto">
            {QUADRIX_POINTS.map((point) => (
              <li
                key={point}
                className="flex items-center text-sm md:text-base text-[#f4efe4]/85 rounded-xl px-5 py-3.5"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <AlertTriangle className="w-4 h-4 mr-3 shrink-0" style={{ color: '#f1c85b' }} />
                {point}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 5. Como a apostila Nexo Social ajuda */}
      <section className="py-16 lg:py-20 bg-background section-seamless">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold font-heading text-foreground">
              Como a apostila Nexo Social ajuda
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {HELPS.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: index * 0.05 }}
                className="bg-card p-6 rounded-xl border border-border shadow-sm"
              >
                <div className="w-10 h-10 rounded-lg bg-[hsl(var(--primary))] flex items-center justify-center mb-4 text-[hsl(var(--accent))]">
                  <item.icon className="w-5 h-5" />
                </div>
                <p className="text-sm font-semibold text-card-foreground leading-snug">{item.title}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Produto recomendado */}
      <section className="py-16 lg:py-20 bg-muted/40 section-seamless">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold font-heading text-foreground">Produto recomendado</h2>
          </div>
          <div className="bg-card rounded-2xl overflow-hidden shadow-premium-lg border border-border">
            <div className="grid md:grid-cols-[0.8fr_1.2fr] gap-0">
              <div className="relative bg-[hsl(var(--primary))] p-8 flex items-center justify-center">
                <img
                  src="/nexo-social-capa-741.jpeg"
                  alt="Capa da apostila Nexo Social – SEDES DF 2026, banca Quadrix, 741 páginas"
                  className="w-full max-w-[13rem] h-auto rounded-lg shadow-premium-lg ring-1 ring-white/15"
                  loading="lazy"
                />
              </div>
              <div className="p-7 md:p-9 flex flex-col justify-center">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                  Nexo Social — SEDES-DF 2026
                </p>
                <h3 className="text-xl md:text-2xl font-bold font-heading text-foreground mb-4">
                  Apostila completa para a banca Quadrix
                </h3>
                <ul className="space-y-2 mb-6">
                  {['Banca Quadrix', '741 páginas', 'PDF digital'].map((item) => (
                    <li key={item} className="flex items-center text-sm text-foreground">
                      <CheckCircle2 className="w-4 h-4 mr-2.5 text-[hsl(var(--accent))] shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="mb-6">
                  <span className="text-3xl font-bold font-heading tracking-tight text-[hsl(var(--primary))]">
                    R$ 39,90
                  </span>
                  <p className="text-xs text-muted-foreground mt-1">Pagamento único</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link to="/apostilas" className="flex-1">
                    <Button className="w-full h-11 font-bold bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] hover:bg-[hsl(var(--accent))]/90 transition-premium">
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Comprar agora
                    </Button>
                  </Link>
                  <Link to="/#preview-apostila" className="flex-1">
                    <Button variant="outline" className="w-full h-11 font-semibold">
                      <Eye className="w-4 h-4 mr-2" />
                      Ver por dentro
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Materiais gratuitos — reaproveita o modal da Fase 5 */}
      <section className="py-16 lg:py-20 bg-background section-seamless">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className="rounded-2xl p-8 md:p-10 text-center"
            style={{ background: 'rgba(11,34,56,1)', border: '1px solid rgba(211,165,47,0.3)' }}
          >
            <Download className="w-9 h-9 mx-auto mb-4" style={{ color: '#f1c85b' }} />
            <h2 className="text-xl md:text-2xl font-bold text-[#f4efe4] mb-3">
              Receba uma prévia gratuita do material
            </h2>
            <p className="text-sm text-[#f4efe4]/65 leading-relaxed mb-6 max-w-md mx-auto">
              Informe seus dados e receba uma amostra visual do conteúdo da apostila Nexo Social.
            </p>
            <Button
              type="button"
              onClick={() => setIsSampleModalOpen(true)}
              className="h-12 px-8 font-bold text-sm uppercase tracking-wide rounded-sm text-[#f1c85b] hover:text-[#f1c85b] transition-premium"
              style={{ border: '1px solid #d3a52f', background: 'rgba(211,165,47,0.08)' }}
            >
              <Download className="w-4 h-4 mr-2" />
              Baixar amostra grátis
            </Button>
          </div>
        </div>
      </section>

      {/* 8. CTA final */}
      <section className="py-16 lg:py-20 bg-[hsl(var(--primary))] text-center section-seamless">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold font-heading text-white mb-6">
            Estude com foco no que realmente importa.
          </h2>
          <Link to="/apostilas">
            <Button className="h-12 px-9 font-bold bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] hover:bg-[hsl(var(--accent))]/90 transition-premium">
              Quero estudar com o Método Nortis
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      <FreeSampleModal isOpen={isSampleModalOpen} onClose={() => setIsSampleModalOpen(false)} />
    </>
  );
};

export default SedesDfHubPage;
