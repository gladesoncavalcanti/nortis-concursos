import React from 'react';
import { ShieldCheck, Zap } from 'lucide-react';

/**
 * Faixa fina de confiança acima do Header (Fase 3 — Executive Minimal Dark).
 *
 * Propositalmente informativa, não interativa: "Minha conta/Entrar" e
 * "Carrinho" já existem no Header logo abaixo, com a lógica real de
 * useAuth/useCart intacta. Duplicar esses controles aqui (mesmo que só
 * como texto) arriscava parecer redundante/barato — em vez disso, esta
 * barra soma 2 blocos de confiança aos 2 controles reais do Header,
 * completando os "quatro blocos" sem duplicar nenhuma lógica.
 *
 * Não é sticky de propósito: rola junto com a página, deixando só o
 * Header (já sticky) fixo no topo — evita empilhar duas barras fixas.
 */
const TrustBar = () => {
  return (
    <div className="bg-[hsl(var(--primary))] border-b border-[hsl(var(--accent))]/15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-8 md:h-9 flex items-center justify-center md:justify-end gap-x-8">
        {/* Mobile: versão compacta única, sem quebra de linha */}
        <p className="md:hidden text-[11px] text-white/70 tracking-wide whitespace-nowrap">
          Compra segura · PDF imediato
        </p>

        {/* Desktop: os dois blocos completos */}
        <div className="hidden md:flex items-center gap-2 text-[11px] text-white/70">
          <ShieldCheck className="w-3.5 h-3.5 text-[hsl(var(--accent))]" aria-hidden="true" />
          <span className="font-medium text-white/85">Compra segura</span>
          <span className="text-white/30">·</span>
          <span>Asaas · Pix · Cartão</span>
        </div>
        <div className="hidden md:flex items-center gap-2 text-[11px] text-white/70">
          <Zap className="w-3.5 h-3.5 text-[hsl(var(--accent))]" aria-hidden="true" />
          <span className="font-medium text-white/85">Acesso imediato</span>
          <span className="text-white/30">·</span>
          <span>PDF na hora</span>
        </div>
      </div>
    </div>
  );
};

export default TrustBar;
