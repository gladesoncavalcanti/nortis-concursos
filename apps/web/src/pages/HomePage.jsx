import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BookOpen, Target, ShieldAlert, Sparkles, RefreshCw, Trophy, 
  ArrowRight, Star, Quote, ShoppingCart, CheckCircle2, AlertCircle, 
  Brain, Gift, Headphones, FileText, CalendarDays, Lightbulb, Send, MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Textarea } from '@/components/ui/textarea.jsx';
import { toast } from 'sonner';

const HomePage = () => {
  const [leadForm, setLeadForm] = useState({ name: '', email: '' });
  const [isSubmittingLead, setIsSubmittingLead] = useState(false);

  const [contactForm, setContactForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);

  const differentials = [
    { icon: CheckCircle2, title: 'Conteúdo atualizado', desc: 'Material alinhado com as jurisprudências e leis mais recentes.' },
    { icon: BookOpen, title: 'Questões comentadas', desc: 'Resolução detalhada foca no padrão da banca examinadora.' },
    { icon: AlertCircle, title: 'Pegadinhas de banca', desc: 'Alertas estratégicos sobre as armadilhas mais comuns nas provas.' },
    { icon: Brain, title: 'Mapas mentais', desc: 'Esquemas visuais que aceleram a revisão e a memorização.' },
    { icon: RefreshCw, title: 'Atualizações', desc: 'Acesso às erratas até a data da prova sem custo adicional.' }
  ];

  const handleLeadSubmit = async (e) => {
    e.preventDefault();
    if (!leadForm.name || !leadForm.email) {
      toast.error('Preencha todos os campos.');
      return;
    }

    setIsSubmittingLead(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const leads = JSON.parse(localStorage.getItem('nortis_leads') || '[]');
    leads.push({ ...leadForm, timestamp: new Date().toISOString() });
    localStorage.setItem('nortis_leads', JSON.stringify(leads));
    
    toast.success('Obrigado! Verifique seu e-mail para acessar os materiais gratuitos.');
    setLeadForm({ name: '', email: '' });
    setIsSubmittingLead(false);
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.subject || !contactForm.message) {
      toast.error('Preencha todos os campos obrigatórios.');
      return;
    }

    setIsSubmittingContact(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const contacts = JSON.parse(localStorage.getItem('nortis_contacts') || '[]');
    contacts.push({ ...contactForm, timestamp: new Date().toISOString() });
    localStorage.setItem('nortis_contacts', JSON.stringify(contacts));
    
    toast.success('Mensagem enviada com sucesso! Entraremos em contato em breve.');
    setContactForm({ name: '', email: '', subject: '', message: '' });
    setIsSubmittingContact(false);
  };

  return (
    <>
      <Helmet>
        <title>NORTIS CONCURSOS | O norte da sua aprovação.</title>
        <meta name="description" content="Apostilas premium, materiais estratégicos, questões comentadas e atualizações constantes para acelerar sua aprovação nas principais bancas examinadoras." />
      </Helmet>

      {/* Hero Section - Image Banner Only */}
      <section 
        className="w-full min-h-[300px] sm:min-h-[350px] md:min-h-[400px] lg:min-h-[500px] bg-cover bg-center bg-no-repeat section-seamless"
        style={{
          backgroundImage: 'url(https://horizons-cdn.hostinger.com/2547f642-7924-40ef-a160-8a0896ff1615/dfa641e7b824a816b202b4fe423ec000.png)'
        }}
      />

      {/* Veja por dentro da apostila Nexo Social – SEDES-DF 2026 */}
      <section className="py-12 bg-background section-seamless w-full overflow-hidden">
        <div className="w-full px-0 mx-0">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="w-full flex justify-center"
          >
            <img 
              src="https://horizons-cdn.hostinger.com/2547f642-7924-40ef-a160-8a0896ff1615/f3900e46957cb834c668c50a24f1adb2.png" 
              alt="Veja por dentro da apostila Nexo Social – SEDES-DF 2026" 
              className="w-full h-auto object-contain"
            />
          </motion.div>
        </div>
      </section>

      {/* Featured Apostila */}
      <section className="py-12 lg:py-16 nortis-gradient-bg section-seamless">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold font-heading text-foreground mb-3">Apostila em Destaque</h2>
            <div className="h-1 w-20 bg-[hsl(var(--accent))] mx-auto rounded-full mb-3"></div>
          </div>

          <div className="bg-secondary rounded-2xl overflow-hidden shadow-premium max-w-5xl mx-auto border-none">
            <div className="grid md:grid-cols-2 gap-0">
              <div className="relative h-64 md:h-auto bg-background">
                <img 
                  src="https://horizons-cdn.hostinger.com/2547f642-7924-40ef-a160-8a0896ff1615/92a96de5b50a82d706116606aa01fa00.jpg" 
                  alt="Nexo Social – SEDES DF 2026" 
                  className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity"
                />
              </div>
              <div className="p-6 md:p-8 flex flex-col justify-center">
                <h3 className="text-2xl md:text-3xl font-bold font-heading text-foreground mb-3">Nexo Social – SEDES DF 2026</h3>
                <div className="text-2xl md:text-3xl font-bold text-[hsl(var(--accent))] mb-4">R$ 297,00</div>
                <p className="text-muted-foreground mb-5 leading-relaxed">
                  Apostila completa e estratégica para o concurso SEDES DF 2026. Conteúdo atualizado, questões comentadas, pegadinhas de banca, mapas mentais e atualizações constantes. Acesso imediato ao PDF após a compra.
                </p>
                
                <ul className="space-y-2 mb-6">
                  {['Conteúdo atualizado', 'Questões comentadas', 'Pegadinhas de banca', 'Mapas mentais', 'Atualizações'].map((item, idx) => (
                    <li key={idx} className="flex items-center text-foreground font-medium">
                      <CheckCircle2 className="w-5 h-5 text-[hsl(var(--accent))] mr-2 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>

                <Link to="/apostilas">
                  <Button className="w-full bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--background))] border border-transparent font-bold py-5 text-lg transition-premium shadow-md hover:shadow-lg hover:-translate-y-1">
                    <ShoppingCart className="w-5 h-5 mr-2" /> Comprar Agora
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Nexo */}
      <section className="py-12 lg:py-16 nortis-gradient-bg section-seamless">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold font-heading text-foreground mb-3">Por Que Escolher a Nortis?</h2>
            <div className="h-1 w-20 bg-[hsl(var(--accent))] mx-auto rounded-full mb-3"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5 justify-center">
            {differentials.map((diff, index) => (
              <motion.div
                key={diff.title}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="bg-secondary p-6 rounded-xl shadow-sm hover:shadow-premium transition-premium border-none"
              >
                <div className="w-10 h-10 rounded-lg bg-[hsl(var(--primary))] flex items-center justify-center mb-4 text-[hsl(var(--accent))]">
                  <diff.icon className="w-5 h-5" />
                </div>
                <h3 className="text-lg md:text-xl font-semibold font-heading text-foreground mb-2">{diff.title}</h3>
                <p className="text-muted-foreground leading-relaxed text-sm md:text-base">{diff.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Nortis */}
      <section className="py-12 lg:py-16 nortis-gradient-bg section-seamless">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4 text-foreground">Sobre a Nortis</h2>
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-6">
                A Nortis Concursos nasceu com o propósito de oferecer materiais de alta qualidade para candidatos que buscam aprovação em concursos públicos. Nossa missão é produzir conteúdos completos, atualizados e estratégicos, auxiliando estudantes em todas as etapas da preparação.
              </p>
              <Link to="/sobre">
                <Button variant="outline" className="border-2 border-[hsl(var(--accent))] text-[hsl(var(--accent))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))] bg-transparent font-semibold px-6 transition-premium">
                  Conheça Nossa História
                </Button>
              </Link>
            </motion.div>

            <div className="grid gap-4">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="bg-secondary p-5 rounded-xl hover:shadow-premium transition-premium border-none"
              >
                <h3 className="text-lg font-bold font-heading text-[hsl(var(--accent))] mb-1">Missão</h3>
                <p className="text-muted-foreground text-sm md:text-base">Aprovar pessoas através da educação.</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="bg-secondary p-5 rounded-xl hover:shadow-premium transition-premium border-none"
              >
                <h3 className="text-lg font-bold font-heading text-[hsl(var(--accent))] mb-1">Visão</h3>
                <p className="text-muted-foreground text-sm md:text-base">Ser referência nacional em apostilas digitais para concursos.</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="bg-secondary p-5 rounded-xl hover:shadow-premium transition-premium border-none"
              >
                <h3 className="text-lg font-bold font-heading text-[hsl(var(--accent))] mb-1">Valores</h3>
                <p className="text-muted-foreground text-sm md:text-base">Ética, qualidade, atualização e compromisso com o aluno.</p>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Free Materials Capture */}
      <section className="py-12 lg:py-16 bg-secondary relative overflow-hidden section-seamless">
        <div className="absolute inset-0 opacity-10" style={{ 
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)', 
          backgroundSize: '40px 40px' 
        }}></div>
        <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-primary rounded-2xl p-6 md:p-8 lg:p-10 shadow-premium border-none"
          >
            <div className="text-center mb-6">
              <h2 className="text-2xl md:text-3xl font-bold font-heading text-foreground mb-2">
                Materiais Gratuitos para Sua Aprovação
              </h2>
              <p className="text-base md:text-lg text-muted-foreground">
                Acesse PDFs gratuitos, simulados, cronogramas de estudo e dicas exclusivas.
              </p>
            </div>

            <form onSubmit={handleLeadSubmit} className="space-y-3 max-w-md mx-auto">
              <div>
                <Input
                  type="text"
                  placeholder="Nome completo"
                  value={leadForm.name}
                  onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
                  className="bg-secondary border-none text-foreground placeholder:text-muted-foreground h-11"
                  required
                />
              </div>
              <div>
                <Input
                  type="email"
                  placeholder="Seu melhor e-mail"
                  value={leadForm.email}
                  onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                  className="bg-secondary border-none text-foreground placeholder:text-muted-foreground h-11"
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={isSubmittingLead}
                className="w-full h-11 bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] hover:bg-[hsl(var(--accent))]/90 font-bold text-base transition-premium"
              >
                {isSubmittingLead ? 'Processando...' : 'Receber Materiais Gratuitos'}
              </Button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-12 lg:py-16 nortis-gradient-bg section-seamless">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-10">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold font-heading text-foreground mb-4">Contato</h2>
              <p className="text-base md:text-lg text-muted-foreground mb-6">
                Ficou com alguma dúvida? Nossa equipe está pronta para ajudar você na sua jornada de estudos.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center p-5 bg-secondary rounded-xl border-none">
                  <MessageSquare className="w-6 h-6 text-[hsl(var(--accent))] mr-4" />
                  <div>
                    <h4 className="font-bold text-foreground">E-mail</h4>
                    <a href="mailto:contato@nortisconcursos.com.br" className="text-muted-foreground hover:text-[hsl(var(--accent))] transition-colors">
                      contato@nortisconcursos.com.br
                    </a>
                  </div>
                </div>
                <div className="flex items-center p-5 bg-secondary rounded-xl border-none">
                  <Headphones className="w-6 h-6 text-[hsl(var(--accent))] mr-4" />
                  <div>
                    <h4 className="font-bold text-foreground">WhatsApp</h4>
                    <a href="https://wa.me/5561991168987" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-[hsl(var(--accent))] transition-colors">
                      +55 61 99116-8987
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-secondary rounded-2xl p-6 lg:p-8 shadow-premium border-none"
            >
              <form onSubmit={handleContactSubmit} className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Nome completo</label>
                  <Input
                    type="text"
                    placeholder="Seu nome"
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    className="bg-primary border-none text-foreground placeholder:text-muted-foreground h-11"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">E-mail</label>
                  <Input
                    type="email"
                    placeholder="seu@email.com"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    className="bg-primary border-none text-foreground placeholder:text-muted-foreground h-11"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Assunto</label>
                  <Input
                    type="text"
                    placeholder="Assunto da mensagem"
                    value={contactForm.subject}
                    onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                    className="bg-primary border-none text-foreground placeholder:text-muted-foreground h-11"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Mensagem</label>
                  <Textarea
                    rows={3}
                    placeholder="Como podemos ajudar?"
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    className="bg-primary border-none text-foreground placeholder:text-muted-foreground resize-none p-3"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isSubmittingContact}
                  className="w-full h-11 bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] hover:bg-[hsl(var(--accent))]/90 font-bold text-base transition-premium flex items-center justify-center gap-2 mt-4"
                >
                  {isSubmittingContact ? 'Enviando...' : (
                    <>Enviar Mensagem <Send className="w-5 h-5" /></>
                  )}
                </Button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Upcoming Launches */}
      <section className="py-8 bg-primary text-center section-seamless">
        <div className="max-w-3xl mx-auto px-3 sm:px-4 lg:px-6">
          <h3 className="text-xl md:text-2xl font-bold font-heading text-foreground mb-1">Próximos Lançamentos</h3>
          <p className="text-sm md:text-base text-muted-foreground">Novas apostilas estão em desenvolvimento.</p>
        </div>
      </section>
    </>
  );
};

export default HomePage;