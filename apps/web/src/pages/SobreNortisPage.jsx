import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Target, Eye, Heart, Compass } from 'lucide-react';

const SobreNortisPage = () => {
  const cards = [
    {
      icon: Target,
      title: 'Missão',
      description: 'Aprovar pessoas através da educação.'
    },
    {
      icon: Eye,
      title: 'Visão',
      description: 'Ser referência nacional em apostilas digitais para concursos.'
    },
    {
      icon: Heart,
      title: 'Valores',
      description: 'Ética, qualidade, atualização e compromisso com o aluno.'
    }
  ];

  return (
    <>
      <Helmet>
        <title>Sobre a Nortis Concursos</title>
        <meta name="description" content="Conheça a Nortis Concursos, marca editorial voltada à produção de materiais digitais organizados para concursos públicos." />
        <link rel="canonical" href="https://www.nortisconcursos.com.br/sobre" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Sobre a Nortis Concursos" />
        <meta property="og:description" content="Conheça a Nortis Concursos, marca editorial voltada à produção de materiais digitais organizados para concursos públicos." />
        <meta property="og:url" content="https://www.nortisconcursos.com.br/sobre" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Sobre a Nortis Concursos" />
        <meta name="twitter:description" content="Conheça a Nortis Concursos, marca editorial voltada à produção de materiais digitais organizados para concursos públicos." />
      </Helmet>

      <div className="min-h-screen bg-background">
        <section className="bg-[hsl(var(--primary))] border-b border-[hsl(var(--accent))]/20 py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-[hsl(var(--primary))] to-[hsl(var(--secondary))]/10"></div>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Compass className="w-16 h-16 text-[hsl(var(--accent))] mx-auto mb-6" />
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-heading text-white mb-6 tracking-tight">
                Sobre a NORTIS
              </h1>
              <p className="text-xl text-white/90 font-body font-light leading-relaxed">
                O norte da sua aprovação.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="py-24">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="space-y-6"
              >
                <h2 className="text-3xl font-bold font-heading text-foreground">Nossa História</h2>
                <div className="h-1 w-16 bg-[hsl(var(--accent))] rounded-full"></div>
                <div className="prose prose-lg text-muted-foreground font-body leading-relaxed">
                  <p>
                    A Nortis Concursos nasceu com o propósito de oferecer materiais de alta qualidade para candidatos que buscam aprovação em concursos públicos. Nossa missão é produzir conteúdos completos, atualizados e estratégicos, auxiliando estudantes em todas as etapas da preparação.
                  </p>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="relative h-[400px] rounded-2xl overflow-hidden shadow-2xl border-4 border-white"
              >
                <img 
                  src="https://horizons-cdn.hostinger.com/2547f642-7924-40ef-a160-8a0896ff1615/723d9ff474b485a675ba9740ca7ebf93.jpg" 
                  alt="Nortis Concursos" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-[hsl(var(--primary))]/20 mix-blend-multiply"></div>
              </motion.div>
            </div>
          </div>
        </section>

        <section className="py-24 bg-muted border-t border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-8">
              {cards.map((card, index) => (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.15 }}
                  className="bg-card p-10 rounded-2xl shadow-lg border border-border/50 hover:border-[hsl(var(--accent))]/50 transition-colors relative overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[hsl(var(--accent))]/5 rounded-bl-full transition-transform group-hover:scale-110"></div>
                  <div className="w-16 h-16 bg-[hsl(var(--primary))] rounded-xl flex items-center justify-center text-[hsl(var(--accent))] mb-8 relative z-10">
                    <card.icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold font-heading text-card-foreground mb-4 relative z-10">{card.title}</h3>
                  <p className="text-muted-foreground leading-relaxed relative z-10">{card.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default SobreNortisPage;