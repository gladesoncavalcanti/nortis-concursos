import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, ChevronLeft, ChevronRight, RotateCcw, X } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { getStudyProfile, profileToAnswers, saveStudyProfile } from '@/api/studyProfile.js';
import { getMySyllabus } from '@/api/syllabus.js';
import { getSpecialtyOptions } from '@/api/specialtySelection.js';

// Diagnóstico inicial do aluno — "Sprint Funcional 1.2".
//
// O perfil é persistido no Supabase com RLS por usuário e sincroniza entre
// dispositivos. O localStorage permanece apenas como fallback de migração
// para respostas salvas antes da persistência remota.
//
// A recomendação final é uma regra editorial simples (texto fixo por
// combinação de respostas), nunca uma promessa de resultado, e só
// linka para rotas que já existem hoje (/apostilas,
// /materiais-gratuitos, /sedes-df-2026) — nunca uma página inventada.

const STORAGE_KEY_PREFIX = 'nortis_quiz_';

const QUESTIONS = [
  {
    id: 'concurso',
    question: 'Qual concurso você está estudando?',
    options: [
      { value: 'sedes-df', label: 'SEDES-DF 2026' },
      { value: 'outro', label: 'Outro concurso' },
    ],
  },
  {
    id: 'cargo',
    question: 'Qual cargo ou nível você pretende?',
    options: [
      { value: 'tecnico', label: 'Nível técnico / médio' },
      { value: 'superior', label: 'Nível superior / especialista' },
      { value: 'indeciso', label: 'Ainda não decidi' },
    ],
  },
  {
    id: 'especialidade',
    question: 'Qual é sua especialidade?',
    options: [],
  },
  {
    id: 'preparo',
    question: 'Como está sua preparação hoje?',
    options: [
      { value: 'comecando', label: 'Estou começando agora' },
      { value: 'andamento', label: 'Já estou estudando' },
    ],
  },
  {
    id: 'tempo',
    question: 'Quanto tempo por dia você consegue estudar?',
    options: [
      { value: 'ate1h', label: 'Até 1 hora' },
      { value: '1a3h', label: 'De 1 a 3 horas' },
      { value: 'mais3h', label: 'Mais de 3 horas' },
    ],
  },
  {
    id: 'dificuldade',
    question: 'Qual sua maior dificuldade agora?',
    options: [
      { value: 'legislacao', label: 'Legislação' },
      { value: 'redacao', label: 'Redação' },
      { value: 'organizacao', label: 'Organização dos estudos' },
      { value: 'questoes', label: 'Questões' },
      { value: 'indeciso', label: 'Ainda não sei' },
    ],
  },
];

// Só o texto — nunca "você vai passar", nunca "plano personalizado por
// IA". Sempre "sugestão de ponto de partida".
const DIFFICULTY_ADVICE = {
  legislacao:
    'vale revisar o conteúdo da sua apostila ponto a ponto antes de partir para questões, sem pular etapas.',
  redacao:
    'redação costuma render mais quando praticada aos poucos — comece revisando os materiais disponíveis antes de partir para a produção de texto.',
  organizacao:
    'organização é a base de tudo: um bom próximo passo é definir um cronograma simples antes de acelerar o ritmo.',
  questoes:
    'praticar questões funciona melhor combinado com revisão teórica — evite pular direto para questões sem revisar o conteúdo antes.',
  indeciso: 'o primeiro passo é conhecer bem o edital e a estrutura do concurso antes de decidir onde focar.',
};

// Só rotas que já existem no app hoje — nunca uma página inventada.
const DIFFICULTY_CTA = {
  legislacao: { label: 'Ver apostilas', to: '/apostilas' },
  redacao: { label: 'Ver materiais gratuitos', to: '/materiais-gratuitos' },
  organizacao: null,
  questoes: { label: 'Ver apostilas', to: '/apostilas' },
  indeciso: { label: 'Ver apostilas', to: '/apostilas' },
};

const PREPARO_PREFIX = {
  comecando: 'Como você está começando agora, ',
  andamento: 'Já que você está em ritmo de estudos, ',
};

