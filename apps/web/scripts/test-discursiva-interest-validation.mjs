#!/usr/bin/env node
// Teste isolado da validação client-side do cadastro de interesse da
// Sprint Discursiva (fatia vertical 2).
//
// Diferente de test-supabase-connection.mjs / test-products-adapter.mjs,
// este script NÃO faz nenhuma chamada de rede — testa só a função pura
// validateDiscursivaInterestForm, exportada por
// apps/web/src/api/discursivaInterestValidation.js (módulo sem nenhum
// import, para não depender do alias @/ do Vite). Isso é intencional: o CLI do
// Supabase e o Docker não estavam disponíveis no ambiente em que este
// script foi escrito, então não foi possível subir um Postgres local
// para testar o INSERT e a RLS de ponta a ponta (ver relatório da
// implementação). A garantia real contra dado inválido é o CHECK
// constraint da migration 20260810000000_create_discursive_interest_leads.sql,
// não esta validação — este script cobre só a camada de UX.
//
// Roda via:
//   node apps/web/scripts/test-discursiva-interest-validation.mjs
// ou:
//   npm run test:discursiva-interest --prefix apps/web

import {
  validateDiscursivaInterestForm,
  EMPTY_DISCURSIVA_INTEREST_FORM,
} from '../src/api/discursivaInterestValidation.js';

let failures = 0;

function assert(condition, message) {
  if (!condition) {
    console.error(`✗ FALHOU: ${message}`);
    failures += 1;
    return;
  }
  console.log(`✓ ${message}`);
}

function hasNoErrors(form) {
  return Object.keys(validateDiscursivaInterestForm(form)).length === 0;
}

console.log('\nValidando validateDiscursivaInterestForm...\n');

// Formulário vazio: todos os campos obrigatórios devem falhar.
const emptyErrors = validateDiscursivaInterestForm(EMPTY_DISCURSIVA_INTEREST_FORM);
assert(Object.keys(emptyErrors).length > 0, 'formulário vazio é rejeitado');
assert(Boolean(emptyErrors.name), 'nome vazio é rejeitado');
assert(Boolean(emptyErrors.email), 'e-mail vazio é rejeitado');
assert(Boolean(emptyErrors.whatsapp), 'whatsapp vazio é rejeitado');
assert(Boolean(emptyErrors.category), 'categoria vazia é rejeitada');
assert(Boolean(emptyErrors.specialty), 'especialidade vazia é rejeitada');
assert(Boolean(emptyErrors.packageInterest), 'pacote vazio é rejeitado');
assert(Boolean(emptyErrors.consent), 'consentimento ausente é rejeitado');

// E-mail com formato inválido.
assert(
  Boolean(
    validateDiscursivaInterestForm({
      ...EMPTY_DISCURSIVA_INTEREST_FORM,
      email: 'nao-e-um-email',
    }).email
  ),
  'e-mail sem formato válido é rejeitado'
);

// WhatsApp curto demais (menos de 10 dígitos).
assert(
  Boolean(
    validateDiscursivaInterestForm({
      ...EMPTY_DISCURSIVA_INTEREST_FORM,
      whatsapp: '123',
    }).whatsapp
  ),
  'whatsapp com poucos dígitos é rejeitado'
);

// Especialidade incompatível com a categoria (TDAS não aceita
// servico_social — regra de produto: TDAS e EDAS nunca se misturam).
assert(
  Boolean(
    validateDiscursivaInterestForm({
      ...EMPTY_DISCURSIVA_INTEREST_FORM,
      category: 'TDAS',
      specialty: 'servico_social',
    }).specialty
  ),
  'especialidade de EDAS é rejeitada quando a categoria é TDAS'
);
assert(
  Boolean(
    validateDiscursivaInterestForm({
      ...EMPTY_DISCURSIVA_INTEREST_FORM,
      category: 'EDAS',
      specialty: 'agente_social',
    }).specialty
  ),
  'especialidade de TDAS é rejeitada quando a categoria é EDAS'
);

// Pacotes também são vinculados à categoria no cliente e no banco.
assert(
  Boolean(
    validateDiscursivaInterestForm({
      ...EMPTY_DISCURSIVA_INTEREST_FORM,
      category: 'TDAS',
      specialty: 'agente_social',
      packageInterest: 'edas-essencial',
    }).packageInterest
  ),
  'pacote de EDAS é rejeitado quando a categoria é TDAS'
);
assert(
  Boolean(
    validateDiscursivaInterestForm({
      ...EMPTY_DISCURSIVA_INTEREST_FORM,
      category: 'EDAS',
      specialty: 'servico_social',
      packageInterest: 'pacote-inexistente',
    }).packageInterest
  ),
  'id de pacote desconhecido é rejeitado'
);

// Formulário completo e válido — TDAS / Agente Social.
assert(
  hasNoErrors({
    name: 'Maria Teste',
    email: 'maria@example.com',
    whatsapp: '(61) 99999-8888',
    category: 'TDAS',
    specialty: 'agente_social',
    packageInterest: 'tdas-essencial',
    consent: true,
  }),
  'formulário TDAS/Agente Social completo e válido é aceito'
);

// Formulário completo e válido — EDAS / Serviço Social.
assert(
  hasNoErrors({
    name: 'João Teste',
    email: 'joao@example.com',
    whatsapp: '61999998888',
    category: 'EDAS',
    specialty: 'servico_social',
    packageInterest: 'edas-essencial',
    consent: true,
  }),
  'formulário EDAS/Serviço Social completo e válido é aceito'
);

// Formulário válido sem consentimento — deve ser rejeitado mesmo com
// todo o resto correto (consentimento nunca é opcional).
assert(
  !hasNoErrors({
    name: 'Ana Teste',
    email: 'ana@example.com',
    whatsapp: '61999998888',
    category: 'TDAS',
    specialty: 'tecnico_administrativo',
    packageInterest: 'diagnostico',
    consent: false,
  }),
  'formulário sem consentimento é rejeitado mesmo com todo o resto válido'
);

console.log();
if (failures > 0) {
  console.error(`${failures} verificação(ões) falharam.\n`);
  process.exit(1);
}

console.log('Todas as validações passaram.\n');
