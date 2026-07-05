import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MessageCircleQuestion,
  Megaphone,
  CalendarClock,
  HelpCircle,
  Lock,
  CheckCircle2,
  ShoppingCart,
  Gift,
} from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';

/**
 * "Comunidade Nortis" (Fase 15) — prévia institucional/visual, sem
 * fórum real, sem backend, sem Supabase. Nenhum número de membros,
 * evento real ou canal de WhatsApp é usado aqui: o projeto já possui
 * um número de WhatsApp em Contato/Home/Footer, mas há uma divergência
 * entre esse número e o do FloatingWhatsAppButton — por segurança,
 * nenhum link direto de WhatsApp é usado nesta seção, apenas o texto
 * conservador "suporte pelos canais oficiais".
 */
const COMMUNITY_BLOCKS = [
  {
    icon: MessageCircleQuestion,
    title: 'Tire suas dúvidas',
    description: 'Espaço preparado para dúvidas sobre acesso, material e orientação de uso da apostila.',
    status: 'Em estruturação',
  },
  {
    icon: Megaphone,
    title: 'Grupo de acompanhamento',
    description: 'Canal futuro para comunicados, orientações gerais e avisos importantes.',
    status: 'Canal oficial em definição',
  },
  {
    icon: CalendarClock,
    title: 'Eventos e aulões',
    description: 'Área planejada para divulgar encontros, lives ou revisões, caso sejam disponibilizados.',
    status: 'Aguardando programação',
  },
  {
    icon: HelpCircle,
    title: 'Perguntas frequentes',
    description: 'Organização futura das dúvidas mais comuns sobre compra, acesso e uso do material.',
    status: 'Em breve',
  },
];

const FAQ_HIGHLIGHTS = [
  'Como acessar o PDF após a compra?',
  'A apostila terá atualização até a prova?',
  'Como usar os mapas mentais na revisão?',
  'Posso estudar pelo celular?',
];

const TREATMENT_ITEMS = [
  'Comunicação por canais oficiais.',
  'Sem promessa de aprovação.',
  'Orientações gerais de estudo e uso do material.',
  'Respeito à privacidade dos participantes.',
  'Informações oficiais sempre conferidas nos canais do concurso.',
];

const CommunityPreviewSection = () => (
  <section
    className="relative overflow-hidden section-seamless"
    style={{
      background:
        'radial-gradient(circle at 12% 88%, rgba(211,165,47,0.08) 0%, transparent 30%), linear-gradient(90deg, #071622 0%, #071522 45%, #06121f 100%)',
    }}
  >
    <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
      <div className="text-center mb-3">
        <h2
          className="text-2xl md:text-3xl font-bold mb-3"
          style={{ fontFamily: 'Georgia, "Times New Roman", serif', color: '#f4efe4' }}
        >
          Comunidade Nortis
        </h2>
        <p className="text-sm md:text-base text-[#f4efe4]/65 leading-relaxed max-w-2xl mx-auto">
          Um espaço pensado para aproximar alunos, dúvidas e orientações de estudo, com foco em
          preparação organizada e responsável.
        </p>
      </div>
      <p className="text-xs text-[#f4efe4]/40 italic text-center mb-10">
        Prévia institucional. Funcionalidades de comunidade serão disponibilizadas apenas quando os
        canais oficiais estiverem ativos.
      </p>

      {/* 4 blocos de comunidade — demonstrativos */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {COMMUNITY_BLOCKS.map((block, index) => (
          <motion.div
            key={block.title}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: index * 0.05 }}
            className="rounded-xl p-5 flex flex-col"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(211,165,47,0.22)' }}
          >
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
              style={{ background: 'rgba(211,165,47,0.12)', border: '1px solid rgba(211,165,47,0.3)' }}
            >
              <block.icon className="w-4 h-4" style={{ color: '#f1c85b' }} />
            </div>
            <h3 className="text-sm font-semibold text-[#f4efe4] mb-1.5">{block.title}</h3>
            <p className="text-xs sm:text-sm text-[#f4efe4]/60 leading-relaxed mb-3 flex-grow">
              {block.description}
            </p>
            <span
              className="inline-block w-fit text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full"
              style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(244,239,228,0.6)', border: '1px solid rgba(255,255,255,0.12)' }}
            >
              {block.status}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Mini painel estilo fórum — apenas demonstrativo */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.35 }}
        className="rounded-2xl p-6 md:p-8 mb-6"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(211,165,47,0.22)' }}
      >
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h3 className="text-base font-semibold text-[#f4efe4]">Dúvidas em destaque</h3>
          <span
            className="text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full"
            style={{ background: 'rgba(211,165,47,0.15)', color: '#f1c85b', border: '1px solid rgba(211,165,47,0.35)' }}
          >
            Exemplo de organização
          </span>
        </div>
        <ul className="space-y-2.5">
          {FAQ_HIGHLIGHTS.map((question) => (
            <li
              key={question}
              className="text-sm text-[#f4efe4]/75 py-2.5 px-3 rounded-lg"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              {question}
            </li>
          ))}
        </ul>
      </motion.div>

      {/* Bloco de transparência */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.35 }}
        className="rounded-2xl p-6 md:p-8 mb-10"
        style={{ background: 'rgba(211,165,47,0.06)', border: '1px solid rgba(211,165,47,0.3)' }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Lock className="w-4 h-4" style={{ color: '#f1c85b' }} />
          <h3 className="text-base font-semibold text-[#f4efe4]">Como a comunidade será conduzida</h3>
        </div>
        <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-2">
          {TREATMENT_ITEMS.map((item) => (
            <li key={item} className="flex items-start text-sm text-[#f4efe4]/75">
              <CheckCircle2 className="w-4 h-4 mr-2 mt-0.5 shrink-0" style={{ color: '#f1c85b' }} />
              {item}
            </li>
          ))}
        </ul>
      </motion.div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link to="/apostilas">
          <Button className="w-full sm:w-auto h-11 px-8 font-bold bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] hover:bg-[hsl(var(--accent))]/90 transition-premium">
            <ShoppingCart className="w-4 h-4 mr-2" />
            Conhecer a apostila
          </Button>
        </Link>
        <Link to="/#preview-apostila">
          <Button
            variant="outline"
            className="w-full sm:w-auto h-11 px-8 font-semibold text-sm border-white/25 text-[#f4efe4] bg-transparent hover:bg-white/10 hover:text-[#f4efe4] transition-premium"
          >
            <Gift className="w-4 h-4 mr-2" />
            Receber amostra gratuita
          </Button>
        </Link>
      </div>
    </div>
  </section>
);

export default CommunityPreviewSection;
