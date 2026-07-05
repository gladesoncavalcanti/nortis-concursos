import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';

/**
 * Contagem regressiva reutilizável (Fase 8) — estilo Executive Minimal
 * Dark. Componente isolado e "burro": não sabe nada sobre datas reais
 * de concurso algum, só recebe `examDate` de fora (ver
 * apps/web/src/config/contestDates.js).
 *
 * Regra inegociável: se `examDate` for null/inválida, mostra
 * "Data da prova a confirmar" com cards inativos ("--") — nunca uma
 * contagem inventada. Só calcula dias/horas/minutos/segundos quando
 * `examDate` é uma data real, futura, configurada explicitamente.
 *
 * Props:
 *  - examDate: string ISO 8601 ou null
 *  - title: string
 *  - subtitle: string (usado só quando examDate é null)
 *  - statusLabel: string (rótulo pequeno acima do título)
 */
const ZERO_TIME = { days: null, hours: null, minutes: null, seconds: null };

function diffToParts(diffMs) {
  const totalSeconds = Math.max(0, Math.floor(diffMs / 1000));
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

const ExamCountdown = ({
  examDate = null,
  title = 'Contagem regressiva',
  subtitle = 'Acompanharemos as atualizações oficiais do concurso SEDES-DF 2026. Enquanto isso, você já pode iniciar sua preparação com foco na banca Quadrix.',
  statusLabel = 'SEDES-DF 2026',
}) => {
  const parsedExamTime = examDate ? new Date(examDate).getTime() : null;
  const hasValidDate = Number.isFinite(parsedExamTime);

  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!hasValidDate) return undefined;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [hasValidDate]);

  const hasPassed = hasValidDate && parsedExamTime <= now;
  const parts = hasValidDate && !hasPassed ? diffToParts(parsedExamTime - now) : ZERO_TIME;

  const cards = [
    { label: 'Dias', value: parts.days },
    { label: 'Horas', value: parts.hours },
    { label: 'Minutos', value: parts.minutes },
    { label: 'Segundos', value: parts.seconds },
  ];

  return (
    <section
      className="relative overflow-hidden section-seamless"
      style={{
        background:
          'radial-gradient(circle at 12% 18%, rgba(211,165,47,0.09) 0%, transparent 30%), linear-gradient(90deg, #071622 0%, #071522 45%, #06121f 100%)',
      }}
    >
      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-16 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] mb-3" style={{ color: '#f1c85b' }}>
          {statusLabel}
        </p>
        <h2
          className="text-2xl md:text-3xl font-bold mb-3"
          style={{ fontFamily: 'Georgia, "Times New Roman", serif', color: '#f4efe4' }}
        >
          {title}
        </h2>

        {!hasValidDate ? (
          <>
            <p className="text-base md:text-lg font-semibold mb-2" style={{ color: '#f1c85b' }}>
              Data da prova a confirmar
            </p>
            <p className="text-sm text-[#f4efe4]/60 leading-relaxed max-w-xl mx-auto mb-8">{subtitle}</p>
          </>
        ) : hasPassed ? (
          <p className="text-base md:text-lg font-semibold mb-8" style={{ color: '#f1c85b' }}>
            Prova realizada
          </p>
        ) : (
          <p className="text-sm text-[#f4efe4]/60 leading-relaxed max-w-xl mx-auto mb-8">
            Tempo restante até a data configurada:
          </p>
        )}

        {!hasPassed && (
          <div className="grid grid-cols-4 gap-2 sm:gap-4 mb-9 max-w-xl mx-auto">
            {cards.map((card) => (
              <div
                key={card.label}
                className="rounded-xl px-2 py-4 sm:px-4 sm:py-5"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(211,165,47,0.22)' }}
              >
                <p
                  className="text-2xl sm:text-4xl font-bold tabular-nums"
                  style={{ fontFamily: 'Georgia, "Times New Roman", serif', color: card.value === null ? 'rgba(244,239,228,0.3)' : '#f4efe4' }}
                >
                  {card.value === null ? '--' : String(card.value).padStart(2, '0')}
                </p>
                <p className="text-[10px] sm:text-xs uppercase tracking-wide text-[#f4efe4]/45 mt-1.5">
                  {card.label}
                </p>
              </div>
            ))}
          </div>
        )}

        <Link to="/apostilas">
          <Button
            className="h-11 px-8 font-bold text-sm uppercase tracking-wide rounded-sm text-[#f1c85b] hover:text-[#f1c85b] transition-premium"
            style={{ border: '1px solid #d3a52f', background: 'rgba(211,165,47,0.08)' }}
          >
            <Clock className="w-4 h-4 mr-2" />
            Começar preparação agora
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>
    </section>
  );
};

export default ExamCountdown;
