import React from 'react';
import { MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { NORTIS_WHATSAPP_URL } from '@/config/contact.js';

const FloatingWhatsAppButton = () => {
  return (
    <motion.a
      href={NORTIS_WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] rounded-full shadow-lg flex items-center justify-center hover:brightness-110 transition-all duration-300 hover:scale-110 active:scale-95 ring-4 ring-[hsl(var(--secondary))]/30"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.5 }}
      whileHover={{ y: -4 }}
      aria-label="Fale com a Nortis pelo WhatsApp"
    >
      <MessageCircle className="w-7 h-7" />
      <motion.div
        className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-[hsl(var(--secondary))]"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </motion.a>
  );
};

export default FloatingWhatsAppButton;