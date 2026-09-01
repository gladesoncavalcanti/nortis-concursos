import React from 'react';
import { Info } from 'lucide-react';

/**
 * Aviso discreto de lançamento promocional — usado nas áreas comerciais.
 * Nunca menciona detalhes técnicos (Supabase, PDF privado, checkout) —
 * só o que é relevante pro visitante.
 */
const PreLaunchNotice = ({ className = '' }) => (
  <div
    className={`flex items-start gap-3 rounded-xl border border-[hsl(var(--accent))]/30 bg-[hsl(var(--accent))]/[0.06] px-4 py-3 ${className}`}
  >
    <Info className="w-4 h-4 mt-0.5 shrink-0 text-[hsl(var(--accent))]" />
    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
      <span className="font-semibold text-foreground">Lançamento Nortis.</span>{' '}
      Oferta promocional por tempo limitado para a apostila Nexo Social — SEDES-DF 2026.
      A Central gratuita continua separada: cadastro e login liberam os recursos provisórios sem compra.
    </p>
  </div>
);

export default PreLaunchNotice;
