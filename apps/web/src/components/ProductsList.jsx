import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Loader2 } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/hooks/use-toast';
import { getSupabaseProducts } from '@/api/supabaseProducts';
import { adaptSupabaseProduct } from '@/api/productsAdapter';

const placeholderImage = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMzc0MTUxIi8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzlDQTNBRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pgo8L3N2Zz4K";

const ProductCard = ({ product, index }) => {
  const { addToCart } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();

  const displayVariant = useMemo(() => product.variants[0], [product]);
  const hasSale = useMemo(() => displayVariant && displayVariant.sale_price_in_cents !== null, [displayVariant]);
  const displayPrice = useMemo(() => hasSale ? displayVariant.sale_price_formatted : displayVariant.price_formatted, [displayVariant, hasSale]);
  const originalPrice = useMemo(() => hasSale ? displayVariant.price_formatted : null, [displayVariant, hasSale]);

  const handleAddToCart = useCallback(async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (product.variants.length > 1) {
      navigate(`/product/${product.id}`);
      return;
    }

    const defaultVariant = product.variants[0];

    try {
      await addToCart(product, defaultVariant, 1, defaultVariant.inventory_quantity);
      toast({
        title: "Adicionado ao Carrinho! 🛒",
        description: `${product.title} foi adicionado.`,
      });
    } catch (error) {
      toast({
        title: "Erro ao adicionar",
        description: error.message,
        variant: "destructive"
      });
    }
  }, [product, addToCart, toast, navigate]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      className="h-full"
    >
      <Link to={`/product/${product.id}`} className="block h-full">
        <div className="rounded-lg border border-border bg-card text-card-foreground shadow-sm overflow-hidden group transition-all duration-300 hover:shadow-premium hover:-translate-y-0.5 flex flex-col h-full">
          <div className="relative h-56 overflow-hidden bg-muted">
            <img
              src={product.image || placeholderImage}
              alt={product.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {product.ribbon_text && (
              <div className="absolute top-3 left-3 bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] text-xs font-bold px-3 py-1 rounded-full shadow-md">
                {product.ribbon_text}
              </div>
            )}
          </div>
          <div className="p-6 flex flex-col flex-grow">
            <h3 className="text-lg font-bold font-heading text-card-foreground mb-2 line-clamp-2">{product.title}</h3>
            <p className="text-sm text-muted-foreground mb-6 flex-grow line-clamp-3">{product.subtitle || product.description?.replace(/<[^>]*>?/gm, '') || 'Material completo e atualizado.'}</p>

            <div className="mt-auto pt-4 border-t border-border">
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-2xl font-bold text-[hsl(var(--primary))]">{displayPrice}</span>
                {hasSale && (
                  <span className="text-sm line-through text-muted-foreground">{originalPrice}</span>
                )}
              </div>
              <Button onClick={handleAddToCart} className="w-full bg-[hsl(var(--primary))] text-white hover:bg-[hsl(var(--primary))]/90 font-semibold transition-colors duration-300">
                <ShoppingCart className="mr-2 h-4 w-4" /> Comprar Agora
              </Button>
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