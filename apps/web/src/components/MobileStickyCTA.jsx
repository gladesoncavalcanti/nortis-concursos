import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';

/**
 * Barra fixa de conversão, mobile-only (Fase 17). Pré-lançamento (Sprint
 * Social 1.2): leva para captura de lead em /materiais-gratuitos — não
 * cria checkout, não adiciona ao carrinho, não altera preço. Some
 * automaticamente fora das páginas comerciais e enquanto o carrinho está
 * aberto (isCartOpen), para nunca cobrir o drawer ou o botão "Finalizar
 * Compra".
 */
const VISIBLE_PATHS = ['/', '/sedes-df-2026', '/apostilas'];

const MobileStickyCTA = ({ isCartOpen }) => {
  const location = useLocation();

  if (isCartOpen || !VISIBLE_PATHS.includes(location.pathname)) {
    return null;
  }

  return (
    <div
      className="md:hidden fixed bottom-0 left-0 right-0 z-30 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
      style={{
        background: 'linear-gradient(90deg, #071622 0%, #071522 45%, #06121f 100%)',
        borderTop: '1px solid rgba(211,165,47,0.35)',
      }}
    >
      <div className="flex items-center justify-between gap-3 px-4 pt-3">
        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-wide text-[#f4efe4]/55 truncate">
            Apostila Nexo Social
          </p>
          <p
            className="text-lg font-bold leading-tight"
            style={{ fontFamily: 'Georgia, "Times New Roman", serif', color: '#f4efe4' }}
          >
            Pré-lançamento
          </p>
          <p className="text-[10px] text-[#f4efe4]/50 truncate">Vendas temporariamente pausadas</p>
        </div>
        <Link to="/materiais-gratuitos" className="shrink-0">
          <Button className="h-11 px-5 font-bold bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] hover:bg-[hsl(var(--accent))]/90 transition-premium">
            <Bell className="w-4 h-4 mr-1.5" />
            Conteúdos grátis
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default MobileStickyCTA;
