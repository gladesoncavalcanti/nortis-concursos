import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle2, ChevronLeft, Clock3, Loader2, Save, Send } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { getMyEssaySubmission, isEssayTextSubmittable, submitEssay, updateEssayDraftText } from '@/api/essaySubmissions.js';

// Rótulos neutros — nenhum deles afirma correção, nota ou revisão.
const STATUS_LABELS = {
  draft: 'Rascunho',
  submitted: 'Redação enviada',
  processing: 'Em processamento',
  corrected: 'Processamento concluído',
  failed: 'Falha no processamento',
};

const EssayEditorPage = () => {
  const { submissionId } = useParams();
  const [submission, setSubmission] = useState(null);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  const [busy, setBusy] = useState(false);
  const [confirmingSend, setConfirmingSend] = useState(false);

  const load = () => {
    setLoading(true);
    getMyEssaySubmission(submissionId).then(({ data, error: loadError }) => {
      setSubmission(data);
      setText(data?.essay_text ?? '');
      setError(loadError);
      setLoading(false);
    });
  };

  useEffect(load, [submissionId]);

  const saveDraft = async () => {
    setBusy(true);
    setNotice(null);
    setError(null);
    const { data, error: saveError } = await updateEssayDraftText({ submissionId, text });
    if (saveError) setError(saveError);
    else { setSubmission(data); setNotice('Rascunho salvo.'); }
    setBusy(false);
  };

  const confirmSend = async () => {
    setBusy(true);
    setError(null);
    const { data, error: sendError } = await submitEssay({ submissionId, text });
    if (sendError) setError(sendError);
    else { setSubmission(data); setConfirmingSend(false); }
    setBusy(false);
  };

  const isDraft = submission?.status === 'draft';
  const canSend = isDraft && isEssayTextSubmittable(text) && !busy;

  return (
    <>
      <Helmet><title>Redação - Tutor Nortis - NORTIS CONCURSOS</title></Helmet>
      <div className="min-h-screen bg-background py-12">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <Link to="/minha-conta/tutor/redacao" className="mb-6 inline-flex items-center text-sm font-semibold text-[hsl(var(--accent))] hover:underline">
            <ChevronLeft className="mr-1 h-4 w-4" />Temas de redação
          </Link>

          {loading ? (
            <Loader2 className="mx-auto mt-16 h-8 w-8 animate-spin" aria-hidden="true" />
          ) : error && !submission ? (
            <p className="mt-8 rounded-2xl bg-card p-6" role="alert">{error}</p>
          ) : (
            <>
              <p className="text-xs font-bold uppercase tracking-[.16em] text-[hsl(var(--accent))]">{submission.essay_themes?.title}</p>
              <h1 className="mt-2 text-2xl font-bold">Sua redação</h1>
              <p className="mt-3 rounded-xl bg-muted p-4 text-sm leading-relaxed text-muted-foreground">{submission.essay_themes?.prompt_text}</p>

              <div className="mt-4 flex items-center gap-2 text-sm font-semibold" role="status">
                {isDraft ? <Clock3 className="h-4 w-4 text-muted-foreground" aria-hidden="true" /> : <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden="true" />}
                {STATUS_LABELS[submission.status] ?? submission.status}
              </div>

              {error && <p className="mt-3 text-sm text-destructive" role="alert">{error}</p>}
              {notice && <p className="mt-3 text-sm text-emerald-600" role="status">{notice}</p>}

              {isDraft ? (
                <>
                  <textarea
                    className="mt-4 min-h-72 w-full rounded-2xl border border-border bg-card p-4 text-sm leading-relaxed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]"
                    value={text}
                    onChange={(event) => setText(event.target.value)}
                    placeholder="Escreva sua redação aqui..."
                    maxLength={20000}
                    aria-label="Texto da redação"
                    disabled={busy}
                  />
                  <p className="mt-1 text-right text-xs text-muted-foreground">{text.length}/20000</p>

                  {!confirmingSend ? (
                    <div className="mt-4 flex flex-wrap gap-3">
                      <Button variant="outline" disabled={busy} onClick={saveDraft}>
                        <Save className="mr-2 h-4 w-4" aria-hidden="true" />Salvar rascunho
                      </Button>
                      <Button disabled={!canSend} onClick={() => setConfirmingSend(true)}>
                        <Send className="mr-2 h-4 w-4" aria-hidden="true" />Enviar redação
                      </Button>
                    </div>
                  ) : (
                    <div className="mt-4 rounded-xl border border-[hsl(var(--accent))]/40 bg-[hsl(var(--accent))]/10 p-4">
                      <p className="text-sm font-semibold">Confirmar envio?</p>
                      <p className="mt-1 text-sm text-muted-foreground">Depois de enviada, esta redação não poderá mais ser editada.</p>
                      <div className="mt-3 flex flex-wrap gap-3">
                        <Button variant="outline" disabled={busy} onClick={() => setConfirmingSend(false)}>Cancelar</Button>
                        <Button disabled={busy} onClick={confirmSend}>{busy ? 'Enviando...' : 'Confirmar envio'}</Button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="mt-4 rounded-2xl border border-border bg-card p-6">
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{submission.essay_text}</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default EssayEditorPage;
