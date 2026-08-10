// `category` usa o mesmo vocabulário de public.discursive_interest_leads
// (migration 20260810000000_create_discursive_interest_leads.sql):
// 'TDAS' | 'EDAS' | 'AMBOS'. Usado para filtrar as opções de pacote no
// formulário de interesse conforme a categoria escolhida pelo aluno.
export const DISCURSIVA_PACKAGES = [
  {
    id: 'diagnostico',
    name: 'Diagnóstico',
    price: 0,
    audience: 'TDAS e EDAS',
    category: 'AMBOS',
    description: 'Uma primeira leitura orientativa para identificar prioridades de melhoria.',
  },
  {
    id: 'tdas-essencial',
    name: 'TDAS Essencial',
    price: 49.9,
    audience: 'Agente Social e Técnico Administrativo',
    category: 'TDAS',
    description: 'Correção estruturada com foco nos critérios da prova discursiva.',
  },
  {
    id: 'tdas-intensivo',
    name: 'TDAS Intensivo',
    price: 79.9,
    audience: 'Agente Social e Técnico Administrativo',
    category: 'TDAS',
    description: 'Ciclo intensivo para praticar, receber orientação e reescrever.',
  },
  {
    id: 'edas-essencial',
    name: 'EDAS Essencial',
    price: 89.9,
    audience: 'Serviço Social',
    category: 'EDAS',
    description: 'Correção especializada, sujeita à confirmação de disponibilidade pedagógica.',
    availabilityNote: 'Lista de interesse',
  },
  {
    id: 'edas-intensivo',
    name: 'EDAS Intensivo',
    price: 119.9,
    audience: 'Serviço Social',
    category: 'EDAS',
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
