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
 * Substitui a antiga imagem composta ("Conheça sua futura aprovação"),
 * que era desfocada no mobile e trazia uma contagem de páginas errada
 * (671) impressa na própria arte. Esta seção é HTML/CSS real — legível
 * em qualquer tela, sem depender de nenhuma imagem externa.
 */
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
  <section className="py-12 lg:py-16 bg-background section-seamless">
    <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-bold font-heading text-foreground mb-3">{title}</h2>
        <div className="h-1 w-20 bg-[hsl(var(--accent))] mx-auto rounded-full mb-3"></div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Tudo dentro da apostila Nexo Social – SEDES DF 2026, focada na banca Quadrix — 741 páginas.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
        {FEATURES.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            className="bg-card p-5 rounded-xl border border-border shadow-sm hover:shadow-premium transition-premium"
          >
            <div className="w-10 h-10 rounded-lg bg-[hsl(var(--primary))] flex items-center justify-center mb-3 text-[hsl(var(--accent))]">
              <feature.icon className="w-5 h-5" />
            </div>
            <h3 className="font-semibold font-heading text-card-foreground mb-1 text-sm md:text-base">
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
