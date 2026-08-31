import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ExternalLink, FileSearch, MapPin, Radar, ShieldCheck } from 'lucide-react';
import ContestInterestCta from '@/components/ContestInterestCta.jsx';
import { MONITORED_CONTESTS } from '@/config/monitoredContests.js';

const STATUS_STYLES = {
  gold: 'border-[#d3a52f]/50 bg-[#d3a52f]/15 text-[#f1c85b]',
  green: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200',
  blue: 'border-sky-500/40 bg-sky-500/10 text-sky-200',
};

const ConcursosPage = () => (
  <>
    <Helmet>
      <title>Concursos em acompanhamento | Nortis Concursos</title>
      <meta
        name="description"
        content="Radar Nortis de concursos públicos confirmados ou autorizados, com páginas em andamento para futuras trilhas de estudo."
      />
      <link rel="canonical" href="https://www.nortisconcursos.com.br/concursos" />
      <meta property="og:type" content="website" />
      <meta property="og:title" content="Concursos em acompanhamento | Nortis Concursos" />
      <meta
        property="og:description"
        content="Radar Nortis de concursos públicos confirmados ou autorizados, com páginas em andamento para futuras trilhas de estudo."
      />
      <meta property="og:url" content="https://www.nortisconcursos.com.br/concursos" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="Concursos em acompanhamento | Nortis Concursos" />
      <meta
        name="twitter:description"
        content="Radar Nortis de concursos públicos confirmados ou autorizados, com páginas em andamento para futuras trilhas de estudo."
      />
    </Helmet>

    <div className="bg-background text-foreground">
      <section className="relative overflow-hidden bg-[hsl(var(--primary))] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(211,165,47,0.20),transparent_32%),radial-gradient(circle_at_85%_15%,rgba(255,255,255,0.08),transparent_28%)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#d3a52f]/40 bg-[#d3a52f]/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#f1c85b]">
              <Radar className="h-4 w-4" />
              Radar Nortis
            </span>
            <h1 className="mt-6 max-w-4xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl font-heading">
              Concursos em acompanhamento
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-white/78 md:text-lg">
              Área inicial para concursos confirmados, autorizados ou com edital publicado. Cada página
              nasce como “Em andamento” para receber, depois, materiais, diagnóstico, plano de estudos
              e funcionalidades no mesmo padrão que já está sendo consolidado no SEDES-DF.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border bg-card p-5 shadow-sm">
            <FileSearch className="mb-3 h-5 w-5 text-[hsl(var(--primary))]" />
            <h2 className="font-semibold">Fonte oficial primeiro</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              O radar registra somente dados confirmados por órgão, banca, edital ou página institucional.
            </p>
          </div>
          <div className="rounded-2xl border bg-card p-5 shadow-sm">
            <ShieldCheck className="mb-3 h-5 w-5 text-[hsl(var(--primary))]" />
            <h2 className="font-semibold">Sem promessa indevida</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Páginas sem material completo ficam marcadas como acompanhamento, não como curso finalizado.
            </p>
          </div>
          <div className="rounded-2xl border bg-card p-5 shadow-sm">
            <Radar className="mb-3 h-5 w-5 text-[hsl(var(--primary))]" />
            <h2 className="font-semibold">Base para expansão</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              A estrutura já separa cada concurso para receber catálogo, funcionalidades e conteúdo depois.
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {MONITORED_CONTESTS.map((contest, index) => (
            <motion.article
              key={contest.slug}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: index * 0.04 }}
              className="flex min-h-full flex-col rounded-3xl border bg-card p-6 shadow-sm transition-shadow hover:shadow-lg"
            >
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] ${
                    STATUS_STYLES[contest.statusTone] ?? STATUS_STYLES.blue
                  }`}
                >
                  {contest.statusLabel}
                </span>
                <span className="rounded-full bg-muted px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  {contest.priority}
                </span>
              </div>

              <h2 className="text-2xl font-bold font-heading text-foreground">{contest.title}</h2>
              <p className="mt-2 text-sm font-medium text-muted-foreground">{contest.organ}</p>

              <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 text-[hsl(var(--primary))]" />
                <span>{contest.location}</span>
              </div>

              <dl className="mt-5 space-y-3 text-sm">
                <div>
                  <dt className="font-semibold text-foreground">Fase</dt>
                  <dd className="text-muted-foreground">{contest.phase}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-foreground">Área</dt>
                  <dd className="text-muted-foreground">{contest.area}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-foreground">Nível</dt>
                  <dd className="text-muted-foreground">{contest.level}</dd>
                </div>
              </dl>

              <p className="mt-5 flex-1 text-sm leading-6 text-muted-foreground">{contest.summary}</p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <ContestInterestCta
                  contestSlug={contest.slug}
                  contestTitle={contest.title}
                  className="inline-flex items-center justify-center gap-2"
                />
                <Link
                  to={`/concursos/${contest.slug}`}
                  className="inline-flex items-center justify-center rounded-md border px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-muted"
                >
                  Detalhes
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>

              <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                {contest.internalHref ? (
                  <Link
                    to={contest.internalHref}
                    className="inline-flex items-center justify-center rounded-md border px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-muted sm:flex-1"
                  >
                    Página Nortis
                  </Link>
                ) : (
                  <a
                    href={contest.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center rounded-md border px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-muted sm:flex-1"
                  >
                    Fonte oficial
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                )}
              </div>
            </motion.article>
          ))}
        </div>
      </section>
    </div>
  </>
);

export default ConcursosPage;

