import React from 'react';

/**
 * Capa oficial da apostila "Nexo Social – SEDES DF 2026" (arte real,
 * 741 páginas, /public/nexo-social-capa-741.jpeg). Usada em vez da arte
 * antiga hospedada externamente, que trazia uma contagem de páginas
 * desatualizada.
 *
 * `variant`:
 *  - "card"      → cards da vitrine (ProductsList), altura do container pai
 *  - "detail"    → página de detalhe do produto e destaque da home
 *  - "thumbnail" → miniatura do carrinho, recortada no topo (logo + título,
 *                  a única parte com texto grande o suficiente pra ficar
 *                  legível numa miniatura de 80x80)
 */
const COVER_SRC = '/nexo-social-capa-741.jpeg';
const COVER_ALT = 'Capa da apostila Nexo Social – SEDES DF 2026, banca Quadrix, 741 páginas';

const ProductCover = ({ variant = 'card', className = '' }) => {
  if (variant === 'thumbnail') {
    return (
      <img
        src={COVER_SRC}
        alt={COVER_ALT}
        className={`w-full h-full object-cover object-top ${className}`}
        loading="lazy"
      />
    );
  }

  return (
    <div
      className={`relative w-full h-full flex items-center justify-center bg-[hsl(var(--primary))] rounded-xl overflow-hidden ${className}`}
    >
      <img
        src={COVER_SRC}
        alt={COVER_ALT}
        className="w-full h-full object-contain"
        loading={variant === 'detail' ? 'eager' : 'lazy'}
      />
    </div>
  );
};

export default ProductCover;
