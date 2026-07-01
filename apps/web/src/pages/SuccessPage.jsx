import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, Download, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';

const SuccessPage = () => {
  return (
    <>
      <Helmet>
        <title>Compra Realizada - NORTIS CONCURSOS</title>
        <meta name="description" content="Sua compra foi realizada com sucesso. Acesse suas apostilas agora." />
      </Helmet>

      <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl w-full"
        >
          <div className="bg-card rounded-2xl p-8 md:p-12 shadow-lg text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-card-foreground mb-4 leading-tight" style={{ letterSpacing: '-0.02em' }}>
              Compra realizada com sucesso
            </h1>

            <p className="text-lg text-card-foreground/80 mb-8 leading-relaxed">
              Obrigado pela sua compra! Sua apostila já está disponível para download na sua conta.
            </p>

            <div className="bg-muted rounded-xl p-6 mb-8">
              <h2 className="text-xl font-bold text-foreground mb-4">
                Próximos passos
              </h2>
              <div className="space-y-3 text-left">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-[hsl(var(--primary))] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-white">1</span>
                  </div>
                  <p className="text-muted-foreground">
                    Acesse sua conta para visualizar e baixar sua apostila
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-[hsl(var(--primary))] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-white">2</span>
                  </div>
                  <p className="text-muted-foreground">
                    Você receberá um e-mail de confirmação com o link de download
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-[hsl(var(--primary))] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-white">3</span>
                  </div>
                  <p className="text-muted-foreground">
                    Comece seus estudos e boa sorte na sua preparação
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/minha-conta">
                <Button size="lg" className="bg-[hsl(var(--primary))] text-white hover:bg-[hsl(var(--primary))]/90 font-semibold">
                  <Download className="w-5 h-5 mr-2" />
                  Acessar minha conta
                </Button>
              </Link>
              <Link to="/apostilas">
                <Button size="lg" variant="outline" className="font-semibold">
                  Ver mais apostilas
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default SuccessPage;