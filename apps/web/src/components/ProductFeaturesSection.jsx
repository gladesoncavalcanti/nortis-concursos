import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  AlertTriangle,
  Table2,
  Brain,
  Workflow,
  MessageSquare,
  FileText,
  ListOrdered,
  X,
  ZoomIn,
} from 'lucide-react';

/**
 * Arte oficial "Conheça sua futura aprovação" (método Nortis + os 8
 * quadrinhos do que há na apostila). No desktop entra grande, emoldurada
 * num painel navy que a destaca como peça central da seção; no mobile,
 * como o texto dos quadrinhos é pequeno demais pra caber legível na
 * largura da tela, ela vira uma faixa com scroll horizontal suave (a
 * imagem mantém o tamanho real, o usuário desliza).
 *
 * Cada card abaixo é clicável e abre um lightbox com o recorte ampliado
 * do quadrinho correspondente (/public/cards/), permitindo ler o
 * conteúdo em detalhe tanto no mobile quanto no desktop.
 */
const METODO_IMG_SRC = '/nortis-metodo-quadrinhos.jpeg';
const METODO_IMG_ALT =
  'Conheça sua futura aprovação — método Nortis: DNA da aprovação, pegadinhas da banca Quadrix, quadros comparativos, mapas mentais, fluxogramas, questões comentadas, resumos executivos e sumário completo da apostila Nexo Social – SEDES DF 2026';

const FEATURES = [
  {
    icon: BookOpen,
    title: 'Conteúdo completo',
    desc: 'Toda a legislação social e políticas públicas cobradas pela banca.',
    image: '/cards/01-dna-da-aprovacao.png',
    imageAlt: 'DNA da Aprovação — método exclusivo Nortis em 7 etapas: diagnóstico, norte, aprofundamento, revisão, questões, gestões e aprovação',
  },
  {
    icon: AlertTriangle,
    title: 'Pegadinhas da banca Quadrix',
    desc: 'Alertas sobre as armadilhas mais comuns nas provas da Quadrix.',
    image: '/cards/02-pegadinhas-da-banca.png',
    imageAlt: 'Pegadinhas da banca Quadrix — exemplo real de pegadinha com comentário e dica Nortis',
  },
  {
    icon: Table2,
    title: 'Quadros comparativos',
    desc: 'Compare leis, conceitos e regras de forma objetiva.',
    image: '/cards/03-quadros-comparativos.png',
    imageAlt: 'Quadros comparativos — comparação lado a lado entre LOAS e SUAS por aspecto',
  },
  {
    icon: Brain,
    title: 'Mapas mentais',
    desc: 'Visualize e fixe muito mais conteúdo em menos tempo.',
    image: '/cards/04-mapas-mentais.png',
    imageAlt: 'Mapas mentais — mapa mental consolidado e interpretação de textos no padrão Quadrix',
  },
  {
    icon: Workflow,
    title: 'Fluxogramas',
    desc: 'Organize processos e entenda o passo a passo de cada tema.',
    image: '/cards/05-fluxogramas.png',
    imageAlt: 'Fluxogramas — questão de título resolvida em 4 filtros em cascata, passo a passo',
  },
  {
    icon: MessageSquare,
    title: 'Questões comentadas',
    desc: 'Resolução detalhada, no padrão da banca examinadora.',
    image: '/cards/06-questoes-comentadas.png',
    imageAlt: 'Questões comentadas — questão no padrão Quadrix com alternativas e comentário completo',
  },
  {
    icon: FileText,
    title: 'Resumos executivos',
    desc: 'Revisões rápidas e eficientes na reta final.',
    image: '/cards/07-resumos-executivos.png',
    imageAlt: 'Resumos executivos — conteúdo sintético do BPC para revisões eficientes',
  },
  {
    icon: ListOrdered,
    title: 'Sumário completo',
    desc: 'Veja a estrutura completa da apostila, capítulo por capítulo.',
    image: '/cards/08-sumario-completo.png',
    imageAlt: 'Sumário completo — estrutura da apostila com capítulos e páginas, de Legislação Social aos simulados finais',
  },
];