function buildRecommendation(answers) {
  const prefix = PREPARO_PREFIX[answers.preparo] || '';
  const advice = DIFFICULTY_ADVICE[answers.dificuldade] || DIFFICULTY_ADVICE.indeciso;
  let cta = DIFFICULTY_CTA[answers.dificuldade] ?? null;

  // Quando o aluno já disse que o concurso é o SEDES-DF, o hub
  // dedicado (/sedes-df-2026) é um destino mais específico e também já
  // existente — substitui o CTA genérico de /apostilas quando houver um.
  if (cta && answers.concurso === 'sedes-df') {
    cta = { label: 'Ver o hub do SEDES-DF 2026', to: '/sedes-df-2026' };
  }

  return {
    text: `Com base nas suas respostas, uma sugestão de ponto de partida é: ${prefix}${advice}`,
    cta,
  };
}

function loadSavedAnswers(userId) {
  if (!userId) return null;

  try {
    const raw = window.localStorage.getItem(`${STORAGE_KEY_PREFIX}${userId}`);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || !parsed.answers) return null;

    return parsed;
  } catch (_error) {
    // localStorage indisponível ou dado corrompido — degrada
    // silenciosamente para "sem diagnóstico salvo".
    return null;
  }
}

function saveAnswers(userId, answers) {
  if (!userId) return;

  try {
    window.localStorage.setItem(
      `${STORAGE_KEY_PREFIX}${userId}`,
      JSON.stringify({ answers, completedAt: new Date().toISOString() })
    );
  } catch (_error) {
    // Ex.: modo privado sem acesso a localStorage. Sem crash — o
    // convite volta a aparecer na próxima visita, o que é aceitável
    // para este MVP.
  }
}

