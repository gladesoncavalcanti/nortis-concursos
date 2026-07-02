import React, { useEffect, useState } from 'react';
import { getSupabaseProducts } from '@/api/supabaseProducts';
import { adaptSupabaseProduct } from '@/api/productsAdapter';

/**
 * Página de verificação isolada, sem link no menu principal.
 * Mostra o resultado de adaptSupabaseProduct() aplicado aos produtos
 * reais do Supabase — valida visualmente o shape adaptado antes de
 * qualquer conexão com /apostilas, ProductsList ou ProductDetailPage.
 *
 * Sem botão de comprar, sem addToCart, sem Link para /product/:id —
 * puramente leitura + adaptação, sem tocar no catálogo real.
 */
const SupabaseProductsAdaptedCheckPage = () => {
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
    <div style={{ padding: '2rem', fontFamily: 'monospace' }}>
      <h1>Supabase Products Adapted Check (dev only)</h1>
      <p>
        Rota isolada, sem link no menu. Mostra o resultado de{' '}
        <code>adaptSupabaseProduct()</code> — não conectada a /apostilas,
        ProductsList, ProductDetailPage, carrinho ou checkout.
      </p>

      {loading && <p>Carregando...</p>}

      {error && (
        <p style={{ color: 'red' }}>Erro ao consultar Supabase: {error}</p>
      )}

      {!loading && !error && products.length === 0 && (
        <p>Nenhum produto encontrado na tabela products.</p>
      )}

      {!loading && !error && products.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1rem' }}>
          {products.map((product) => {
            const variant = product.variants[0];
            return (
              <div
                key={product.id}
                style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '1rem', maxWidth: '480px' }}
              >
                {product.ribbon_text && (
                  <div
                    style={{
                      display: 'inline-block',
                      background: '#eee',
                      padding: '0.15rem 0.6rem',
                      borderRadius: '4px',
                      marginBottom: '0.5rem',
                      fontSize: '0.85rem',
                    }}
                  >
                    {product.ribbon_text}
                  </div>
                )}

                {product.image && (
                  <img
                    src={product.image}
                    alt={product.title}
                    style={{ maxWidth: '100%', marginBottom: '0.5rem' }}
                  />
                )}

                <h2 style={{ margin: '0 0 0.25rem' }}>{product.title}</h2>

                {product.subtitle && (
                  <p style={{ margin: '0 0 0.5rem', color: '#555' }}>{product.subtitle}</p>
                )}

                <p style={{ margin: '0 0 0.5rem' }}>{product.description}</p>

                <p style={{ margin: '0 0 0.25rem' }}>
                  price_in_cents: {product.price_in_cents}
                </p>
                <p style={{ margin: '0 0 0.25rem' }}>
                  variants[0].price_formatted: {variant?.price_formatted ?? '—'}
                  {' | '}
                  sale_price_formatted: {variant?.sale_price_formatted ?? '—'}
                </p>
                <p style={{ margin: 0 }}>
                  manage_inventory: {String(variant?.manage_inventory ?? '—')}
                  {' | '}
                  inventory_quantity: {String(variant?.inventory_quantity ?? '—')}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SupabaseProductsAdaptedCheckPage;
