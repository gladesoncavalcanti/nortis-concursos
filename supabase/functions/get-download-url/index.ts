// get-download-url
//
// Gera uma signed URL de curta duração (300s) para o PDF de um produto
// ao qual o usuário autenticado tem um enrollment ativo. Exige conta
// autenticada — não há caminho de convidado para download (decisão de
// arquitetura: checkout sempre com conta).
//
// Dois clientes Supabase com privilégios distintos:
//   - userClient: chave anon + o JWT recebido. Toda consulta a
//     `enrollments` passa pela RLS real (policy enrollments_self);
//     nunca lê pdf_path, nunca gera signed URL.
//   - adminClient: service_role, instanciado só DEPOIS que o
//     enrollment já foi autorizado pelo userClient. Usado
//     exclusivamente para ler products.pdf_path e chamar
//     storage.createSignedUrl — nunca decide se o enrollment pertence
//     ao usuário.
//
// Segurança (não negociável):
// - Identidade do comprador vem exclusivamente do JWT
//   (userClient.auth.getUser(token)) — um eventual `user_id` no corpo
//   da requisição é rejeitado (ver validação de payload abaixo), nunca
//   lido.
// - products.active NÃO é usado para decidir a entrega: active
//   controla vitrine/checkout, não deve revogar o acesso de quem já
//   tem enrollment ativo a um produto retirado do catálogo.
// - pdf_path, bucket, project ref, detalhes de banco/Storage, stack
//   trace e secrets nunca aparecem na resposta nem em log.
// - Nenhuma URL pública permanente é criada; cada chamada gera uma
//   signed URL nova, nunca reaproveitada.
// - Nada é gravado em public.downloads nesta fase.
//
// Secrets necessários (já disponíveis automaticamente, nenhum novo):
//   SUPABASE_URL
//   SUPABASE_ANON_KEY
//   SUPABASE_SERVICE_ROLE_KEY
//
// Versão do supabase-js fixada nesta function (2.110.0 — mesma versão
// resolvida em package-lock.json para o frontend) para garantir que
// `createSignedUrl(path, expiresIn, { download: true })` funciona
// exatamente como testado; as demais Edge Functions do projeto não
// foram alteradas.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.110.0';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

const SIGNED_URL_TTL_SECONDS = 300;

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Origens de navegador autorizadas a chamar esta function.
const ALLOWED_ORIGIN_PATTERNS = [
  /^https:\/\/nortisconcursos\.com\.br$/,
  /^https:\/\/www\.nortisconcursos\.com\.br$/,
  /^https:\/\/nortis-concursos-[a-z0-9-]+-gladesoncavalcantis-projects\.vercel\.app$/,
];

type OriginStatus = 'allowed' | 'none' | 'blocked';

// 'allowed' -> origem reconhecida, ecoada de volta no header.
// 'none'    -> sem header Origin (chamada não-navegador, ex.: CLI).
// 'blocked' -> Origin presente mas não reconhecida.
function classifyOrigin(origin: string | null): OriginStatus {
  if (!origin) return 'none';
  return ALLOWED_ORIGIN_PATTERNS.some((re) => re.test(origin)) ? 'allowed' : 'blocked';
}

function buildCorsHeaders(origin: string | null, originStatus: OriginStatus) {
  const headers: Record<string, string> = { Vary: 'Origin' };
  if (originStatus === 'allowed' && origin) {
    // Nunca usar '*' nem o literal 'null' — sempre a origem exata.
    headers['Access-Control-Allow-Origin'] = origin;
    headers['Access-Control-Allow-Headers'] = 'authorization, x-client-info, apikey, content-type';
    headers['Access-Control-Allow-Methods'] = 'POST, OPTIONS';
  }
  return headers;
}

function jsonResponse(body: unknown, status: number, cors: Record<string, string>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}

