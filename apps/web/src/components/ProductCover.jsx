import React from 'react';

/**
 * Capa visual em HTML/CSS para a apostila "Nexo Social – SEDES DF 2026".
 *
 * Existe porque a arte de capa hospedada externamente (Hostinger CDN)
 * mostra uma contagem de páginas desatualizada (671, o correto é 741) e
 * não pode ser editada por aqui. Em vez de sobrepor um selo corretivo em
 * cima da imagem errada, este componente SUBSTITUI a imagem por completo
 * — nenhuma arte antiga fica visível em nenhuma tela.
 *
 * `variant`:
 *  - "card"      → cards da vitrine (ProductsList), altura do container pai
 *  - "detail"    → página de detalhe do produto, maior e mais completa
 *  - "thumbnail" → miniatura do carrinho, bem compacta
 */
const ProductCover = ({ variant = 'card', className = '' }) => {
  if (variant === 'thumbnail') {
    return (
      <div
        className={`relative w-full h-full rounded-lg overflow-hidden bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--primary-light))] flex flex-col items-center justify-center text-center px-1.5 ${className}`}
      >
        <span className="text-[hsl(var(--accent))] font-heading font-bold text-[9px] tracking-wide leading-none">
          NORTIS
        </span>
        <span className="text-white font-heading font-bold text-[10px] leading-tight mt-1">
          Nexo Social
        </span>
        <span className="text-white/70 text-[8px] leading-tight">SEDES DF 2026</span>
      </div>
    );
  }

  const isDetail = variant === 'detail';

  return (
    <div
      className={`relative w-full h-full rounded-xl overflow-hidden bg-gradient-to-br from-[hsl(var(--primary))] via-[hsl(var(--primary-light))] to-[hsl(var(--primary))] border border-white/10 flex flex-col justify-between ${
        isDetail ? 'p-6 md:p-8' : 'p-4 md:p-5'
      } ${className}`}
    >
      <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-[hsl(var(--accent))]/10" />
      <div className="absolute -bottom-14 -left-10 w-40 h-40 rounded-full bg-white/5" />

      <div className="relative z-10">
        <p className="text-[hsl(var(--accent))] font-heading font-bold tracking-[0.2em] uppercase text-[10px] md:text-xs mb-2 md:mb-3">
          Nortis Concursos
        </p>
        <h3 className={`text-white font-heading font-bold leading-tight ${isDetail ? 'text-2xl md:text-3xl' : 'text-lg md:text-xl'}`}>
          Nexo Social
        </h3>
        <p className={`text-white/80 font-heading font-semibold ${isDetail ? 'text-base md:text-lg mb-3' : 'text-sm mb-2'}`}>
          SEDES DF 2026
        </p>
        <p className={`text-white/60 leading-snug ${isDetail ? 'text-sm md:text-base' : 'text-xs'}`}>
          Legislação social e políticas públicas
        </p>
      </div>

      <div className="relative z-10 space-y-2 md:space-y-3 mt-4">
        <div className="flex flex-wrap gap-1.5">
          <span className="text-[10px] md:text-xs font-bold uppercase tracking-wide bg-white/10 text-white px-2.5 py-1 rounded-full border border-white/20">
            Banca Quadrix
          </span>
          <span className="text-[10px] md:text-xs font-bold uppercase tracking-wide bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] px-2.5 py-1 rounded-full">
            741 páginas
          </span>
        </div>
        <ul className={`text-white/70 space-y-1 pt-2 border-t border-white/10 ${isDetail ? 'text-xs md:text-sm' : 'text-[10px]'}`}>
          <li>• Conteúdo atualizado</li>
          <li>• Questões comentadas</li>
          <li>• Mapas mentais</li>
          <li>• Simulado final</li>
        </ul>
      </div>
    </div>
  );
};

export default ProductCover;
