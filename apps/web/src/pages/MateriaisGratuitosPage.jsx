import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  BarChart3,
  BookOpenCheck,
  CalendarClock,
  ClipboardCheck,
  Download,
  FileQuestion,
  FileText,
  HelpCircle,
  PenLine,
  Scale,
  Sparkles,
  Timer,
} from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import FreeSampleModal from '@/components/FreeSampleModal.jsx';
import FreeSedesAccessCta from '@/components/FreeSedesAccessCta.jsx';

/**
 * Página pública de materiais gratuitos SEDES-DF 2026.
 * Os números abaixo refletem o inventário confirmado em produção em
 * 31/08/2026: 15 especialidades, 68 questões diagnósticas, 68 questões
 * práticas, 15 simulados, 10 módulos e 6 temas discursivos ativos.
 * Não cria checkout, não altera preço e não promete equivalência com
 * nota oficial.
 */
const LAUNCH_ACCESS_ITEMS = [
  {
    icon: BookOpenCheck,
    title: 'Edital verticalizado por especialidade',
    desc: '15 especialidades TDAS e EDAS organizadas por cargo, disciplina e bloco oficial já cadastrado.',
    metric: '15 trilhas',
  },
  {
    icon: ClipboardCheck,
    title: 'Diagnóstico objetivo inicial',
    desc: '68 questões autorais para separar desempenho objetivo da autopercepção do aluno.',
    metric: '68 questões',
  },
  {
    icon: FileQuestion,
    title: 'Banco de questões práticas',
    desc: 'Uma camada própria de treino, distinta do diagnóstico, com explicação pedagógica após a resposta.',
    metric: '68 práticas',
  },
  {
    icon: Timer,
    title: 'Simulados piloto por especialidade',
    desc: 'Um simulado inicial para cada especialidade, filtrado pela escolha do aluno na Central Nortis.',
    metric: '15 simulados',
  },
  {
    icon: BarChart3,
    title: 'Plano, progresso e tempo real estudado',
    desc: 'Agenda semanal, histórico de estudos, aderência, revisão de erros e próximo melhor passo.',
    metric: 'Central ativa',
  },
  {
    icon: FileText,
    title: 'Treino discursivo inicial',
    desc: 'Seis temas ativos para rascunho por tema, sem correção humana automática nesta liberação.',
    metric: '6 temas',
  },
];

const CONTENT_PILLARS = [
  { icon: HelpCircle, title: 'Questão do dia', desc: 'Questões comentadas no padrão da banca Quadrix.' },
  { icon: AlertTriangle, title: 'Pegadinha da Quadrix', desc: 'Armadilhas mais comuns nos enunciados da banca.' },
  { icon: Scale, title: 'Lei em 60 segundos', desc: 'Legislação social explicada de forma rápida e direta.' },
  { icon: PenLine, title: 'Redação SEDES-DF', desc: 'Boas práticas de redação para o concurso.' },
  { icon: CalendarClock, title: 'Atualizações do concurso', desc: 'Linha do tempo e informações confirmadas sobre o SEDES-DF 2026.' },
  { icon: Sparkles, title: 'Bastidores do Método Nortis', desc: 'Como a apostila Nexo Social é organizada por dentro.' },
];

