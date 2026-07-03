import React from 'react';
import { Helmet } from 'react-helmet';
import { Link, useSearchParams } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';

const PedidoErroPage = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order_id');
  const motivo = searchParams.get('motivo');

  const mensagem =
    motivo === 'expirado'
      ? 'O prazo para concluir esse pagamento expirou.'
      : 'O pagamento não foi concluído ou foi cancelado.';

  return (
    <>
      <Helmet>
        <title>Pagamento não concluído - NORTIS CONCURSOS</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-background flex items-center justify-center py-16 px-4">
        <div className="max-w-lg w-full bg-card border border-border rounded-xl shadow-premium p-8 md:p-10 text-center">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-9 h-9 text-destructive" />
          </div>

          <h1 className="text-2xl md:text-3xl font-bold font-heading text-foreground mb-3">
            Pagamento não concluído
          </h1>

          <p className="text-muted-foreground leading-relaxed mb-6">
            {mensagem} Nenhum valor foi cobrado. Você pode tentar novamente quando quiser.
          </p>

          {orderId && (
            <p className="text-xs text-muted-foreground mb-6">
              Número do pedido: <span className="font-mono">{orderId}</span>
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/apostilas">
              <Button className="w-full sm:w-auto bg-[hsl(var(--primary))] text-white hover:bg-[hsl(var(--primary))]/90 font-semibold">
                Tentar novamente
              </Button>
            </Link>
            <Link to="/contato">
              <Button variant="outline" className="w-full sm:w-auto font-semibold">
                Falar com o suporte
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default PedidoErroPage;
