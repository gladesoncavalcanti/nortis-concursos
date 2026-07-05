import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HeartHandshake,
  Scale,
  MapPin,
  Brain,
  Building2,
  Gift,
  Lock,
  CheckCircle2,
  ShoppingCart,
} from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';

/**
 * "Catálogo Nortis em expansão" (Fase 20) — prévia institucional do
 * catálogo/marketplace futuro, 100% visual. Os cards abaixo são
 * categorias planejadas, não produtos à venda: sem preço, sem botão de
 * compra, sem selo "disponível". O único produto real hoje é a Nexo
 * Social — SEDES-DF 2026, vendida pelo fluxo já existente em
 * ProductsList.jsx (não tocado nesta fase).
 */
const FUTURE_CATEGORIES = [
  {
    icon: HeartHandshake,
    title: 'Assistência Social',
    description: 'Materiais voltados a legislações sociais, políticas públicas e programas socioassistenciais.',
    status: 'Categoria planejada',
  },
  {
    icon: Building2,
    title: 'Bancas organizadoras',
    description: 'Organização futura por estilo de cobrança, com foco em leitura estratégica de edital.',
    status: 'Em estruturação',
  },
  {
    icon: MapPin,
    title: 'Conhecimentos Distritais',
    description: 'Conteúdos relacionados ao Distrito Federal, LODF, RIDE e realidade local.',
    status: 'Linha editorial',
  },
  {
    icon: Brain,
    title: 'Revisão e simulados',
    description: 'Materiais de apoio para revisão, questões comentadas e prática final.',
    status: 'Planejado',
  },
  {
    icon: Scale,
    title: 'Concursos por área',
    description: 'Organização futura por área de atuação, conforme novos materiais forem publicados.',
    status: 'Em breve',
  },
  {
    icon: Gift,
    title: 'Materiais gratuitos',
    description: 'Espaço para amostras, guias e conteúdos de apoio liberados pela Nortis.',
    status: 'Disponibilização gradual',
  },
];

const ORGANIZATION_ITEMS = [
  'Materiais publicados somente após revisão editorial.',
  'Produtos exibidos apenas quando estiverem realmente disponíveis.',
  'Compra sempre pelo fluxo oficial do site.',
  'Sem promessas de aprovação.',
  'Informações de concurso sempre conferidas nos canais oficiais.',
  'Transparência sobre produto digital, acesso e pagamento.',
];

const MarketplacePreviewSection = () => (
  <section
    className="relative overflow-hidden section-seamless"
    style={{
      background:
        'radial-gradient(circle at 10% 90%, rgba(211,165,47,0.08) 0%, transparent 30%), linear-gradient(90deg, #071622 0%, #071522 45%, #06121f 100%)',
    }}
  >
    <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
      <div className="text-center mb-3">
        <h2
          className="text-2xl md:text-3xl font-bold mb-3"
          style={{ fontFamily: 'Georgia, "Times New Roman", serif', color: '#f4efe4' }}
        >
          Catálogo Nortis em expansão
        </h2>
        <p className="text-sm md:text-base text-[#f4efe4]/65 leading-relaxed max-w-2xl mx-auto">
          Uma visão futura para organizar materiais por concurso, banca e área de estudo, mantendo
          curadoria editorial e clareza para o aluno.
        </p>
      </div>
      <p className="text-xs sm:text-sm text-[#f1c85b]/90 font-medium text-center mb-3 max-w-2xl mx-auto">
        Prévia institucional. Esta seção não representa produtos disponíveis para compra neste
        momento.
      </p>
      <p className="text-xs text-[#f4efe4]/40 italic text-center mb-10 max-w-2xl mx-auto">
        Atualmente, a apostila disponível é a Nexo Social — SEDES-DF 2026. Novos materiais só serão
        exibidos quando estiverem oficialmente cadastrados e disponíveis no site.
      </p>

      {/* Categorias futuras — não são produtos: sem preço, sem botão de compra */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {FUTURE_CATEGORIES.map((category, index) => (
          <motion.div
            key={category.title}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: index * 0.05 }}
            className="rounded-xl p-5"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(211,165,47,0.22)' }}
          >
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
              style={{ background: 'rgba(211,165,47,0.12)', border: '1px solid rgba(211,165,47,0.3)' }}
            >
              <category.icon className="w-4 h-4" style={{ color: '#f1c85b' }} />
            </div>
            <h3 className="text-sm font-semibold text-[#f4efe4] mb-1.5">{category.title}</h3>
            <p className="text-xs sm:text-sm text-[#f4efe4]/60 leading-relaxed mb-3">{category.description}</p>
            <span
              className="inline-block text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full"
              style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(244,239,228,0.6)', border: '1px solid rgba(255,255,255,0.12)' }}
            >
              {category.status}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Bloco de transparência sobre organização futura do catálogo */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.35 }}
        className="rounded-2xl p-6 md:p-8 mb-10"
        style={{ background: 'rgba(211,165,47,0.06)', border: '1px solid rgba(211,165,47,0.3)' }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Lock className="w-4 h-4" style={{ color: '#f1c85b' }} />
          <h3 className="text-base font-semibold text-[#f4efe4]">Como o catálogo será organizado</h3>
        </div>
        <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-2">
          {ORGANIZATION_ITEMS.map((item) => (
            <li key={item} className="flex items-start text-sm text-[#f4efe4]/75">
              <CheckCircle2 className="w-4 h-4 mr-2 mt-0.5 shrink-0" style={{ color: '#f1c85b' }} />
              {item}
            </li>
          ))}
        </ul>
      </motion.div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link to="/apostilas">
          <Button className="w-full sm:w-auto h-11 px-8 font-bold bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] hover:bg-[hsl(var(--accent))]/90 transition-premium">
            <ShoppingCart className="w-4 h-4 mr-2" />
            Ver apostila disponível
          </Button>
        </Link>
        <Link to="/sedes-df-2026">
          <Button
            variant="outline"
            className="w-full sm:w-auto h-11 px-8 font-semibold text-sm border-white/25 text-[#f4efe4] bg-transparent hover:bg-white/10 hover:text-[#f4efe4] transition-premium"
          >
            Conhecer SEDES-DF 2026
          </Button>
        </Link>
      </div>
    </div>
  </section>
);

export default MarketplacePreviewSection;
