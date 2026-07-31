import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Download, Eye, MapPin, Gift, MessageCircle, Instagram, Facebook, Linkedin, Youtube } from 'lucide-react';
import FreeSampleModal from '@/components/FreeSampleModal.jsx';
import { NORTIS_WHATSAPP_DISPLAY, NORTIS_WHATSAPP_URL } from '@/config/contact.js';

/**
 * /comece-aqui (Sprint Social 1) — página mobile-first para uso como
 * link da bio (Instagram/TikTok/YouTube). Só aponta para páginas e
 * canais que já existem de fato no projeto — nenhuma rede social
 * fictícia, nenhum link "#".
 */
const LINKS = [
  { label: 'Amostra gratuita', icon: Download, kind: 'sample' },
  { label: 'Ver a apostila por dentro', icon: Eye, kind: 'link', to: '/#preview-apostila' },
  { label: 'Guia SEDES-DF 2026', icon: MapPin, kind: 'link', to: '/sedes-df-2026' },
  { label: 'Materiais gratuitos', icon: Gift, kind: 'link', to: '/materiais-gratuitos' },
  { label: 'Falar no WhatsApp', icon: MessageCircle, kind: 'external', href: NORTIS_WHATSAPP_URL },
];

// Mesmas URLs já publicadas no Footer do site — nenhuma rede nova
// inventada aqui, só reaproveitadas.
const SOCIAL_LINKS = [
  { icon: Instagram, href: 'https://instagram.com/nortisconcursos', label: 'Instagram' },
  { icon: Facebook, href: 'https://facebook.com/nortisconcursos', label: 'Facebook' },
  { icon: Linkedin, href: 'https://linkedin.com/company/nortisconcursos', label: 'LinkedIn' },
  { icon: Youtube, href: 'https://youtube.com/@nortisconcursos', label: 'YouTube' },
];

const ComeceAquiPage = () => {
  const [isSampleModalOpen, setIsSampleModalOpen] = useState(false);

  return (
    <>
      <Helmet>
        <title>Comece aqui | Nortis Concursos</title>
        <meta
          name="description"
          content="Todos os links da Nortis Concursos em um só lugar: amostra gratuita, guia SEDES-DF 2026, materiais gratuitos e WhatsApp."
        />
        <link rel="canonical" href="https://www.nortisconcursos.com.br/comece-aqui" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Comece aqui | Nortis Concursos" />
        <meta
          property="og:description"
          content="Todos os links da Nortis Concursos em um só lugar: amostra gratuita, guia SEDES-DF 2026, materiais gratuitos e WhatsApp."
        />
        <meta property="og:url" content="https://www.nortisconcursos.com.br/comece-aqui" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Comece aqui | Nortis Concursos" />
        <meta
          name="twitter:description"
          content="Todos os links da Nortis Concursos em um só lugar: amostra gratuita, guia SEDES-DF 2026, materiais gratuitos e WhatsApp."
        />
      </Helmet>

      <div
        className="min-h-[calc(100vh-4rem)] py-12 md:py-16"
        style={{
          background:
            'radial-gradient(circle at 50% 0%, rgba(211,165,47,0.12) 0%, transparent 42%), linear-gradient(180deg, #071622 0%, #071522 45%, #06121f 100%)',
        }}
      >
        <div className="max-w-md mx-auto px-5">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8"
          >
            <img
              src="/nortis-emblema-n.jpeg"
              alt="Nortis Concursos"
              className="h-16 w-16 rounded-full object-cover ring-1 ring-[hsl(var(--accent))]/50 mx-auto mb-4"
            />
            <h1
              className="text-2xl font-bold mb-2"
              style={{ fontFamily: 'Georgia, "Times New Roman", serif', color: '#f4efe4' }}
            >
              Nortis Concursos
            </h1>
            <p className="text-sm text-[#f4efe4]/70 leading-relaxed">
              Preparação estratégica para o SEDES-DF 2026 — Método Nortis, banca Quadrix.
            </p>
          </motion.div>

          <div className="space-y-3 mb-10">
            {LINKS.map((item, index) => {
              const commonClass =
                'w-full flex items-center gap-3 h-14 px-5 rounded-xl text-sm font-semibold text-[#f4efe4] transition-premium hover:-translate-y-0.5';
              const commonStyle = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(211,165,47,0.28)' };

              const content = (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: index * 0.05 }}
                  className={commonClass}
                  style={commonStyle}
                >
                  <item.icon className="w-5 h-5 shrink-0" style={{ color: '#f1c85b' }} />
                  {item.label}
                </motion.div>
              );

              if (item.kind === 'sample') {
                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => setIsSampleModalOpen(true)}
                    className="block w-full text-left"
                  >
                    {content}
                  </button>
                );
              }

              if (item.kind === 'external') {
                return (
                  <a key={item.label} href={item.href} target="_blank" rel="noopener noreferrer" className="block">
                    {content}
                  </a>
                );
              }

              return (
                <Link key={item.label} to={item.to} className="block">
                  {content}
                </Link>
              );
            })}
          </div>

          <div className="text-center mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] mb-4" style={{ color: '#f1c85b' }}>
              Acompanhe a Nortis
            </p>
            <div className="flex items-center justify-center gap-4">
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-[#f4efe4] hover:text-[hsl(var(--primary))] hover:bg-[#f1c85b] transition-all duration-300"
                  style={{ border: '1px solid rgba(255,255,255,0.2)' }}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          <p className="text-center text-[11px] text-[#f4efe4]/45 leading-relaxed">
            Nortis Concursos está em fase de pré-lançamento. Acompanhe as novidades e receba
            conteúdo gratuito enquanto a preparação para o SEDES-DF 2026 avança.
          </p>
        </div>
      </div>

      <FreeSampleModal isOpen={isSampleModalOpen} onClose={() => setIsSampleModalOpen(false)} />
    </>
  );
};

export default ComeceAquiPage;
