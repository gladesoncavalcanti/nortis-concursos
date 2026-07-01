import React from 'react';
import { Helmet } from 'react-helmet';

const PoliticaPrivacidadePage = () => {
  return (
    <>
      <Helmet>
        <title>Política de Privacidade - NORTIS CONCURSOS</title>
        <meta name="description" content="Política de Privacidade da Nortis Concursos. Saiba como protegemos seus dados." />
      </Helmet>
      <div className="min-h-screen bg-background py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold font-heading text-foreground mb-8">Política de Privacidade</h1>
          <div className="prose prose-lg text-muted-foreground font-body">
            <p>A Nortis Concursos valoriza a privacidade de seus usuários e criou esta Política de Privacidade para demonstrar seu compromisso em proteger a sua privacidade e seus dados pessoais, nos termos da Lei Geral de Proteção de Dados (LGPD).</p>
            
            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">1. Coleta de Dados</h2>
            <p>Coletamos informações que você nos fornece diretamente, como nome, e-mail e dados de pagamento ao realizar uma compra ou se cadastrar para receber materiais gratuitos.</p>
            
            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">2. Uso dos Dados</h2>
            <p>Utilizamos seus dados para processar pagamentos, enviar os materiais adquiridos, comunicar atualizações de apostilas e enviar ofertas relevantes, sempre com a opção de descadastramento (opt-out).</p>
            
            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">3. Armazenamento e Segurança</h2>
            <p>Seus dados são armazenados em servidores seguros e utilizamos criptografia padrão da indústria para proteger suas informações de pagamento.</p>
            
            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">4. Seus Direitos</h2>
            <p>Você tem o direito de solicitar acesso, correção ou exclusão dos seus dados pessoais a qualquer momento através do e-mail contato@nortisconcursos.com.br.</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default PoliticaPrivacidadePage;