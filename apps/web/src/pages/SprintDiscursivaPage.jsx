import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, FileText, MessageCircle, RefreshCw, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { NORTIS_WHATSAPP_URL } from '@/config/contact.js';
import { DISCURSIVA_PACKAGES, formatDiscursivaPrice } from '@/config/discursivaCatalog.js';

const STEPS = [
  { icon: FileText, title: 'Envie sua resposta', text: 'Texto digitado e, quando necessário, imagem do manuscrito.' },
  { icon: ShieldCheck, title: 'Receba uma correção orientada', text: 'Análise estruturada com revisão humana nas correções pagas.' },
  { icon: RefreshCw, title: 'Reescreva com direção', text: 'Use o relatório para corrigir pontos concretos e evoluir sua resposta.' },
];

const SprintDiscursivaPage = () => (
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
          <a href={NORTIS_WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
            <Button className="w-full sm:w-auto h-12 px-8 font-bold bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] hover:bg-[hsl(var(--accent))]/90">
              Entrar na lista de interesse
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </a>
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
              <div className="flex items-center text-xs text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 mr-2 text-[hsl(var(--accent))]" />
                Lançamento em preparação
              </div>
            </article>
          ))}
        </div>
        <p className="max-w-3xl mx-auto mt-8 text-center text-xs leading-relaxed text-muted-foreground">
          Projeto independente, sem vínculo oficial com o Instituto Quadrix. Correções, diagnósticos e
          estimativas têm finalidade exclusivamente pedagógica e não representam nota ou resultado oficial.
        </p>
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
  </>
);

export default SprintDiscursivaPage;
