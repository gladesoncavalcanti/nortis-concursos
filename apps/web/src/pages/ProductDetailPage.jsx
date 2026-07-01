import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { ShoppingCart, Loader2, CheckCircle2, ShieldCheck, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/hooks/use-toast';
import { getProduct } from '@/api/EcommerceApi';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toast } = useToast();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const data = await getProduct(id);
        setProduct(data);
        if (data.variants && data.variants.length > 0) {
          setSelectedVariant(data.variants[0]);
        }
      } catch (err) {
        setError(err.message || 'Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const hasSale = useMemo(() => selectedVariant && selectedVariant.sale_price_in_cents !== null, [selectedVariant]);
  const displayPrice = useMemo(() => hasSale ? selectedVariant?.sale_price_formatted : selectedVariant?.price_formatted, [selectedVariant, hasSale]);
  const originalPrice = useMemo(() => hasSale ? selectedVariant?.price_formatted : null, [selectedVariant, hasSale]);

  const handleAddToCart = async () => {
    if (!product || !selectedVariant) return;

    try {
      await addToCart(product, selectedVariant, quantity, selectedVariant.inventory_quantity);
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
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-background">
        <Loader2 className="h-12 w-12 text-[hsl(var(--secondary))] animate-spin" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-background p-4">
        <div className="text-center text-destructive p-8 bg-destructive/10 rounded-lg max-w-md">
          <p className="mb-4">Erro ao carregar apostila: {error}</p>
          <Button onClick={() => navigate('/apostilas')} variant="outline">Voltar para Apostilas</Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{`${product.title} - NORTIS CONCURSOS`}</title>
        <meta name="description" content={product.subtitle || `Compre a apostila ${product.title} e prepare-se para a aprovação.`} />
      </Helmet>

      <div className="min-h-screen bg-background py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Button variant="ghost" onClick={() => navigate('/apostilas')} className="mb-8 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4 mr-2" /> Voltar para Apostilas
          </Button>

          <div className="bg-card rounded-2xl shadow-lg border border-border overflow-hidden">
            <div className="grid md:grid-cols-2 gap-0">
              {/* Image Section */}
              <div className="bg-muted p-8 flex items-center justify-center relative">
                <motion.img
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  src={product.image || "https://horizons-cdn.hostinger.com/2547f642-7924-40ef-a160-8a0896ff1615/4d1535b54ffb46bf29453d9b264366e6.png"}
                  alt={product.title}
                  className="w-full max-w-md rounded-xl shadow-2xl object-cover"
                />
                {product.ribbon_text && (
                  <div className="absolute top-6 left-6 bg-[hsl(var(--secondary))] text-[hsl(var(--primary))] text-sm font-bold px-4 py-1.5 rounded-full shadow-lg">
                    {product.ribbon_text}
                  </div>
                )}
              </div>

              {/* Details Section */}
              <div className="p-8 md:p-12 flex flex-col">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <h1 className="text-3xl md:text-4xl font-bold font-heading text-foreground mb-4 leading-tight">
                    {product.title}
                  </h1>
                  
                  <div className="flex items-baseline gap-3 mb-6">
                    <span className="text-4xl font-bold text-[hsl(var(--secondary))]">{displayPrice}</span>
                    {hasSale && (
                      <span className="text-lg line-through text-muted-foreground">{originalPrice}</span>
                    )}
                  </div>

                  <div className="prose prose-sm text-muted-foreground mb-8" dangerouslySetInnerHTML={{ __html: product.description }} />

                  {product.variants.length > 1 && (
                    <div className="mb-8">
                      <label className="block text-sm font-medium text-foreground mb-3">Selecione a Opção</label>
                      <div className="flex flex-wrap gap-3">
                        {product.variants.map((variant) => (
                          <Button
                            key={variant.id}
                            variant={selectedVariant?.id === variant.id ? "default" : "outline"}
                            onClick={() => setSelectedVariant(variant)}
                            className={selectedVariant?.id === variant.id ? "bg-[hsl(var(--primary))] text-white" : ""}
                          >
                            {variant.title}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-4 mb-8">
                    <div className="flex items-center border border-border rounded-md bg-muted/50">
                      <Button onClick={() => setQuantity(Math.max(1, quantity - 1))} variant="ghost" className="px-4 hover:bg-muted">-</Button>
                      <span className="px-4 font-medium">{quantity}</span>
                      <Button onClick={() => setQuantity(quantity + 1)} variant="ghost" className="px-4 hover:bg-muted">+</Button>
                    </div>
                    <Button 
                      onClick={handleAddToCart} 
                      className="flex-1 h-12 bg-[hsl(var(--secondary))] text-[hsl(var(--primary))] hover:bg-[hsl(var(--secondary))]/90 font-bold text-lg transition-all"
                    >
                      <ShoppingCart className="mr-2 h-5 w-5" /> Comprar Agora
                    </Button>
                  </div>

                  <div className="space-y-4 pt-8 border-t border-border">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <ShieldCheck className="w-5 h-5 text-green-500 mr-3" />
                      Compra 100% segura e garantida
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <CheckCircle2 className="w-5 h-5 text-[hsl(var(--secondary))] mr-3" />
                      Acesso imediato após a confirmação do pagamento
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <CheckCircle2 className="w-5 h-5 text-[hsl(var(--secondary))] mr-3" />
                      Atualizações gratuitas até a data da prova
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductDetailPage;