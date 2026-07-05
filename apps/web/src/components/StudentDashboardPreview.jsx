import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Target,
  MessageSquare,
  RotateCcw,
  BookOpen,
  AlertTriangle,
  Brain,
  Clock,
  CheckCircle2,
  ShoppingCart,
} from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';

/**
 * "Organize sua preparação com clareza" (Fase 11) — prévia visual de
 * dashboard, 100% demonstrativa. Não é um dashboard real: nenhum dado
 * vem do usuário, do login ou do Supabase — tudo é número de exemplo,
 * marcado explicitamente como "exemplo visual"/"simulação"/"roteiro
 * sugerido" em cada card, além do aviso geral da seção.
 */
const METRIC_CARDS = [
  {
    icon: Target,
    label: 'Roteiro sugerido',
    value: '68%',
    caption: 'exemplo visual',
    isProgressRing: true,
  },
  {
    icon: MessageSquare,
    label: 'Questões comentadas',
    value: '342',
    caption: 'simulação',
  },
  {
    icon: RotateCcw,
    label: 'Revisões planejadas',
    value: '5 blocos',
    caption: 'roteiro sugerido',
  },
  {
    icon: BookOpen,
    label: 'Foco da semana',
    value: 'ECA e medidas socioeducativas',
    caption: 'exemplo de organização',
    isText: true,
  },
];

const NEXT_ACTIONS = [
  { icon: AlertTriangle, label: 'Revisar pegadinhas da banca' },
  { icon: MessageSquare, label: 'Resolver questões comentadas' },
  { icon: Brain, label: 'Refazer mapa mental' },
  { icon: Clock, label: 'Simular tempo de prova' },
];

const PRODUCT_BULLETS = ['Banca Quadrix', '741 páginas', 'PDF digital'];

const ProgressRing = ({ percent }) => {
  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <svg width="64" height="64" viewBox="0 0 64 64" className="shrink-0">
      <circle cx="32" cy="32" r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
      <circle
        cx="32"
        cy="32"
        r={radius}
        fill="none"
        stroke="#d3a52f"
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform="rotate(-90 32 32)"
      />
      <text x="32" y="37" textAnchor="middle" fontSize="14" fontWeight="700" fill="#f4efe4">
        {percent}%
      </text>
    </svg>
  );
};

const StudentDashboardPreview = () => (
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
          Organize sua preparação com clareza
        </h2>
        <p className="text-sm md:text-base text-[#f4efe4]/65 leading-relaxed max-w-2xl mx-auto">
          Uma prévia visual de como acompanhar estudos, revisões e questões usando a apostila como
          guia.
        </p>
      </div>
      <p className="text-xs text-[#f4efe4]/40 italic text-center mb-10">
        Prévia visual demonstrativa. Esta seção não representa dados reais do usuário.
      </p>

      {/* 4 cards de métrica demonstrativa */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {METRIC_CARDS.map((card, index) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: index * 0.05 }}
            className="rounded-xl p-5"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(211,165,47,0.22)' }}
          >
            <div className="flex items-center gap-2 mb-3">
              <card.icon className="w-4 h-4" style={{ color: '#f1c85b' }} />
              <p className="text-xs font-semibold uppercase tracking-wide text-[#f4efe4]/55">
                {card.label}
              </p>
            </div>

            {card.isProgressRing ? (
              <div className="flex items-center gap-3">
                <ProgressRing percent={68} />
                <p className="text-[11px] text-[#f4efe4]/40 italic">{card.caption}</p>
              </div>
            ) : (
              <>
                <p
                  className={`font-bold text-[#f4efe4] mb-1 ${card.isText ? 'text-sm leading-snug' : 'text-2xl'}`}
                  style={!card.isText ? { fontFamily: 'Georgia, "Times New Roman", serif' } : undefined}
                >
                  {card.value}
                </p>
                <p className="text-[11px] text-[#f4efe4]/40 italic">{card.caption}</p>
              </>
            )}
          </motion.div>
        ))}
      </div>

      {/* 2 mini painéis */}
      <div className="grid md:grid-cols-2 gap-4 mb-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.35 }}
          className="rounded-xl p-5 sm:p-6"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(211,165,47,0.22)' }}
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-[#f4efe4]/55 mb-4">
            Próximas ações
          </p>
          <ul className="space-y-3">
            {NEXT_ACTIONS.map((action) => (
              <li key={action.label} className="flex items-center text-sm text-[#f4efe4]/80">
                <action.icon className="w-4 h-4 mr-2.5 shrink-0" style={{ color: '#f1c85b' }} />
                {action.label}
              </li>
            ))}
          </ul>
          <p className="text-[11px] text-[#f4efe4]/40 italic mt-4">exemplo visual</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.35, delay: 0.05 }}
          className="rounded-xl p-5 sm:p-6 flex flex-col"
          style={{ background: 'rgba(211,165,47,0.06)', border: '1px solid rgba(211,165,47,0.3)' }}
        >
          <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: '#f1c85b' }}>
            Apostila recomendada
          </p>
          <h3 className="text-base font-semibold text-[#f4efe4] mb-3">Nexo Social — SEDES-DF 2026</h3>
          <ul className="space-y-1.5 mb-4 flex-grow">
            {PRODUCT_BULLETS.map((item) => (
              <li key={item} className="flex items-center text-sm text-[#f4efe4]/75">
                <CheckCircle2 className="w-4 h-4 mr-2 shrink-0" style={{ color: '#f1c85b' }} />
                {item}
              </li>
            ))}
          </ul>
          <Link to="/apostilas">
            <Button
              className="w-full h-10 font-semibold text-sm rounded-sm text-[#f1c85b] hover:text-[#f1c85b] transition-premium"
              style={{ border: '1px solid #d3a52f', background: 'rgba(211,165,47,0.08)' }}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Ver apostila
            </Button>
          </Link>
        </motion.div>
      </div>

      <div className="text-center">
        <Link to="/apostilas">
          <Button className="h-11 px-8 font-bold bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] hover:bg-[hsl(var(--accent))]/90 transition-premium">
            Ver apostila recomendada
          </Button>
        </Link>
      </div>
    </div>
  </section>
);

export default StudentDashboardPreview;
