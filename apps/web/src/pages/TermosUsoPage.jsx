import React from 'react';
import { Helmet } from 'react-helmet';

const TermosUsoPage = () => {
  return (
    <>
      <Helmet>
        <title>Termos de Uso - NORTIS CONCURSOS</title>
        <meta name="description" content="Termos de Uso da Nortis Concursos. Regras e condições para utilização de nossos materiais." />
      </Helmet>
      <div className="min-h-screen bg-background py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold font-heading text-foreground mb-8">Termos de Uso</h1>
          <div className="prose prose-lg text-muted-foreground font-body">
            <p>Ao acessar e utilizar os materiais da Nortis Concursos, você concorda com os presentes Termos de Uso.</p>
            
            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">1. Direitos Autorais</h2>
            <p>Todos os materiais (apostilas, mapas mentais, simulados) são de propriedade exclusiva da Nortis Concursos. É expressamente proibida a reprodução, distribuição, compartilhamento ou revenda não autorizada dos materiais.</p>
            
            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">2. Acesso aos Materiais</h2>
            <p>O acesso aos materiais digitais é pessoal e intransferível. O sistema monitora acessos simultâneos e downloads suspeitos, podendo bloquear a conta em caso de violação.</p>
            
            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">3. Política de Reembolso</h2>
            <p>Garantimos a devolução integral do valor pago em até 7 (sete) dias após a compra, conforme o Código de Defesa do Consumidor, caso o material não atenda às suas expectativas.</p>
            
            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">4. Atualizações</h2>
            <p>As apostilas adquiridas recebem atualizações gratuitas até a data da prova do respectivo concurso, disponibilizadas na área do aluno.</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default TermosUsoPage;