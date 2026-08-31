import React, { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import {
  Activity,
  BarChart3,
  BookOpen,
  ChevronLeft,
  ClipboardList,
  FileText,
  GraduationCap,
  Loader2,
  Mail,
  ShieldCheck,
  Target,
  Users,
} from 'lucide-react';
import { getAdminDashboard } from '@/api/adminDashboard.js';

const formatDateTime = (value) => {
  if (!value) return '—';
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
};

const formatNumber = (value) => new Intl.NumberFormat('pt-BR').format(Number(value ?? 0));

const StatCard = ({ icon: Icon, label, value, description }) => (
  <article className="rounded-2xl bg-card p-5 shadow-sm">
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-2 text-3xl font-bold text-foreground">{formatNumber(value)}</p>
      </div>
      <span className="rounded-xl bg-[hsl(var(--accent))]/10 p-3 text-[hsl(var(--accent))]">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
    </div>
    {description && <p className="mt-3 text-xs text-muted-foreground">{description}</p>}
  </article>
);

const Panel = ({ title, description, children }) => (
  <section className="rounded-2xl bg-card p-6 shadow-sm">
    <div className="mb-5">
      <h2 className="text-xl font-bold">{title}</h2>
      {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
    </div>
    {children}
  </section>
);

const EmptyState = ({ children = 'Sem registros para exibir.' }) => (
  <p className="rounded-xl bg-muted p-4 text-sm text-muted-foreground">{children}</p>
);

const AdminDashboardPage = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    getAdminDashboard().then(({ data, error: loadError }) => {
      if (!mounted) return;
      setDashboard(data);
      setError(loadError);
      setLoading(false);
    });

    return () => {
      mounted = false;
    };
  }, []);

  const summary = dashboard?.summary ?? {};
  const totalLeads = useMemo(
    () =>
      Number(summary.free_sample_leads ?? 0) +
      Number(summary.discursive_interest_leads ?? 0) +
      Number(summary.contest_interest_leads ?? 0),
    [summary]
  );

  return (
    <>
      <Helmet>
        <title>Painel interno | Nortis Concursos</title>
      </Helmet>

      <div className="min-h-screen bg-background py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link
            to="/minha-conta"
            className="mb-6 inline-flex items-center text-sm font-semibold text-[hsl(var(--accent))] hover:underline"
          >
            <ChevronLeft className="mr-1 h-4 w-4" aria-hidden="true" />
            Voltar para a Central
          </Link>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.16em] text-[hsl(var(--accent))]">
                Painel interno
              </p>
              <h1 className="mt-2 text-3xl font-bold">Admin Nortis</h1>
              <p className="mt-3 max-w-3xl text-muted-foreground">
                Visão operacional de leads, acessos gratuitos, matrículas e uso da Central. Leitura restrita a contas
                com perfil administrativo.
              </p>
            </div>

            {dashboard?.generated_at && (
              <p className="rounded-full bg-muted px-4 py-2 text-xs text-muted-foreground">
                Atualizado em {formatDateTime(dashboard.generated_at)}
              </p>
            )}
          </div>

          {loading ? (
            <div className="mt-16 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--accent))]" aria-label="Carregando painel" />
            </div>
          ) : error ? (
            <div role="alert" className="mt-8 rounded-2xl bg-card p-6 text-muted-foreground">
              <ShieldCheck className="mb-3 h-7 w-7 text-[hsl(var(--accent))]" aria-hidden="true" />
              <p>{error}</p>
            </div>
          ) : (
            <div className="mt-8 space-y-8">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard icon={Users} label="Alunos cadastrados" value={summary.students} />
                <StatCard icon={GraduationCap} label="Matrículas ativas" value={summary.active_enrollments} />
                <StatCard
                  icon={Target}
                  label="Acessos gratuitos SEDES"
                  value={summary.free_sedes_enrollments}
                  description="Matrículas ativas sem pedido associado."
                />
                <StatCard icon={Mail} label="Leads totais" value={totalLeads} />
                <StatCard icon={ClipboardList} label="Interesses por concursos" value={summary.contest_interest_leads} />
                <StatCard icon={FileText} label="Interesses da Discursiva" value={summary.discursive_interest_leads} />
                <StatCard icon={BookOpen} label="Questões respondidas" value={summary.question_attempts} />
                <StatCard icon={Activity} label="Minutos estudados" value={summary.study_minutes} />
              </div>

              <div className="grid gap-8 lg:grid-cols-2">
                <Panel title="Demanda por concurso" description="Interesses autenticados no Radar Nortis.">
                  {dashboard.contest_interests_by_slug?.length ? (
                    <div className="space-y-3">
                      {dashboard.contest_interests_by_slug.map((item) => (
                        <div key={item.contest_slug} className="flex items-center justify-between rounded-xl bg-muted p-4">
                          <div>
                            <p className="font-semibold">{item.contest_slug}</p>
                            <p className="text-xs text-muted-foreground">
                              Última confirmação: {formatDateTime(item.last_confirmed_at)}
                            </p>
                          </div>
                          <span className="text-2xl font-bold">{formatNumber(item.total)}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyState />
                  )}
                </Panel>

                <Panel title="Interesse na Sprint Discursiva" description="Agrupamento por categoria, especialidade e pacote.">
                  {dashboard.discursive_interest_by_package?.length ? (
                    <div className="space-y-3">
                      {dashboard.discursive_interest_by_package.map((item) => (
                        <div
                          key={`${item.category}-${item.specialty}-${item.package_interest}`}
                          className="rounded-xl bg-muted p-4"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <p className="font-semibold">{item.package_interest}</p>
                            <span className="text-xl font-bold">{formatNumber(item.total)}</span>
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {item.category} · {item.specialty} · último em {formatDateTime(item.latest_at)}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyState />
                  )}
                </Panel>
              </div>

              <Panel title="Matrículas por produto" description="Distribuição atual de acesso por produto.">
                {dashboard.enrollments_by_product?.length ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-border text-sm">
                      <thead>
                        <tr className="text-left text-muted-foreground">
                          <th className="py-3 pr-4 font-semibold">Produto</th>
                          <th className="px-4 py-3 font-semibold">Ativas</th>
                          <th className="px-4 py-3 font-semibold">Revogadas</th>
                          <th className="px-4 py-3 font-semibold">Expiradas</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {dashboard.enrollments_by_product.map((item) => (
                          <tr key={item.product_slug}>
                            <td className="py-3 pr-4">
                              <p className="font-medium">{item.product_title}</p>
                              <p className="text-xs text-muted-foreground">{item.product_slug}</p>
                            </td>
                            <td className="px-4 py-3">{formatNumber(item.active_total)}</td>
                            <td className="px-4 py-3">{formatNumber(item.revoked_total)}</td>
                            <td className="px-4 py-3">{formatNumber(item.expired_total)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <EmptyState />
                )}
              </Panel>

              <div className="grid gap-8 lg:grid-cols-3">
                <Panel title="Amostras recentes">
                  {dashboard.recent_free_sample_leads?.length ? (
                    <ol className="space-y-3">
                      {dashboard.recent_free_sample_leads.map((lead) => (
                        <li key={lead.id} className="rounded-xl bg-muted p-4">
                          <p className="font-semibold">{lead.name}</p>
                          <p className="text-sm text-muted-foreground">{lead.email}</p>
                          <p className="mt-1 text-xs text-muted-foreground">{formatDateTime(lead.created_at)}</p>
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <EmptyState />
                  )}
                </Panel>

                <Panel title="Discursiva recente">
                  {dashboard.recent_discursive_interest_leads?.length ? (
                    <ol className="space-y-3">
                      {dashboard.recent_discursive_interest_leads.map((lead) => (
                        <li key={lead.id} className="rounded-xl bg-muted p-4">
                          <p className="font-semibold">{lead.name}</p>
                          <p className="text-sm text-muted-foreground">{lead.email}</p>
                          <p className="text-sm text-muted-foreground">{lead.whatsapp}</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {lead.category} · {lead.specialty} · {lead.package_interest}
                          </p>
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <EmptyState />
                  )}
                </Panel>

                <Panel title="Radar recente">
                  {dashboard.recent_contest_interest_leads?.length ? (
                    <ol className="space-y-3">
                      {dashboard.recent_contest_interest_leads.map((lead) => (
                        <li key={lead.id} className="rounded-xl bg-muted p-4">
                          <p className="font-semibold">{lead.contest_slug}</p>
                          <p className="text-sm text-muted-foreground">{lead.email}</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            Confirmado em {formatDateTime(lead.last_confirmed_at)}
                          </p>
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <EmptyState />
                  )}
                </Panel>
              </div>

              <div className="grid gap-8 lg:grid-cols-2">
                <Panel title="Especialidades escolhidas" description="Distribuição declarada pelos alunos na Central.">
                  {dashboard.study_profiles_by_target?.length ? (
                    <div className="space-y-3">
                      {dashboard.study_profiles_by_target.map((item) => (
                        <div key={item.target_specialty} className="flex items-center justify-between rounded-xl bg-muted p-4">
                          <p className="font-semibold">{item.target_specialty}</p>
                          <span className="text-xl font-bold">{formatNumber(item.total)}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyState />
                  )}
                </Panel>

                <Panel title="Uso nos últimos 7 dias" description="Sinais operacionais, não avaliação pedagógica individual.">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <StatCard
                      icon={BookOpen}
                      label="Questões"
                      value={dashboard.recent_activity?.question_attempts_last_7_days}
                    />
                    <StatCard
                      icon={BarChart3}
                      label="Simulados concluídos"
                      value={dashboard.recent_activity?.completed_simulations_last_7_days}
                    />
                    <StatCard
                      icon={Activity}
                      label="Minutos estudados"
                      value={dashboard.recent_activity?.study_minutes_last_7_days}
                    />
                    <StatCard
                      icon={FileText}
                      label="Redações/rascunhos"
                      value={dashboard.recent_activity?.essay_submissions_last_7_days}
                    />
                  </div>
                </Panel>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminDashboardPage;