const MateriaisGratuitosPage = () => {
  const [isSampleModalOpen, setIsSampleModalOpen] = useState(false);

  return (
    <>
      <Helmet>
        <title>Conteúdos gratuitos | Nortis Concursos</title>
        <meta name="description" content="Libere gratuitamente a Central Nortis SEDES-DF 2026 com edital verticalizado, questões, simulados, flashcards, plano de estudos e treino discursivo." />
        <link rel="canonical" href="https://www.nortisconcursos.com.br/materiais-gratuitos" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Conteúdos gratuitos | Nortis Concursos" />
        <meta property="og:description" content="Libere gratuitamente a Central Nortis SEDES-DF 2026 com edital verticalizado, questões, simulados, flashcards, plano de estudos e treino discursivo." />
        <meta property="og:url" content="https://www.nortisconcursos.com.br/materiais-gratuitos" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Conteúdos gratuitos | Nortis Concursos" />
        <meta name="twitter:description" content="Libere gratuitamente a Central Nortis SEDES-DF 2026 com edital verticalizado, questões, simulados, flashcards, plano de estudos e treino discursivo." />
      </Helmet>

      <div className="min-h-screen bg-background">
        <section className="bg-[hsl(var(--primary))] py-20 border-b border-[hsl(var(--accent))]/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl md:text-5xl font-bold font-heading text-white mb-6 tracking-tight">
                Conteúdos gratuitos da Nortis
              </h1>
              <div className="h-1 w-24 bg-[hsl(var(--accent))] mx-auto rounded-full mb-6"></div>
              <p className="text-xl text-white/90 max-w-3xl mx-auto font-body font-light">
                Libere sem custo, por tempo provisório de lançamento, a Central Nortis SEDES-DF 2026:
                edital verticalizado, diagnóstico, questões autorais, simulados, plano de estudos e
                treino discursivo inicial.
              </p>
              <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-white/65">
                Para acessar, o aluno precisa criar conta ou fazer login. A liberação gratuita cria uma matrícula
                ativa de lançamento, sem passar por checkout, pagamentos ou Asaas.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <FreeSedesAccessCta className="h-12 px-8 font-bold bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] hover:bg-[hsl(var(--accent))]/90 transition-premium" />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsSampleModalOpen(true)}
                  className="h-12 px-8 border-white/30 bg-transparent font-bold text-white hover:bg-white/10 hover:text-white"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Receber avisos da Nortis
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="py-16 md:py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[hsl(var(--accent))] mb-3">
                Liberação provisória de lançamento
              </p>
              <h2 className="text-3xl font-bold font-heading text-foreground mb-4">
                O que o aluno acessa hoje
              </h2>
              <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
                A Nortis já liberou uma base funcional para o aluno SEDES-DF estudar dentro da plataforma,
                com acesso condicionado a cadastro/login e matrícula gratuita de lançamento.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {LAUNCH_ACCESS_ITEMS.map((item, index) => (
                <motion.article
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.04 }}
                  className="flex h-full flex-col rounded-xl border border-border bg-card p-6 shadow-sm"
                >
                  <div className="mb-5 flex items-start justify-between gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]">
                      <item.icon className="h-6 w-6" />
                    </div>
                    <span className="rounded-full bg-[hsl(var(--accent))]/15 px-3 py-1 text-xs font-bold uppercase tracking-wide text-[hsl(var(--primary))]">
                      {item.metric}
                    </span>
                  </div>
                  <h3 className="font-heading text-lg font-bold text-card-foreground">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
                </motion.article>
              ))}
            </div>

            <div className="mt-10 rounded-2xl border border-[hsl(var(--accent))]/30 bg-[hsl(var(--accent))]/10 p-6 text-center">
              <h3 className="font-heading text-xl font-bold text-foreground">Condição de lançamento</h3>
              <p className="mx-auto mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                Este acesso gratuito é provisório, promocional e vinculado ao lançamento da plataforma.
                Ele não altera o preço da apostila, não substitui a Sprint Discursiva com correção humana
                e pode ser reorganizado quando a Nortis abrir novas turmas, produtos ou regras comerciais.
              </p>
              <div className="mt-5 flex justify-center">
                <FreeSedesAccessCta className="h-11 px-7 font-bold bg-[hsl(var(--primary))] text-white hover:bg-[hsl(var(--primary))]/90" />
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-20 bg-muted/35">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold font-heading text-foreground mb-4">Conteúdos públicos de apoio</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Além da Central liberada por login, a Nortis mantém conteúdos públicos para orientar a preparação.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {CONTENT_PILLARS.map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  className="flex gap-4 p-6 bg-card border border-border rounded-xl shadow-sm hover:border-[hsl(var(--accent))]/50 transition-colors"
                >
                  <div className="w-12 h-12 rounded-lg bg-[hsl(var(--primary))]/10 flex items-center justify-center text-[hsl(var(--primary))] flex-shrink-0">
                    <item.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold font-heading text-card-foreground mb-1.5">{item.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="text-center mt-14">
              <Button
                type="button"
                onClick={() => setIsSampleModalOpen(true)}
                className="h-12 px-8 font-bold bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] hover:bg-[hsl(var(--accent))]/90 transition-premium"
              >
                <Download className="w-4 h-4 mr-2" />
                Receber avisos da Nortis
              </Button>
              <p className="mt-4 text-xs text-muted-foreground">
                O acesso gratuito é liberado na sua conta Nortis. A Sprint Discursiva com correção humana continua em lista de interesse.
              </p>
            </div>
          </div>
        </section>
      </div>

      <FreeSampleModal isOpen={isSampleModalOpen} onClose={() => setIsSampleModalOpen(false)} />
    </>
  );
};

export default MateriaisGratuitosPage;
