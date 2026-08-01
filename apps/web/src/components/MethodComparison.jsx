import React from 'react';
import { motion } from 'framer-motion';
import { Check, Minus, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';

/**
 * "Por que o Método Nortis faz diferença?" (Fase 6) — comparativo
 * Apostila comum x Método Nortis, estilo Executive Minimal Dark.
 *
 * Tom deliberadamente comparativo e factual, sem depreciar concorrentes
 * nem prometer aprovação garantida: cada linha descreve uma
 * característica do MATERIAL (organização, foco, recursos), nunca um
 * resultado. Nenhum dado de "resultados comprovados" ou depoimento é
 * usado, conforme pedido.
 */
const ROWS = [
  { label: 'Análise da banca Quadrix', common: false, nortis: true },
  { label: 'Pegadinhas recorrentes', common: false, nortis: true },
  { label: 'Questões comentadas', common: 'básico', nortis: true },
  { label: 'Mapas mentais', common: false, nortis: true },
  { label: 'Quadros comparativos', common: false, nortis: true },
  { label: 'Fluxogramas', common: false, nortis: true },
  { label: 'Resumos executivos', common: false, nortis: true },
  { label: 'Atualizações até a prova', common: false, nortis: true },
  { label: 'Simulado final integrado', common: false, nortis: true },
  { label: 'Organização por módulos', common: 'linear', nortis: true },
];

const COMMON_SUMMARY = [
  'Conteúdo genérico',
  'Pouco foco na banca',
  'Poucos alertas de prova',
  'Organização linear',
  'Revisão menos estratégica',
];

const NORTIS_SUMMARY = [
  'Conteúdo direcionado ao edital',
  'Foco na banca Quadrix',
  'Pegadinhas e pontos de atenção',
  'Mapas, quadros e fluxogramas',
  'Revisão orientada para a prova',
];

const MethodComparison = () => (
  <section
    className="relative overflow-hidden section-seamless"
    style={{
      background:
        'radial-gradient(circle at 88% 12%, rgba(211,165,47,0.09) 0%, transparent 30%), linear-gradient(90deg, #071622 0%, #071522 45%, #06121f 100%)',
    }}
  >
    <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 lg:py-24">
      <div className="text-center mb-12">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] mb-3" style={{ color: '#f1c85b' }}>
          Comparativo
        </p>
        <h2
          className="text-3xl md:text-4xl font-bold mb-4"
          style={{ fontFamily: 'Georgia, "Times New Roman", serif', color: '#f4efe4' }}
        >
          Por que o Método Nortis faz diferença?
        </h2>
        <p className="text-[#f4efe4]/65 max-w-2xl mx-auto leading-relaxed">
          Compare uma apostila comum com um material organizado para estudar com direção, foco na
          banca e revisão estratégica.
        </p>
      </div>

      {/* Resumo em 2 colunas — legível em qualquer largura, inclusive mobile */}
      <div className="grid sm:grid-cols-2 gap-5 mb-10">
        <div
          className="rounded-2xl p-6"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-[#f4efe4]/50 mb-4">
            Apostila comum
          </p>
          <ul className="space-y-2.5">
            {COMMON_SUMMARY.map((item) => (
              <li key={item} className="flex items-start text-sm text-[#f4efe4]/60">
                <Minus className="w-4 h-4 mr-2.5 mt-0.5 shrink-0 text-[#f4efe4]/35" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div
          className="rounded-2xl p-6"
          style={{ background: 'rgba(211,165,47,0.06)', border: '1px solid rgba(211,165,47,0.3)' }}
        >
          <p className="text-xs font-semibold uppercase tracking-wide mb-4" style={{ color: '#f1c85b' }}>
            Método Nortis
          </p>
          <ul className="space-y-2.5">
            {NORTIS_SUMMARY.map((item) => (
              <li key={item} className="flex items-start text-sm text-[#f4efe4]/85 font-medium">
                <Check className="w-4 h-4 mr-2.5 mt-0.5 shrink-0" style={{ color: '#f1c85b' }} />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Tabela comparativa item a item */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="rounded-2xl overflow-hidden mb-10"
        style={{ border: '1px solid rgba(211,165,47,0.2)' }}
      >
        <div
          className="grid grid-cols-[1fr_auto_auto] sm:grid-cols-[1.4fr_1fr_1fr] gap-2 sm:gap-4 px-4 sm:px-6 py-3"
          style={{ background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(211,165,47,0.18)' }}
        >
          <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wide text-[#f4efe4]/50">
            Recurso
          </span>
          <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wide text-[#f4efe4]/50 text-center">
            Comum
          </span>
          <span
            className="text-[11px] sm:text-xs font-semibold uppercase tracking-wide text-center"
            style={{ color: '#f1c85b' }}
          >
            Nortis
          </span>
        </div>

        {ROWS.map((row, index) => (
          <div
            key={row.label}
            className="grid grid-cols-[1fr_auto_auto] sm:grid-cols-[1.4fr_1fr_1fr] gap-2 sm:gap-4 px-4 sm:px-6 py-3 items-center"
            style={{
              background: index % 2 === 0 ? 'rgba(255,255,255,0.015)' : 'transparent',
              borderTop: index === 0 ? 'none' : '1px solid rgba(255,255,255,0.05)',
            }}
          >
            <span className="text-xs sm:text-sm text-[#f4efe4]/80 pr-2">{row.label}</span>
            <span className="flex justify-center">
              {row.common === true ? (
                <Check className="w-4 h-4 text-[#f4efe4]/40" />
              ) : row.common === false ? (
                <Minus className="w-4 h-4 text-[#f4efe4]/30" />
              ) : (
                <span className="text-[11px] text-[#f4efe4]/45 italic">{row.common}</span>
              )}
            </span>
            <span className="flex justify-center">
              <Check className="w-4 h-4" style={{ color: '#f1c85b' }} />
            </span>
          </div>
        ))}
      </motion.div>

      <div className="text-center">
        <a href="#preview-apostila">
          <Button
            className="h-12 px-9 font-bold text-sm uppercase tracking-wide rounded-sm text-[#f1c85b] hover:text-[#f1c85b] transition-premium"
            style={{ border: '1px solid #d3a52f', background: 'rgba(211,165,47,0.08)' }}
          >
            Ver a apostila por dentro
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </a>
      </div>
    </div>
  </section>
);

export default MethodComparison;
