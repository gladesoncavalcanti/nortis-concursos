import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Download, CheckCircle, FileText, CalendarDays, BrainCircuit } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { toast } from 'sonner';

const MateriaisGratuitosPage = () => {
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email) {
      toast.error('Preencha todos os campos.');
      return;
    }

    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const leads = JSON.parse(localStorage.getItem('nortis_leads') || '[]');
    leads.push({ ...formData, timestamp: new Date().toISOString() });
    localStorage.setItem('nortis_leads', JSON.stringify(leads));
    
    setIsSuccess(true);
    toast.success('Obrigado! Verifique seu e-mail para acessar os materiais gratuitos.');
    setIsSubmitting(false);
  };

  const freeMaterials = [
    {
      icon: FileText,
      title: 'Amostras de Apostilas (PDF)',
      description: 'Capítulos iniciais dos nossos principais materiais para você conhecer nossa didática e diagramação.'
    },
    {
      icon: CalendarDays,
      title: 'Cronogramas de Estudo Editáveis',
      description: 'Planilhas prontas para você organizar seus ciclos de revisão e acompanhamento de edital.'
    },
    {
      icon: CheckCircle,
      title: 'Simulados de Nivelamento',
      description: 'Bateria de questões inéditas para testar seus conhecimentos antes da prova oficial.'
    },
    {
      icon: BrainCircuit,
      title: 'Mapas Mentais Resumo',
      description: 'Seleção dos nossos melhores esquemas visuais abordando temas de alta incidência.'
    }
  ];

  return (
    <>
      <Helmet>
        <title>Materiais Gratuitos - NORTIS CONCURSOS</title>
        <meta name="description" content="Baixe gratuitamente PDFs, cronogramas de estudo e simulados de alto rendimento elaborados pela Nortis." />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Premium Header */}
        <section className="bg-[hsl(var(--primary))] py-20 border-b border-[hsl(var(--accent))]/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl md:text-5xl font-bold font-heading text-white mb-6 tracking-tight">
                Materiais Gratuitos para Sua Aprovação
              </h1>
              <div className="h-1 w-24 bg-[hsl(var(--accent))] mx-auto rounded-full mb-6"></div>
              <p className="text-xl text-white/90 max-w-3xl mx-auto font-body font-light">
                Acesse PDFs gratuitos, simulados, cronogramas de estudo e dicas exclusivas.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-5 gap-16 items-start">
              
              {/* Left Column - Materials List */}
              <motion.div 
                className="lg:col-span-3 space-y-8"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div>
                  <h2 className="text-3xl font-bold font-heading text-foreground mb-4">O que você vai receber</h2>
                  <p className="text-muted-foreground text-lg mb-8">
                    Ao se cadastrar, você ganha acesso instantâneo a uma pasta exclusiva contendo:
                  </p>
                </div>

                <div className="space-y-6">
                  {freeMaterials.map((item, index) => (
                    <div key={index} className="flex gap-4 p-6 bg-card border border-border rounded-xl shadow-sm hover:border-[hsl(var(--accent))]/50 transition-colors">
                      <div className="w-12 h-12 rounded-lg bg-[hsl(var(--primary))]/10 flex items-center justify-center text-[hsl(var(--primary))] flex-shrink-0">
                        <item.icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold font-heading text-card-foreground mb-2">{item.title}</h3>
                        <p className="text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Right Column - Form */}
              <motion.div 
                className="lg:col-span-2"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <div className="bg-[hsl(var(--primary))] rounded-2xl p-8 shadow-2xl relative overflow-hidden border border-[hsl(var(--accent))]/30">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[hsl(var(--accent))] rounded-full opacity-10 blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                  
                  {!isSuccess ? (
                    <>
                      <h3 className="text-2xl font-bold font-heading text-white mb-2">Libere seu acesso</h3>
                      <p className="text-white/80 mb-8 text-sm">
                        Preencha os dados e enviaremos o link seguro diretamente para o seu e-mail.
                      </p>

                      <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
                        <div>
                          <label className="block text-sm font-medium text-white/90 mb-2">Nome completo</label>
                          <Input
                            type="text"
                            placeholder="Seu nome"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-[hsl(var(--accent))] h-12"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-white/90 mb-2">E-mail</label>
                          <Input
                            type="email"
                            placeholder="seu@email.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-[hsl(var(--accent))] h-12"
                            required
                          />
                        </div>

                        <Button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full h-12 bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] hover:bg-[hsl(var(--accent))]/90 font-bold text-lg mt-4 transition-all"
                        >
                          {isSubmitting ? 'Processando...' : 'Receber Materiais Gratuitos'}
                        </Button>
                        <p className="text-xs text-center text-white/60 mt-4">
                          Fique tranquilo, não enviamos spam.
                        </p>
                      </form>
                    </>
                  ) : (
                    <motion.div 
                      className="text-center py-10"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-10 h-10 text-green-400" />
                      </div>
                      <h3 className="text-2xl font-bold font-heading text-white mb-4">Tudo Certo!</h3>
                      <p className="text-white/80 mb-8 leading-relaxed">
                        Obrigado! Verifique seu e-mail para acessar os materiais gratuitos.
                      </p>
                      <Button
                        onClick={() => {
                          setIsSuccess(false);
                          setFormData({ name: '', email: '' });
                        }}
                        variant="outline"
                        className="border-white/20 text-white hover:bg-white/10 bg-transparent w-full"
                      >
                        Fazer novo download
                      </Button>
                    </motion.div>
                  )}
                </div>
              </motion.div>

            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default MateriaisGratuitosPage;