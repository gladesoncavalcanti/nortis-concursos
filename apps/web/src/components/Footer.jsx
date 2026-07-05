import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, Instagram, Linkedin, Facebook, Youtube } from 'lucide-react';
import { NORTIS_WHATSAPP_DISPLAY, NORTIS_WHATSAPP_URL } from '@/config/contact.js';

const Footer = () => {
  return (
    <footer className="nortis-gradient-bg text-primary-foreground border-t border-[hsl(var(--accent))]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-28 md:pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <img
                src="/nortis-emblema-n.jpeg"
                alt="Nortis Concursos Logo"
                className="h-12 w-12 rounded-full object-cover ring-1 ring-[hsl(var(--accent))]/40"
              />
              <span className="flex flex-col leading-none font-heading">
                <span className="text-base font-bold text-white tracking-[0.08em]">NORTIS</span>
                <span className="text-[10px] font-medium text-[hsl(var(--accent))] tracking-[0.28em]">CONCURSOS</span>
              </span>
            </div>
            <p className="text-sm text-white/75 leading-relaxed font-body mb-5">
              O norte da sua aprovação em concursos públicos. Materiais premium, focados e constantemente atualizados para a sua jornada rumo à posse.
            </p>
            <p className="text-xs text-white/50 leading-relaxed">
              Pagamentos processados com segurança pela Asaas · Pix e cartão de crédito.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-lg font-semibold font-heading text-[hsl(var(--accent))] mb-6">Navegação</h3>
            <ul className="space-y-3">
              <li><Link to="/" className="text-sm text-white/80 hover:text-[hsl(var(--accent))] transition-colors duration-200">Home</Link></li>
              <li><Link to="/apostilas" className="text-sm text-white/80 hover:text-[hsl(var(--accent))] transition-colors duration-200">Apostilas</Link></li>
              <li><Link to="/materiais-gratuitos" className="text-sm text-white/80 hover:text-[hsl(var(--accent))] transition-colors duration-200">Materiais Gratuitos</Link></li>
              <li><Link to="/sobre" className="text-sm text-white/80 hover:text-[hsl(var(--accent))] transition-colors duration-200">Sobre</Link></li>
              <li><Link to="/contato" className="text-sm text-white/80 hover:text-[hsl(var(--accent))] transition-colors duration-200">Contato</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold font-heading text-[hsl(var(--accent))] mb-6">Contato</h3>
            <ul className="space-y-4">
              <li>
                <a href="mailto:contato@nortisconcursos.com.br" className="flex items-center text-sm text-white/80 hover:text-[hsl(var(--accent))] transition-colors duration-200 group">
                  <Mail className="w-5 h-5 mr-3 flex-shrink-0 text-[hsl(var(--accent))] group-hover:scale-110 transition-transform" />
                  <span>contato@nortisconcursos.com.br</span>
                </a>
              </li>
              <li>
                <a href={NORTIS_WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="flex items-center text-sm text-white/80 hover:text-[hsl(var(--accent))] transition-colors duration-200 group">
                  <Phone className="w-5 h-5 mr-3 flex-shrink-0 text-[hsl(var(--accent))] group-hover:scale-110 transition-transform" />
                  <span>{NORTIS_WHATSAPP_DISPLAY}</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="text-lg font-semibold font-heading text-[hsl(var(--accent))] mb-6">Redes Sociais</h3>
            <div className="flex flex-wrap gap-4">
              <a href="https://instagram.com/nortisconcursos" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-[hsl(var(--accent))] hover:border-[hsl(var(--accent))] hover:text-[hsl(var(--primary))] transition-all duration-300" aria-label="Instagram">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="https://facebook.com/nortisconcursos" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-[hsl(var(--accent))] hover:border-[hsl(var(--accent))] hover:text-[hsl(var(--primary))] transition-all duration-300" aria-label="Facebook">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="https://linkedin.com/company/nortisconcursos" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-[hsl(var(--accent))] hover:border-[hsl(var(--accent))] hover:text-[hsl(var(--primary))] transition-all duration-300" aria-label="LinkedIn">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="https://youtube.com/@nortisconcursos" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-[hsl(var(--accent))] hover:border-[hsl(var(--accent))] hover:text-[hsl(var(--primary))] transition-all duration-300" aria-label="YouTube">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[hsl(var(--accent))]/20 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-sm text-white/60">
            © 2026 Nortis Concursos – nortisconcursos.com.br – Todos os direitos reservados.
          </p>
          <div className="flex space-x-6">
            <Link to="/politica-privacidade" className="text-sm text-white/60 hover:text-[hsl(var(--accent))] transition-colors duration-200">
              Política de Privacidade
            </Link>
            <Link to="/termos-uso" className="text-sm text-white/60 hover:text-[hsl(var(--accent))] transition-colors duration-200">
              Termos de Uso
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;