const PersonalizationQuiz = ({ userId }) => {
  const [saved, setSaved] = useState(null);
  // 'invite' | 'wizard' | 'summary'
  const [mode, setMode] = useState('invite');
  const [stepIndex, setStepIndex] = useState(0);
  const [draft, setDraft] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [syllabusNodes, setSyllabusNodes] = useState([]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const [{ data }, syllabus] = await Promise.all([getStudyProfile(), getMySyllabus()]);
      if (!mounted) return;
      setSyllabusNodes(syllabus.data);
      const remoteAnswers = profileToAnswers(data);
      const localAnswers = loadSavedAnswers(userId);
      if (!remoteAnswers && localAnswers?.answers) await saveStudyProfile(localAnswers.answers);
      const existing = remoteAnswers ? { answers: remoteAnswers, completedAt: data.completed_at } : localAnswers;
      setSaved(existing);
      setMode(existing ? 'summary' : 'invite');
    };
    load();
    return () => { mounted = false; };
  }, [userId]);

  const startWizard = () => {
    setDraft(saved?.answers ?? {});
    setStepIndex(0);
    setMode('wizard');
  };

  const closeWizard = () => {
    // Fechar nunca grava nada — só volta para o que já existia antes
    // (convite ou o resumo já salvo).
    setMode(saved ? 'summary' : 'invite');
  };

  const selectedRole = draft.cargo ?? saved?.answers?.cargo;
  const specialtyOptions = getSpecialtyOptions(syllabusNodes, selectedRole);
  const selectedExam = draft.concurso ?? saved?.answers?.concurso;
  const questions = QUESTIONS
    .filter((question) => question.id !== 'especialidade' || selectedExam === 'sedes-df')
    .map((question) =>
      question.id === 'especialidade' ? { ...question, options: specialtyOptions } : question
    );
  const currentQuestion = questions[stepIndex];
  const currentAnswer = currentQuestion ? draft[currentQuestion.id] : undefined;

  const handleSelect = (value) => {
    setDraft((prev) => ({
      ...prev,
      [currentQuestion.id]: value,
      ...(currentQuestion.id === 'cargo' ? { especialidade: undefined } : {}),
      ...(currentQuestion.id === 'concurso' && value !== 'sedes-df' ? { especialidade: undefined } : {}),
    }));
  };

  const handleContinue = async () => {
    if (!currentAnswer) return;

    if (stepIndex < questions.length - 1) {
      setStepIndex((s) => s + 1);
      return;
    }

    setIsSaving(true);
    setSaveError(null);
    const { error } = await saveStudyProfile(draft);
    setIsSaving(false);
    if (error) {
      setSaveError(error);
      return;
    }
    saveAnswers(userId, draft);
    setSaved({ answers: draft });
    setMode('summary');
  };

  const handleBack = () => {
    if (stepIndex > 0) setStepIndex((s) => s - 1);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="bg-card rounded-2xl p-6 shadow-sm">
        {mode === 'invite' && (
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-[hsl(var(--accent))]/15 flex items-center justify-center shrink-0">
              <Sparkles className="w-6 h-6 text-[hsl(var(--accent))]" aria-hidden="true" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-card-foreground mb-1">Personalize sua preparação</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Responda 5 perguntas rápidas (cerca de 2 minutos) e receba uma sugestão de por onde começar.
              </p>
              <Button
                onClick={startWizard}
                className="bg-[hsl(var(--primary))] text-white hover:bg-[hsl(var(--primary))]/90"
              >
                Começar diagnóstico
              </Button>
            </div>
          </div>
        )}

        {mode === 'wizard' && currentQuestion && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Pergunta {stepIndex + 1} de {questions.length}
              </span>
              <button
                type="button"
                onClick={closeWizard}
                className="text-muted-foreground hover:text-card-foreground transition-colors"
                aria-label="Fechar diagnóstico"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            <div className="h-1.5 w-full bg-muted rounded-full mb-6 overflow-hidden">
              <div
                className="h-full bg-[hsl(var(--accent))] transition-all"
                style={{ width: `${((stepIndex + 1) / questions.length) * 100}%` }}
              />
            </div>

            <h2 className="text-lg font-bold text-card-foreground mb-4">{currentQuestion.question}</h2>

            <div className="grid gap-2 mb-6">
              {currentQuestion.options.map((opt) => {
                const selected = currentAnswer === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleSelect(opt.value)}
                    aria-pressed={selected}
                    className={`text-left px-4 py-3 rounded-xl border transition-colors ${
                      selected
                        ? 'border-[hsl(var(--accent))] bg-[hsl(var(--accent))]/10 text-card-foreground font-semibold'
                        : 'border-border text-card-foreground/80 hover:border-[hsl(var(--accent))]/50'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between">
              <Button type="button" variant="outline" onClick={handleBack} disabled={stepIndex === 0}>
                <ChevronLeft className="w-4 h-4 mr-1" aria-hidden="true" />
                Voltar
              </Button>
              <Button
                type="button"
                onClick={handleContinue}
                disabled={!currentAnswer || isSaving}
                className="bg-[hsl(var(--primary))] text-white hover:bg-[hsl(var(--primary))]/90"
              >
                {isSaving ? 'Salvando...' : stepIndex < questions.length - 1 ? 'Continuar' : 'Concluir'}
                <ChevronRight className="w-4 h-4 ml-1" aria-hidden="true" />
              </Button>
            </div>
            {saveError && <p className="mt-3 text-sm text-destructive">{saveError}</p>}
          </div>
        )}

        {mode === 'summary' && saved && (
          <div>
            <div className="flex items-start justify-between gap-3 mb-4">
              <h2 className="text-xl font-bold text-card-foreground">Seu diagnóstico</h2>
              <Button type="button" variant="outline" size="sm" onClick={startWizard}>
                <RotateCcw className="w-4 h-4 mr-2" aria-hidden="true" />
                Refazer
              </Button>
            </div>

            <dl className="grid sm:grid-cols-2 gap-3 mb-5 text-sm">
              {questions.map((q) => (
                <div key={q.id} className="p-3 bg-muted rounded-lg">
                  <dt className="text-muted-foreground text-xs mb-0.5">{q.question}</dt>
                  <dd className="text-card-foreground font-medium">
                    {q.options.find((option) => option.value === saved.answers[q.id])?.label || '—'}
                  </dd>
                </div>
              ))}
            </dl>

            {(() => {
              const recommendation = buildRecommendation(saved.answers);
              return (
                <div className="p-4 rounded-xl bg-[hsl(var(--accent))]/10 border border-[hsl(var(--accent))]/20">
                  <p className="text-sm text-card-foreground">{recommendation.text}</p>
                  {recommendation.cta && (
                    <Link
                      to={recommendation.cta.to}
                      className="inline-flex items-center gap-1 mt-3 text-sm font-semibold text-[hsl(var(--primary))] hover:underline"
                    >
                      {recommendation.cta.label}
                      <ChevronRight className="w-4 h-4" aria-hidden="true" />
                    </Link>
                  )}
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default PersonalizationQuiz;
