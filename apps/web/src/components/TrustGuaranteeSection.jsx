import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, Zap, RotateCcw, Lock, Headphones, Smartphone, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';

/**
 * "Compra segura, acesso imediato e suporte" (Fase 13) — seção de
 * confiança/garantia, estilo Executive Minimal Dark.
 *
 * O card de garantia usa linguagem alinhada à Política de Reembolso
 * REAL já publicada em /termos-uso (TermosUsoPage.jsx, item 3:
 * "Garantimos a devolução integral do valor pago em até 7 (sete) dias
 * após a compra, conforme o Código de Defesa do Consumidor"). Não é
 * uma promessa nova — só reflete o que já está documentado no site.
 *
 * Nenhum depoimento, avaliação, nota (ex: 4,9/5) ou número de alunos é
 * usado — nenhum desses dados existe de forma real no projeto.
 */
const TRUST_CARDS = [
  {
    icon: ShieldCheck,
    title: 'Pagamento seguro',
    description: 'Processamento via Asaas, com opções de Pix e cartão, conforme disponibilidade no checkout.',
  },
  {
    icon: Zap,
    title: 'Acesso imediato',
    description: 'Após a confirmação do pagamento, o acesso ao material digital é liberado conforme o fluxo da plataforma.',
  },
  {
    icon: RotateCcw,
    title: 'Garantia de 7 dias',
    description: 'Garantia de 7 dias para solicitar reembolso, conforme as condições de compra descritas nos Termos de Uso.',
  },
  {
    icon: Lock,
    title: 'Privacidade dos dados',
    description: 'Seus dados são utilizados apenas para cadastro, entrega, suporte e comunicações relacionadas, conforme a Política de Privacidade.',
  },
  {
    icon: Headphones,
    title: 'Suporte ao aluno',
    description: 'Em caso de dúvida sobre acesso, pagamento ou material, você pode falar com a equipe Nortis pelos canais oficiais.',
  },
  {
    icon: Smartphone,
    title: 'Produto digital',
    description: 'Material em PDF digital, ideal para estudar no computador, tablet ou celular.',
  },
];

const TrustGuaranteeSection = () => (
  <section
    className="relative overflow-hidden section-seamless"
    style={{
      background:
        'radial-gradient(circle at 8% 10%, rgba(211,165,47,0.08) 0%, transparent 30%), linear-gradient(90deg, #071622 0%, #071522 45%, #06121f 100%)',
    }}
  >
    <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
      <div className="text-center mb-10">
        <h2
          className="text-2xl md:text-3xl font-bold mb-3"
          style={{ fontFamily: 'Georgia, "Times New Roman", serif', color: '#f4efe4' }}
        >
          Compra segura, acesso imediato e suporte
        </h2>
        <p className="text-sm md:text-base text-[#f4efe4]/65 leading-relaxed max-w-2xl mx-auto">
          Tudo pensado para que você compre com tranquilidade e comece sua preparação sem
          complicação.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {TRUST_CARDS.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: index * 0.05 }}
            className="rounded-xl p-5"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(211,165,47,0.22)' }}
          >
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
              style={{ background: 'rgba(211,165,47,0.12)', border: '1px solid rgba(211,165,47,0.3)' }}
            >
              <card.icon className="w-4 h-4" style={{ color: '#f1c85b' }} />
            </div>
            <h3 className="text-sm font-semibold text-[#f4efe4] mb-1.5">{card.title}</h3>
            <p className="text-xs sm:text-sm text-[#f4efe4]/60 leading-relaxed">{card.description}</p>
          </motion.div>
        ))}
      </div>

      <p className="text-xs text-[#f4efe4]/40 text-center max-w-2xl mx-auto mb-10 leading-relaxed">
        Sem promessa de aprovação. O resultado depende da dedicação do candidato, do edital, da
        banca e da rotina de estudos.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link to="/apostilas">
          <Button className="w-full sm:w-auto h-11 px-8 font-bold bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] hover:bg-[hsl(var(--accent))]/90 transition-premium">
            <ShoppingCart className="w-4 h-4 mr-2" />
            Comprar com segurança
          </Button>
        </Link>
        <Link to="/politica-privacidade">
          <Button
            variant="outline"
            className="w-full sm:w-auto h-11 px-8 font-semibold text-sm border-white/25 text-[#f4efe4] bg-transparent hover:bg-white/10 hover:text-[#f4efe4] transition-premium"
          >
            Ver política de privacidade
          </Button>
        </Link>
      </div>
    </div>
  </section>
);

export default TrustGuaranteeSection;
