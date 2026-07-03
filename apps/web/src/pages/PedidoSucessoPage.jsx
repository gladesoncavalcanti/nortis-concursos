import React from 'react';
import { Helmet } from 'react-helmet';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';

const PedidoSucessoPage = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order_id');

  return (
    <>
      <Helmet>
        <title>Pagamento confirmado - NORTIS CONCURSOS</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-background flex items-center justify-center py-16 px-4">
        <div className="max-w-lg w-full bg-card border border-border rounded-xl shadow-premium p-8 md:p-10 text-center">
          <div className="w-16 h-16 bg-[hsl(var(--accent))]/15 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-9 h-9 text-[hsl(var(--accent))]" />
          </div>

          <h1 className="text-2xl md:text-3xl font-bold font-heading text-foreground mb-3">
            Pagamento em confirmação
          </h1>

          <p className="text-muted-foreground leading-relaxed mb-2">
            Recebemos o seu pagamento e estamos confirmando com a Asaas. Assim que a confirmação
            chegar, seu acesso à apostila é liberado automaticamente.
          </p>

          <p className="text-muted-foreground leading-relaxed mb-6">
            Você receberá a confirmação no e-mail informado na compra. Se já tiver conta, acesse
            "Minha Conta" para acompanhar seu pedido.
          </p>

          {orderId && (
            <p className="text-xs text-muted-foreground mb-6">
              Número do pedido: <span className="font-mono">{orderId}</span>
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/minha-conta">
              <Button className="w-full sm:w-auto bg-[hsl(var(--primary))] text-white hover:bg-[hsl(var(--primary))]/90 font-semibold">
                Ir para Minha Conta
              </Button>
            </Link>
            <Link to="/apostilas">
              <Button variant="outline" className="w-full sm:w-auto font-semibold">
                Ver mais apostilas
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default PedidoSucessoPage;
