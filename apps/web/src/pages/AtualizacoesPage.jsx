import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Calendar, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';

const AtualizacoesPage = () => {
  const updates = [
    {
      date: '2026-06-18',
      title: 'Apostila SEDES DF 2026 - Atualização de Legislação',
      description: 'Incluídas as alterações recentes na Lei Orgânica do Distrito Federal e atualizações jurisprudenciais do STF sobre direitos fundamentais. Material revisado com 47 novas questões comentadas.',
      category: 'Atualização'
    },
    {
      date: '2026-06-10',
      title: 'Nova Apostila: Tribunal de Contas da União 2026',
      description: 'Lançamento da apostila completa para o concurso do TCU. Conteúdo alinhado com o edital preliminar, incluindo Direito Administrativo, Constitucional, Controle Externo e Auditoria Governamental.',
      category: 'Lançamento'
    },
    {
      date: '2026-06-03',
      title: 'Apostila Polícia Federal - Revisão Completa',
      description: 'Revisão geral do material com atualização de legislação penal e processual penal. Adicionados 120 novos exercícios baseados nas últimas provas da banca CEBRASPE.',
      category: 'Atualização'
    },
    {
      date: '2026-05-27',
      title: 'Mapas Mentais de Direito Constitucional',
      description: 'Disponibilizados 35 mapas mentais exclusivos sobre os principais temas de Direito Constitucional. Material complementar gratuito para alunos que adquiriram apostilas.',
      category: 'Material Extra'
    },
    {
      date: '2026-05-19',
      title: 'Apostila INSS 2026 - Conteúdo Ampliado',
      description: 'Ampliação do conteúdo de Direito Previdenciário com análise detalhada das Leis 8.212/91 e 8.213/91. Incluídas questões comentadas das últimas 5 provas do CEBRASPE para o cargo.',
      category: 'Atualização'
    },
    {
      date: '2026-05-12',
      title: 'Nova Apostila: Receita Federal 2026',
      description: 'Lançamento da apostila para Auditor Fiscal da Receita Federal. Material completo com teoria, questões comentadas e simulados. Foco especial em Legislação Tributária e Aduaneira.',
      category: 'Lançamento'
    }
  ];

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Lançamento':
        return 'bg-green-100 text-green-800';
      case 'Atualização':
        return 'bg-blue-100 text-blue-800';
      case 'Material Extra':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  return (
    <>
      <Helmet>
        <title>Atualizações - NORTIS CONCURSOS</title>
        <meta name="description" content="Acompanhe as últimas atualizações das nossas apostilas, novos lançamentos e materiais complementares para concursos públicos." />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Header Section */}
        <section className="bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--secondary))] text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight" style={{ letterSpacing: '-0.02em' }}>
                Atualizações
              </h1>
              <p className="text-lg md:text-xl text-white/90 max-w-3xl leading-relaxed">
                Fique por dentro das últimas atualizações das nossas apostilas e novos lançamentos
              </p>
            </motion.div>
          </div>
        </section>

        {/* Updates List */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="space-y-6">
              {updates.map((update, index) => (
                <motion.article
                  key={update.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-card rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold ${getCategoryColor(update.category)}`}>
                      {update.category}
                    </span>
                    <div className="flex items-center text-sm text-card-foreground/60">
                      <Calendar className="w-4 h-4 mr-2" />
                      {formatDate(update.date)}
                    </div>
                  </div>

                  <h2 className="text-xl md:text-2xl font-bold text-card-foreground mb-3 leading-tight">
                    {update.title}
                  </h2>

                  <p className="text-card-foreground/80 leading-relaxed mb-4">
                    {update.description}
                  </p>

                  <Button variant="ghost" size="sm" className="text-[hsl(var(--primary))] hover:text-[hsl(var(--primary))]/80 p-0 h-auto font-semibold">
                    Saiba mais
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </motion.article>
              ))}
            </div>

            {/* CTA Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="mt-16 bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--secondary))] rounded-2xl p-8 md:p-12 text-white text-center"
            >
              <h2 className="text-2xl md:text-3xl font-bold mb-4 leading-tight" style={{ letterSpacing: '-0.02em' }}>
                Receba atualizações por e-mail
              </h2>
              <p className="text-lg text-white/90 mb-6 leading-relaxed">
                Cadastre-se para receber notificações sobre novas apostilas e atualizações de conteúdo
              </p>
              <Button size="lg" className="bg-[hsl(var(--accent))] text-[hsl(var(--primary))] hover:bg-[hsl(var(--accent))]/90 font-semibold">
                Cadastrar agora
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </motion.div>
          </div>
        </section>
      </div>
    </>
  );
};

export default AtualizacoesPage;