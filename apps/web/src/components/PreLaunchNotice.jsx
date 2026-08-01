import React from 'react';
import { Info } from 'lucide-react';

/**
 * Aviso discreto de pré-lançamento (Sprint Social 1.2) — usado nas áreas
 * comerciais (Home, SEDES-DF, detalhe do produto) enquanto as vendas
 * estão pausadas no servidor. Nunca menciona detalhes técnicos
 * (Supabase, PDF privado, checkout) — só o que é relevante pro visitante.
 */
const PreLaunchNotice = ({ className = '' }) => (
  <div
    className={`flex items-start gap-3 rounded-xl border border-[hsl(var(--accent))]/30 bg-[hsl(var(--accent))]/[0.06] px-4 py-3 ${className}`}
  >
    <Info className="w-4 h-4 mt-0.5 shrink-0 text-[hsl(var(--accent))]" />
    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
      <span className="font-semibold text-foreground">Pré-lançamento Nortis.</span>{' '}
      As vendas serão abertas após a conclusão da área segura de acesso. Baixe a amostra gratuita
      e acompanhe as novidades.
    </p>
  </div>
);

export default PreLaunchNotice;
