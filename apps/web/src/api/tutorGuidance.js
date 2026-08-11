import { buildNextBestAction } from './nextBestAction.js';
import { buildWeeklyAdherence } from './weeklyAdherence.js';

const diagnosticGuidance = {
  kind: 'diagnostic',
  title: 'Comece por uma evidência objetiva',
  message: 'Responda ao diagnóstico da sua especialidade para descobrir pontos fortes e conteúdos que precisam de reforço.',
  cta: 'Iniciar diagnóstico',
  route: '/minha-conta/diagnostico',
};

function buildPerformanceGuidance(progress, adherence) {
  if (!progress || progress.answered === 0) return diagnosticGuidance;

  const simulationLabel = progress.completedSimulations === 1 ? 'simulado concluído' : 'simulados concluídos';
  const weekEvidence = adherence.plannedTasks > 0
    ? ` Nesta semana, você concluiu ${adherence.completedTasks} de ${adherence.plannedTasks} tarefas e ${adherence.adherencePercent}% dos minutos planejados.`
    : ' Sua semana ainda não possui tarefas planejadas.';

  return {
    kind: 'performance',
    title: 'Seu desempenho objetivo agora',
    message: `Você respondeu ${progress.answered} questões, com ${progress.accuracy}% de acerto, e possui ${progress.completedSimulations} ${simulationLabel}.${weekEvidence}`,
    cta: 'Ver progresso detalhado',
    route: '/minha-conta/progresso',
  };
}

function buildReviewGuidance(progress, adherence) {
  const pendingReviewCount = progress?.review?.length ?? 0;
  if (pendingReviewCount > 0) {
    return {
      kind: 'review',
      title: 'Revise os erros ainda pendentes',
      message: `Você tem ${pendingReviewCount} ${pendingReviewCount === 1 ? 'questão pendente' : 'questões pendentes'}. Refaça primeiro esses erros e confirme a aprendizagem com uma nova tentativa.`,
      cta: 'Iniciar revisão de erros',
      route: '/minha-conta/progresso',
    };
  }

  if (adherence.overdueTasks > 0) {
    return {
      kind: 'replan',
      title: 'Reencaixe as tarefas atrasadas',
      message: `Sua fila de erros está vazia, mas há ${adherence.overdueTasks} ${adherence.overdueTasks === 1 ? 'tarefa atrasada' : 'tarefas atrasadas'}. Reorganize o plano antes de adicionar nova carga.`,
      cta: 'Replanejar semana',
      route: '/minha-conta/plano',
    };
  }

  if (!progress || progress.answered === 0) return diagnosticGuidance;

  return {
    kind: 'memory',
    title: 'Mantenha a revisão ativa',
    message: 'Sua fila de erros está vazia. Revise os flashcards programados ou faça novas questões para gerar evidências recentes.',
    cta: 'Revisar flashcards',
    route: '/minha-conta/flashcards',
  };
}

function buildWeekGuidance(adherence) {
  if (adherence.plannedTasks === 0 && adherence.overdueTasks === 0) {
    return {
      kind: 'plan',
      title: adherence.guidance.title,
      message: adherence.guidance.description,
      cta: 'Montar plano semanal',
      route: '/minha-conta/plano',
    };
  }

  const remainingSummary = adherence.remainingMinutes > 0
    ? `ainda possui ${adherence.remainingMinutes} minutos planejados`
    : 'não possui minutos pendentes nesta semana';

  return {
    kind: adherence.overdueTasks > 0 ? 'replan' : 'week',
    title: adherence.guidance.title,
    message: `${adherence.guidance.description} Você concluiu ${adherence.completedTasks} de ${adherence.plannedTasks} tarefas e ${remainingSummary}.`,
    cta: adherence.overdueTasks > 0 ? 'Replanejar semana' : 'Abrir plano semanal',
    route: '/minha-conta/plano',
  };
}

export function buildTutorGuidance({ progress, planItems = [], intent = 'next', today = new Date() }) {
  const adherence = buildWeeklyAdherence({ items: planItems, today });

  if (intent === 'performance') return buildPerformanceGuidance(progress, adherence);
  if (intent === 'review') return buildReviewGuidance(progress, adherence);
  if (intent === 'week') return buildWeekGuidance(adherence);

  const action = buildNextBestAction({ progress, planItems, today });
  return {
    kind: action.kind,
    title: action.title,
    message: action.description,
    cta: action.cta,
    route: action.route,
  };
}
