import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Scale, Target, HeartHandshake, Brain, ArrowRight, CheckCircle2, ShoppingCart, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';

/**
 * "Conteúdo estratégico para estudar com direção" (Fase 12) — seção
 * editorial estática, sem CMS, sem tabela nova, sem rota /blog. Os
 * cards menores são chamadas editoriais (título + categoria), não
 * artigos completos — nenhum deles linka para uma página de artigo
 * que ainda não existe. Nenhuma data, notícia ou informação de edital
 * é mencionada; o tom evita afirmar "cai na prova", preferindo termos
 * como "merece atenção" e "ajuda a organizar a revisão".
 */
const FEATURED_ARTICLE = {
  category: 'Legislação Social',
  title: 'LOAS e SUAS: pontos que merecem atenção na preparação para SEDES-DF',
  summary:
    'Um guia introdutório sobre como organizar a revisão de conceitos, competências e benefícios socioassistenciais sem perder o foco na banca.',
};

const SMALLER_ARTICLES = [
  {
    icon: Target,
    category: 'Banca',
    title: 'Como a banca Quadrix costuma exigir atenção do candidato',
  },
  {
    icon: Scale,
    category: 'Legislação',
    title: 'ECA: temas que devem entrar na revisão final',
  },
  {
    icon: HeartHandshake,
    category: 'DF Social',
    title: 'Programas sociais do DF: organize sua revisão',
  },
  {
    icon: Brain,
    category: 'Método Nortis',
    title: 'Mapas mentais e questões comentadas: como usar na reta final',
  },
];

const TAGS = ['LOAS/SUAS', 'ECA', 'Quadrix', 'Programas Sociais do DF', 'Mapas Mentais', 'Questões Comentadas', 'Revisão Final'];

const PRODUCT_BULLETS = ['Banca Quadrix', '741 páginas', 'PDF digital'];

const AuthorityBlogSection = () => (
  <section
    className="relative overflow-hidden section-seamless"
    style={{
      background:
        'radial-gradient(circle at 92% 90%, rgba(211,165,47,0.08) 0%, transparent 30%), linear-gradient(90deg, #071622 0%, #071522 45%, #06121f 100%)',
    }}
  >
    <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
      <div className="text-center mb-3">
        <h2
          className="text-2xl md:text-3xl font-bold mb-3"
          style={{ fontFamily: 'Georgia, "Times New Roman", serif', color: '#f4efe4' }}
        >
          Conteúdo estratégico para estudar com direção
        </h2>
        <p className="text-sm md:text-base text-[#f4efe4]/65 leading-relaxed max-w-2xl mx-auto">
          Guias, análises e materiais de apoio para quem quer entender os pontos mais relevantes do
          concurso SEDES-DF 2026 com foco na banca Quadrix.
        </p>
      </div>
      <p className="text-xs text-[#f4efe4]/40 italic text-center mb-10">
        Conteúdos informativos. As atualizações oficiais devem ser sempre conferidas nos canais do
        concurso e no edital.
      </p>

      {/* Artigo em destaque */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.35 }}
        className="rounded-2xl p-6 md:p-8 mb-6"
        style={{ background: 'rgba(211,165,47,0.06)', border: '1px solid rgba(211,165,47,0.3)' }}
      >
        <span
          className="inline-block text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full mb-3"
          style={{ background: 'rgba(211,165,47,0.15)', color: '#f1c85b', border: '1px solid rgba(211,165,47,0.35)' }}
        >
          {FEATURED_ARTICLE.category}
        </span>
        <h3 className="text-lg md:text-xl font-semibold text-[#f4efe4] mb-3 leading-snug max-w-2xl">
          {FEATURED_ARTICLE.title}
        </h3>
        <p className="text-sm text-[#f4efe4]/65 leading-relaxed max-w-2xl mb-5">{FEATURED_ARTICLE.summary}</p>
        <Link to="/#preview-apostila">
          <Button
            variant="outline"
            className="h-10 px-6 font-semibold text-sm border-white/25 text-[#f4efe4] bg-transparent hover:bg-white/10 hover:text-[#f4efe4] transition-premium"
          >
            Ver material recomendado
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </motion.div>

      {/* Cards menores — chamadas editoriais, não artigos completos */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {SMALLER_ARTICLES.map((article, index) => (
          <motion.div
            key={article.title}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: index * 0.05 }}
            className="rounded-xl p-5"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <div className="flex items-center gap-2 mb-3">
              <article.icon className="w-4 h-4" style={{ color: '#f1c85b' }} />
              <span
                className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(244,239,228,0.6)' }}
              >
                {article.category}
              </span>
            </div>
            <p className="text-sm text-[#f4efe4]/85 leading-snug font-medium">{article.title}</p>
          </motion.div>
        ))}
      </div>

      {/* Tags/categorias */}
      <div className="flex flex-wrap justify-center gap-2 mb-12">
        {TAGS.map((tag) => (
          <span
            key={tag}
            className="text-[11px] font-medium px-3 py-1.5 rounded-full"
            style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(244,239,228,0.55)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Card da apostila + CTA final */}
      <div className="grid md:grid-cols-[1fr_auto] gap-6 items-center rounded-2xl p-6 md:p-8" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(211,165,47,0.22)' }}>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#f4efe4]/55 mb-2 flex items-center gap-2">
            <BookOpen className="w-3.5 h-3.5" style={{ color: '#f1c85b' }} />
            Nexo Social — SEDES-DF 2026
          </p>
          <div className="flex flex-wrap gap-4 mb-3">
            {PRODUCT_BULLETS.map((item) => (
              <span key={item} className="flex items-center text-sm text-[#f4efe4]/75">
                <CheckCircle2 className="w-4 h-4 mr-1.5 shrink-0" style={{ color: '#f1c85b' }} />
                {item}
              </span>
            ))}
          </div>
          <span className="text-2xl font-bold text-[#f4efe4] tracking-tight">R$ 29,90</span>
          <p className="text-xs text-[#f4efe4]/45 mt-1">
            Promoção de lançamento · de <span className="line-through">R$ 69,90</span> por R$ 29,90
          </p>
        </div>
        <div className="flex flex-col sm:flex-row md:flex-col gap-3">
          <Link to="/product/nexo-social-sedes-df-2026">
            <Button
              className="w-full h-11 font-semibold text-sm rounded-sm text-[#f1c85b] hover:text-[#f1c85b] transition-premium"
              style={{ border: '1px solid #d3a52f', background: 'rgba(211,165,47,0.08)' }}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Comprar apostila
            </Button>
          </Link>
        </div>
      </div>

      <div className="text-center mt-10">
        <Link to="/product/nexo-social-sedes-df-2026">
          <Button className="h-11 px-8 font-bold bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] hover:bg-[hsl(var(--accent))]/90 transition-premium">
            Estudar com o material completo
          </Button>
        </Link>
      </div>
    </div>
  </section>
);

export default AuthorityBlogSection;
