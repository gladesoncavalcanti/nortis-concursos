import React from 'react';
import { Helmet } from 'react-helmet';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ExternalLink, MapPin, ShieldCheck } from 'lucide-react';
import { getMonitoredContestBySlug } from '@/config/monitoredContests.js';

const ConcursoDetailPage = () => {
  const { slug } = useParams();
  const contest = getMonitoredContestBySlug(slug);

  if (!contest) {
    return (
      <div className="min-h-[60vh] bg-background px-4 py-16">
        <div className="mx-auto max-w-3xl rounded-3xl border bg-card p-8 text-center shadow-sm">
          <h1 className="text-3xl font-bold font-heading">Concurso não encontrado</h1>
          <p className="mt-3 text-muted-foreground">
            Esta página ainda não existe no radar da Nortis.
          </p>
          <Link
            to="/concursos"
            className="mt-6 inline-flex items-center justify-center rounded-md bg-[hsl(var(--primary))] px-5 py-3 text-sm font-semibold text-white"
          >
            Voltar para concursos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{contest.title} em acompanhamento | Nortis Concursos</title>
        <meta
          name="description"
          content={`${contest.title}: página em acompanhamento da Nortis com dados confirmados por fonte oficial e próximos passos editoriais.`}
        />
        <link rel="canonical" href={`https://www.nortisconcursos.com.br/concursos/${contest.slug}`} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={`${contest.title} em acompanhamento | Nortis Concursos`} />
        <meta
          property="og:description"
          content={`${contest.title}: página em acompanhamento da Nortis com dados confirmados por fonte oficial e próximos passos editoriais.`}
        />
        <meta property="og:url" content={`https://www.nortisconcursos.com.br/concursos/${contest.slug}`} />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      <div className="bg-background text-foreground">
        <section className="bg-[hsl(var(--primary))] text-white">
          <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 md:py-16">
            <Link
              to="/concursos"
              className="inline-flex items-center text-sm font-semibold text-white/75 transition-colors hover:text-[#f1c85b]"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao radar
            </Link>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-[#d3a52f]/50 bg-[#d3a52f]/15 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-[#f1c85b]">
                {contest.statusLabel}
              </span>
              <span className="rounded-full border border-white/15 bg-white/8 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-white/75">
                {contest.phase}
              </span>
            </div>

            <h1 className="mt-5 text-4xl font-bold tracking-tight font-heading sm:text-5xl">
              {contest.title}
            </h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-white/78">{contest.summary}</p>
          </div>
        </section>

        <section className="mx-auto grid max-w-5xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 md:py-16">
          <article className="rounded-3xl border bg-card p-6 shadow-sm md:p-8">
            <h2 className="text-2xl font-bold font-heading">Informações confirmadas</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Esta página registra apenas dados já confirmados em fonte oficial. O detalhamento
              completo da preparação Nortis só será adicionado quando houver base suficiente para não
              inventar cronograma, vagas, conteúdo programático ou promessa de resultado.
            </p>

            <ul className="mt-6 space-y-4">
              {contest.confirmedFacts.map((fact) => (
                <li key={fact} className="flex gap-3 text-sm leading-6 text-muted-foreground">
                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[hsl(var(--primary))]" />
                  <span>{fact}</span>
                </li>
              ))}
            </ul>
          </article>

          <aside className="space-y-6">
            <div className="rounded-3xl border bg-card p-6 shadow-sm">
              <h2 className="text-lg font-bold font-heading">Resumo operacional</h2>
              <dl className="mt-5 space-y-4 text-sm">
                <div>
                  <dt className="font-semibold">Órgão</dt>
                  <dd className="mt-1 text-muted-foreground">{contest.organ}</dd>
                </div>
                <div>
                  <dt className="font-semibold">Local</dt>
                  <dd className="mt-1 flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {contest.location}
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold">Área</dt>
                  <dd className="mt-1 text-muted-foreground">{contest.area}</dd>
                </div>
                <div>
                  <dt className="font-semibold">Nível</dt>
                  <dd className="mt-1 text-muted-foreground">{contest.level}</dd>
                </div>
              </dl>
            </div>

            <div className="rounded-3xl border bg-card p-6 shadow-sm">
              <h2 className="text-lg font-bold font-heading">Plano Nortis</h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{contest.nortisPlan}</p>
            </div>

            <div className="rounded-3xl border bg-muted/40 p-6">
              <h2 className="text-lg font-bold font-heading">Fonte</h2>
              <p className="mt-2 text-sm text-muted-foreground">{contest.sourceLabel}</p>
              {contest.internalHref ? (
                <Link
                  to={contest.internalHref}
                  className="mt-4 inline-flex items-center rounded-md bg-[hsl(var(--primary))] px-4 py-2.5 text-sm font-semibold text-white"
                >
                  Abrir página Nortis
                </Link>
              ) : (
                <a
                  href={contest.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center rounded-md bg-[hsl(var(--primary))] px-4 py-2.5 text-sm font-semibold text-white"
                >
                  Abrir fonte oficial
                  <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              )}
            </div>
          </aside>
        </section>
      </div>
    </>
  );
};

export default ConcursoDetailPage;

