import { supabase } from '@/lib/supabase';
import { isEssayTextSubmittable } from '@/api/essaySubmissionValidation.js';

const SUBMISSION_FIELDS = 'id,user_id,theme_id,essay_text,status,created_at,updated_at,submitted_at,essay_themes(id,title,prompt_text,source_reference)';

export { isEssayTextSubmittable };

/**
 * Cria um rascunho de redação para o tema informado. Não valida texto
 * vazio aqui de propósito — o rascunho pode nascer vazio e ser
 * preenchido depois via updateEssayDraftText.
 */
export async function createEssayDraft({ themeId }) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: 'Sessão não encontrada.' };

  const { data, error } = await supabase
    .from('essay_submissions')
    .insert({ user_id: user.id, theme_id: themeId })
    .select(SUBMISSION_FIELDS)
    .single();

  return { data: data ?? null, error: error ? 'Não foi possível iniciar a redação agora.' : null };
}

/**
 * Get-or-create: devolve o rascunho já aberto do aluno para o tema, ou
 * cria um novo se não existir nenhum. Regra de negócio (migration
 * 20260813150000_add_essay_submissions_one_draft_per_theme.sql): no
 * máximo 1 draft aberto por usuário+tema — múltiplas TENTATIVAS
 * históricas (submitted em diante) continuam ilimitadas.
 *
 * A garantia final de unicidade é do banco (índice único parcial
 * essay_submissions_one_open_draft_per_theme_uidx), não desta função —
 * o SELECT abaixo é só o caminho feliz para evitar uma escrita
 * desnecessária. Em caso de corrida real (clique duplo, duas abas,
 * requisições concorrentes chegando entre o SELECT e o INSERT), o
 * banco rejeita a segunda inserção com 23505 (unique_violation); esse
 * erro é tratado aqui como "o draft já existe" — busca de novo e
 * devolve o vencedor da corrida, nunca propaga o erro ao aluno.
 */
export async function getOrCreateEssayDraft({ themeId }) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: 'Sessão não encontrada.' };

  const findOpenDraft = () => supabase
    .from('essay_submissions')
    .select(SUBMISSION_FIELDS)
    .eq('user_id', user.id)
    .eq('theme_id', themeId)
    .eq('status', 'draft')
    .maybeSingle();

  const { data: existing, error: selectError } = await findOpenDraft();
  if (selectError) return { data: null, error: 'Não foi possível iniciar a redação agora.' };
  if (existing) return { data: existing, error: null };

  const { data: created, error: insertError } = await supabase
    .from('essay_submissions')
    .insert({ user_id: user.id, theme_id: themeId })
    .select(SUBMISSION_FIELDS)
    .single();

  if (!insertError) return { data: created, error: null };

  // Corrida perdida: outra requisição concorrente já criou o draft
  // entre o SELECT e o INSERT acima — o índice único parcial rejeitou
  // esta segunda inserção. O draft concorrente é o resultado correto.
  if (insertError.code === '23505') {
    const { data: raceWinner, error: raceSelectError } = await findOpenDraft();
    if (raceSelectError || !raceWinner) {
      return { data: null, error: 'Não foi possível iniciar a redação agora.' };
    }
    return { data: raceWinner, error: null };
  }

  return { data: null, error: 'Não foi possível iniciar a redação agora.' };
}

/**
 * Atualiza o texto de uma redação ainda em rascunho. A RLS
 * (essay_submissions_draft_owner_update) já impede a atualização quando
 * o status não é mais 'draft' — o UPDATE simplesmente não afeta nenhuma
 * linha nesse caso, e reportamos isso como erro para a tela reagir.
 */
export async function updateEssayDraftText({ submissionId, text }) {
  const { data, error } = await supabase
    .from('essay_submissions')
    .update({ essay_text: text, updated_at: new Date().toISOString() })
    .eq('id', submissionId)
    .select(SUBMISSION_FIELDS)
    .maybeSingle();

  if (error) return { data: null, error: 'Não foi possível salvar o rascunho agora.' };
  if (!data) return { data: null, error: 'Esta redação não pode mais ser editada.' };
  return { data, error: null };
}

/**
 * Envia definitivamente a redação (draft -> submitted). Nunca afirma
 * correção, nota ou revisão — só muda o estado técnico. Rejeita texto
 * vazio antes de tentar o UPDATE (o banco também rejeitaria via
 * essay_submissions_non_empty_when_active).
 */
export async function submitEssay({ submissionId, text }) {
  if (!isEssayTextSubmittable(text)) {
    return { data: null, error: 'Escreva sua redação antes de enviar.' };
  }

  const { data, error } = await supabase
    .from('essay_submissions')
    .update({
      essay_text: text,
      status: 'submitted',
      submitted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', submissionId)
    .select(SUBMISSION_FIELDS)
    .maybeSingle();

  if (error) return { data: null, error: 'Não foi possível enviar a redação agora.' };
  if (!data) return { data: null, error: 'Esta redação não pode mais ser enviada.' };
  return { data, error: null };
}

/**
 * Consulta uma submissão específica do próprio aluno (inclui o status
 * técnico atual). A RLS restringe a leitura às submissões do próprio
 * usuário — um id de outra pessoa simplesmente não retorna linha.
 */
export async function getMyEssaySubmission(submissionId) {
  const { data, error } = await supabase
    .from('essay_submissions')
    .select(SUBMISSION_FIELDS)
    .eq('id', submissionId)
    .maybeSingle();

  if (error) return { data: null, error: 'Não foi possível carregar sua redação agora.' };
  if (!data) return { data: null, error: 'Redação não encontrada.' };
  return { data, error: null };
}
