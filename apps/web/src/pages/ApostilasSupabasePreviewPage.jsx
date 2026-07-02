import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import { getSupabaseProducts } from '@/api/supabaseProducts';
import { adaptSupabaseProduct } from '@/api/productsAdapter';

const placeholderImage =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMzc0MTUxIi8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzlDQTNBRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pgo8L3N2Zz4K';

/**
 * Card visualmente parecido com o da vitrine real (ProductsList.jsx),
 * mas deliberadamente SEM addToCart, SEM botão "Comprar Agora" e SEM
 * Link para /product/:id — é só comparação visual, não é uma vitrine
 * funcional.
 */
const SupabasePreviewCard = ({ product, index }) => {
  const variant = product.variants[0];
  const hasSale = Boolean(variant && variant.sale_price_in_cents !== null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      className="h-full"
    >
      <div className="rounded-xl border border-border bg-card text-card-foreground shadow-sm overflow-hidden flex flex-col h-full">
        <div className="relative h-56 overflow-hidden">
          <img
            src={product.image || placeholderImage}
            alt={product.title}
            className="w-full h-full object-cover"
          />
          {product.ribbon_text && (
            <div className="absolute top-3 left-3 bg-[hsl(var(--secondary))] text-[hsl(var(--primary))] text-xs font-bold px-3 py-1 rounded-full shadow-lg">
              {product.ribbon_text}
            </div>
          )}
        </div>

        <div className="p-6 flex flex-col flex-grow">
          <h3 className="text-lg font-bold font-heading text-card-foreground mb-2 line-clamp-2">
            {product.title}
          </h3>
          <p className="text-sm text-muted-foreground mb-4 flex-grow line-clamp-3">
            {product.subtitle || product.description || 'Sem descrição.'}
          </p>

          <div className="mt-auto space-y-2">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-[hsl(var(--secondary))]">
                {hasSale ? variant.sale_price_formatted : variant?.price_formatted}
              </span>
              {hasSale && (
                <span className="text-sm line-through text-muted-foreground">
                  {variant.price_formatted}
                </span>
              )}
            </div>

            <p className="text-xs text-muted-foreground">
              Estoque:{' '}
              {variant?.manage_inventory
                ? `${variant.inventory_quantity ?? 0} unidade(s) (controlado)`
                : 'não controlado'}
            </p>

            <div className="pt-2 text-xs font-semibold text-[hsl(var(--secondary))] uppercase tracking-wide">
              Preview Supabase — compra desabilitada
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const ApostilasSupabasePreviewPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    getSupabaseProducts().then((result) => {
      if (!isMounted) return;
      if (result.error) {
        setError(result.error);
      } else {
        setProducts(result.data.map(adaptSupabaseProduct));
      }
      setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <>
      <Helmet>
        <title>Preview Supabase (comparação) - NORTIS CONCURSOS</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-background pb-24">
        <section className="bg-[hsl(var(--primary))] border-b border-[hsl(var(--secondary))]/20 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 bg-yellow-400/90 text-black text-sm font-bold px-4 py-2 rounded-full mb-4">
              <AlertTriangle className="w-4 h-4" />
              Preview Supabase — não é a vitrine real
            </div>
            <h1 className="text-3xl md:text-4xl font-bold font-heading text-white mb-2">
              Catálogo Supabase (comparação)
            </h1>
            <p className="text-white/80 max-w-2xl mx-auto">
              Produtos vindos do Supabase, já adaptados ao mesmo formato usado pela loja real,
              só para comparação visual. Compra está desabilitada nesta página — a loja de
              verdade continua em <code className="bg-white/10 px-1 rounded">/apostilas</code>.
            </p>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
          {loading && (
            <p className="text-center text-muted-foreground">Carregando produtos do Supabase...</p>
          )}

          {error && (
            <div className="text-center text-destructive p-8 bg-destructive/10 rounded-lg">
              <p>Erro ao carregar do Supabase: {error}</p>
            </div>
          )}

          {!loading && !error && products.length === 0 && (
            <p className="text-center text-muted-foreground p-8">
              Nenhum produto encontrado na tabela products do Supabase.
            </p>
          )}

          {!loading && !error && products.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {products.map((product, index) => (
                <SupabasePreviewCard key={product.id} product={product} index={index} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ApostilasSupabasePreviewPage;
