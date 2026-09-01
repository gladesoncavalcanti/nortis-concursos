import React, { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Loader2, ShoppingCart } from 'lucide-react';
import { getSupabaseProducts } from '@/api/supabaseProducts';
import { adaptSupabaseProduct } from '@/api/productsAdapter';

const placeholderImage = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMzc0MTUxIi8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzlDQTNBRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pgo8L3N2Zz4K";

const ProductCard = ({ product, index }) => {
  const displayVariant = useMemo(() => product.variants[0], [product]);
  const hasSale = useMemo(() => displayVariant && displayVariant.sale_price_in_cents !== null, [displayVariant]);
  const displayPrice = useMemo(() => hasSale ? displayVariant.sale_price_formatted : displayVariant.price_formatted, [displayVariant, hasSale]);
  const originalPrice = useMemo(() => hasSale ? displayVariant.price_formatted : null, [displayVariant, hasSale]);

  // A arte de capa hospedada externamente para este produto traz uma
  // contagem de páginas desatualizada (671, o correto é 741) e não pode
  // ser editada por aqui. Em vez de mostrar essa imagem, renderizamos uma
  // capa 100% HTML/CSS para este produto específico.
  const isNexoSocial = product.title?.includes('Nexo Social');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      className="h-full"
    >
      <Link to={`/product/${product.id}`} className="block h-full">
        <div className="rounded-xl border border-border bg-card text-card-foreground shadow-sm overflow-hidden group transition-all duration-300 hover:shadow-premium-lg hover:-translate-y-1 hover:border-[hsl(var(--accent))]/40 flex flex-col h-full">
          <div className="relative h-64 overflow-hidden bg-[hsl(var(--primary))] flex items-center justify-center p-4">
            {isNexoSocial ? (
              <img
                src="/nexo-social-capa-741.jpeg"
                alt="Capa da apostila Nexo Social – SEDES DF 2026, banca Quadrix, 741 páginas"
                className="h-full w-auto object-contain rounded-md shadow-premium-lg ring-1 ring-white/15 transition-transform duration-500 group-hover:scale-[1.03]"
                loading="lazy"
              />
            ) : (
              <img
                src={product.image || placeholderImage}
                alt={product.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 rounded-lg"
              />
            )}
            {product.ribbon_text && (
              <div className="absolute top-4 left-4 bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] text-xs font-bold px-3 py-1 rounded-full shadow-md">
                {product.ribbon_text}
              </div>
            )}
          </div>
          <div className="p-6 flex flex-col flex-grow">
            <h3 className="text-lg font-bold font-heading text-card-foreground mb-2 line-clamp-2 group-hover:text-[hsl(var(--primary))] transition-colors">{product.title}</h3>
            <p className="text-sm text-muted-foreground mb-6 flex-grow line-clamp-3 leading-relaxed">{product.subtitle || product.description?.replace(/<[^>]*>?/gm, '') || 'Material completo e atualizado.'}</p>

            <div className="mt-auto pt-4 border-t border-border">
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-2xl font-bold font-heading tracking-tight text-[hsl(var(--primary))]">{displayPrice}</span>
                {hasSale && (
                  <span className="text-sm line-through text-muted-foreground">{originalPrice}</span>
                )}
              </div>
              <div className="w-full flex items-center justify-center gap-2 rounded-md bg-[hsl(var(--accent))] py-2.5 text-sm font-bold text-[hsl(var(--accent-foreground))]">
                <ShoppingCart className="h-4 w-4" />
                Comprar por {displayPrice}
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

const ProductsList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchProducts = async () => {
      setLoading(true);
      setError(null);

      const result = await getSupabaseProducts();

      if (!isMounted) return;

      if (result.error) {
        setError(result.error);
      } else {
        setProducts(result.data.map(adaptSupabaseProduct));
      }

      setLoading(false);
    };

    fetchProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-12 w-12 text-[hsl(var(--secondary))] animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-destructive p-8 bg-destructive/10 rounded-lg">
        <p>Erro ao carregar apostilas: {error}</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center text-muted-foreground p-8">
        <p>Nenhuma apostila disponível no momento.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      {products.map((product, index) => (
        <ProductCard key={product.id} product={product} index={index} />
      ))}
    </div>
  );
};

export default ProductsList;
