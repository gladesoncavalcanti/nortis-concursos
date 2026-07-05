import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ShoppingCart, Download, CheckCircle2, X } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';

/**
 * "Veja por dentro da apostila" (Fase 4) — mockup de leitor + card
 * comercial, estilo Executive Minimal Dark.
 *
 * Não existe arquivo real de amostra em PDF no projeto (verificado antes
 * de implementar). As 8 imagens abaixo SÃO reais — o mesmo conteúdo já
 * usado no lightbox da seção "Conheça o Que Você Recebe"
 * (apps/web/public/cards/), não são páginas inventadas. Ainda assim, são
 * peças de resumo visual da apostila, não o PDF literal escaneado —
 * por isso o aviso discreto "Prévia visual demonstrativa" e o contador
 * "Prévia X de 8" (nunca um número de página fabricado tipo "página 156").
 */
const PREVIEW_PAGES = [
  { title: 'DNA da Aprovação', src: '/cards/01-dna-da-aprovacao.png' },
  { title: 'Pegadinhas da banca Quadrix', src: '/cards/02-pegadinhas-da-banca.png' },
  { title: 'Quadros comparativos', src: '/cards/03-quadros-comparativos.png' },
  { title: 'Mapas mentais', src: '/cards/04-mapas-mentais.png' },
  { title: 'Fluxogramas', src: '/cards/05-fluxogramas.png' },
  { title: 'Questões comentadas', src: '/cards/06-questoes-comentadas.png' },
  { title: 'Resumos executivos', src: '/cards/07-resumos-executivos.png' },
  { title: 'Sumário completo', src: '/cards/08-sumario-completo.png' },
];

const BULLETS = ['PDF digital', 'Acesso imediato', 'Banca Quadrix', '741 páginas', 'Atualizações até a prova'];

