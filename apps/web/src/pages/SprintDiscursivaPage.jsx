import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, FileText, MessageCircle, RefreshCw, ShieldCheck, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { NORTIS_WHATSAPP_URL } from '@/config/contact.js';
import { DISCURSIVA_PACKAGES, formatDiscursivaPrice } from '@/config/discursivaCatalog.js';
import DiscursivaInterestModal from '@/components/DiscursivaInterestModal.jsx';

const STEPS = [
  { icon: FileText, title: 'Envie sua resposta', text: 'Texto digitado e, quando necessário, imagem do manuscrito.' },
  { icon: ShieldCheck, title: 'Receba uma correção orientada', text: 'Análise estruturada com revisão humana nas correções pagas.' },
  { icon: RefreshCw, title: 'Reescreva com direção', text: 'Use o relatório para corrigir pontos concretos e evoluir sua resposta.' },
];

const FAQ_ITEMS = [
  {
    question: 'Qual é a diferença entre TDAS e EDAS?',
    answer: 'TDAS reúne as opções para Agente Social e Técnico Administrativo. EDAS corresponde à opção de Serviço Social. Ao se cadastrar, escolha a categoria e a especialidade do seu cargo.',
  },
  {
    question: 'Como funcionam as três etapas da Sprint?',
    answer: 'Primeiro, você envia sua resposta. Depois, recebe uma correção orientada — com revisão humana nas correções pagas. Por fim, usa o relatório para reescrever o texto com foco nos pontos de melhoria.',
  },
  {
    question: 'Qual é a diferença entre os pacotes?',
    answer: 'O Diagnóstico oferece uma primeira leitura orientativa. Os pacotes Essencial incluem correção estruturada. Os pacotes Intensivo propõem um ciclo de prática, orientação e reescrita. As opções TDAS e EDAS são direcionadas aos respectivos cargos.',
  },
  {
    question: 'Os pacotes já estão disponíveis?',
    answer: 'Ainda não há compra online. Os pacotes estão em preparação, e as opções EDAS dependem também da confirmação de disponibilidade pedagógica. Você pode registrar seu interesse para receber o aviso de abertura das vagas.',
  },
  {
    question: 'A Sprint é oficial do Instituto Quadrix?',
    answer: 'Não. Este é um projeto independente da Nortis Concursos, sem vínculo oficial com o Instituto Quadrix. Correções, diagnósticos e estimativas têm finalidade pedagógica e não representam nota ou resultado oficial.',
  },
  {
    question: 'O que acontece depois do cadastro?',
    answer: 'A Nortis registra seu cargo, especialidade e pacote de interesse e entra em contato quando as vagas correspondentes forem abertas. O cadastro não é uma compra nem garante uma vaga.',
  },
];

const toggleDetailsWithKeyboard = (event) => {
  if (event.key !== 'Enter' && event.key !== ' ') return;

  event.preventDefault();
  const details = event.currentTarget.closest('details');
  if (details) details.open = !details.open;
};

