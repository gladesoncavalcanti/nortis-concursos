import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, ClipboardList, PenLine, ListChecks, Scale, Award, Users, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';

/**
 * Linha do tempo do concurso (Fase 9) — componente reutilizável e
 * isolado, estilo Executive Minimal Dark. Não sabe nada sobre datas
 * reais: cada etapa recebe `dateLabel` de fora (por padrão "A
 * confirmar" para todas, já que nenhuma data oficial existe no
 * projeto — ver apps/web/src/config/contestDates.js, Fase 8).
 *
 * Diferente do ExamCountdown.jsx (Fase 8): aqui não há contagem
 * numérica nenhuma, só o status textual de cada etapa. As duas seções
 * não se misturam.
 */
const DEFAULT_STAGES = [
  {
    icon: FileText,
    title: 'Publicação do edital',
    description: 'Documento oficial com regras, cargos e cronograma do concurso.',
    status: 'Aguardando divulgação oficial',
    dateLabel: 'A confirmar',
  },
  {
    icon: ClipboardList,
    title: 'Período de inscrições',
    description: 'Janela oficial para se inscrever no concurso.',
    status: 'Aguardando edital',
    dateLabel: 'A confirmar',
  },
  {
    icon: PenLine,
    title: 'Prova objetiva',
    description: 'Aplicação da prova pela banca Quadrix.',
    status: 'Data a confirmar',
    dateLabel: 'A confirmar',
    highlight: true,
  },
  {
    icon: ListChecks,
    title: 'Gabarito preliminar',
    description: 'Divulgação inicial das respostas consideradas corretas.',
    status: 'Após a prova',
    dateLabel: 'A confirmar',
  },
  {
    icon: Scale,
    title: 'Recursos',
    description: 'Prazo para contestar questões ou gabarito, conforme o edital.',
    status: 'Conforme edital',
    dateLabel: 'A confirmar',
  },
  {
    icon: Award,
    title: 'Resultado',
    description: 'Divulgação do resultado final e classificação.',
    status: 'Aguardando cronograma oficial',
    dateLabel: 'A confirmar',
  },
  {
    icon: Users,
    title: 'Convocações',
    description: 'Chamadas para posse, conforme necessidade do órgão.',
    status: 'Conforme fases do concurso',
    dateLabel: 'A confirmar',
  },
];

const ContestTimeline = ({ stages = DEFAULT_STAGES }) => (
  <section
    className="relative overflow-hidden section-seamless"
    style={{
      background:
        'radial-gradient(circle at 90% 8%, rgba(211,165,47,0.08) 0%, transparent 30%), linear-gradient(90deg, #071622 0%, #071522 45%, #06121f 100%)',
    }}
  >
    <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
      <div className="text-center mb-10">
        <h2
          className="text-2xl md:text-3xl font-bold mb-3"
          style={{ fontFamily: 'Georgia, "Times New Roman", serif', color: '#f4efe4' }}
        >
          Linha do tempo do concurso
        </h2>
        <p className="text-sm md:text-base text-[#f4efe4]/65 leading-relaxed max-w-xl mx-auto">
          Acompanhe as principais etapas previstas do concurso SEDES-DF 2026. As datas serão
          atualizadas conforme divulgação oficial.
        </p>
      </div>

      <ol className="relative">
        {/* linha vertical dourada discreta, alinhada ao centro dos pontos */}
        <div
          aria-hidden="true"
          className="absolute left-[19px] sm:left-6 top-2 bottom-2 w-px"
          style={{ background: 'rgba(211,165,47,0.25)' }}
        />

        {stages.map((stage, index) => (
          <motion.li
            key={stage.title}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: index * 0.05 }}
            className="relative flex gap-4 sm:gap-5 pb-6 last:pb-0"
          >
            <div
              className="relative z-10 shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center"
              style={{
                background: stage.highlight ? 'rgba(211,165,47,0.15)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${stage.highlight ? 'rgba(211,165,47,0.6)' : 'rgba(211,165,47,0.25)'}`,
              }}
            >
              <stage.icon className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: '#f1c85b' }} />
            </div>

            <div
              className="flex-1 rounded-xl px-4 py-3.5 sm:px-5 sm:py-4"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 mb-1.5">
                <h3 className="text-sm sm:text-base font-semibold text-[#f4efe4]">{stage.title}</h3>
                <span
                  className="text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full shrink-0"
                  style={{ background: 'rgba(211,165,47,0.12)', color: '#f1c85b', border: '1px solid rgba(211,165,47,0.3)' }}
                >
                  {stage.dateLabel}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#f4efe4]/60 leading-relaxed mb-1.5">{stage.description}</p>
              <p className="text-[11px] sm:text-xs text-[#f4efe4]/45 italic">{stage.status}</p>
            </div>
          </motion.li>
        ))}
      </ol>

      <p className="text-xs text-[#f4efe4]/40 text-center mt-8 mb-8 leading-relaxed">
        As informações desta linha do tempo são organizacionais e serão atualizadas quando houver
        cronograma oficial.
      </p>

      <div className="text-center">
        <Link to="/apostilas">
          <Button
            variant="outline"
            className="h-11 px-7 font-semibold text-sm border-white/20 text-[#f4efe4] bg-transparent hover:bg-white/10 hover:text-[#f4efe4] transition-premium"
          >
            Preparar com antecedência
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>
    </div>
  </section>
);

export default ContestTimeline;
