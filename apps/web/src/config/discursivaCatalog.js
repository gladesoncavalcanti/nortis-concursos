export const DISCURSIVA_PACKAGES = [
  {
    id: 'diagnostico',
    name: 'Diagnóstico',
    price: 0,
    audience: 'TDAS e EDAS',
    description: 'Uma primeira leitura orientativa para identificar prioridades de melhoria.',
  },
  {
    id: 'tdas-essencial',
    name: 'TDAS Essencial',
    price: 49.9,
    audience: 'Agente Social e Técnico Administrativo',
    description: 'Correção estruturada com foco nos critérios da prova discursiva.',
  },
  {
    id: 'tdas-intensivo',
    name: 'TDAS Intensivo',
    price: 79.9,
    audience: 'Agente Social e Técnico Administrativo',
    description: 'Ciclo intensivo para praticar, receber orientação e reescrever.',
  },
  {
    id: 'edas-essencial',
    name: 'EDAS Essencial',
    price: 89.9,
    audience: 'Serviço Social',
    description: 'Correção especializada, sujeita à confirmação de disponibilidade pedagógica.',
    availabilityNote: 'Lista de interesse',
  },
  {
    id: 'edas-intensivo',
    name: 'EDAS Intensivo',
    price: 119.9,
    audience: 'Serviço Social',
    description: 'Ciclo intensivo especializado, sujeito à confirmação de disponibilidade pedagógica.',
    availabilityNote: 'Lista de interesse',
  },
];

export const formatDiscursivaPrice = (price) =>
  price === 0
    ? 'Gratuito'
    : new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(price);
