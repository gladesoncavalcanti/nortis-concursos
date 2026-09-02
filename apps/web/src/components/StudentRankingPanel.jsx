import React, { useEffect, useState } from 'react';
import { Trophy, Loader2, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import {
  getMyRankingPreference,
  getStudentOptInLeaderboard,
  saveMyRankingPreference,
} from '@/api/studentRanking.js';

const StudentRankingPanel = () => {
  const [rows, setRows] = useState([]);
  const [displayName, setDisplayName] = useState('');
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const load = async () => {
    const { data, error } = await getStudentOptInLeaderboard();
    setRows(data);
    setMessage(error);
    setLoading(false);
  };

  useEffect(() => {
    let mounted = true;
    Promise.all([
      getMyRankingPreference(),
      getStudentOptInLeaderboard(),
    ]).then(([preferenceResult, leaderboardResult]) => {
      if (!mounted) return;
      setDisplayName(preferenceResult.data?.display_name ?? '');
      setEnabled(Boolean(preferenceResult.data?.enabled));
      setRows(leaderboardResult.data);
      setMessage(preferenceResult.error || leaderboardResult.error);
      setLoading(false);
    });
    return () => { mounted = false; };
  }, []);

  const save = async () => {
    setSaving(true);
    setMessage(null);
    const { error } = await saveMyRankingPreference({ enabled, displayName });
    if (error) setMessage(error);
    else {
      setMessage(enabled ? 'Participação no ranking ativada.' : 'Participação no ranking desativada.');
      await load();
    }
    setSaving(false);
  };

  return (
    <section className="mt-8 rounded-2xl bg-card p-6" aria-labelledby="student-ranking-title">
      <div className="flex items-start gap-3">
        <Trophy className="mt-1 h-6 w-6 text-[hsl(var(--accent))]" aria-hidden="true" />
        <div>
          <p className="text-xs font-bold uppercase tracking-[.16em] text-[hsl(var(--accent))]">Ranking opt-in</p>
          <h2 id="student-ranking-title" className="mt-1 text-xl font-bold">Comparativo entre participantes</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Só aparece quem aceitar participar e escolher um nome público. E-mail, telefone e dados sensíveis nunca aparecem.
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 rounded-xl bg-muted p-4 sm:grid-cols-[1fr_auto]">
        <label className="text-sm">
          Nome público
          <input
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2"
            value={displayName}
            maxLength={40}
            placeholder="Ex.: Aluno Nortis"
            onChange={(event) => setDisplayName(event.target.value)}
          />
        </label>
        <label className="flex items-center gap-2 self-end text-sm">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(event) => setEnabled(event.target.checked)}
          />
          Participar
        </label>
        <div className="sm:col-span-2">
          <Button onClick={save} disabled={saving || (enabled && displayName.trim().length < 3)}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Salvar ranking
          </Button>
        </div>
      </div>

      {loading ? (
        <Loader2 className="mt-5 h-5 w-5 animate-spin" aria-label="Carregando ranking" />
      ) : rows.length === 0 ? (
        <div className="mt-5 rounded-xl bg-muted p-4">
          <div className="flex items-center gap-2 font-semibold">
            <ShieldCheck className="h-5 w-5" aria-hidden="true" />
            Ranking ainda protegido
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            O ranking nominal só abre quando houver pelo menos 3 alunos com opt-in ativo.
          </p>
        </div>
      ) : (
        <ol className="mt-5 divide-y divide-border overflow-hidden rounded-xl border border-border">
          {rows.map((row) => (
            <li key={`${row.rank_position}-${row.display_name}`} className={`grid gap-3 p-4 sm:grid-cols-[80px_1fr_auto] ${row.is_current_user ? 'bg-[hsl(var(--accent))]/10' : 'bg-card'}`}>
              <span className="font-bold">#{row.rank_position}</span>
              <span className="font-semibold">{row.display_name}</span>
              <span className="text-sm text-muted-foreground">
                {row.question_accuracy}% · {row.answered} questões · {row.completed_simulations} simulados
              </span>
            </li>
          ))}
        </ol>
      )}

      {message && <p className="mt-4 text-sm text-muted-foreground" role="status">{message}</p>}
    </section>
  );
};

export default StudentRankingPanel;
