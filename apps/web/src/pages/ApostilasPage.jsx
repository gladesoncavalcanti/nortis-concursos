import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import ProductsList from '@/components/ProductsList.jsx';
import ProductFeaturesSection from '@/components/ProductFeaturesSection.jsx';
import { Button } from '@/components/ui/button.jsx';

const ApostilasPage = () => {
  return (
    <>
      <Helmet>
        <title>Apostilas - NORTIS CONCURSOS</title>
        <meta name="description" content="Catálogo completo de apostilas premium para concursos públicos. Encontre o material ideal para sua aprovação." />
      </Helmet>

      <div className="min-h-screen bg-background pb-24">
        {/* Premium Page Header */}
        <section className="bg-[hsl(var(--primary))] py-16 md:py-20 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl md:text-5xl font-bold font-heading text-white mb-4 tracking-tight">
                Nossas Apostilas
              </h1>
              <div className="h-1 w-20 bg-[hsl(var(--accent))] mx-auto rounded-full mb-6"></div>
              <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto font-body font-light">
                Materiais completos, elaborados por especialistas e focados nas especificidades das principais bancas examinadoras.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Conheça o Que Você Recebe — substitui a antiga imagem composta
            (desfocada no mobile e com contagem de páginas errada) por uma
            seção real em HTML/CSS. */}
        <ProductFeaturesSection />

        <section className="pb-16 bg-background section-seamless w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col sm:flex-row justify-center items-center gap-4 max-w-2xl mx-auto px-4"
          >
            <Link to="/materiais-gratuitos" className="w-full sm:w-auto">
              <Button className="w-full bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] hover:bg-[hsl(var(--accent))]/90 font-bold px-8 py-6 text-base transition-premium shadow-md hover:shadow-lg hover:-translate-y-1">
                Solicitar Amostra Premium
              </Button>
            </Link>
            <Link to="/apostilas" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full border-2 border-[hsl(var(--accent))] text-[hsl(var(--accent))] bg-transparent hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))] font-bold px-8 py-6 text-base transition-premium shadow-sm hover:shadow-md hover:-translate-y-1">
                Conheça nosso método
              </Button>
            </Link>
          </motion.div>
        </section>

        {/* Store Grid Section */}
        <section className="pt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ProductsList />
          </div>
        </section>
      </div>
    </>
  );
};

export default ApostilasPage;