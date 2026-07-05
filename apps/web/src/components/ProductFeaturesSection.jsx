import React from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  AlertTriangle,
  Table2,
  Brain,
  Workflow,
  MessageSquare,
  FileText,
  ClipboardCheck,
} from 'lucide-react';

/**
 * Arte oficial "Conheça sua futura aprovação" (método Nortis + os 8
 * quadrinhos do que há na apostila). No desktop entra grande, emoldurada
 * num painel navy que a destaca como peça central da seção; no mobile,
 * como o texto dos quadrinhos é pequeno demais pra caber legível na
 * largura da tela, ela vira uma faixa com scroll horizontal suave (a
 * imagem mantém o tamanho real, o usuário desliza). Os cards HTML
 * abaixo continuam como fonte garantidamente legível em qualquer tela.
 */
const METODO_IMG_SRC = '/nortis-metodo-quadrinhos.jpeg';
const METODO_IMG_ALT =
  'Conheça sua futura aprovação — método Nortis: DNA da aprovação, pegadinhas da banca Quadrix, quadros comparativos, mapas mentais, fluxogramas, questões comentadas, resumos executivos e sumário completo da apostila Nexo Social – SEDES DF 2026';

const FEATURES = [
  { icon: BookOpen, title: 'Conteúdo completo', desc: 'Toda a legislação social e políticas públicas cobradas pela banca.' },
  { icon: AlertTriangle, title: 'Pegadinhas da banca Quadrix', desc: 'Alertas sobre as armadilhas mais comuns nas provas da Quadrix.' },
  { icon: Table2, title: 'Quadros comparativos', desc: 'Compare leis, conceitos e regras de forma objetiva.' },
  { icon: Brain, title: 'Mapas mentais', desc: 'Visualize e fixe muito mais conteúdo em menos tempo.' },
  { icon: Workflow, title: 'Fluxogramas', desc: 'Organize processos e entenda o passo a passo de cada tema.' },
  { icon: MessageSquare, title: 'Questões comentadas', desc: 'Resolução detalhada, no padrão da banca examinadora.' },
  { icon: FileText, title: 'Resumos executivos', desc: 'Revisões rápidas e eficientes na reta final.' },
  { icon: ClipboardCheck, title: 'Simulado final', desc: 'Teste seu conhecimento em condições reais de prova.' },
];

const ProductFeaturesSection = ({ title = 'Conheça o Que Você Recebe' }) => (
  <section className="py-16 lg:py-24 bg-background section-seamless">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <p className="eyebrow mb-3">Método Nortis</p>
        <h2 className="text-3xl md:text-4xl font-bold font-heading text-foreground mb-4">{title}</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Tudo dentro da apostila Nexo Social – SEDES DF 2026, focada na banca Quadrix — 741 páginas.
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
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            className="group bg-card p-6 rounded-xl border border-border shadow-sm hover:shadow-premium hover:-translate-y-0.5 transition-premium"
          >
            <div className="w-11 h-11 rounded-lg bg-[hsl(var(--primary))] flex items-center justify-center mb-4 text-[hsl(var(--accent))] group-hover:scale-105 transition-transform duration-300">
              <feature.icon className="w-5 h-5" />
            </div>
            <h3 className="font-semibold font-heading text-card-foreground mb-1.5 text-sm md:text-base">
              {feature.title}
            </h3>
            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default ProductFeaturesSection;
