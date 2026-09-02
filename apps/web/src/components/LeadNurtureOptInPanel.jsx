import React, { useEffect, useState } from 'react';
import { Bell, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import {
  getMyLeadNurturePreferences,
  saveMyLeadNurturePreferences,
} from '@/api/leadNurturePreferences.js';

const LeadNurtureOptInPanel = () => {
  const [form, setForm] = useState({ emailOptIn: false, whatsappOptIn: false });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    let mounted = true;
    getMyLeadNurturePreferences().then(({ data }) => {
      if (!mounted) return;
      setForm({
        emailOptIn: Boolean(data?.email_opt_in),
        whatsappOptIn: Boolean(data?.whatsapp_opt_in),
      });
      setLoading(false);
    });
    return () => { mounted = false; };
  }, []);

  const save = async () => {
    setSaving(true);
    setMessage(null);
    const { error } = await saveMyLeadNurturePreferences(form);
    setMessage(error || 'Preferências salvas. A Nortis usará isso apenas para avisos de conteúdo e concursos.');
    setSaving(false);
  };

  return (
    <section className="mt-8 rounded-2xl bg-card p-6" aria-labelledby="lead-nurture-opt-in-title">
      <div className="flex items-start gap-3">
        <Bell className="mt-1 h-6 w-6 text-[hsl(var(--accent))]" aria-hidden="true" />
        <div>
          <p className="text-xs font-bold uppercase tracking-[.16em] text-[hsl(var(--accent))]">Avisos Nortis</p>
          <h2 id="lead-nurture-opt-in-title" className="mt-1 text-xl font-bold">Receber atualizações e materiais</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Escolha se quer receber avisos sobre SEDES-DF, novos simulados, temas e concursos acompanhados.
            O envio real depende de canal autorizado e pode ser desativado depois.
          </p>
        </div>
      </div>

      {loading ? (
        <Loader2 className="mt-5 h-5 w-5 animate-spin" aria-label="Carregando preferências" />
      ) : (
        <div className="mt-5 space-y-4">
          <label className="flex cursor-pointer items-start gap-3 rounded-xl bg-muted p-4 text-sm">
            <input
              type="checkbox"
              checked={form.emailOptIn}
              onChange={(event) => setForm((current) => ({ ...current, emailOptIn: event.target.checked }))}
            />
            <span>
              <strong>E-mail</strong>
              <span className="block text-muted-foreground">Receber avisos de conteúdo, liberação de material e concursos monitorados.</span>
            </span>
          </label>
          <label className="flex cursor-pointer items-start gap-3 rounded-xl bg-muted p-4 text-sm">
            <input
              type="checkbox"
              checked={form.whatsappOptIn}
              onChange={(event) => setForm((current) => ({ ...current, whatsappOptIn: event.target.checked }))}
            />
            <span>
              <strong>WhatsApp</strong>
              <span className="block text-muted-foreground">Usar somente para avisos relevantes, quando esse canal estiver configurado.</span>
            </span>
          </label>
          <Button onClick={save} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Salvar preferências
          </Button>
          {message && <p className="text-sm text-muted-foreground" role="status">{message}</p>}
        </div>
      )}
    </section>
  );
};

export default LeadNurtureOptInPanel;
