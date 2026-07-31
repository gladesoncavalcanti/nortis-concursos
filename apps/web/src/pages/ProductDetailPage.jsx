import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle2, ShieldCheck, ArrowLeft, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PreLaunchNotice from '@/components/PreLaunchNotice.jsx';
import { getProduct } from '@/api/EcommerceApi';
import { getSupabaseProductByIdOrSlug } from '@/api/supabaseProducts';
import { adaptSupabaseProduct } from '@/api/productsAdapter';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);

        // Tenta primeiro no Supabase (id ou slug). A vitrine (/apostilas)
        // já liga pra cá usando o id do produto Supabase.
        const supabaseResult = await getSupabaseProductByIdOrSlug(id);

        const data = supabaseResult.data
          ? adaptSupabaseProduct(supabaseResult.data)
          // Fallback conservador: produto não encontrado no Supabase,
          // pode ser um produto antigo cadastrado só na Hostinger.
          : await getProduct(id);

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

  // A arte de capa hospedada externamente para este produto traz uma
  // contagem de páginas desatualizada (671, o correto é 741) e não pode
  // ser editada por aqui. Em vez de mostrar essa imagem, renderizamos uma
  // capa 100% HTML/CSS para este produto específico.
  const isNexoSocial = product?.title?.includes('Nexo Social');

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
        <meta name="description" content={product.subtitle || `Conheça a apostila ${product.title} e acompanhe as novidades da Nortis.`} />
      </Helmet>

      <div className="min-h-screen bg-background py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Button variant="ghost" onClick={() => navigate('/apostilas')} className="mb-8 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4 mr-2" /> Voltar para Apostilas
          </Button>

          <div className="bg-card rounded-2xl shadow-premium-lg border border-border overflow-hidden">
            <div className="grid md:grid-cols-[0.9fr_1.1fr] gap-0">
              {/* Image Section */}
              <div className="relative bg-[hsl(var(--primary))] p-8 md:p-12 flex items-center justify-center overflow-hidden">
                <div aria-hidden="true" className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-[hsl(var(--accent))]/[0.1] blur-3xl" />
                {isNexoSocial ? (
                  <motion.img
                    initial={{ opacity: 0, scale: 0.94 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    src="/nexo-social-capa-741.jpeg"
                    alt="Capa da apostila Nexo Social – SEDES DF 2026, banca Quadrix, 741 páginas"
                    className="relative w-full max-w-xs md:max-w-sm h-auto rounded-lg shadow-premium-lg ring-1 ring-white/15 object-contain"
                  />
                ) : (
                  <motion.img
                    initial={{ opacity: 0, scale: 0.94 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    src={product.image || "https://horizons-cdn.hostinger.com/2547f642-7924-40ef-a160-8a0896ff1615/4d1535b54ffb46bf29453d9b264366e6.png"}
                    alt={product.title}
                    className="relative w-full max-w-md rounded-xl shadow-2xl object-cover"
                  />
                )}
                {product.ribbon_text && (
                  <div className="absolute top-6 left-6 bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] text-sm font-bold px-4 py-1.5 rounded-full shadow-md">
                    {product.ribbon_text}
                  </div>
                )}
              </div>

              {/* Details Section */}
              <div className="p-7 md:p-12 flex flex-col">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  {isNexoSocial && (
                    <div className="flex flex-wrap gap-2 mb-5">
                      <span className="text-xs font-semibold uppercase tracking-wide bg-muted text-muted-foreground px-3 py-1 rounded-full border border-border">
                        Banca Quadrix
                      </span>
                      <span className="text-xs font-semibold uppercase tracking-wide bg-muted text-muted-foreground px-3 py-1 rounded-full border border-border">
                        741 páginas
                      </span>
                      <span className="text-xs font-semibold uppercase tracking-wide bg-muted text-muted-foreground px-3 py-1 rounded-full border border-border">
                        PDF · acesso imediato
                      </span>
                    </div>
                  )}

                  <h1 className="text-3xl md:text-4xl font-bold font-heading text-foreground mb-2 leading-tight">
                    {product.title}
                  </h1>
                  {product.subtitle && (
                    <p className="text-base text-muted-foreground mb-6 leading-relaxed">{product.subtitle}</p>
                  )}

                  <div className="prose prose-sm text-muted-foreground mb-7" dangerouslySetInnerHTML={{ __html: product.description }} />

                  <div className="bg-muted/50 border border-border rounded-xl px-5 py-4 mb-7">
                    <div className="flex items-baseline gap-3">
                      <span className="text-4xl font-bold font-heading tracking-tight text-[hsl(var(--primary))]">{displayPrice}</span>
                      {hasSale && (
                        <span className="text-lg line-through text-muted-foreground">{originalPrice}</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Vendas temporariamente pausadas</p>
                  </div>

                  <PreLaunchNotice className="mb-7" />

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

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mb-8">
                    <div className="w-full sm:flex-1 flex items-center justify-center gap-2 h-12 rounded-md border border-border bg-muted text-sm font-semibold text-muted-foreground">
                      <Info className="h-4 w-4" />
                      Vendas temporariamente pausadas
                    </div>
                    <Button
                      onClick={() => navigate('/materiais-gratuitos')}
                      variant="outline"
                      className="w-full sm:w-auto h-12 font-semibold"
                    >
                      Quero ser avisado no lançamento
                    </Button>
                  </div>

                  <div className="space-y-3 pt-6 border-t border-border">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <ShieldCheck className="w-5 h-5 text-[hsl(var(--accent))] mr-3 flex-shrink-0" />
                      Pagamento seguro via Asaas, quando as vendas forem reabertas
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <CheckCircle2 className="w-5 h-5 text-[hsl(var(--accent))] mr-3 flex-shrink-0" />
                      Acesso imediato após a confirmação do pagamento
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <CheckCircle2 className="w-5 h-5 text-[hsl(var(--accent))] mr-3 flex-shrink-0" />
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