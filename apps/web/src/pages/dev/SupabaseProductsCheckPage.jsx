import React, { useEffect, useState } from 'react';
import { getSupabaseProducts } from '@/api/supabaseProducts';

/**
 * Página de verificação isolada, sem link no menu principal.
 * Renderiza dados crus da tabela `products` do Supabase.
 *
 * Sem botão de comprar, sem addToCart, sem Link para /product/:id —
 * puramente leitura, para validar a conexão real dentro do runtime do app.
 */
const SupabaseProductsCheckPage = () => {
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
        setProducts(result.data);
      }
      setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div style={{ padding: '2rem', fontFamily: 'monospace' }}>
      <h1>Supabase Products Check (dev only)</h1>
      <p>Rota isolada, sem link no menu. Leitura read-only de public.products.</p>

      {loading && <p>Carregando...</p>}

      {error && (
        <p style={{ color: 'red' }}>Erro ao consultar Supabase: {error}</p>
      )}

      {!loading && !error && products.length === 0 && (
        <p>Nenhum produto encontrado na tabela products.</p>
      )}

      {!loading && !error && products.length > 0 && (
        <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse', marginTop: '1rem' }}>
          <thead>
            <tr>
              <th>id</th>
              <th>title</th>
              <th>price_cents</th>
              <th>active</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td>{product.id}</td>
                <td>{product.title ?? product.name ?? '—'}</td>
                <td>{product.price_cents ?? product.amount ?? '—'}</td>
                <td>{String(product.active ?? '—')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default SupabaseProductsCheckPage;
