import { supabase } from '@/lib/supabase';

/**
 * Solicita uma signed URL de curta duração (300s) para o PDF de um
 * enrollment ativo, via Edge Function `get-download-url`.
 *
 * `supabase.functions.invoke` já anexa automaticamente o Authorization
 * (JWT) e o apikey da sessão atual — nenhum token é lido, copiado ou
 * manuseado manualmente aqui. Sem sessão, a própria Edge Function
 * responde 401 e o erro correspondente é retornado normalmente.
 *
 * A resposta de sucesso é sempre `{ url, expiresIn }` — nunca
 * `pdf_path`, bucket ou qualquer detalhe de Storage; este arquivo só
 * repassa o que a function já filtrou. A signed URL não é logada.
 *
 * @param {object} params
 * @param {string} params.enrollmentId
 * @returns {Promise<{ url: string|null, expiresIn: number|null, error: string|null }>}
 */
export async function requestDownloadUrl({ enrollmentId }) {
  if (!enrollmentId) {
    return { url: null, expiresIn: null, error: 'Acesso inválido.' };
  }

  const { data, error } = await supabase.functions.invoke('get-download-url', {
    body: { enrollment_id: enrollmentId },
  });

  if (error) {
    // Em erro HTTP (4xx/5xx), a Edge Function já devolve uma mensagem
    // segura em `{ error }` (nunca stack/pdf_path/secrets) — tentamos
    // repassá-la para a UI; se o corpo não for um JSON legível, caímos
    // numa mensagem genérica.
    const specificMessage = await error.context
      ?.clone?.()
      .json()
      .then((body) => (typeof body?.error === 'string' ? body.error : null))
      .catch(() => null);

    return {
      url: null,
      expiresIn: null,
      error: specificMessage || 'Não foi possível gerar o link agora. Tente novamente.',
    };
  }

  if (!data?.url) {
    return { url: null, expiresIn: null, error: 'Não foi possível gerar o link agora. Tente novamente.' };
  }

  return { url: data.url, expiresIn: data.expiresIn ?? null, error: null };
}