const ApostilaPreview = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isSampleModalOpen, setIsSampleModalOpen] = useState(false);

  const active = PREVIEW_PAGES[activeIndex];

  const goPrev = () => setActiveIndex((i) => (i === 0 ? PREVIEW_PAGES.length - 1 : i - 1));
  const goNext = () => setActiveIndex((i) => (i === PREVIEW_PAGES.length - 1 ? 0 : i + 1));

  return (
    <section
      className="relative overflow-hidden section-seamless"
      style={{
        background:
          'radial-gradient(circle at 14% 22%, rgba(211,165,47,0.10) 0%, transparent 32%), linear-gradient(90deg, #071622 0%, #071522 45%, #06121f 100%)',
      }}
    >
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 lg:py-24">
        <div className="text-center mb-12">
          <p
            className="text-xs font-semibold uppercase tracking-[0.18em] mb-3"
            style={{ color: '#f1c85b' }}
          >
            Amostra do material
          </p>
          <h2
            className="text-3xl md:text-4xl font-bold mb-4"
            style={{ fontFamily: 'Georgia, "Times New Roman", serif', color: '#f4efe4' }}
          >
            Veja por dentro da apostila
          </h2>
          <p className="text-[#f4efe4]/65 max-w-2xl mx-auto leading-relaxed">
            Explore uma prévia visual do material antes de comprar. Conteúdo organizado, direto ao
            ponto e pensado para a banca Quadrix.
          </p>
        </div>

        <div className="grid lg:grid-cols-[1.3fr_0.9fr] gap-8 lg:gap-10 items-stretch">
          {/* Mockup de leitor */}
          <div
            className="rounded-2xl overflow-hidden flex flex-col"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(211,165,47,0.22)' }}
          >
            {/* Barra superior do leitor */}
            <div
              className="flex items-center justify-between gap-3 px-4 md:px-5 py-3"
              style={{ borderBottom: '1px solid rgba(211,165,47,0.18)' }}
            >
              <span className="text-xs md:text-sm font-semibold text-[#f4efe4]/90 truncate">
                Prévia da apostila
              </span>
              <div className="flex items-center gap-2 md:gap-3 shrink-0">
                <span className="hidden sm:inline-block text-[11px] text-[#f4efe4]/50 px-2 py-1 rounded border border-white/10">
                  100%
                </span>
                <button
                  type="button"
                  onClick={goPrev}
                  aria-label="Prévia anterior"
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[#f4efe4]/70 hover:text-[#f1c85b] transition-colors"
                  style={{ border: '1px solid rgba(211,165,47,0.35)' }}
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  aria-label="Próxima prévia"
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[#f4efe4]/70 hover:text-[#f1c85b] transition-colors"
                  style={{ border: '1px solid rgba(211,165,47,0.35)' }}
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Página ativa */}
            <div className="flex-1 flex items-center justify-center p-5 md:p-8 bg-black/20">
              <AnimatePresence mode="wait">
                <motion.img
                  key={active.src}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  src={active.src}
                  alt={`Prévia visual demonstrativa — ${active.title}`}
                  className="max-h-[360px] md:max-h-[420px] w-auto object-contain rounded-lg shadow-2xl"
                  style={{ border: '1px solid rgba(211,165,47,0.25)' }}
                />
              </AnimatePresence>
            </div>

            {/* Rodapé: contador + miniaturas */}
            <div className="px-4 md:px-5 pb-4 md:pb-5 pt-1">
              <p className="text-center text-[11px] text-[#f4efe4]/45 mb-3">
                Prévia {activeIndex + 1} de {PREVIEW_PAGES.length} · 741 páginas no total ·{' '}
                <span className="italic">prévia visual demonstrativa</span>
              </p>
              <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 snap-x snap-mandatory [-webkit-overflow-scrolling:touch]">
                {PREVIEW_PAGES.map((page, index) => (
                  <button
                    key={page.src}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    aria-label={`Ver prévia: ${page.title}`}
                    aria-current={index === activeIndex}
                    className="relative shrink-0 w-12 h-16 md:w-14 md:h-[4.6rem] rounded-md overflow-hidden snap-center transition-all"
                    style={{
                      border:
                        index === activeIndex
                          ? '2px solid #d3a52f'
                          : '1px solid rgba(255,255,255,0.12)',
                      opacity: index === activeIndex ? 1 : 0.55,
                    }}
                  >
                    <img src={page.src} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Card comercial */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="rounded-2xl p-6 md:p-8 flex flex-col"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(211,165,47,0.22)' }}
          >
            <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: '#f1c85b' }}>
              Nexo Social — SEDES-DF 2026
            </p>
            <h3 className="text-xl md:text-2xl font-bold text-[#f4efe4] mb-4 leading-snug">
              Apostila completa para a banca Quadrix
            </h3>

            <ul className="space-y-2.5 mb-6">
              {BULLETS.map((item) => (
                <li key={item} className="flex items-center text-sm text-[#f4efe4]/80">
                  <CheckCircle2 className="w-4 h-4 mr-2.5 shrink-0" style={{ color: '#f1c85b' }} />
                  {item}
                </li>
              ))}
            </ul>

            <div className="mb-6">
              <span className="text-3xl font-bold text-[#f4efe4] tracking-tight">R$ 39,90</span>
              <p className="text-xs text-[#f4efe4]/45 mt-1">Pagamento único</p>
            </div>

            <div className="mt-auto space-y-3">
              <Link to="/apostilas" className="block">
                <Button
                  className="w-full h-12 font-bold text-sm uppercase tracking-wide rounded-sm text-[#f1c85b] hover:text-[#f1c85b] transition-premium"
                  style={{ border: '1px solid #d3a52f', background: 'rgba(211,165,47,0.08)' }}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Quero a apostila
                </Button>
              </Link>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsSampleModalOpen(true)}
                className="w-full h-11 font-semibold text-sm text-[#f4efe4]/70 hover:text-[#f4efe4] hover:bg-white/5"
              >
                <Download className="w-4 h-4 mr-2" />
                Baixar amostra grátis
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Modal "amostra grátis" — visual apenas, sem captura de lead
          (preparado para a Fase 5, sem lógica de e-mail/Supabase ainda) */}
      <AnimatePresence>
        {isSampleModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setIsSampleModalOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-label="Amostra grátis"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-sm rounded-2xl p-7 text-center"
              style={{ background: '#0b2238', border: '1px solid rgba(211,165,47,0.3)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setIsSampleModalOpen(false)}
                aria-label="Fechar"
                className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center text-[#f4efe4]/60 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <Download className="w-9 h-9 mx-auto mb-4" style={{ color: '#f1c85b' }} />
              <h3 className="text-lg font-bold text-[#f4efe4] mb-2">Amostra grátis em breve</h3>
              <p className="text-sm text-[#f4efe4]/70 leading-relaxed">
                Estamos preparando uma amostra gratuita da apostila Nexo Social – SEDES-DF 2026 para
                download. Em breve você poderá baixar direto por aqui.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default ApostilaPreview;
