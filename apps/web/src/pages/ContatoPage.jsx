import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Mail, Phone, Clock, Send, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Textarea } from '@/components/ui/textarea.jsx';
import { toast } from 'sonner';
import { NORTIS_WHATSAPP_DISPLAY, NORTIS_WHATSAPP_URL } from '@/config/contact.js';

const ContatoPage = () => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast.error('Preencha todos os campos obrigatórios.');
      return;
    }

    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const messages = JSON.parse(localStorage.getItem('nortis_contacts') || '[]');
    messages.push({ ...formData, timestamp: new Date().toISOString() });
    localStorage.setItem('nortis_contacts', JSON.stringify(messages));

    toast.success('Mensagem enviada com sucesso! Entraremos em contato em breve.');
    setFormData({ name: '', email: '', subject: '', message: '' });
    setIsSubmitting(false);
  };

  return (
    <>
      <Helmet>
        <title>Contato - NORTIS CONCURSOS</title>
        <meta name="description" content="Fale com a equipe da Nortis Concursos. Estamos à disposição para tirar dúvidas e oferecer suporte." />
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
                Fale Conosco
              </h1>
              <div className="h-1 w-24 bg-[hsl(var(--accent))] mx-auto rounded-full mb-6"></div>
              <p className="text-xl text-white/90 max-w-2xl mx-auto font-body font-light">
                Nossa equipe de atendimento está de prontidão para ajudar no que for preciso. 
              </p>
            </motion.div>
          </div>
        </section>

        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-12 gap-16">
              
              <motion.div 
                className="lg:col-span-5 space-y-10"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div>
                  <h2 className="text-3xl font-bold font-heading text-foreground mb-4">Canais de Atendimento</h2>
                  <p className="text-muted-foreground text-lg">
                    Escolha a forma mais conveniente para falar com a gente.
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="flex p-6 bg-card border border-border rounded-xl shadow-sm hover:border-[hsl(var(--accent))]/50 transition-colors">
                    <Mail className="w-8 h-8 text-[hsl(var(--accent))] mr-4 flex-shrink-0" />
                    <div>
                      <h3 className="text-lg font-semibold font-heading text-card-foreground mb-1">E-mail</h3>
                      <a href="mailto:contato@nortisconcursos.com.br" className="text-muted-foreground hover:text-[hsl(var(--primary))] transition-colors">
                        contato@nortisconcursos.com.br
                      </a>
                    </div>
                  </div>

                  <div className="flex p-6 bg-card border border-border rounded-xl shadow-sm hover:border-[hsl(var(--accent))]/50 transition-colors">
                    <Phone className="w-8 h-8 text-[hsl(var(--accent))] mr-4 flex-shrink-0" />
                    <div>
                      <h3 className="text-lg font-semibold font-heading text-card-foreground mb-1">WhatsApp</h3>
                      <a href={NORTIS_WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-[hsl(var(--primary))] transition-colors">
                        {NORTIS_WHATSAPP_DISPLAY}
                      </a>
                    </div>
                  </div>

                  <div className="flex p-6 bg-[hsl(var(--primary))] border border-[hsl(var(--accent))]/20 rounded-xl shadow-sm text-white">
                    <Clock className="w-8 h-8 text-[hsl(var(--accent))] mr-4 flex-shrink-0" />
                    <div>
                      <h3 className="text-lg font-semibold font-heading text-white mb-2">Horário de Atendimento</h3>
                      <p className="text-white/80 text-sm mb-1">Segunda a Sexta: 08h às 18h</p>
                      <p className="text-white/80 text-sm">Sábado: 09h às 13h</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                className="lg:col-span-7"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <div className="bg-card rounded-2xl p-8 md:p-10 shadow-lg border border-border">
                  <h3 className="text-2xl font-bold font-heading text-card-foreground mb-8">Envie uma Mensagem</h3>
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-card-foreground">Nome completo</label>
                        <Input
                          type="text"
                          placeholder="Seu nome"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="bg-muted text-foreground border-border h-12"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-card-foreground">E-mail</label>
                        <Input
                          type="email"
                          placeholder="seu@email.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="bg-muted text-foreground border-border h-12"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-card-foreground">Assunto</label>
                      <Input
                        type="text"
                        placeholder="Ex: Dúvida sobre apostila"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="bg-muted text-foreground border-border h-12"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-card-foreground">Sua mensagem</label>
                      <Textarea
                        rows={6}
                        placeholder="Escreva como podemos ajudar..."
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="bg-muted text-foreground border-border resize-none p-4"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full h-14 bg-[hsl(var(--primary))] text-white hover:bg-[hsl(var(--secondary))] font-bold text-lg transition-all flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? 'Enviando...' : (
                        <>
                          Enviar Mensagem <Send className="w-5 h-5" />
                        </>
                      )}
                    </Button>
                  </form>
                </div>
              </motion.div>

            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default ContatoPage;