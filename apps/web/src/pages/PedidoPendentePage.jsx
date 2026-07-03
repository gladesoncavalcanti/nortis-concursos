import React from 'react';
import { Helmet } from 'react-helmet';
import { Link, useSearchParams } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';

const PedidoPendentePage = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order_id');

  return (
    <>
      <Helmet>
        <title>Pagamento pendente - NORTIS CONCURSOS</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-background flex items-center justify-center py-16 px-4">
        <div className="max-w-lg w-full bg-card border border-border rounded-xl shadow-premium p-8 md:p-10 text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock className="w-9 h-9 text-[hsl(var(--primary))]" />
          </div>

          <h1 className="text-2xl md:text-3xl font-bold font-heading text-foreground mb-3">
            Pagamento pendente
          </h1>

          <p className="text-muted-foreground leading-relaxed mb-2">
            Seu pagamento ainda não foi confirmado. Se você pagou via Pix, a confirmação costuma
            ser instantânea — aguarde alguns instantes. Se escolheu boleto, a compensação pode
            levar até 2 dias úteis.
          </p>

          <p className="text-muted-foreground leading-relaxed mb-6">
            Assim que o pagamento for confirmado, o acesso à apostila é liberado automaticamente,
            sem necessidade de nenhuma ação adicional.
          </p>

          {orderId && (
            <p className="text-xs text-muted-foreground mb-6">
              Número do pedido: <span className="font-mono">{orderId}</span>
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/minha-conta">
              <Button className="w-full sm:w-auto bg-[hsl(var(--primary))] text-white hover:bg-[hsl(var(--primary))]/90 font-semibold">
                Acompanhar em Minha Conta
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

export default PedidoPendentePage;