const ProductFeaturesSection = ({ title = 'Conheça o Que Você Recebe' }) => {
  const [openFeature, setOpenFeature] = useState(null);

  // Fecha com ESC e trava o scroll da página enquanto o lightbox está aberto
  useEffect(() => {
    if (!openFeature) return undefined;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setOpenFeature(null);
    };
    document.addEventListener('keydown', handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [openFeature]);

  return (
    <section className="py-16 lg:py-24 bg-background section-seamless">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="eyebrow mb-3">Método Nortis</p>
          <h2 className="text-3xl md:text-4xl font-bold font-heading text-foreground mb-4">{title}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Tudo dentro da apostila Nexo Social – SEDES DF 2026, focada na banca Quadrix — 741 páginas.
            Toque em um card para ver o conteúdo ampliado.
          </p>
        </div>

        {/* Desktop: peça visual grande, emoldurada num painel navy */}
        <div className="hidden md:block mb-14">
          <div className="max-w-5xl mx-auto bg-[hsl(var(--primary))] rounded-2xl p-4 lg:p-6 shadow-premium-lg">
            <img
              src={METODO_IMG_SRC}
              alt={METODO_IMG_ALT}
              className="w-full h-auto rounded-xl object-contain"
              loading="lazy"
            />
          </div>
        </div>

        {/* Mobile: a mesma arte em tamanho real, dentro de uma faixa com
            scroll horizontal suave — evita miniatura ilegível. */}
        <div className="md:hidden mb-12">
          <div className="overflow-x-auto pb-3 -mx-4 px-4 snap-x snap-mandatory [-webkit-overflow-scrolling:touch]">
            <img
              src={METODO_IMG_SRC}
              alt={METODO_IMG_ALT}
              className="h-auto max-w-none rounded-xl shadow-premium border border-border snap-center"
              style={{ width: '640px' }}
              loading="lazy"
            />
          </div>
          <p className="text-center text-xs text-muted-foreground mt-2">
            Deslize para o lado para ver todos os detalhes →
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map((feature, index) => (
            <motion.button
              key={feature.title}
              type="button"
              onClick={() => setOpenFeature(feature)}
              aria-label={`Ampliar detalhes de ${feature.title}`}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="group text-left bg-card p-6 rounded-xl border border-border shadow-sm hover:shadow-premium hover:-translate-y-0.5 hover:border-[hsl(var(--accent))]/40 transition-premium cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2"
            >
              <div className="w-11 h-11 rounded-lg bg-[hsl(var(--primary))] flex items-center justify-center mb-4 text-[hsl(var(--accent))] group-hover:scale-105 transition-transform duration-300">
                <feature.icon className="w-5 h-5" />
              </div>
              <h3 className="font-semibold font-heading text-card-foreground mb-1.5 text-sm md:text-base">
                {feature.title}
              </h3>
              <p className="text-xs md:text-sm text-muted-foreground leading-relaxed mb-3">{feature.desc}</p>
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground/70 group-hover:text-[hsl(var(--accent))] transition-colors">
                <ZoomIn className="w-3.5 h-3.5" /> Ampliar
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Lightbox — imagem ampliada do quadrinho selecionado */}
      <AnimatePresence>
        {openFeature && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8"
            onClick={() => setOpenFeature(null)}
            role="dialog"
            aria-modal="true"
            aria-label={`Visualização ampliada: ${openFeature.title}`}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="relative max-w-full max-h-full"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setOpenFeature(null)}
                aria-label="Fechar visualização"
                className="absolute -top-3 -right-3 z-10 w-9 h-9 rounded-full bg-[hsl(var(--primary))] text-white border border-white/20 shadow-lg flex items-center justify-center hover:bg-[hsl(var(--primary-light))] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <img
                src={openFeature.image}
                alt={openFeature.imageAlt}
                className="max-w-[92vw] max-h-[85vh] w-auto h-auto object-contain rounded-xl shadow-premium-lg bg-white"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default ProductFeaturesSection;
