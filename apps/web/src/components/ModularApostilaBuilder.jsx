import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Scale,
  Baby,
  Gavel,
  HeartHandshake,
  MapPin,
  Brain,
  Check,
  BookOpen,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';

/**
 * "Monte seu roteiro dentro da apostila" (Fase 19) — montador modular
 * 100% visual/demonstrativo. A seleção de módulos é estado local
 * (useState), não persiste, não altera preço, não altera carrinho e não
 * cria checkout por módulo. A apostila continua sendo vendida como um
 * único produto completo — todos os módulos já fazem parte dela.
 */
const MODULES = [
  {
    id: 'loas-suas',
    icon: HeartHandshake,
    title: 'LOAS e SUAS',
    description: 'Fundamentos da assistência social, benefícios e organização do sistema.',
  },
  {
    id: 'eca',
    icon: Baby,
    title: 'ECA',
    description: 'Proteção integral, medidas protetivas, medidas socioeducativas e pontos de atenção.',
  },
  {
    id: 'legislacao-complementar',
    icon: Scale,
    title: 'Legislação social complementar',
    description: 'LBI, Estatuto da Pessoa Idosa e Lei Maria da Penha.',
  },
  {
    id: 'programas-df',
    icon: Gavel,
    title: 'Programas Sociais do DF',
    description: 'Prato Cheio, Cartão Gás, DF Social e benefícios eventuais.',
  },
  {
    id: 'conhecimentos-distritais',
    icon: MapPin,
    title: 'Conhecimentos Distritais',
    description: 'LODF, RIDE e realidade socioeconômica do Distrito Federal.',
  },
  {
    id: 'revisao-pratica',
    icon: Brain,
    title: 'Revisão e prática',
    description: 'Mapas mentais, pegadinhas, questões comentadas e simulado final.',
  },
];

const SUMMARY_BULLETS = [
  'Todos os módulos incluídos',
  '741 páginas',
  'PDF digital',
  'Banca Quadrix',
  'Atualizações até a prova',
];

const ModularApostilaBuilder = () => {
  const [highlighted, setHighlighted] = useState(() => MODULES.map((m) => m.id));

  const toggleModule = (id) => {
    setHighlighted((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  return (
    <section
      className="relative overflow-hidden section-seamless"
      style={{
        background:
          'radial-gradient(circle at 90% 8%, rgba(211,165,47,0.08) 0%, transparent 30%), linear-gradient(90deg, #071622 0%, #071522 45%, #06121f 100%)',
      }}
    >
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="text-center mb-3">
          <h2
            className="text-2xl md:text-3xl font-bold mb-3"
            style={{ fontFamily: 'Georgia, "Times New Roman", serif', color: '#f4efe4' }}
          >
            Monte seu roteiro dentro da apostila
          </h2>
          <p className="text-sm md:text-base text-[#f4efe4]/65 leading-relaxed max-w-2xl mx-auto">
            Visualize os principais módulos incluídos no material completo e entenda como
            organizar sua preparação por temas.
          </p>
        </div>
        <p className="text-xs text-[#f4efe4]/40 italic text-center mb-10">
          Visual demonstrativo. A apostila é vendida como material único e completo, sem cobrança
          por módulo.
        </p>

        <div className="grid lg:grid-cols-[1fr_340px] gap-6 items-start">
          {/* Módulos — seleção visual local, apenas para destacar no roteiro */}
          <div className="grid sm:grid-cols-2 gap-4">
            {MODULES.map((module, index) => {
              const isHighlighted = highlighted.includes(module.id);
              return (
                <motion.button
                  key={module.id}
                  type="button"
                  onClick={() => toggleModule(module.id)}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: index * 0.05 }}
                  className="text-left rounded-xl p-5 transition-colors"
                  style={{
                    background: isHighlighted ? 'rgba(211,165,47,0.08)' : 'rgba(255,255,255,0.03)',
                    border: isHighlighted
                      ? '1px solid rgba(211,165,47,0.45)'
                      : '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: 'rgba(211,165,47,0.12)', border: '1px solid rgba(211,165,47,0.3)' }}
                    >
                      <module.icon className="w-4 h-4" style={{ color: '#f1c85b' }} />
                    </div>
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                      style={{
                        background: isHighlighted ? '#d3a52f' : 'transparent',
                        border: isHighlighted ? 'none' : '1px solid rgba(244,239,228,0.3)',
                      }}
                    >
                      {isHighlighted && <Check className="w-3 h-3 text-[#071622]" />}
                    </div>
                  </div>
                  <h3 className="text-sm font-semibold text-[#f4efe4] mb-1.5">{module.title}</h3>
                  <p className="text-xs sm:text-sm text-[#f4efe4]/60 leading-relaxed mb-2">
                    {module.description}
                  </p>
                  <span className="text-[10px] font-medium uppercase tracking-wide text-[#f1c85b]/80">
                    {isHighlighted ? 'Destacado no roteiro' : 'Selecionar para destacar no roteiro'}
                  </span>
                </motion.button>
              );
            })}
          </div>

          {/* Resumo do material completo */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35 }}
            className="rounded-2xl p-6 lg:sticky lg:top-24"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(211,165,47,0.3)' }}
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-[#f4efe4]/55 mb-2 flex items-center gap-2">
              <BookOpen className="w-3.5 h-3.5" style={{ color: '#f1c85b' }} />
              Resumo do material completo
            </p>
            <h3 className="text-base font-semibold text-[#f4efe4] mb-4">Nexo Social — SEDES-DF 2026</h3>

            <ul className="space-y-2 mb-4">
              {SUMMARY_BULLETS.map((item) => (
                <li key={item} className="flex items-center text-sm text-[#f4efe4]/75">
                  <FileText className="w-4 h-4 mr-2 shrink-0" style={{ color: '#f1c85b' }} />
                  {item}
                </li>
              ))}
            </ul>

            <div
              className="rounded-lg p-3 mb-4 text-xs text-[#f4efe4]/60"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              Módulos destacados: {highlighted.length} de {MODULES.length} · Todos inclusos na
              apostila completa.
            </div>

            <div className="mb-1">
              <span
                className="text-2xl font-bold"
                style={{ fontFamily: 'Georgia, "Times New Roman", serif', color: '#f4efe4' }}
              >
                R$ 29,90
              </span>
            </div>
            <p className="text-[11px] text-[#f4efe4]/40 mb-5">
              Promoção de lançamento · de <span className="line-through">R$ 69,90</span> por R$ 29,90
            </p>

            <Link to="/product/nexo-social-sedes-df-2026">
              <Button className="w-full h-11 font-bold bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] hover:bg-[hsl(var(--accent))]/90 transition-premium">
                <BookOpen className="w-4 h-4 mr-2" />
                Comprar apostila completa
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ModularApostilaBuilder;
