import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HelpCircle,
  AlertTriangle,
  Scale,
  PenLine,
  CalendarClock,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

/**
 * "Conteúdo gratuito para acelerar sua preparação" (Sprint Social 1) —
 * pilares editoriais pensados para conteúdo de redes sociais (Instagram,
 * TikTok, YouTube, WhatsApp). Cada card aponta só para páginas/canais que
 * já existem de fato no projeto — nunca um link "#" ou rede inexistente.
 */
const PILLARS = [
  {
    icon: HelpCircle,
    title: 'Questão do dia',
    desc: 'Uma questão comentada por dia, no padrão da banca Quadrix.',
    to: '/materiais-gratuitos',
    linkLabel: 'Ver materiais gratuitos',
  },
  {
    icon: AlertTriangle,
    title: 'Pegadinha da Quadrix',
    desc: 'As armadilhas mais comuns nos enunciados da banca.',
    to: '/sedes-df-2026',
    linkLabel: 'Ver no guia SEDES-DF',
  },
  {
    icon: Scale,
    title: 'Lei em 60 segundos',
    desc: 'Legislação social explicada de forma rápida e direta.',
    to: '/materiais-gratuitos',
    linkLabel: 'Ver materiais gratuitos',
  },
  {
    icon: PenLine,
    title: 'Redação SEDES-DF',
    desc: 'Boas práticas de redação para o concurso.',
    to: '/sedes-df-2026',
    linkLabel: 'Ver no guia SEDES-DF',
  },
  {
    icon: CalendarClock,
    title: 'Atualizações do concurso',
    desc: 'Linha do tempo e informações confirmadas sobre o SEDES-DF 2026.',
    to: '/sedes-df-2026',
    linkLabel: 'Ver linha do tempo',
  },
  {
    icon: Sparkles,
    title: 'Bastidores do Método Nortis',
    desc: 'Como a apostila Nexo Social é organizada por dentro.',
    to: '/#preview-apostila',
    linkLabel: 'Ver por dentro',
  },
];

const SocialContentPillars = () => {
  return (
    <section className="py-16 lg:py-24 bg-muted/40 section-seamless">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="eyebrow mb-3">Redes sociais</p>
          <h2 className="text-3xl md:text-4xl font-bold font-heading text-foreground mb-4">
            Conteúdo gratuito para acelerar sua preparação
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Os pilares de conteúdo que acompanham a Nortis nas redes — sempre com um link real para
            saber mais.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
          {PILLARS.map((pillar, index) => (
            <motion.div
              key={pillar.title}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.06 }}
              className="group bg-card p-7 rounded-xl shadow-sm hover:shadow-premium hover:-translate-y-0.5 transition-premium border border-border flex flex-col"
            >
              <div className="w-11 h-11 rounded-lg bg-[hsl(var(--primary))] flex items-center justify-center mb-5 text-[hsl(var(--accent))] group-hover:scale-105 transition-transform duration-300">
                <pillar.icon className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold font-heading text-foreground mb-2">{pillar.title}</h3>
              <p className="text-muted-foreground leading-relaxed text-sm md:text-base mb-5 flex-1">
                {pillar.desc}
              </p>
              <Link
                to={pillar.to}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[hsl(var(--primary))] hover:text-[hsl(var(--accent))] transition-colors"
              >
                {pillar.linkLabel}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SocialContentPillars;
