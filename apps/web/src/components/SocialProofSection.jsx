import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, Lock, CheckCircle2, UserCheck, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';

/**
 * "Depoimentos reais, quando disponíveis" (Fase 14) — estrutura
 * preparatória para depoimentos reais de alunos, sem nenhum dado
 * fictício. Nenhum depoimento real foi encontrado no projeto até o
 * momento desta fase; os cards abaixo são placeholders neutros, sem
 * nomes, fotos, estrelas, notas ou menção a aprovação/resultado.
 */
const PLACEHOLDER_CARDS = [
  {
    icon: UserCheck,
    title: 'Depoimento de aluno',
    description: 'Espaço reservado para relato real de estudante que utilizou o material.',
    badge: 'Aguardando validação',
  },
  {
    icon: ShieldCheck,
    title: 'Experiência com o material',
    description: 'Este espaço será usado apenas com autorização do aluno e identificação adequada.',
    badge: 'Em breve',
  },
  {
    icon: CheckCircle2,
    title: 'Feedback sobre a preparação',
    description:
      'Relatos reais poderão destacar organização, clareza e uso da apostila na rotina de estudos.',
    badge: 'Transparência',
  },
];

const TREATMENT_ITEMS = [
  'Apenas relatos autorizados.',
  'Sem promessas de aprovação.',
  'Sem manipulação de resultado.',
  'Identificação preservada quando solicitado.',
  'Publicação somente após validação.',
];

const SocialProofSection = () => (
  <section
    className="relative overflow-hidden section-seamless"
    style={{
      background:
        'radial-gradient(circle at 88% 12%, rgba(211,165,47,0.08) 0%, transparent 30%), linear-gradient(90deg, #071622 0%, #071522 45%, #06121f 100%)',
    }}
  >
    <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
      <div className="text-center mb-3">
        <h2
          className="text-2xl md:text-3xl font-bold mb-3"
          style={{ fontFamily: 'Georgia, "Times New Roman", serif', color: '#f4efe4' }}
        >
          Depoimentos reais, quando disponíveis
        </h2>
        <p className="text-sm md:text-base text-[#f4efe4]/65 leading-relaxed max-w-2xl mx-auto">
          A Nortis prioriza transparência. Esta área será usada para publicar relatos reais de
          alunos, sem promessas de aprovação ou resultados artificiais.
        </p>
      </div>
      <p className="text-xs text-[#f4efe4]/40 italic text-center mb-10">
        Espaço preparado para depoimentos reais. Nenhuma avaliação fictícia é exibida.
      </p>

      {/* Cards reservados — placeholders neutros, sem nome/foto/estrelas/nota */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {PLACEHOLDER_CARDS.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: index * 0.05 }}
            className="rounded-xl p-5 flex flex-col"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(211,165,47,0.22)' }}
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(211,165,47,0.12)', border: '1px solid rgba(211,165,47,0.3)' }}
              >
                <card.icon className="w-4 h-4" style={{ color: '#f1c85b' }} />
              </div>
              <span
                className="text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full"
                style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(244,239,228,0.6)', border: '1px solid rgba(255,255,255,0.12)' }}
              >
                {card.badge}
              </span>
            </div>
            <h3 className="text-sm font-semibold text-[#f4efe4] mb-1.5">{card.title}</h3>
            <p className="text-xs sm:text-sm text-[#f4efe4]/60 leading-relaxed">{card.description}</p>
          </motion.div>
        ))}
      </div>

      {/* Bloco de transparência */}
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
          <h3 className="text-base font-semibold text-[#f4efe4]">Como trataremos os depoimentos</h3>
        </div>
        <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-2">
          {TREATMENT_ITEMS.map((item) => (
            <li key={item} className="flex items-start text-sm text-[#f4efe4]/75">
              <CheckCircle2 className="w-4 h-4 mr-2 mt-0.5 shrink-0" style={{ color: '#f1c85b' }} />
              {item}
            </li>
          ))}
        </ul>
      </motion.div>

      <div className="text-center">
        <Link to="/apostilas">
          <Button className="h-11 px-8 font-bold bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] hover:bg-[hsl(var(--accent))]/90 transition-premium">
            <ShoppingCart className="w-4 h-4 mr-2" />
            Conhecer a apostila
          </Button>
        </Link>
      </div>
    </div>
  </section>
);

export default SocialProofSection;
