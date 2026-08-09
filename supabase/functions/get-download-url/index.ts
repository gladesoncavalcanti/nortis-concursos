// get-download-url
//
// Gera uma signed URL de curta duração (300s) para o PDF de um produto
// ao qual o usuário autenticado tem um enrollment ativo. Esta função
// de download exige usuário autenticado — não há caminho de convidado
// aqui. A exigência de conta antes do CHECKOUT em si é uma decisão de
// arquitetura já aprovada, mas ainda será aplicada em
// create-asaas-checkout numa fase posterior; hoje esse checkout
// continua aceitando tanto usuário autenticado quanto convidado.
//
// Dois clientes Supabase com privilégios distintos:
//   - userClient: chave publishable + o JWT recebido. Toda consulta a
//     `enrollments` passa pela RLS real (policy enrollments_self);
//     nunca lê pdf_path, nunca gera signed URL.
//   - adminClient: chave secret, instanciado só DEPOIS que o
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
//   SUPABASE_PUBLISHABLE_KEYS (JSON, ex.: {"default": "sb_publishable_..."})
//   SUPABASE_SECRET_KEYS      (JSON, ex.: {"default": "sb_secret_..."})
//     Usamos só a chave "default" de cada uma. Sem fallback para as
//     antigas SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY: ausência
//     ou formato inválido falha fechado (500 genérico).
//
// Versão do supabase-js fixada nesta function (2.110.0 — mesma versão
// resolvida em package-lock.json para o frontend) para garantir que
// `createSignedUrl(path, expiresIn, { download: true })` funciona
// exatamente como testado; as demais Edge Functions do projeto não
// foram alteradas.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.110.0';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';

// SUPABASE_PUBLISHABLE_KEYS / SUPABASE_SECRET_KEYS chegam como JSON
// (ex.: {"default": "sb_..."}), pois um projeto pode ter mais de uma
// chave de cada tipo. Extraímos só a "default". Qualquer formato
// inesperado (variável ausente, JSON inválido, campo ausente ou
// não-string) é tratado como ausência da chave.
function readDefaultKey(envVarName: string): string {
  const raw = Deno.env.get(envVarName);
  if (!raw) return '';

  try {
    const parsed = JSON.parse(raw);
    const value = parsed?.default;

    return typeof value === 'string' && value.trim().length > 0
      ? value.trim()
      : '';
  } catch {
    return '';
  }
}

const SUPABASE_PUBLISHABLE_KEY = readDefaultKey('SUPABASE_PUBLISHABLE_KEYS');
const SUPABASE_SECRET_KEY = readDefaultKey('SUPABASE_SECRET_KEYS');

// A chave secret (opaca, não é JWT) só deve viajar no header apikey.
// Sem este wrapper, o client manda Authorization: Bearer <secret key>
// por padrão — comportamento correto para a antiga service_role (um
// JWT), mas não para o novo formato de chave. Remove o Authorization
// SOMENTE quando ele for exatamente "Bearer <secret key>"; qualquer
// outro Authorization passa intocado. Usado só pelo adminClient —
// nunca pelo userClient, que precisa do JWT real do comprador.
function createSecretKeyFetch(secretKey: string): typeof fetch {
  const nativeFetch = globalThis.fetch;

  return async (input, init) => {
    const headers = new Headers(init?.headers);
    const authorization = headers.get('Authorization');

    if (authorization === `Bearer ${secretKey}`) {
      headers.delete('Authorization');
    }

    return nativeFetch(input, {
      ...init,
      headers,
    });
  };
}

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

  // Origem de navegador presente e não reconhecida: recusada antes de
  // qualquer outra checagem, inclusive antes do próprio preflight —
  // um OPTIONS de origem bloqueada recebe 403 sem
  // Access-Control-Allow-Origin, então o navegador nunca chega a
  // tentar o POST real. CORS não substitui autenticação — isto é uma
  // camada adicional contra abuso vindo de páginas de terceiros.
  if (originStatus === 'blocked') {
    return jsonResponse({ error: 'Origem não autorizada.' }, 403, cors);
  }

  // Preflight: responde só com os headers de CORS quando a origem é
  // reconhecida. Nenhuma verificação de autenticação é necessária aqui
  // — navegadores nunca enviam Authorization no preflight.
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: cors });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Método não permitido.' }, 405, cors);
  }

  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY || !SUPABASE_SECRET_KEY) {
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

  // Cliente NO CONTEXTO DO USUÁRIO — chave publishable + o JWT recebido.
  // Toda consulta feita com ele respeita a RLS real (enrollments_self).
  // Sem sessão própria persistida no servidor — a identidade do usuário
  // vem sempre do JWT explícito em auth.getUser(token) logo abaixo,
  // nunca de estado de sessão interno do client.
  const userClient = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
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

  if (enrollment.expires_at) {
    const expiresAtMs = Date.parse(enrollment.expires_at);

    // Fail-closed: nega data no passado, igual ao instante atual, ou
    // qualquer valor malformado/não interpretável — só aceita um
    // Date.parse válido estritamente no futuro.
    if (!Number.isFinite(expiresAtMs) || expiresAtMs <= Date.now()) {
      return jsonResponse({ error: 'Este acesso expirou.' }, 403, cors);
    }
  }

  // 4. SÓ AGORA, com o enrollment já autorizado pelo cliente do
  //    usuário, instancia o cliente administrativo — usado
  //    exclusivamente para ler pdf_path e gerar a signed URL.
  //    products.active NÃO entra nesta checagem de propósito: active
  //    controla catálogo/vendas, não revoga entrega já concedida.
  const adminClient = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      fetch: createSecretKeyFetch(SUPABASE_SECRET_KEY),
    },
  });

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
