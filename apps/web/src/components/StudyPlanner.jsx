import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, RotateCcw, MessageSquare, ClipboardCheck, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';

/**
 * "Plano semanal de estudos" (Fase 10) — roteiro sugerido, 100%
 * estático/visual, estilo Executive Minimal Dark.
 *
 * Não é um planner real: não há checkbox que salve estado, não há
 * conexão com login/Supabase, não há progresso do usuário nem
 * calendário funcional. As barrinhas de "progresso" são puramente
 * ilustrativas, marcadas como sugestão visual no aviso da seção.
 */
const BADGE_ICON = {
  Leitura: BookOpen,
  Revisão: RotateCcw,
  Questões: MessageSquare,
  Simulado: ClipboardCheck,
};

const WEEKS = [
  {
    label: 'Semana 1',
    title: 'Fundamentos da assistência social',
    topics: ['LOAS', 'SUAS', 'Benefícios socioassistenciais', 'Revisão por quadros'],
    badges: ['Leitura', 'Revisão'],
    progress: 20,
  },
  {
    label: 'Semana 2',
    title: 'Criança e adolescente',
    topics: ['ECA', 'Medidas protetivas', 'Medidas socioeducativas', 'Questões comentadas'],
    badges: ['Leitura', 'Questões'],
    progress: 35,
  },
  {
    label: 'Semana 3',
    title: 'Legislação social complementar',
    topics: ['Lei Brasileira de Inclusão', 'Estatuto da Pessoa Idosa', 'Lei Maria da Penha', 'Pontos de atenção da banca'],
    badges: ['Leitura', 'Revisão'],
    progress: 50,
  },
  {
    label: 'Semana 4',
    title: 'Programas sociais do DF',
    topics: ['Prato Cheio', 'Cartão Gás', 'DF Social', 'Benefícios eventuais'],
    badges: ['Leitura', 'Questões'],
    progress: 65,
  },
  {
    label: 'Semana 5',
    title: 'Conhecimentos distritais',
    topics: ['LODF', 'RIDE', 'Realidade socioeconômica do DF', 'Revisão estratégica'],
    badges: ['Leitura', 'Revisão'],
    progress: 80,
  },
  {
    label: 'Revisão final',
    title: 'Revisão final',
    topics: ['Mapas mentais', 'Pegadinhas recorrentes', 'Simulado final integrado', 'Revisão dos erros'],
    badges: ['Revisão', 'Simulado'],
    progress: 100,
    highlight: true,
  },
];

const StudyPlanner = () => (
  <section className="py-16 lg:py-20 bg-muted/40 section-seamless">
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-4">
        <h2 className="text-2xl md:text-3xl font-bold font-heading text-foreground mb-3">
          Plano semanal de estudos
        </h2>
        <p className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-2xl mx-auto">
          Uma sugestão visual para organizar sua preparação por blocos, com revisão progressiva e
          foco nos conteúdos mais relevantes para a banca Quadrix.
        </p>
      </div>
      <p className="text-xs text-muted-foreground/70 italic text-center mb-10">
        Este é um roteiro sugerido. Ajuste o ritmo conforme sua rotina e o edital oficial.
      </p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {WEEKS.map((week, index) => (
          <motion.div
            key={week.label}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: index * 0.05 }}
            className="rounded-xl p-5 sm:p-6 flex flex-col"
            style={
              week.highlight
                ? { background: 'linear-gradient(135deg, #0b2238, #071522)', border: '1px solid rgba(211,165,47,0.4)' }
                : { background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }
            }
          >
            <div className="flex items-center justify-between mb-2">
              <span
                className="text-[11px] font-bold uppercase tracking-wide"
                style={{ color: week.highlight ? '#f1c85b' : 'hsl(var(--accent))' }}
              >
                {week.label}
              </span>
              {week.highlight && <Sparkles className="w-4 h-4" style={{ color: '#f1c85b' }} />}
            </div>

            <h3
              className="text-base font-semibold mb-3 leading-snug"
              style={{ color: week.highlight ? '#f4efe4' : 'hsl(var(--card-foreground))' }}
            >
              {week.title}
            </h3>

            <ul className="space-y-1.5 mb-4 flex-grow">
              {week.topics.map((topic) => (
                <li
                  key={topic}
                  className="text-xs sm:text-sm leading-relaxed"
                  style={{ color: week.highlight ? 'rgba(244,239,228,0.7)' : 'hsl(var(--muted-foreground))' }}
                >
                  • {topic}
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap gap-1.5 mb-4">
              {week.badges.map((badge) => {
                const Icon = BADGE_ICON[badge];
                return (
                  <span
                    key={badge}
                    className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full"
                    style={
                      week.highlight
                        ? { background: 'rgba(211,165,47,0.15)', color: '#f1c85b', border: '1px solid rgba(211,165,47,0.35)' }
                        : { background: 'hsl(var(--muted))', color: 'hsl(var(--muted-foreground))', border: '1px solid hsl(var(--border))' }
                    }
                  >
                    {Icon && <Icon className="w-3 h-3" />}
                    {badge}
                  </span>
                );
              })}
            </div>

            {/* Barra ilustrativa — não representa progresso real do usuário */}
            <div
              className="h-1.5 rounded-full overflow-hidden"
              style={{ background: week.highlight ? 'rgba(255,255,255,0.08)' : 'hsl(var(--muted))' }}
            >
              <div
                className="h-full rounded-full"
                style={{
                  width: `${week.progress}%`,
                  background: week.highlight ? '#d3a52f' : 'hsl(var(--accent))',
                }}
              />
            </div>
            <p
              className="text-[10px] mt-1.5"
              style={{ color: week.highlight ? 'rgba(244,239,228,0.4)' : 'hsl(var(--muted-foreground))' }}
            >
              Sugestão de progressão do roteiro
            </p>
          </motion.div>
        ))}
      </div>

      <div className="text-center mt-10">
        <Link to="/apostilas">
          <Button className="h-11 px-8 font-bold bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] hover:bg-[hsl(var(--accent))]/90 transition-premium">
            Usar a apostila como guia
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>
    </div>
  </section>
);

export default StudyPlanner;
