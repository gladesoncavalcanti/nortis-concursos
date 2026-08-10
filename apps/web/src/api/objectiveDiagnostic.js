import { supabase } from '@/lib/supabase';
import { getStudyProfile } from '@/api/studyProfile.js';
import { getTopicAssessments } from '@/api/topicAssessments.js';
import { buildObjectiveDiagnostic, rankObjectiveWeaknesses } from '@/api/objectiveDiagnosticModel.js';

const QUESTION_SELECT = `
  id, statement, source_reference, authorship, sort_order, syllabus_node_id,
  syllabus_nodes(id, title, parent_id, node_type),
  question_options(id, label, option_text, sort_order)
`;

function sortOptions(questions) {
  return questions.map((question) => ({
    ...question,
    question_options: [...(question.question_options ?? [])].sort(
      (a, b) => a.sort_order - b.sort_order || a.label.localeCompare(b.label)
    ),
  }));
}

export async function getObjectiveDiagnostic() {
  const profileResult = await getStudyProfile();
  const profile = profileResult.data;
  if (profileResult.error) return { data: null, error: profileResult.error };
  if (!profile?.target_specialty_id) {
    return { data: { needsSpecialty: true }, error: null };
  }

  const [questionResult, resultResponse, assessmentResult, specialtyResult] = await Promise.all([
    supabase.from('questions').select(QUESTION_SELECT)
      .eq('diagnostic_eligible', true).eq('active', true).order('sort_order'),
    supabase.rpc('get_my_diagnostic_results'),
    getTopicAssessments(),
    supabase.from('syllabus_nodes').select('id,title,slug')
      .eq('id', profile.target_specialty_id).maybeSingle(),
  ]);

  if (questionResult.error || resultResponse.error || assessmentResult.error || specialtyResult.error) {
    return { data: null, error: 'Não foi possível carregar o diagnóstico agora.' };
  }

  const questions = sortOptions((questionResult.data ?? []).filter(
    (question) => question.syllabus_nodes?.parent_id === profile.target_specialty_id
  ));
  const questionIds = new Set(questions.map((question) => question.id));
  const results = (resultResponse.data ?? []).filter((result) => questionIds.has(result.question_id));

  return {
    data: {
      needsSpecialty: false,
      specialty: specialtyResult.data,
      questions,
      results,
      selfAssessments: assessmentResult.data,
      summary: buildObjectiveDiagnostic({
        questions,
        results,
        selfAssessments: assessmentResult.data,
      }),
    },
    error: null,
  };
}

export async function submitDiagnosticAnswer(questionId, selectedOptionId) {
  const { data, error } = await supabase.rpc('submit_diagnostic_answer', {
    p_question_id: questionId,
    p_selected_option_id: selectedOptionId,
  });
  if (error || !data?.[0]) {
    return { data: null, error: 'Não foi possível registrar esta resposta agora.' };
  }
  return { data: data[0], error: null };
}

export async function getWeakestObjectiveSubjects(subjectIds, limit = 3) {
  if (!subjectIds.length) return { data: [], error: null };
  const { data, error } = await supabase.from('question_attempts')
    .select('question_id,is_correct,answered_at,questions(syllabus_node_id,syllabus_nodes(id,title,node_type))')
    .eq('attempt_context', 'diagnostic')
    .order('answered_at', { ascending: false });
  if (error) return { data: [], error: 'Não foi possível carregar o desempenho objetivo.' };
  return { data: rankObjectiveWeaknesses(data ?? [], subjectIds, limit), error: null };
}