const SprintDiscursivaPage = () => {
  const [interestModal, setInterestModal] = useState({ isOpen: false, category: '', packageId: '' });

  const openInterestModal = (category = '', packageId = '') =>
    setInterestModal({ isOpen: true, category, packageId });
  const closeInterestModal = () => setInterestModal((prev) => ({ ...prev, isOpen: false }));

  return (
  <>
    <Helmet>
      <title>Sprint Discursiva SEDES-DF 2026 | Nortis Concursos</title>
      <meta
        name="description"
        content="Conheça a Sprint Discursiva Nortis para a SEDES-DF 2026: prática orientada, correção estruturada e reescrita para TDAS e EDAS."
      />
      <link rel="canonical" href="https://www.nortisconcursos.com.br/sprint-discursiva-sedes-df" />
    </Helmet>

    <section className="relative overflow-hidden bg-[hsl(var(--primary))] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,hsl(var(--accent)/0.18),transparent_32%)]" />
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[hsl(var(--accent))] mb-4">Novo projeto-piloto Nortis</p>
        <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-5">
          Sprint Discursiva SEDES-DF 2026
        </h1>
        <p className="max-w-2xl mx-auto text-base md:text-lg text-white/75 leading-relaxed mb-8">
          Pratique respostas discursivas com um processo direto: diagnóstico, correção orientada e reescrita — com foco no seu cargo.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <Button
            type="button"
            onClick={() => openInterestModal()}
            className="w-full sm:w-auto h-12 px-8 font-bold bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] hover:bg-[hsl(var(--accent))]/90"
          >
            Entrar na lista de interesse
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          <Link to="/sedes-df-2026">
            <Button variant="outline" className="w-full sm:w-auto h-12 px-8 border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white">
              Ver guia SEDES-DF
            </Button>
          </Link>
        </div>
        <p className="mt-5 text-xs text-white/55">Fase inicial com vagas e capacidade de atendimento limitadas.</p>
      </div>
    </section>

    <section className="py-14 md:py-18 bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-5">
          {STEPS.map(({ icon: Icon, title, text }, index) => (
            <article key={title} className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-[hsl(var(--primary))] text-[hsl(var(--accent))] mb-4">
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Etapa {index + 1}</p>
              <h2 className="font-heading text-lg font-bold text-foreground mb-2">{title}</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">{text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>

    <section className="py-14 md:py-20 bg-muted/40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center mb-10">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[hsl(var(--accent))] mb-3">Pacotes planejados</p>
          <h2 className="font-heading text-3xl font-bold text-foreground mb-3">Escolha o ritmo da sua preparação</h2>
          <p className="text-muted-foreground">Os pacotes ainda não estão disponíveis para compra online. Cadastre seu interesse para receber a abertura das vagas.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {DISCURSIVA_PACKAGES.map((item) => (
            <article key={item.id} className="flex flex-col rounded-xl border border-border bg-card p-6 shadow-sm">
              <div className="flex items-start justify-between gap-3 mb-3">
                <h3 className="font-heading text-lg font-bold text-foreground">{item.name}</h3>
                {item.availabilityNote && <span className="text-[10px] uppercase tracking-wide rounded-full bg-muted px-2.5 py-1 text-muted-foreground">{item.availabilityNote}</span>}
              </div>
              <p className="text-xs font-semibold text-muted-foreground mb-4">{item.audience}</p>
              <p className="text-2xl font-bold text-[hsl(var(--primary))] mb-4">{formatDiscursivaPrice(item.price)}</p>
              <p className="text-sm leading-relaxed text-muted-foreground mb-5 flex-grow">{item.description}</p>
              <div className="flex items-center text-xs text-muted-foreground mb-4">
                <CheckCircle2 className="w-4 h-4 mr-2 text-[hsl(var(--accent))]" />
                Lançamento em preparação
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => openInterestModal(item.category === 'AMBOS' ? '' : item.category, item.id)}
                className="w-full h-10 text-sm font-semibold"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Quero esse pacote
              </Button>
            </article>
          ))}
        </div>
        <p className="max-w-3xl mx-auto mt-8 text-center text-xs leading-relaxed text-muted-foreground">
          Projeto independente, sem vínculo oficial com o Instituto Quadrix. Correções, diagnósticos e
          estimativas têm finalidade exclusivamente pedagógica e não representam nota ou resultado oficial.
        </p>
      </div>
    </section>

    <section className="py-14 md:py-20 bg-background" aria-labelledby="faq-title">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[hsl(var(--accent))] mb-3">Dúvidas frequentes</p>
          <h2 id="faq-title" className="font-heading text-3xl font-bold text-foreground mb-3">
            Antes de registrar seu interesse
          </h2>
          <p className="text-muted-foreground">Entenda a proposta, os pacotes e as próximas etapas.</p>
        </div>

        <div className="space-y-3">
          {FAQ_ITEMS.map((item) => (
            <details key={item.question} className="group rounded-xl border border-border bg-card px-5 py-4 shadow-sm">
              <summary
                onKeyDown={toggleDetailsWithKeyboard}
                className="cursor-pointer list-none font-heading font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2 rounded-sm"
              >
                <span className="flex items-center justify-between gap-4">
                  {item.question}
                  <span aria-hidden="true" className="text-xl leading-none text-[hsl(var(--accent))] transition-transform group-open:rotate-45">+</span>
                </span>
              </summary>
              <p className="pt-3 pr-8 text-sm leading-relaxed text-muted-foreground">{item.answer}</p>
            </details>
          ))}

          <details className="group rounded-xl border border-border bg-card px-5 py-4 shadow-sm">
            <summary
              onKeyDown={toggleDetailsWithKeyboard}
              className="cursor-pointer list-none font-heading font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2 rounded-sm"
            >
              <span className="flex items-center justify-between gap-4">
                Como meus dados serão usados?
                <span aria-hidden="true" className="text-xl leading-none text-[hsl(var(--accent))] transition-transform group-open:rotate-45">+</span>
              </span>
            </summary>
            <p className="pt-3 pr-8 text-sm leading-relaxed text-muted-foreground">
              Os dados informados são usados para o contato da Nortis sobre a Sprint Discursiva, conforme o consentimento dado no formulário. Consulte a{' '}
              <Link to="/politica-privacidade" className="font-medium underline underline-offset-2 hover:text-foreground">
                Política de Privacidade
              </Link>
              .
            </p>
          </details>
        </div>
      </div>
    </section>

    <section className="py-16 bg-[hsl(var(--primary))] text-center text-white">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <MessageCircle className="w-9 h-9 mx-auto mb-4 text-[hsl(var(--accent))]" />
        <h2 className="font-heading text-2xl md:text-3xl font-bold mb-4">Quer participar do primeiro grupo?</h2>
        <p className="text-white/70 mb-7">Fale com a Nortis para informar seu cargo e receber as próximas orientações.</p>
        <a href={NORTIS_WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
          <Button className="h-12 px-8 font-bold bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] hover:bg-[hsl(var(--accent))]/90">
            Falar com a Nortis
          </Button>
        </a>
      </div>
    </section>

    <DiscursivaInterestModal
      isOpen={interestModal.isOpen}
      onClose={closeInterestModal}
      initialCategory={interestModal.category}
      initialPackageId={interestModal.packageId}
    />
  </>
  );
};

export default SprintDiscursivaPage;
