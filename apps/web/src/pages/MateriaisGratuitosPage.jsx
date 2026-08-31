import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Download, HelpCircle, AlertTriangle, Scale, PenLine, CalendarClock, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import FreeSampleModal from '@/components/FreeSampleModal.jsx';
import FreeSedesAccessCta from '@/components/FreeSedesAccessCta.jsx';

/**
 * Pré-lançamento (Sprint Social 1.3): mesmos pilares editoriais do
 * SocialContentPillars (Home), mas descritos aqui como temas que a
 * Nortis vai abordar — não como conteúdo diário já publicado, já que
 * isso ainda não existe.
 */
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
                Libere sem custo a Central Nortis SEDES-DF 2026: edital verticalizado, questões autorais,
                simulados, flashcards, plano de estudos e treino discursivo inicial.
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

        <section className="py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold font-heading text-foreground mb-4">O que estamos preparando</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Acesso gratuito para começar a estudar hoje, sem compra online nesta liberação.
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
