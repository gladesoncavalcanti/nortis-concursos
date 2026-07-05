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
import ProductFeaturesSection from '@/components/ProductFeaturesSection.jsx';

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

      {/* Hero Section — produto em primeiro plano: texto à esquerda,
          capa oficial à direita, fundo navy sólido com brilhos sutis.
          Sem foto de fundo genérica competindo com o conteúdo. */}
      <section className="relative overflow-hidden bg-[hsl(var(--primary))] section-seamless">
        <div aria-hidden="true" className="absolute -top-48 -right-32 w-[520px] h-[520px] rounded-full bg-[hsl(var(--accent))]/[0.08] blur-3xl" />
        <div aria-hidden="true" className="absolute -bottom-56 -left-40 w-[480px] h-[480px] rounded-full bg-white/[0.04] blur-3xl" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-16 md:pt-20 md:pb-20 lg:pt-24 lg:pb-24">
          <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-12 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <p className="eyebrow mb-4">Nortis Concursos · Banca Quadrix</p>
              <h1 className="text-4xl sm:text-5xl lg:text-[3.4rem] font-bold font-heading text-white leading-[1.1] mb-5">
                Nexo Social
                <span className="block text-[hsl(var(--accent))]">SEDES DF 2026</span>
              </h1>
              <p className="text-base md:text-lg text-white/80 font-body leading-relaxed mb-7 max-w-xl">
                A apostila especializada em legislação social e políticas públicas,
                construída questão por questão no padrão real da banca Quadrix.
              </p>

              <div className="flex flex-wrap gap-2 mb-8">
                {['741 páginas', 'Questões comentadas', 'PDF · acesso imediato'].map((chip) => (
                  <span
                    key={chip}
                    className="text-xs font-semibold uppercase tracking-wide bg-white/[0.07] text-white/90 px-3.5 py-1.5 rounded-full border border-white/15"
                  >
                    {chip}
                  </span>
                ))}
              </div>

              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-5xl font-bold font-heading text-white tracking-tight">R$ 39,90</span>
                <span className="text-lg text-white/50 line-through">R$ 49,90</span>
              </div>
              <p className="text-sm text-white/60 mb-8">Pagamento único · sem mensalidade</p>

              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <Link to="/apostilas">
                  <Button className="w-full sm:w-auto bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] hover:bg-[hsl(var(--accent))]/90 font-bold px-10 py-6 text-base transition-premium shadow-premium-lg">
                    Comprar agora
                  </Button>
                </Link>
                <Link to="/apostilas">
                  <Button variant="outline" className="w-full sm:w-auto border border-white/25 text-white bg-transparent hover:bg-white/10 hover:text-white font-semibold px-8 py-6 text-base transition-premium">
                    Ver todas as apostilas
                  </Button>
                </Link>
              </div>

              <p className="text-xs text-white/50 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-[hsl(var(--accent))]" aria-hidden="true" />
                Pagamento seguro via Asaas · Pix ou cartão · Acesso imediato após a confirmação
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="relative flex justify-center lg:justify-end"
            >
              <div aria-hidden="true" className="absolute inset-0 flex items-center justify-center">
                <div className="w-72 h-72 md:w-96 md:h-96 rounded-full bg-[hsl(var(--accent))]/[0.12] blur-3xl" />
              </div>
              <img
                src="/nexo-social-capa-741.jpeg"
                alt="Capa da apostila Nexo Social – SEDES DF 2026, banca Quadrix, 741 páginas"
                className="relative w-64 sm:w-72 md:w-80 lg:w-[22rem] h-auto rounded-xl shadow-premium-lg ring-1 ring-white/15"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Faixa institucional — banner oficial da marca, emoldurado com
          discrição para funcionar como selo de autoridade, sem texto
          sobreposto competindo com o conteúdo. */}
      <section className="w-full bg-[hsl(var(--primary))] border-t border-white/[0.06] py-10 md:py-14 section-seamless">
        <div className="max-w-4xl mx-auto px-6">
          <img
            src="/nortis-banner-institucional.png"
            alt="Nortis Concursos — O norte da sua aprovação"
            className="w-full h-auto rounded-xl ring-1 ring-white/10 shadow-premium-lg"
            loading="lazy"
          />
        </div>
      </section>

      {/* Conheça o Que Você Recebe — substitui a antiga imagem composta
          (desfocada no mobile e com contagem de páginas errada) por uma
          seção real em HTML/CSS. */}
      <ProductFeaturesSection />

      {/* Featured Apostila — card editorial: capa em painel navy à
          esquerda, conteúdo comercial hierarquizado à direita. */}
      <section className="py-16 lg:py-24 bg-background section-seamless">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="eyebrow mb-3">Material completo</p>
            <h2 className="text-3xl md:text-4xl font-bold font-heading text-foreground">Apostila em Destaque</h2>
          </div>

          <div className="bg-card rounded-2xl overflow-hidden shadow-premium-lg max-w-5xl mx-auto border border-border">
            <div className="grid md:grid-cols-[0.9fr_1.1fr] gap-0">
              <div className="relative bg-[hsl(var(--primary))] p-8 md:p-10 flex items-center justify-center overflow-hidden">
                <div aria-hidden="true" className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-[hsl(var(--accent))]/[0.1] blur-3xl" />
                <img
                  src="/nexo-social-capa-741.jpeg"
                  alt="Capa da apostila Nexo Social – SEDES DF 2026, banca Quadrix, 741 páginas"
                  className="relative w-full max-w-[16rem] md:max-w-[18rem] h-auto rounded-lg shadow-premium-lg ring-1 ring-white/15"
                  loading="lazy"
                />
                <div className="absolute top-5 right-5 bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] text-xs font-bold px-3 py-1.5 rounded-full shadow-md">
                  LANÇAMENTO
                </div>
              </div>
              <div className="p-7 md:p-10 flex flex-col justify-center">
                <div className="flex flex-wrap gap-2 mb-5">
                  <span className="text-xs font-semibold uppercase tracking-wide bg-muted text-muted-foreground px-3 py-1 rounded-full border border-border">
                    Banca Quadrix
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-wide bg-muted text-muted-foreground px-3 py-1 rounded-full border border-border">
                    741 páginas
                  </span>
                </div>

                <h3 className="text-2xl md:text-3xl font-bold font-heading text-foreground mb-4 leading-snug">Nexo Social – SEDES DF 2026</h3>

                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Apostila completa e estratégica para o concurso SEDES DF 2026. Conteúdo atualizado, questões comentadas, pegadinhas de banca, mapas mentais e atualizações constantes. Acesso imediato ao PDF após a compra.
                </p>

                <ul className="space-y-2.5 mb-7">
                  {['Conteúdo atualizado', 'Questões comentadas', 'Simulado final', 'Pegadinhas de banca', 'Mapas mentais'].map((item, idx) => (
                    <li key={idx} className="flex items-center text-foreground text-sm md:text-base font-medium">
                      <CheckCircle2 className="w-5 h-5 text-[hsl(var(--accent))] mr-2.5 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>

                <div className="flex items-baseline gap-3 mb-5">
                  <span className="text-4xl font-bold font-heading text-[hsl(var(--primary))] tracking-tight">R$ 39,90</span>
                  <span className="text-base line-through text-muted-foreground">R$ 49,90</span>
                </div>

                <Link to="/apostilas">
                  <Button className="w-full bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] hover:bg-[hsl(var(--accent))]/90 font-bold py-6 text-lg transition-premium shadow-premium">
                    <ShoppingCart className="w-5 h-5 mr-2" /> Comprar Agora
                  </Button>
                </Link>
                <p className="text-xs text-muted-foreground text-center mt-3">
                  Pagamento seguro via Asaas · Pix ou cartão
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Nexo */}
      <section className="py-16 lg:py-24 bg-muted/40 section-seamless">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="eyebrow mb-3">Diferenciais</p>
            <h2 className="text-3xl md:text-4xl font-bold font-heading text-foreground">Por Que Escolher a Nortis?</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6 justify-center">
            {differentials.map((diff, index) => (
              <motion.div
                key={diff.title}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                className="group bg-card p-7 rounded-xl shadow-sm hover:shadow-premium hover:-translate-y-0.5 transition-premium border border-border"
              >
                <div className="w-11 h-11 rounded-lg bg-[hsl(var(--primary))] flex items-center justify-center mb-5 text-[hsl(var(--accent))] group-hover:scale-105 transition-transform duration-300">
                  <diff.icon className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold font-heading text-foreground mb-2">{diff.title}</h3>
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
              <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4 text-white">Sobre a Nortis</h2>
              <p className="text-base md:text-lg text-white/75 leading-relaxed mb-6">
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
                className="bg-white/10 p-5 rounded-xl hover:bg-white/15 transition-premium border border-white/10"
              >
                <h3 className="text-lg font-bold font-heading text-[hsl(var(--accent))] mb-1">Missão</h3>
                <p className="text-white/75 text-sm md:text-base">Aprovar pessoas através da educação.</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="bg-white/10 p-5 rounded-xl hover:bg-white/15 transition-premium border border-white/10"
              >
                <h3 className="text-lg font-bold font-heading text-[hsl(var(--accent))] mb-1">Visão</h3>
                <p className="text-white/75 text-sm md:text-base">Ser referência nacional em apostilas digitais para concursos.</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="bg-white/10 p-5 rounded-xl hover:bg-white/15 transition-premium border border-white/10"
              >
                <h3 className="text-lg font-bold font-heading text-[hsl(var(--accent))] mb-1">Valores</h3>
                <p className="text-white/75 text-sm md:text-base">Ética, qualidade, atualização e compromisso com o aluno.</p>
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
              <h2 className="text-2xl md:text-3xl font-bold font-heading text-white mb-2">
                Materiais Gratuitos para Sua Aprovação
              </h2>
              <p className="text-base md:text-lg text-white/75">
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
                  className="bg-white/10 border border-white/15 text-white placeholder:text-white/50 h-11"
                  required
                />
              </div>
              <div>
                <Input
                  type="email"
                  placeholder="Seu melhor e-mail"
                  value={leadForm.email}
                  onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                  className="bg-white/10 border border-white/15 text-white placeholder:text-white/50 h-11"
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
              <h2 className="text-3xl md:text-4xl font-bold font-heading text-white mb-4">Contato</h2>
              <p className="text-base md:text-lg text-white/75 mb-6">
                Ficou com alguma dúvida? Nossa equipe está pronta para ajudar você na sua jornada de estudos.
              </p>

              <div className="space-y-4">
                <div className="flex items-center p-5 bg-white/10 rounded-xl border border-white/10">
                  <MessageSquare className="w-6 h-6 text-[hsl(var(--accent))] mr-4" />
                  <div>
                    <h4 className="font-bold text-white">E-mail</h4>
                    <a href="mailto:contato@nortisconcursos.com.br" className="text-white/75 hover:text-[hsl(var(--accent))] transition-colors">
                      contato@nortisconcursos.com.br
                    </a>
                  </div>
                </div>
                <div className="flex items-center p-5 bg-white/10 rounded-xl border border-white/10">
                  <Headphones className="w-6 h-6 text-[hsl(var(--accent))] mr-4" />
                  <div>
                    <h4 className="font-bold text-white">WhatsApp</h4>
                    <a href="https://wa.me/5561991168987" target="_blank" rel="noopener noreferrer" className="text-white/75 hover:text-[hsl(var(--accent))] transition-colors">
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
              className="bg-white/10 rounded-2xl p-6 lg:p-8 border border-white/10"
            >
              <form onSubmit={handleContactSubmit} className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-white mb-1">Nome completo</label>
                  <Input
                    type="text"
                    placeholder="Seu nome"
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    className="bg-white/10 border border-white/15 text-white placeholder:text-white/50 h-11"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-1">E-mail</label>
                  <Input
                    type="email"
                    placeholder="seu@email.com"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    className="bg-white/10 border border-white/15 text-white placeholder:text-white/50 h-11"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-1">Assunto</label>
                  <Input
                    type="text"
                    placeholder="Assunto da mensagem"
                    value={contactForm.subject}
                    onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                    className="bg-white/10 border border-white/15 text-white placeholder:text-white/50 h-11"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-1">Mensagem</label>
                  <Textarea
                    rows={3}
                    placeholder="Como podemos ajudar?"
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    className="bg-white/10 border border-white/15 text-white placeholder:text-white/50 resize-none p-3"
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
          <h3 className="text-xl md:text-2xl font-bold font-heading text-white mb-1">Próximos Lançamentos</h3>
          <p className="text-sm md:text-base text-white/70">Novas apostilas estão em desenvolvimento.</p>
        </div>
      </section>
    </>
  );
};

export default HomePage;