Deno.serve(async (req) => {
  const origin = req.headers.get('Origin');
  const originStatus = classifyOrigin(origin);
  const cors = buildCorsHeaders(origin, originStatus);

  // Preflight: responde só com os headers de CORS quando a origem é
  // reconhecida. Nenhuma verificação de autenticação é necessária aqui
  // — navegadores nunca enviam Authorization no preflight.
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: cors });
  }

  // Origem de navegador presente e não reconhecida: recusada antes de
  // qualquer outra checagem. CORS não substitui autenticação — isto é
  // uma camada adicional contra abuso vindo de páginas de terceiros.
  if (originStatus === 'blocked') {
    return jsonResponse({ error: 'Origem não autorizada.' }, 403, cors);
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Método não permitido.' }, 405, cors);
  }

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
    // Mensagem genérica de propósito — nunca revela qual variável
    // está ausente.
    return jsonResponse({ error: 'Serviço temporariamente indisponível.' }, 500, cors);
  }

  // 1. Identifica o usuário exclusivamente pelo JWT.
  const authHeader = req.headers.get('Authorization') ?? '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice('Bearer '.length).trim() : '';
  if (!token) {
    return jsonResponse({ error: 'Sessão não encontrada.' }, 401, cors);
  }

  // Cliente NO CONTEXTO DO USUÁRIO — chave anon + o JWT recebido.
  // Toda consulta feita com ele respeita a RLS real (enrollments_self).
  const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  const { data: userData, error: userError } = await userClient.auth.getUser(token);
  const user = userData?.user;
  if (userError || !user) {
    return jsonResponse({ error: 'Sessão inválida ou expirada.' }, 401, cors);
  }

  // 2. Payload: só as chaves enrollment_id/product_id são aceitas.
  //    Qualquer outra chave (inclusive user_id) é rejeitada — a
  //    identidade do comprador nunca vem do corpo da requisição.
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: 'JSON inválido.' }, 400, cors);
  }

  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return jsonResponse({ error: 'Payload inválido.' }, 400, cors);
  }

  const payload = body as Record<string, unknown>;
  const hasUnknownKey = Object.keys(payload).some(
    (key) => key !== 'enrollment_id' && key !== 'product_id'
  );
  if (hasUnknownKey) {
    return jsonResponse({ error: 'Payload inválido.' }, 400, cors);
  }

  const hasEnrollmentId = typeof payload.enrollment_id === 'string' && payload.enrollment_id.length > 0;
  const hasProductId = typeof payload.product_id === 'string' && payload.product_id.length > 0;

  // XOR: rejeita se ambos verdadeiros (os dois enviados) OU ambos
  // falsos (nenhum enviado) — só passa quando exatamente um é true.
  if (hasEnrollmentId === hasProductId) {
    return jsonResponse(
      { error: 'Informe exatamente um entre enrollment_id ou product_id.' },
      400,
      cors
    );
  }

  const idValue = (hasEnrollmentId ? payload.enrollment_id : payload.product_id) as string;
  if (!UUID_REGEX.test(idValue)) {
    return jsonResponse({ error: 'Identificador inválido.' }, 400, cors);
  }

  // 3. Consulta enrollments COM O CLIENTE DO USUÁRIO — RLS
  //    (enrollments_self) já garante auth.uid() = user_id; o filtro
  //    explícito abaixo é redundância proposital, não substitui a RLS.
  let enrollmentQuery = userClient
    .from('enrollments')
    .select('id, status, expires_at, product_id')
    .eq('user_id', user.id);

  enrollmentQuery = hasEnrollmentId
    ? enrollmentQuery.eq('id', idValue)
    : enrollmentQuery.eq('product_id', idValue);

  const { data: enrollment, error: enrollmentError } = await enrollmentQuery.maybeSingle();

  // Mensagem idêntica para "não existe" e "não pertence ao usuário" —
  // nunca revela qual dos dois casos ocorreu.
  if (enrollmentError || !enrollment) {
    return jsonResponse({ error: 'Acesso não encontrado.' }, 404, cors);
  }

  if (enrollment.status !== 'active') {
    return jsonResponse({ error: 'Este acesso não está disponível.' }, 403, cors);
  }

  if (enrollment.expires_at && new Date(enrollment.expires_at).getTime() < Date.now()) {
    return jsonResponse({ error: 'Este acesso expirou.' }, 403, cors);
  }

  // 4. SÓ AGORA, com o enrollment já autorizado pelo cliente do
  //    usuário, instancia o cliente administrativo — usado
  //    exclusivamente para ler pdf_path e gerar a signed URL.
  //    products.active NÃO entra nesta checagem de propósito: active
  //    controla catálogo/vendas, não revoga entrega já concedida.
  const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  const { data: product, error: productError } = await adminClient
    .from('products')
    .select('id, pdf_path')
    .eq('id', enrollment.product_id)
    .maybeSingle();

  if (productError || !product || !product.pdf_path) {
    return jsonResponse({ error: 'Material indisponível no momento.' }, 404, cors);
  }

  // 5. Signed URL — TTL de 300s, forçando download. Nunca retorna
  //    pdf_path bruto; nunca loga a URL gerada.
  const { data: signed, error: signError } = await adminClient.storage
    .from('products')
    .createSignedUrl(product.pdf_path, SIGNED_URL_TTL_SECONDS, { download: true });

  if (signError || !signed?.signedUrl) {
    return jsonResponse(
      { error: 'Não foi possível gerar o link agora. Tente novamente.' },
      502,
      cors
    );
  }

  return jsonResponse({ url: signed.signedUrl, expiresIn: SIGNED_URL_TTL_SECONDS }, 200, cors);
});
