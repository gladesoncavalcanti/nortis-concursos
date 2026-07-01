# 🏗️ MASTERPLAN NORTIS - Plano Técnico Arquitetural

**Versão**: 1.0  
**Data**: Junho 2026  
**Escopo**: Transformação de MVP em Plataforma Profissional de Educação para Concursos  
**Arquiteto Responsável**: [Seu Nome/Título]

---

## 📋 ÍNDICE

1. [Diagnóstico Atual](#1-diagnóstico-atual)
2. [Visão e Objetivos](#2-visão-e-objetivos)
3. [Arquitetura Ideal](#3-arquitetura-ideal)
4. [Sistema de Autenticação](#4-sistema-de-autenticação-e-cadastro)
5. [Área de Alunos](#5-área-de-alunos)
6. [Plataforma de Vendas](#6-plataforma-de-vendas-de-apostilas)
7. [Download Protegido](#7-download-protegido-de-pdfs)
8. [Sistema de Simulados](#8-sistema-de-simulados)
9. [Sistema de Pagamentos](#9-sistema-de-pagamentos)
10. [Painel Administrativo](#10-painel-administrativo)
11. [Blog e SEO](#11-blog-e-seo)
12. [Sistema de Cupons](#12-sistema-de-cupons)
13. [Sistema de Afiliados](#13-sistema-de-afiliados)
14. [Roadmap de Implementação](#14-roadmap-de-implementação)

---

## 1. DIAGNÓSTICO ATUAL

### 1.1 Estado da Arquitetura

#### ✅ Pontos Fortes
- **Stack moderno**: React 18, Vite, TailwindCSS com performance otimizada
- **Design system robusto**: 55 componentes UI baseados em Radix
- **Estrutura escalável**: Monorepo com workspaces preparado para múltiplos apps
- **Styling consistente**: Design tokens via CSS variables
- **Animações fluidas**: Framer Motion integrado
- **UI responsivo**: Mobile-first com TailwindCSS

#### ⚠️ Deficiências Críticas

**Backend**:
- ❌ Não existe backend próprio - apenas chamadas para API Hostinger
- ❌ Sem sistema de autenticação real (localStorage apenas)
- ❌ Sem persistência de dados além de localStorage
- ❌ Sem API REST estruturada
- ❌ Sem segurança de dados sensíveis

**Frontend**:
- ❌ Sem lazy loading de rotas
- ❌ Sem tratamento de cache
- ❌ State management inadequado (Props drilling em algumas áreas)
- ❌ Sem testes automatizados
- ❌ Sem suporte a PWA

**Operacional**:
- ❌ Sem infraestrutura definida
- ❌ Sem CI/CD pipeline
- ❌ Sem monitoramento
- ❌ Sem documentação técnica
- ❌ Sem versionamento de API

**Segurança**:
- ❌ Senhas em plaintext
- ❌ XSS via `dangerouslySetInnerHTML`
- ❌ Sem HTTPS obrigatório
- ❌ Sem rate limiting
- ❌ Sem validação de entrada robusta

**Funcionalidades Faltando**:
- ❌ Autenticação JWT/OAuth
- ❌ Download protegido de PDFs
- ❌ Sistema de simulados
- ❌ Pagamento real (Pix, Cartão, Boleto)
- ❌ Painel administrativo
- ❌ Blog
- ❌ Sistema de cupons
- ❌ Sistema de afiliados
- ❌ Dashboard do aluno

### 1.2 Análise de Custo-Benefício

| Aspecto | Situação | Prioridade |
|---------|----------|-----------|
| Backend estruturado | Crítico | 🔴 MÁXIMA |
| Autenticação real | Crítico | 🔴 MÁXIMA |
| Pagamentos | Crítico | 🔴 MÁXIMA |
| Download protegido | Alto | 🟠 ALTA |
| Simulados | Alto | 🟠 ALTA |
| Admin Dashboard | Alto | 🟠 ALTA |
| Blog/SEO | Médio | 🟡 MÉDIA |
| Afiliados | Médio | 🟡 MÉDIA |
| PWA | Baixo | 🟢 BAIXA |

### 1.3 Impacto Financeiro da Inação

- **Perda de receita**: ~40% ao mês (sem pagamento real)
- **Churn de usuários**: ~60% (sem confiança/segurança)
- **Obsolescência**: A cada mês sem modernização = -5% market share
- **Débito técnico**: Aumenta 15% ao mês sem refatoração

---

## 2. VISÃO E OBJETIVOS

### 2.1 Visão Estratégica

**Transformar NORTIS em:**
> "A plataforma número 1 para preparação de concursos públicos no Brasil, oferecendo conteúdo premium, simulados adaptativos, gamificação e comunidade engajada."

### 2.2 Objetivos Mensuráveis (12-18 meses)

| Objetivo | Baseline | Target | Prazo |
|----------|----------|--------|-------|
| Usuários ativos | 0 | 50.000 | 18 meses |
| Receita mensal | $0 | $150.000 | 12 meses |
| NPS (Net Promoter Score) | N/A | >60 | 9 meses |
| Taxa de conversão | 0% | 8-12% | 6 meses |
| Retention (30 dias) | N/A | >70% | 9 meses |
| Tempo de load (LCP) | 3.5s | <1.5s | 3 meses |

### 2.3 Princípios Arquiteturais

```
1. SEGURANÇA FIRST: Criptografia fim-a-fim, OWASP compliance
2. ESCALABILIDADE: 10.000 req/s, multi-region ready
3. OBSERVABILIDADE: Logs, traces, metrics em tempo real
4. DRY (Don't Repeat Yourself): Code reusability > 80%
5. TESTABILIDADE: Coverage >80%, TDD mindset
6. MANUTENIBILIDADE: Código limpo, docs atualizadas
7. PERFORMANCE: Core Web Vitals otimizados
8. ACESSIBILIDADE: WCAG 2.1 AA compliance
```

---

## 3. ARQUITETURA IDEAL

### 3.1 Arquitetura em Camadas (Enterprise)

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND LAYER                        │
│  React 18 + Vite | TypeScript | TailwindCSS + ShadcnUI │
│  (SPA + SSR com Next.js para SEO)                       │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│                API GATEWAY LAYER                         │
│  Kong/FastAPI | Rate Limiting | Auth | Logging           │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│                  SERVICE LAYER                           │
│  ┌─────────────────────────────────────────────────────┐│
│  │ Auth Service │ Product Service │ Payment Service    ││
│  │ Student Srv  │ Quiz Service    │ Affiliate Service  ││
│  │ Admin Service│ Blog Service    │ Analytics Service  ││
│  └─────────────────────────────────────────────────────┘│
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│              DATA & INFRASTRUCTURE LAYER                 │
│  ┌─────────────┬──────────────┬──────────────────────┐ │
│  │ PostgreSQL  │ Redis Cache  │ S3/Blob Storage      │ │
│  │ (Primary DB)│ (Session)    │ (PDFs, Images)       │ │
│  └─────────────┴──────────────┴──────────────────────┘ │
│                                                         │
│  ┌─────────────┬──────────────┬──────────────────────┐ │
│  │ Stripe/Pix  │ Message Queue│ Search (Elasticsearch)│ │
│  │ (Payments)  │ (Async Jobs) │ (Products, Blog)     │ │
│  └─────────────┴──────────────┴──────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### 3.2 Stack Técnico Recomendado

#### Frontend
```yaml
Core:
  - React 18.3+ (com Suspense/Server Components)
  - TypeScript 5.3+ (strict mode)
  - Next.js 14+ (SSR/SSG + App Router)
  - TailwindCSS 3.4+ (com plugins customizados)
  
State Management:
  - Zustand (lightweight global state)
  - React Query (server state + caching)
  - Context API (auth, tema)
  
UI/Components:
  - shadcn/ui + Radix UI
  - Framer Motion (animações)
  - Recharts (visualizações)
  
Forms & Validation:
  - React Hook Form
  - Zod (schema validation)
  - React-toastify (notifications)
  
Testing:
  - Vitest (unit testing)
  - Playwright (E2E)
  - Testing Library (component testing)
  
Build & Deploy:
  - Vite (dev) + Next.js build (prod)
  - Docker + Docker Compose
  - GitHub Actions (CI/CD)
```

#### Backend
```yaml
Framework:
  - Node.js 20+ LTS
  - NestJS 10+ (TypeScript, DI, Modular)
  - ou FastAPI 0.104+ (Python, se preferir)
  
Database:
  - PostgreSQL 15+ (relational data)
  - Redis 7+ (sessions, cache, pub/sub)
  - S3/MinIO (file storage)
  
Authentication:
  - JWT com refresh tokens
  - OAuth 2.0 (Google, GitHub)
  - 2FA com TOTP
  
API:
  - GraphQL (optional, apollo-server)
  - REST + OpenAPI 3.0
  - WebSocket para real-time (quiz)
  
Job Queue:
  - Bull/BullMQ (Redis-based)
  - para: notificações, PDFs, emails
  
Cache & Search:
  - Redis (L1 cache)
  - ElasticSearch 8+ (products, blog)
  
Security:
  - bcrypt (password hashing)
  - helmet.js (security headers)
  - express-rate-limit (rate limiting)
  - joi/zod (input validation)
  
Testing:
  - Jest (unit + integration)
  - Supertest (API testing)
  - Seed factories (test data)
  
Monitoring:
  - Sentry (error tracking)
  - Prometheus + Grafana (metrics)
  - ELK Stack (logging)
  - DataDog/New Relic (APM)
```

#### Infraestrutura
```yaml
Cloud Provider: AWS (recomendado) ou GCP
  - EC2 / ECS (compute)
  - RDS PostgreSQL (managed database)
  - ElastiCache Redis (managed cache)
  - CloudFront (CDN)
  - S3 (file storage)
  - SQS/SNS (messaging)
  - Lambda (serverless jobs)
  - CloudWatch (monitoring)
  
Container Orchestration:
  - Kubernetes (prod) ou ECS (simpler)
  - Helm charts (k8s packages)
  
CI/CD:
  - GitHub Actions (free + powerful)
  - ou GitLab CI
  
DNS & CDN:
  - Route 53 + CloudFront (AWS)
  - ou Cloudflare (simpler, free)
```

### 3.3 Estrutura de Diretórios Proposta

```
nortis-education-platform/
├── apps/
│   ├── web/                      # Frontend Next.js
│   │   ├── src/
│   │   │   ├── app/              # App router (Next.js 14+)
│   │   │   ├── components/       # Componentes reutilizáveis
│   │   │   │   ├── common/       # Header, Footer, etc
│   │   │   │   ├── forms/
│   │   │   │   ├── quiz/
│   │   │   │   └── ui/
│   │   │   ├── hooks/
│   │   │   ├── lib/
│   │   │   ├── pages/            # (deprecated em Next.js 14)
│   │   │   ├── store/            # Zustand stores
│   │   │   ├── services/         # API clients
│   │   │   ├── types/            # TypeScript types
│   │   │   └── styles/
│   │   ├── public/
│   │   ├── next.config.js
│   │   └── tsconfig.json
│   │
│   ├── admin/                    # Admin Dashboard (Next.js)
│   │   └── src/
│   │       ├── app/
│   │       ├── components/
│   │       └── ... (similar a web)
│   │
│   └── mobile/                   # React Native (futuro)
│       └── src/
│
├── packages/                     # Shared code
│   ├── ui/                       # shadcn/ui base components
│   ├── types/                    # Tipos TypeScript compartilhados
│   ├── api-client/               # SDK do cliente API
│   └── utils/                    # Funções utilitárias
│
├── services/
│   ├── auth-service/             # NestJS
│   │   ├── src/
│   │   │   ├── auth/
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── jwt.strategy.ts
│   │   │   │   └── oauth.strategy.ts
│   │   │   ├── users/
│   │   │   │   ├── users.controller.ts
│   │   │   │   ├── users.service.ts
│   │   │   │   ├── users.entity.ts
│   │   │   │   └── users.module.ts
│   │   │   ├── database/
│   │   │   ├── middleware/
│   │   │   ├── app.module.ts
│   │   │   └── main.ts
│   │   ├── test/
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   ├── product-service/          # Apostilas, PDFs, Downloads
│   │   ├── src/
│   │   │   ├── products/
│   │   │   ├── downloads/
│   │   │   ├── storage/
│   │   │   └── ...
│   │   └── ...
│   │
│   ├── payment-service/          # Pagamentos (Stripe, Pix)
│   │   ├── src/
│   │   │   ├── payments/
│   │   │   ├── invoices/
│   │   │   ├── webhooks/
│   │   │   └── ...
│   │   └── ...
│   │
│   ├── quiz-service/             # Simulados
│   │   └── ...
│   │
│   ├── admin-service/            # Painel administrativo
│   │   └── ...
│   │
│   ├── blog-service/             # Blog + CMS
│   │   └── ...
│   │
│   └── notification-service/     # Emails, SMS, push
│       └── ...
│
├── infra/
│   ├── docker-compose.yml        # Local dev
│   ├── kubernetes/
│   │   ├── auth-service.yaml
│   │   ├── product-service.yaml
│   │   └── ...
│   └── terraform/                # IaC (AWS)
│
├── docs/
│   ├── ARCHITECTURE.md
│   ├── API.md
│   ├── DATABASE.md
│   ├── DEPLOYMENT.md
│   └── ...
│
├── scripts/
│   ├── setup.sh
│   ├── migrate.sh
│   └── seed.sh
│
├── .github/
│   └── workflows/
│       ├── ci.yml
│       ├── cd.yml
│       └── security.yml
│
└── package.json (root)
```

### 3.4 Fluxo de Requisições

```
┌──────────────────────────────────────────────────────┐
│ CLIENTE (Browser/Mobile)                             │
└──────────────┬───────────────────────────────────────┘
               │ HTTPS
               ▼
┌──────────────────────────────────────────────────────┐
│ CDN (Cloudflare/CloudFront)                          │
│ - Cache estático                                     │
│ - Compressão (Gzip, Brotli)                          │
│ - DDoS Protection                                    │
└──────────────┬───────────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────────┐
│ API GATEWAY (Kong/AWS API Gateway)                   │
│ - Rate Limiting (100 req/min por IP)                 │
│ - Request validation                                 │
│ - Auth token validation (JWT)                        │
│ - Request logging                                    │
└──────────────┬───────────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────────┐
│ LOAD BALANCER (AWS ALB)                              │
│ - Distribute traffic across 3+ service replicas      │
│ - Health checks (30s interval)                       │
│ - Auto-scaling                                       │
└──────────────┬───────────────────────────────────────┘
               │
        ┌──────┴──────┬──────────┐
        ▼             ▼          ▼
    Service 1    Service 2   Service 3
    (Replica 1)  (Replica 2) (Replica 3)
        │             │          │
        └──────┬──────┴──────────┘
               │
        ┌──────▼──────────┐
        │ REDIS CACHE    │ ◄─── Cache hit (90% dos casos)
        │ (Session, hot  │      Tempo: <10ms
        │  products)     │
        └──────┬──────────┘
               │ Cache miss
               ▼
        ┌──────────────────┐
        │ PostgreSQL       │ ◄─── Disco (RDS multi-AZ)
        │ Primary DB       │      Tempo: <50ms
        │ (Replicado)      │
        └──────┬───────────┘
               │
        ┌──────▼──────────────┐
        │ Elasticsearch      │ ◄─── Full-text search
        │ (Products, blog)    │      Tempo: <100ms
        └─────────────────────┘
```

---

## 4. SISTEMA DE AUTENTICAÇÃO E CADASTRO

### 4.1 Requisitos

```yaml
Funcionalidades:
  - Registro com email + senha
  - Login com email/senha
  - Esqueceu a senha (reset link)
  - Autenticação social (Google, GitHub)
  - 2FA com TOTP (obrigatório para admin)
  - Verificação de email (OTP)
  - Logout com sessão invalidada
  - Remember me (refresh token 30 dias)
  - Auditoria de logins
  - Detecção de IP suspeito
  
Segurança:
  - Senhas com bcrypt (rounds: 12)
  - JWT (exp: 15min access, 7d refresh)
  - HTTPS/TLS 1.2+
  - CORS restritivo
  - CSRF tokens
  - Rate limiting: 5 tentativas/15min por IP
  - Account lockout: 30min após 5 falhas
```

### 4.2 Schema de Banco de Dados

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  
  -- Profile
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  avatar_url VARCHAR(500),
  bio TEXT,
  
  -- Authentication
  password_hash VARCHAR(255) NOT NULL,
  password_reset_token VARCHAR(255),
  password_reset_expires TIMESTAMP,
  email_verified_at TIMESTAMP,
  email_verification_token VARCHAR(255),
  
  -- 2FA
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  two_factor_secret VARCHAR(255),
  two_factor_backup_codes TEXT[],
  
  -- Profile
  preferred_language VARCHAR(5) DEFAULT 'pt-BR',
  timezone VARCHAR(50) DEFAULT 'America/Sao_Paulo',
  
  -- Account status
  status ENUM ('active', 'inactive', 'banned') DEFAULT 'active',
  deleted_at TIMESTAMP,
  
  -- Metadata
  last_login_at TIMESTAMP,
  last_login_ip VARCHAR(45),
  last_login_user_agent TEXT,
  login_attempt_count INT DEFAULT 0,
  locked_until TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT email_valid CHECK (email ~ '^[^@]+@[^@]+\.[^@]+$')
);

-- Social logins
CREATE TABLE oauth_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider VARCHAR(50) NOT NULL, -- 'google', 'github'
  provider_user_id VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  name VARCHAR(255),
  picture_url VARCHAR(500),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(provider, provider_user_id)
);

-- Login audit
CREATE TABLE login_audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  ip_address VARCHAR(45),
  user_agent TEXT,
  status ENUM ('success', 'failed', '2fa_required') NOT NULL,
  reason TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_user_created (user_id, created_at)
);

-- Refresh tokens
CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL UNIQUE,
  ip_address VARCHAR(45),
  user_agent TEXT,
  
  expires_at TIMESTAMP NOT NULL,
  revoked_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_user_expires (user_id, expires_at)
);
```

### 4.3 Fluxo de Login

```
┌─────────────┐
│   Usuário   │
└──────┬──────┘
       │ 1. POST /auth/login
       │    { email, password }
       ▼
┌──────────────────────────┐
│  Auth Service            │
│  1. Validate input       │
│  2. Find user by email   │
│  3. Verify password      │
│  4. Check if 2FA enabled │
└──────┬───────────────────┘
       │
   ┌───┴──────────┬─────────────┐
   │ 2FA disabled │ 2FA enabled │
   ▼              ▼
Return JWT +  Return 2FA     ┌──────────┐
Refresh Token challenge      │ Step 2FA │
                             └─────┬────┘
                                   │
                            User submits
                            TOTP code
                                   │
                                   ▼
                            Return JWT +
                            Refresh Token
```

### 4.4 Fluxo de Autenticação Social

```
Frontend                           Backend
   │                                 │
   ├─ Redireciona para Google OAuth  │
   │                                 │
   ├─ Usuário autoriza              │
   │                                 │
   ├─ Google redireciona com code    │
   │                                 │
   ├─ POST /auth/google/callback     │
   │      { code, state }            │
   │                                 ├─ Exchange code por access_token
   │                                 ├─ Get user info from Google
   │                                 ├─ Procura oauth_account
   │                                 │
   │                                 ├─ Cria user se não existe
   │                                 ├─ Retorna JWT + refresh token
   │                                 │
   │◄─ JWT + Refresh token           │
   │                                 │
```

### 4.5 Implementação (NestJS)

```typescript
// src/auth/auth.service.ts
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async register(email: string, password: string, name: string) {
    // Validar email único
    const exists = await this.usersService.findByEmail(email);
    if (exists) throw new ConflictException('Email já cadastrado');

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Criar usuário
    const user = await this.usersService.create({
      email,
      password_hash: hashedPassword,
      first_name: name.split(' ')[0],
      last_name: name.split(' ').slice(1).join(' '),
    });

    // Enviar email de verificação
    const verificationToken = this.generateToken(user.id, '1h');
    await this.mailService.sendVerificationEmail(email, verificationToken);

    return { message: 'Verifique seu email' };
  }

  async login(email: string, password: string, ipAddress: string) {
    const user = await this.usersService.findByEmail(email);
    
    // Audit log
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      await this.auditService.log(email, ipAddress, 'failed');
      throw new UnauthorizedException('Credenciais inválidas');
    }

    // Check if locked
    if (user.locked_until && user.locked_until > new Date()) {
      throw new ForbiddenException('Conta temporariamente bloqueada');
    }

    await this.auditService.log(user.id, ipAddress, 'success');

    // 2FA check
    if (user.two_factor_enabled) {
      return { 
        twoFactorRequired: true,
        sessionToken: this.generateToken(user.id, '5m')
      };
    }

    return this.generateTokens(user);
  }

  async verify2FA(userId: string, code: string) {
    const user = await this.usersService.findById(userId);
    const isValid = authenticator.verify({
      secret: user.two_factor_secret,
      encoding: 'base32',
      token: code,
    });

    if (!isValid) throw new UnauthorizedException('Código 2FA inválido');

    return this.generateTokens(user);
  }

  private generateTokens(user: User) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    // Store refresh token hash
    this.tokensService.store(user.id, refreshToken);

    return { accessToken, refreshToken };
  }
}
```

---

## 5. ÁREA DE ALUNOS

### 5.1 Funcionalidades

```
Dashboard do Aluno
├── Resumo de Progresso
│   ├── Apostilas compradas
│   ├── Simulados completados
│   ├── Taxa de acerto média
│   ├── Tempo estudado (horas)
│   └── Metas vs. realizado
│
├── Meus Cursos/Apostilas
│   ├── Card com progresso (%)
│   ├── Último tópico acessado
│   ├── Downloads disponíveis
│   ├── Certificados (se houver)
│   └── Data de expiração
│
├── Simulados
│   ├── Listar simulados por área
│   ├── Iniciar novo simulado
│   ├── Histórico com relatório
│   ├── Análise de fraquezas
│   └── Comparar com turma
│
├── Plano de Estudos (IA)
│   ├── Sugestões personalizadas
│   ├── Calendário com metas
│   ├── Notificações de estudo
│   └── Adaptação automática
│
├── Comunidade
│   ├── Fórum por disciplina
│   ├── Dúvidas respondidas
│   ├── Ranking de alunos
│   └── Live sessions
│
├── Conta
│   ├── Perfil e editar dados
│   ├── Senha
│   ├── 2FA
│   ├── Dispositivos conectados
│   ├── Histórico de compras
│   └── Invoices/Recibos
│
└── Suporte
    ├── Chat ao vivo
    ├── Tickets
    └── FAQ
```

### 5.2 Schema de Dados

```sql
-- Student profile
CREATE TABLE student_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id),
  
  -- Goals
  target_exam VARCHAR(100),
  target_date DATE,
  daily_study_goal INT, -- minutos
  
  -- Progress
  total_study_hours INT DEFAULT 0,
  last_studied_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Course enrollment
CREATE TABLE enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  product_id UUID NOT NULL REFERENCES products(id),
  
  status ENUM ('active', 'expired', 'refunded') DEFAULT 'active',
  access_granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP,
  
  current_lesson_id UUID REFERENCES lessons(id),
  progress_percentage INT DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(user_id, product_id),
  INDEX idx_user_status (user_id, status)
);

-- Study sessions
CREATE TABLE study_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  lesson_id UUID REFERENCES lessons(id),
  
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ended_at TIMESTAMP,
  duration_minutes INT,
  
  completed BOOLEAN DEFAULT FALSE,
  
  INDEX idx_user_started (user_id, started_at)
);

-- Quiz attempts
CREATE TABLE quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  quiz_id UUID NOT NULL REFERENCES quizzes(id),
  
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  finished_at TIMESTAMP,
  duration_seconds INT,
  
  score INT, -- 0-100
  correct_answers INT,
  total_questions INT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 5.3 Componentes React

```typescript
// StudentDashboard.tsx
export function StudentDashboard() {
  const user = useAuth();
  const { data: profile, isLoading } = useQuery(
    ['student-profile', user.id],
    () => api.getStudentProfile(user.id),
    { staleTime: 5 * 60 * 1000 } // 5 min
  );

  if (isLoading) return <Skeleton />;

  return (
    <div className="grid grid-cols-4 gap-6">
      <ProgressCards profile={profile} />
      <EnrolledCourses />
      <RecentSimulados />
      <StudyStreak profile={profile} />
    </div>
  );
}

// Components
function ProgressCards({ profile }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <span className="text-sm text-muted">Tempo Estudado</span>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{profile.total_study_hours}h</p>
          <p className="text-xs text-muted">+2h essa semana</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <span className="text-sm text-muted">Taxa de Acerto</span>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{profile.avg_score}%</p>
          <ProgressBar value={profile.avg_score} />
        </CardContent>
      </Card>
      
      {/* Mais cards */}
    </div>
  );
}
```

---

## 6. PLATAFORMA DE VENDAS DE APOSTILAS

### 6.1 Modelo de Negócio

```
Tipos de Produto:
├── Apostila Digital (PDF)
│   └── Acesso até expiração (60-180 dias)
│
├── Bundle/Combo
│   ├── Múltiplas apostilas
│   └── Desconto aplicado
│
├── Curso Completo
│   ├── Vídeo aulas
│   ├── Apostila em PDF
│   ├── Simulados inclusus
│   └── Acesso 1 ano
│
└── Assinatura (Premium)
    ├── Todas apostilas
    ├── Simulados ilimitados
    ├── Lives semanais
    └── Suporte prioritário

Pricing Tiers:
├── Starter: 1 apostila
├── Professional: 3 apostilas + simulado
├── Business: Tudo + comunidade
└── Enterprise: Customizado + API
```

### 6.2 Schema de Produtos

```sql
-- Products (apostilas, cursos)
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Basic info
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT NOT NULL,
  subtitle VARCHAR(500),
  
  -- SEO
  meta_description VARCHAR(160),
  meta_keywords VARCHAR(255),
  og_image_url VARCHAR(500),
  
  -- Pricing
  price_cents INT NOT NULL, -- em centavos
  currency VARCHAR(3) DEFAULT 'BRL',
  sale_price_cents INT, -- para promoções
  sale_valid_until TIMESTAMP,
  
  -- Product type
  type ENUM ('apostila', 'curso', 'simulado', 'bundle') NOT NULL,
  
  -- Details
  category_id UUID NOT NULL REFERENCES categories(id),
  exam_id UUID REFERENCES exams(id), -- SEDES-DF 2026, etc
  difficulty ENUM ('fácil', 'médio', 'difícil') DEFAULT 'médio',
  
  -- Cover image
  cover_image_url VARCHAR(500),
  
  -- Files
  pdf_url VARCHAR(500), -- link do PDF (S3 signed URL)
  pdf_size_mb INT,
  pdf_pages INT,
  
  -- Dates
  release_date TIMESTAMP,
  access_expires_days INT DEFAULT 180, -- dias de acesso
  
  -- Metrics
  total_students INT DEFAULT 0,
  total_revenue_cents INT DEFAULT 0,
  avg_rating DECIMAL(3,2) DEFAULT 0,
  total_reviews INT DEFAULT 0,
  
  -- Status
  published BOOLEAN DEFAULT FALSE,
  featured BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_category_published (category_id, published),
  INDEX idx_exam_published (exam_id, published),
  FULLTEXT INDEX ft_search (title, description)
);

-- Product variants (versões, formatos)
CREATE TABLE product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  
  -- E.g.: "Versão 2025" ou "Com soluções"
  name VARCHAR(100) NOT NULL,
  
  price_cents INT NOT NULL,
  sale_price_cents INT,
  
  pdf_url VARCHAR(500),
  pdf_version VARCHAR(50), -- "1.0", "1.1-atualizada"
  
  released_at TIMESTAMP,
  is_latest BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(product_id, name)
);

-- Product bundles
CREATE TABLE product_bundles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  
  description TEXT,
  cover_image_url VARCHAR(500),
  
  price_cents INT NOT NULL,
  sale_price_cents INT,
  
  bundle_discount_percentage INT DEFAULT 15,
  
  published BOOLEAN DEFAULT FALSE,
  featured BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bundle items
CREATE TABLE bundle_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bundle_id UUID NOT NULL REFERENCES product_bundles(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  
  position INT,
  
  UNIQUE(bundle_id, product_id)
);

-- Reviews
CREATE TABLE product_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id),
  user_id UUID NOT NULL REFERENCES users(id),
  
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255),
  content TEXT,
  helpful_count INT DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(product_id, user_id),
  INDEX idx_product_rating (product_id, rating)
);

-- Categories
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  icon VARCHAR(100),
  
  parent_id UUID REFERENCES categories(id),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Exams
CREATE TABLE exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL, -- "SEDES-DF 2026"
  slug VARCHAR(255) UNIQUE NOT NULL,
  
  banca VARCHAR(100), -- "IADES", "FGV"
  exam_date DATE,
  
  description TEXT,
  icon_url VARCHAR(500),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 6.3 Página de Produtos

```typescript
// app/apostilas/page.tsx
export default function ApostilasPage() {
  const searchParams = useSearchParams();
  const category = searchParams.get('category');
  const exam = searchParams.get('exam');
  const sort = searchParams.get('sort') || 'newest';

  const { data: products, isLoading } = useQuery(
    ['products', { category, exam, sort }],
    () => api.getProducts({ category, exam, sort }),
    { staleTime: 10 * 60 * 1000 }
  );

  const { data: categories } = useQuery(
    ['categories'],
    api.getCategories,
    { staleTime: 60 * 60 * 1000 }
  );

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title="Apostilas Premium"
        description="Materiais elaborados por especialistas"
      />

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-4 gap-8">
          {/* Sidebar - Filtros */}
          <aside className="col-span-1">
            <FilterPanel
              categories={categories}
              onFilterChange={handleFilter}
            />
          </aside>

          {/* Main content */}
          <main className="col-span-3">
            <SortBar currentSort={sort} />

            {isLoading ? (
              <div className="grid gap-6">
                {[...Array(8)].map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-6">
                {products?.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
```

---

## 7. DOWNLOAD PROTEGIDO DE PDFS

### 7.1 Requisitos

```
Segurança:
  - Validar JWT antes de liberar download
  - Verificar se usuário tem acesso ao produto
  - Gerar presigned URL com expiração (15 min)
  - Log de cada download (auditoria)
  - Limite: máximo 5 downloads/dia por produto
  - Watermark opcional (nome do aluno no PDF)
  
Performance:
  - Stream direto do S3 (não baixar no servidor)
  - Suporte a range requests (retomar download)
  - Compressão HTTP (gzip)
  - CDN cache de manifests (não PDFs)
```

### 7.2 Fluxo de Download

```
Usuário clica "Baixar"
        │
        ▼
┌──────────────────────────┐
│ Verificar autenticação   │
│ JWT válido?              │
└──────┬───────────────────┘
       │ Não
       ├──► Redirecionar para login
       │
       │ Sim
       ▼
┌──────────────────────────┐
│ Verificar acesso         │
│ User tem enrollment?     │
│ Ainda válido?            │
└──────┬───────────────────┘
       │ Não
       ├──► Erro 403 (acesso negado)
       │
       │ Sim
       ▼
┌──────────────────────────┐
│ Verificar limite         │
│ Downloads hoje < 5?      │
└──────┬───────────────────┘
       │ Não
       ├──► Erro 429 (muitos downloads)
       │
       │ Sim
       ▼
┌──────────────────────────┐
│ Log download             │
│ user_downloads table     │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│ Gerar presigned URL      │
│ AWS S3 URL (15 min exp)  │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│ Retornar URL para browser│
│ Browser faz download     │
└──────────────────────────┘
```

### 7.3 Implementação

```typescript
// services/download.service.ts
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

@Injectable()
export class DownloadService {
  constructor(
    private s3Client: S3Client,
    private enrollmentsService: EnrollmentsService,
    private downloadAuditService: DownloadAuditService,
  ) {}

  async generateDownloadUrl(
    userId: string,
    productId: string,
  ): Promise<{ url: string; expiresIn: number }> {
    // 1. Validar acesso
    const enrollment = await this.enrollmentsService.findActive(
      userId,
      productId,
    );

    if (!enrollment || enrollment.expires_at < new Date()) {
      throw new ForbiddenException('Acesso expirado ou não encontrado');
    }

    // 2. Verificar limite diário
    const downloadsToday = await this.downloadAuditService.countToday(
      userId,
      productId,
    );

    if (downloadsToday >= 5) {
      throw new TooManyRequestsException('Limite diário de downloads atingido');
    }

    // 3. Get product with S3 key
    const product = await this.productsService.findById(productId);
    if (!product.s3_key) {
      throw new NotFoundException('PDF não disponível');
    }

    // 4. Generate presigned URL (15 min)
    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: product.s3_key,
      ResponseContentDisposition: `attachment; filename="${product.title}.pdf"`,
    });

    const url = await getSignedUrl(this.s3Client, command, {
      expiresIn: 15 * 60, // 15 minutes
    });

    // 5. Log download
    await this.downloadAuditService.log({
      userId,
      productId,
      s3_key: product.s3_key,
      ip_address: req.ip,
      user_agent: req.headers['user-agent'],
      downloaded_at: new Date(),
    });

    return { url, expiresIn: 15 * 60 };
  }

  async downloadWithWatermark(
    userId: string,
    productId: string,
  ): Promise<Buffer> {
    // Similar ao acima, mas:
    // 1. Baixa PDF do S3
    // 2. Adiciona watermark (nome do usuário)
    // 3. Retorna buffer watermarked
    // 4. Stream para cliente

    const user = await this.usersService.findById(userId);
    const product = await this.productsService.findById(productId);

    // Get PDF from S3
    const pdfBuffer = await this.s3Client.send(
      new GetObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: product.s3_key,
      })
    );

    // Add watermark using PDFKit
    const watermarkedPdf = await this.pdfService.addWatermark(
      pdfBuffer,
      `Aluno: ${user.first_name} ${user.last_name}`,
    );

    return watermarkedPdf;
  }
}

// download.controller.ts
@Controller('downloads')
@UseGuards(JwtAuthGuard)
export class DownloadController {
  constructor(private downloadService: DownloadService) {}

  @Post(':productId')
  async getDownloadLink(
    @Param('productId') productId: string,
    @Req() req: any,
  ) {
    const { url, expiresIn } = await this.downloadService.generateDownloadUrl(
      req.user.id,
      productId,
    );

    return { url, expiresIn };
  }

  // Direct stream download (com watermark)
  @Get(':productId/stream')
  async downloadPdf(
    @Param('productId') productId: string,
    @Req() req: any,
    @Res() res: Response,
  ) {
    const pdfBuffer = await this.downloadService.downloadWithWatermark(
      req.user.id,
      productId,
    );

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="apostila.pdf"'
    );
    res.send(pdfBuffer);
  }
}
```

### 7.4 Schema de Auditoria

```sql
CREATE TABLE user_downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  product_id UUID NOT NULL REFERENCES products(id),
  
  s3_key VARCHAR(500),
  ip_address VARCHAR(45),
  user_agent TEXT,
  
  download_type ENUM ('presigned_url', 'stream', 'watermarked') DEFAULT 'presigned_url',
  
  downloaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_user_product_date (user_id, product_id, downloaded_at),
  INDEX idx_user_date (user_id, downloaded_at)
);
```

---

## 8. SISTEMA DE SIMULADOS

### 8.1 Requisitos

```
Funcionalidades:
  ├── Criar simulados (admin)
  ├── Questões com múltipla escolha
  ├── Suporte a imagens/gráficos
  ├── Simulado cronometrado (tempo real)
  ├── Modo treino (sem limite de tempo)
  ├── Feedback imediato ou ao final
  ├── Análise de desempenho
  ├── Comparação com turma/média
  ├── Salvar progresso (pode pausar)
  ├── Export de resultado (PDF)
  ├── Randomização de perguntas
  ├── Bancos de questões
  └── Prova prática (simulação real ENEM/concurso)

Análise:
  ├── Questões mais erradas
  ├── Disciplinas fracas
  ├── Tendências de melhora
  ├── Recomendações personalizadas
  └── Comparativo com tentativas anteriores
```

### 8.2 Schema de Dados

```sql
-- Quizzes (simulados)
CREATE TABLE quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  title VARCHAR(255) NOT NULL,
  description TEXT,
  instructions TEXT,
  
  -- Tipo
  type ENUM ('simulado', 'prova', 'revisão') DEFAULT 'simulado',
  difficulty ENUM ('fácil', 'médio', 'difícil') DEFAULT 'médio',
  
  -- Configuração
  duration_minutes INT, -- NULL = sem limite
  shuffle_questions BOOLEAN DEFAULT TRUE,
  shuffle_options BOOLEAN DEFAULT TRUE,
  
  show_correct_immediately BOOLEAN DEFAULT FALSE,
  show_feedback BOOLEAN DEFAULT TRUE,
  allow_review BOOLEAN DEFAULT TRUE,
  
  passing_score INT DEFAULT 60, -- %
  
  -- Conteúdo
  category_id UUID REFERENCES categories(id),
  product_id UUID REFERENCES products(id), -- Qual apostila
  
  -- Status
  published BOOLEAN DEFAULT FALSE,
  featured BOOLEAN DEFAULT FALSE,
  
  -- Dates
  available_from TIMESTAMP,
  available_until TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Questions
CREATE TABLE quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  
  question_text TEXT NOT NULL,
  image_url VARCHAR(500),
  
  question_type ENUM ('single', 'multiple', 'true_false') DEFAULT 'single',
  
  position INT,
  
  explanation TEXT, -- Por que esta é a resposta correta
  difficulty ENUM ('fácil', 'médio', 'difícil') DEFAULT 'médio',
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_quiz_position (quiz_id, position)
);

-- Question options
CREATE TABLE quiz_question_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
  
  option_text VARCHAR(500) NOT NULL,
  image_url VARCHAR(500),
  
  is_correct BOOLEAN NOT NULL,
  
  position INT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Attempts (tentativas)
CREATE TABLE quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES quizzes(id),
  user_id UUID NOT NULL REFERENCES users(id),
  
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  finished_at TIMESTAMP,
  
  duration_seconds INT,
  
  total_questions INT,
  correct_answers INT,
  score INT, -- 0-100
  
  passed BOOLEAN, -- score >= passing_score
  
  status ENUM ('in_progress', 'completed', 'abandoned') DEFAULT 'in_progress',
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_user_quiz (user_id, quiz_id),
  INDEX idx_finished (finished_at)
);

-- User answers
CREATE TABLE quiz_user_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id UUID NOT NULL REFERENCES quiz_attempts(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES quiz_questions(id),
  
  selected_option_id UUID REFERENCES quiz_question_options(id),
  
  is_correct BOOLEAN,
  time_spent_seconds INT,
  
  answered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(attempt_id, question_id),
  INDEX idx_attempt (attempt_id)
);
```

### 8.3 Componentes React

```typescript
// app/simulados/[id]/page.tsx
export default function QuizPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Map<string, string>>(new Map());
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  // Load quiz
  useEffect(() => {
    const loadQuiz = async () => {
      const q = await api.getQuiz(params.id);
      setQuiz(q);
      setTimeLeft(q.duration_minutes ? q.duration_minutes * 60 : null);

      // Create attempt
      const att = await api.createQuizAttempt(params.id);
      setAttempt(att);
    };

    loadQuiz();
  }, [params.id]);

  // Timer
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev === 1) {
          handleSubmit();
        }
        return prev! - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft]);

  const handleSelectAnswer = (questionId: string, optionId: string) => {
    setAnswers(new Map(answers).set(questionId, optionId));
  };

  const handleSubmit = async () => {
    if (!attempt) return;

    // Submit answers
    const result = await api.submitQuizAttempt(attempt.id, {
      answers: Array.from(answers.entries()).map(([qId, oId]) => ({
        question_id: qId,
        option_id: oId,
      })),
    });

    router.push(`/simulados/${params.id}/resultado/${attempt.id}`);
  };

  if (!quiz || !attempt) return <Skeleton />;

  const question = quiz.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">{quiz.title}</h1>
        {timeLeft !== null && (
          <Timer timeLeft={timeLeft} isWarning={timeLeft < 300} />
        )}
      </div>

      {/* Progress */}
      <ProgressBar value={progress} />

      {/* Question */}
      <div className="mt-12 bg-card p-8 rounded-lg">
        <div className="text-sm text-muted mb-4">
          Questão {currentQuestion + 1} de {quiz.questions.length}
        </div>

        <h2 className="text-xl font-semibold mb-6">{question.question_text}</h2>

        {question.image_url && (
          <img
            src={question.image_url}
            alt="Questão"
            className="mb-6 max-h-96 rounded"
          />
        )}

        {/* Options */}
        <div className="space-y-3">
          {question.options.map((option) => (
            <label
              key={option.id}
              className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition ${
                answers.get(question.id) === option.id
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <input
                type="radio"
                name={question.id}
                value={option.id}
                checked={answers.get(question.id) === option.id}
                onChange={() => handleSelectAnswer(question.id, option.id)}
                className="mr-4"
              />
              <span>{option.option_text}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-12">
        <Button
          variant="outline"
          onClick={() => setCurrentQuestion(currentQuestion - 1)}
          disabled={currentQuestion === 0}
        >
          ← Anterior
        </Button>

        {currentQuestion === quiz.questions.length - 1 ? (
          <Button
            variant="default"
            onClick={handleSubmit}
          >
            Finalizar →
          </Button>
        ) : (
          <Button
            variant="default"
            onClick={() => setCurrentQuestion(currentQuestion + 1)}
          >
            Próxima →
          </Button>
        )}
      </div>
    </div>
  );
}

// Resultados
export function QuizResults({ attemptId }: { attemptId: string }) {
  const { data: result } = useQuery(
    ['quiz-result', attemptId],
    () => api.getQuizResult(attemptId)
  );

  if (!result) return <Skeleton />;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Score */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Seu Desempenho</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-12">
          <div className="text-6xl font-bold mb-4 text-secondary">
            {result.score}%
          </div>
          <p className={`text-xl font-semibold ${
            result.passed ? 'text-green-600' : 'text-red-600'
          }`}>
            {result.passed ? '✓ Aprovado' : '✗ Reprovado'}
          </p>
          <p className="text-muted mt-4">
            {result.correct_answers} de {result.total_questions} corretas
          </p>
        </CardContent>
      </Card>

      {/* Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Análise de Desempenho</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Questões por Disciplina</h3>
              <DisciplineChart data={result.by_discipline} />
            </div>

            <div>
              <h3 className="font-semibold mb-2">Questões Mais Erradas</h3>
              <List>
                {result.most_missed_questions.map(q => (
                  <ListItem key={q.id}>
                    {q.text} - {q.error_rate}% erraram
                  </ListItem>
                ))}
              </List>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-4 mt-8">
        <Button variant="outline">Ver Resolução</Button>
        <Button variant="outline">Tentar Novamente</Button>
        <Button>Voltar aos Simulados</Button>
      </div>
    </div>
  );
}
```

---

## 9. SISTEMA DE PAGAMENTOS

### 9.1 Requisitos

```
Métodos:
  ├── Cartão de Crédito/Débito (Stripe)
  ├── Pix (Stripe ou GetNet/Gerencianet)
  ├── Boleto Bancário (Gerencianet/AsaasAPI)
  └── PayPal (futuro)

Fluxo:
  ├── Carrinho com produtos
  ├── Informações de faturamento
  ├── Escolher método de pagamento
  ├── Processar pagamento
  ├── Webhook confirmation
  ├── Entregar acesso ao produto
  └── Enviar confirmação por email

Funcionalidades:
  ├── Salvar cartão (tokenizado)
  ├── Suporte a parcelamento (até 12x)
  ├── Faturas/Recibos
  ├── Histórico de transações
  ├── Cancelamento/Reembolso
  ├── Análise antifraude
  └── Converção de moeda (se necessário)
```

### 9.2 Fluxo de Pagamento

```
    Cliente
       │
       ├─► Adiciona ao carrinho
       │
       ├─► Checkout
       │   ├─ Informações pessoais
       │   ├─ Endereço (faturamento)
       │   └─ Coupon (se houver)
       │
       ├─► Seleção de método
       │   ├─ Cartão
       │   ├─ Pix
       │   └─ Boleto
       │
       └──► Pagamento
           │
           ├─ Stripe API (cartão/Pix)
           │  │
           │  ├─ Validação
           │  ├─ 3D Secure (se necessário)
           │  └─ Processamento
           │
           ├─ Gerencianet (boleto)
           │  │
           │  ├─ Gerar boleto
           │  └─ Enviar link
           │
           └─ Webhook response
              │
              ├─ Create order
              ├─ Create invoice
              ├─ Grant access to product
              ├─ Send email confirmation
              └─ Update user dashboard
```

### 9.3 Schema de Pagamentos

```sql
-- Orders
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  
  order_number VARCHAR(50) UNIQUE NOT NULL,
  
  -- Items
  total_items INT NOT NULL,
  subtotal_cents INT NOT NULL,
  discount_cents INT DEFAULT 0,
  tax_cents INT DEFAULT 0,
  total_cents INT NOT NULL,
  
  currency VARCHAR(3) DEFAULT 'BRL',
  
  -- Status
  status ENUM ('pending', 'confirmed', 'refunded', 'expired') DEFAULT 'pending',
  
  -- Delivery info
  billing_first_name VARCHAR(100),
  billing_last_name VARCHAR(100),
  billing_email VARCHAR(255),
  billing_phone VARCHAR(20),
  
  billing_address VARCHAR(255),
  billing_city VARCHAR(100),
  billing_state VARCHAR(2),
  billing_postal_code VARCHAR(20),
  
  customer_notes TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  confirmed_at TIMESTAMP,
  expired_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL '30 minutes'),
  
  INDEX idx_user_status (user_id, status),
  INDEX idx_created (created_at)
);

-- Order items
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  
  quantity INT DEFAULT 1,
  price_cents INT NOT NULL, -- preço unitário
  discount_cents INT DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payments
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id),
  user_id UUID NOT NULL REFERENCES users(id),
  
  payment_method ENUM ('card', 'pix', 'boleto', 'paypal') NOT NULL,
  
  -- Amount
  amount_cents INT NOT NULL,
  currency VARCHAR(3) DEFAULT 'BRL',
  
  -- Metadata
  stripe_payment_intent_id VARCHAR(255),
  pix_qr_code TEXT,
  pix_copy_paste VARCHAR(500),
  boleto_url VARCHAR(500),
  boleto_barcode VARCHAR(50),
  
  -- Card (tokenized)
  card_token VARCHAR(500), -- Stripe token
  card_last_four VARCHAR(4),
  card_brand VARCHAR(20), -- visa, mastercard
  
  -- Installments
  installments INT DEFAULT 1,
  
  -- Status
  status ENUM ('pending', 'processing', 'completed', 'failed', 'cancelled') DEFAULT 'pending',
  failure_reason TEXT,
  
  -- Fraud check
  risk_level ENUM ('low', 'medium', 'high') DEFAULT 'low',
  fraud_score DECIMAL(5,2),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  
  INDEX idx_order (order_id),
  INDEX idx_user (user_id),
  INDEX idx_status (status),
  INDEX idx_stripe_id (stripe_payment_intent_id)
);

-- Invoices (faturas)
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id),
  
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  
  total_cents INT NOT NULL,
  currency VARCHAR(3) DEFAULT 'BRL',
  
  issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  due_date DATE,
  
  pdf_url VARCHAR(500),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Refunds
CREATE TABLE refunds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID NOT NULL REFERENCES payments(id),
  order_id UUID NOT NULL REFERENCES orders(id),
  
  amount_cents INT NOT NULL,
  reason VARCHAR(255),
  
  stripe_refund_id VARCHAR(255),
  
  status ENUM ('pending', 'completed', 'failed') DEFAULT 'pending',
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  
  INDEX idx_payment (payment_id),
  INDEX idx_order (order_id)
);
```

### 9.4 Implementação (NestJS + Stripe)

```typescript
// payment.service.ts
import Stripe from 'stripe';

@Injectable()
export class PaymentService {
  private stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  async createPaymentIntent(orderId: string, userId: string) {
    // Get order details
    const order = await this.ordersService.findById(orderId);
    const user = await this.usersService.findById(userId);

    // Create payment intent
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: order.total_cents,
      currency: 'brl',
      customer: user.stripe_customer_id,
      metadata: {
        orderId,
        userId,
      },
    });

    // Save to database
    await this.paymentsRepository.create({
      order_id: orderId,
      user_id: userId,
      stripe_payment_intent_id: paymentIntent.id,
      amount_cents: order.total_cents,
      status: 'pending',
    });

    return {
      clientSecret: paymentIntent.client_secret,
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    };
  }

  async handleStripeWebhook(event: Stripe.Event) {
    const { type, data } = event;

    switch (type) {
      case 'payment_intent.succeeded':
        return this.handlePaymentSucceeded(data.object as Stripe.PaymentIntent);

      case 'payment_intent.payment_failed':
        return this.handlePaymentFailed(data.object as Stripe.PaymentIntent);

      case 'charge.refunded':
        return this.handleRefund(data.object as Stripe.Charge);
    }
  }

  private async handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
    const { orderId, userId } = paymentIntent.metadata as any;

    // Update payment
    await this.paymentsRepository.update(
      { stripe_payment_intent_id: paymentIntent.id },
      {
        status: 'completed',
        completed_at: new Date(),
      }
    );

    // Update order
    const order = await this.ordersService.findById(orderId);
    await this.ordersRepository.update(
      { id: orderId },
      { status: 'confirmed', confirmed_at: new Date() }
    );

    // Grant access to products
    for (const item of order.items) {
      await this.enrollmentsService.create({
        user_id: userId,
        product_id: item.product_id,
        access_granted_at: new Date(),
        expires_at: this.getExpirationDate(item.product),
      });
    }

    // Create invoice
    await this.invoicesService.generate(orderId);

    // Send email
    await this.mailService.sendOrderConfirmation({
      userId,
      orderId,
      downloadLink: `${process.env.APP_URL}/my-account/downloads`,
    });

    // Update analytics
    await this.analyticsService.trackSale(orderId, order.total_cents);
  }

  private async handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
    const { orderId } = paymentIntent.metadata as any;

    await this.paymentsRepository.update(
      { stripe_payment_intent_id: paymentIntent.id },
      {
        status: 'failed',
        failure_reason: paymentIntent.last_payment_error?.message,
      }
    );

    // Notify user
    await this.mailService.sendPaymentFailed({ orderId });
  }

  // Pix (via Stripe)
  async createPixQRCode(orderId: string, userId: string) {
    const order = await this.ordersService.findById(orderId);

    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: order.total_cents,
      currency: 'brl',
      payment_method_types: ['klarna'], // Stripe usa Klarna para Pix no Brasil
      metadata: { orderId, userId },
    });

    // Generate QR code (usando library externa)
    const qrCode = generateQRCode(paymentIntent.client_secret);

    return {
      qrCode,
      pixCopyPaste: paymentIntent.client_secret, // Seria a chave Pix real
      expiresIn: 3600, // 1 hora
    };
  }
}

// payment.controller.ts
@Controller('payments')
export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  @Post('create-payment-intent')
  @UseGuards(JwtAuthGuard)
  async createPaymentIntent(@Body() { orderId }: any, @Req() req: any) {
    return this.paymentService.createPaymentIntent(orderId, req.user.id);
  }

  @Post('webhook')
  @RawBodyRequest()
  async handleWebhook(@Body() rawBody: Buffer, @Headers('stripe-signature') sig: string) {
    return this.paymentService.handleStripeWebhook(
      this.stripe.webhooks.constructEvent(
        rawBody,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      )
    );
  }
}
```

---

## 10. PAINEL ADMINISTRATIVO

### 10.1 Funcionalidades

```
Dashboard Admin
├── Analytics (KPIs)
│   ├── Receita total/mensal
│   ├── Número de alunos
│   ├── Taxa de conversão
│   ├── Churn rate
│   ├── Ticket médio
│   ├── LTV (Lifetime Value)
│   └── Gráficos (revenue, users, growth)
│
├── Gerenciamento de Produtos
│   ├── Criar/editar/deletar apostilas
│   ├── Upload de PDFs
│   ├── Definir preços
│   ├── Criar variantes
│   ├── Bundles
│   ├── Cupons/Promoções
│   └── Preview (como aluno vê)
│
├── Gerenciamento de Pedidos
│   ├── Listar pedidos
│   ├── Ver detalhes
│   ├── Processar reembolsos
│   ├── Gerar faturas
│   └── Filtros avançados
│
├── Gerenciamento de Usuários
│   ├── Listar alunos
│   ├── Ver perfil
│   ├── Bloquear/desbloquear
│   ├── Resetar senha
│   ├── Ver histórico de compras
│   └── Segmentação
│
├── Simulados
│   ├── Criar simulados
│   ├── Adicionar questões
│   ├── Ver estatísticas
│   ├── Análise de questões
│   └── Recomendações
│
├── Blog/Conteúdo
│   ├── Criar posts
│   ├── Editor WYSIWYG
│   ├── Agendamento
│   ├── SEO optimization
│   └── Comentários (moderar)
│
├── Afiliados
│   ├── Listar afiliados
│   ├── Gerar links
│   ├── Ver comissões
│   ├── Pagamentos
│   └── Relatórios
│
├── Marketing
│   ├── Cupons
│   ├── Campanhas por email
│   ├── SMS
│   ├── Notificações push
│   └── Analytics
│
├── Suporte
│   ├── Tickets
│   ├── Chat com alunos
│   ├── FAQ
│   └── Feedback
│
└── Configurações
    ├── Dados da empresa
    ├── Integração de pagamento
    ├── Email SMTP
    ├── Taxas/Margens
    ├── Permissões de usuários
    ├── Logs de auditoria
    └── Backup/Restore
```

### 10.2 Stack Recomendado para Admin

```yaml
Frontend:
  - Next.js 14 (SSR + ISR)
  - TailwindCSS + shadcn/ui
  - React Query (data fetching)
  - Zustand (state management)
  - React Table (data grid)
  - Recharts (gráficos)
  - TipTap (editor de conteúdo)
  
Backend (simples, já incluso):
  - Rotas REST já implementadas
  - Autenticação JWT
  - Role-based access control (RBAC)
  
Funcionalidades:
  - Dark mode
  - Responsive (mobile-friendly)
  - Exportar dados (CSV, PDF)
  - Filtros e search avançado
  - Undo/Redo
```

### 10.3 Exemplo de Página (Analytics)

```typescript
// app/admin/dashboard/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, BarChart, PieChart } from 'recharts';

export default function AdminDashboard() {
  const { data: stats } = useQuery(
    ['admin-stats'],
    api.getAdminStats,
    { staleTime: 60 * 1000 } // 1 min
  );

  if (!stats) return <Skeleton />;

  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        <KPICard
          title="Receita (Mês)"
          value={`R$ ${formatCurrency(stats.monthlyRevenue)}`}
          change="+12.5%"
          icon={DollarSign}
        />
        <KPICard
          title="Alunos Ativos"
          value={stats.activeStudents}
          change="+8.2%"
          icon={Users}
        />
        <KPICard
          title="Taxa de Conversão"
          value={`${stats.conversionRate}%`}
          change="+2.1%"
          icon={TrendingUp}
        />
        <KPICard
          title="Churn Rate"
          value={`${stats.churnRate}%`}
          change="-1.5%"
          icon={AlertCircle}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Receita (últimos 30 dias)</CardTitle>
          </CardHeader>
          <CardContent>
            <LineChart data={stats.revenueChart} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Usuários por Origem</CardTitle>
          </CardHeader>
          <CardContent>
            <PieChart data={stats.sourceChart} />
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Pedidos Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={orderColumns}
            data={stats.recentOrders}
            pagination
            filtering
          />
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## 11. BLOG E SEO

### 11.1 Requisitos

```
Blog:
  ├── Sistema de posts
  ├── Categorias e tags
  ├── Agendamento de publicação
  ├── Editor visual (TipTap)
  ├── Suporte a imagem em destaque
  ├── Autor do post
  ├── Comentários (com moderação)
  ├── Social sharing
  └── Newsletter integration

SEO:
  ├── Meta tags dinâmicas
  ├── Open Graph
  ├── Sitemap XML
  ├── Robots.txt
  ├── JSON-LD (schema markup)
  ├── Canonical URLs
  ├── Breadcrumbs
  ├── AMP pages
  ├── Mobile optimization
  └── Core Web Vitals tracking

Performance:
  ├── Image optimization (next/image)
  ├── Lazy loading
  ├── Code splitting
  ├── Cache headers
  ├── Compression (gzip, brotli)
  └── CDN integration
```

### 11.2 Schema de Blog

```sql
CREATE TABLE blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  excerpt VARCHAR(500),
  content TEXT NOT NULL, -- Markdown ou HTML
  
  featured_image_url VARCHAR(500),
  
  -- SEO
  meta_description VARCHAR(160),
  meta_keywords VARCHAR(255),
  focus_keyword VARCHAR(100),
  
  -- Author
  author_id UUID NOT NULL REFERENCES users(id),
  
  -- Categorization
  category_id UUID REFERENCES blog_categories(id),
  tags VARCHAR(255)[], -- ARRAY tipo
  
  -- Status
  status ENUM ('draft', 'scheduled', 'published', 'archived') DEFAULT 'draft',
  published_at TIMESTAMP,
  scheduled_for TIMESTAMP,
  
  -- Stats
  view_count INT DEFAULT 0,
  comment_count INT DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FULLTEXT INDEX ft_search (title, excerpt, content),
  INDEX idx_status_published (status, published_at),
  INDEX idx_category (category_id)
);

CREATE TABLE blog_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  
  author_name VARCHAR(100),
  author_email VARCHAR(255),
  
  content TEXT NOT NULL,
  
  approved BOOLEAN DEFAULT FALSE,
  parent_comment_id UUID REFERENCES blog_comments(id),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_post_approved (post_id, approved)
);

CREATE TABLE blog_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 11.3 Implementação (Next.js)

```typescript
// app/blog/[slug]/page.tsx
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await api.getBlogPost(params.slug);

  if (!post) return {};

  return {
    title: post.title,
    description: post.meta_description || post.excerpt,
    keywords: post.meta_keywords,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      url: `${process.env.NEXT_PUBLIC_APP_URL}/blog/${post.slug}`,
      images: [
        {
          url: post.featured_image_url,
          width: 1200,
          height: 630,
        },
      ],
      publishedTime: post.published_at,
      authors: [post.author.name],
      tags: post.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: [post.featured_image_url],
    },
    canonical: `${process.env.NEXT_PUBLIC_APP_URL}/blog/${post.slug}`,
  };
}

export default async function BlogPost({ params }: Props) {
  const post = await api.getBlogPost(params.slug);

  if (!post) notFound();

  // Increment view count
  await api.incrementBlogViewCount(post.id);

  return (
    <article className="max-w-2xl mx-auto py-12">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbItem>Blog</BreadcrumbItem>
        <BreadcrumbItem>{post.category.name}</BreadcrumbItem>
        <BreadcrumbItem current>{post.title}</BreadcrumbItem>
      </Breadcrumb>

      {/* Header */}
      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
        <div className="flex items-center gap-4 text-muted">
          <span>{post.author.name}</span>
          <span>•</span>
          <time>{formatDate(post.published_at)}</time>
          <span>•</span>
          <span>{post.view_count} visualizações</span>
        </div>
      </header>

      {/* Featured Image */}
      {post.featured_image_url && (
        <Image
          src={post.featured_image_url}
          alt={post.title}
          width={800}
          height={400}
          className="w-full rounded-lg mb-8"
          priority
        />
      )}

      {/* Content */}
      <div
        className="prose prose-lg max-w-none mb-12"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {/* Schema.org JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: post.title,
            description: post.excerpt,
            image: post.featured_image_url,
            datePublished: post.published_at,
            author: {
              '@type': 'Person',
              name: post.author.name,
            },
            keywords: post.tags.join(', '),
          }),
        }}
      />

      {/* Tags */}
      <div className="flex gap-2 mb-8">
        {post.tags.map(tag => (
          <Link key={tag} href={`/blog?tag=${tag}`}>
            <Badge variant="outline">{tag}</Badge>
          </Link>
        ))}
      </div>

      {/* Comments */}
      <CommentsSection postId={post.id} />

      {/* Related Posts */}
      <RelatedPosts categoryId={post.category_id} />
    </article>
  );
}

// app/blog/page.tsx - Listagem com paginação
export default async function BlogIndex({
  searchParams,
}: {
  searchParams: { page?: string; category?: string; tag?: string };
}) {
  const page = parseInt(searchParams.page || '1');
  const category = searchParams.category;
  const tag = searchParams.tag;

  const { posts, total } = await api.getBlogPosts({
    page,
    limit: 12,
    category,
    tag,
  });

  return (
    <div className="max-w-6xl mx-auto py-12">
      <h1 className="text-4xl font-bold mb-12">Blog</h1>

      <div className="grid grid-cols-3 gap-8 mb-12">
        {posts.map(post => (
          <article key={post.id} className="flex flex-col">
            <Image
              src={post.featured_image_url}
              alt={post.title}
              width={400}
              height={250}
              className="rounded-lg mb-4 object-cover"
            />
            <h2 className="text-xl font-bold mb-2">{post.title}</h2>
            <p className="text-muted mb-4">{post.excerpt}</p>
            <Link href={`/blog/${post.slug}`} className="text-primary">
              Ler artigo →
            </Link>
          </article>
        ))}
      </div>

      <Pagination
        current={page}
        total={Math.ceil(total / 12)}
        baseUrl="/blog"
      />
    </div>
  );
}
```

---

## 12. SISTEMA DE CUPONS

### 12.1 Tipos de Cupons

```
Cupons:
├── Percentual
│   ├── 10% de desconto
│   └── Válido em qualquer produto
│
├── Valor Fixo
│   ├── R$ 50 de desconto
│   └── Válido em compras acima de R$ 200
│
├── BOGO (Buy One Get One)
│   ├── Compre 1 apostila, ganhe 1 igual
│   └── Máx. 1 uso por cliente
│
├── Frete Grátis
│   └── Aplica em bundles específicos
│
├── Cupom por Referência
│   ├── Código único por afiliado
│   └── Pode ter limite de usos
│
└── Cupom Temporário
    ├── Black Friday (48 horas)
    ├── Lançamento (primeira semana)
    └── VIP (acesso exclusivo)
```

### 12.2 Schema de Cupons

```sql
CREATE TABLE coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  code VARCHAR(50) UNIQUE NOT NULL,
  description VARCHAR(255),
  
  -- Tipo de desconto
  discount_type ENUM ('percentage', 'fixed', 'bogo', 'free_shipping') DEFAULT 'percentage',
  discount_value INT NOT NULL, -- % ou centavos
  
  -- Aplicação
  applicable_to ENUM ('all', 'category', 'product', 'bundle') DEFAULT 'all',
  applicable_id UUID REFERENCES products(id), -- se specific
  
  -- Limites
  minimum_purchase_cents INT, -- compra mínima para aplicar
  max_discount_cents INT, -- desconto máximo (ex: max 50 reais)
  max_uses INT, -- quantas vezes pode ser usado (NULL = ilimitado)
  max_uses_per_user INT DEFAULT 1, -- máximo por cliente
  
  -- Datas
  valid_from TIMESTAMP,
  valid_until TIMESTAMP,
  
  -- Status
  active BOOLEAN DEFAULT TRUE,
  
  -- Tracking
  uses_count INT DEFAULT 0,
  total_discount_given_cents INT DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(code),
  INDEX idx_code_active (code, active)
);

CREATE TABLE coupon_uses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id UUID NOT NULL REFERENCES coupons(id),
  order_id UUID NOT NULL REFERENCES orders(id),
  user_id UUID NOT NULL REFERENCES users(id),
  
  discount_value_cents INT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(coupon_id, order_id),
  INDEX idx_user_coupon (user_id, coupon_id)
);
```

### 12.3 Validação de Cupom (Backend)

```typescript
// coupon.service.ts
@Injectable()
export class CouponService {
  async validateAndApplyCoupon(
    code: string,
    userId: string,
    orderItems: OrderItem[],
    orderTotal: number,
  ) {
    // 1. Find coupon
    const coupon = await this.couponsRepository.findOne({ code });

    if (!coupon || !coupon.active) {
      throw new BadRequestException('Cupom inválido ou expirado');
    }

    // 2. Check dates
    const now = new Date();
    if (coupon.valid_from && coupon.valid_from > now) {
      throw new BadRequestException('Cupom ainda não está válido');
    }
    if (coupon.valid_until && coupon.valid_until < now) {
      throw new BadRequestException('Cupom expirou');
    }

    // 3. Check uses limit
    if (coupon.max_uses && coupon.uses_count >= coupon.max_uses) {
      throw new BadRequestException('Cupom atingiu o limite de usos');
    }

    // 4. Check user usage limit
    const userUses = await this.couponUsesRepository.countWhere({
      coupon_id: coupon.id,
      user_id: userId,
    });

    if (userUses >= (coupon.max_uses_per_user || 1)) {
      throw new BadRequestException(
        'Você já usou este cupom o máximo permitido'
      );
    }

    // 5. Check minimum purchase
    if (coupon.minimum_purchase_cents && orderTotal < coupon.minimum_purchase_cents) {
      throw new BadRequestException(
        `Compra mínima de R$ ${this.formatPrice(coupon.minimum_purchase_cents)} necessária`
      );
    }

    // 6. Check applicability
    if (coupon.applicable_to === 'product') {
      const hasProduct = orderItems.some(
        item => item.product_id === coupon.applicable_id
      );
      if (!hasProduct) {
        throw new BadRequestException('Este cupom não se aplica a seus produtos');
      }
    }

    if (coupon.applicable_to === 'category') {
      const hasCategory = await this.validateCategoryApplicability(
        orderItems,
        coupon.applicable_id
      );
      if (!hasCategory) {
        throw new BadRequestException('Este cupom não se aplica a suas categorias');
      }
    }

    // 7. Calculate discount
    let discountValue = 0;

    switch (coupon.discount_type) {
      case 'percentage':
        discountValue = Math.floor(orderTotal * (coupon.discount_value / 100));
        break;

      case 'fixed':
        discountValue = coupon.discount_value;
        break;

      case 'bogo':
        // Desconto do produto mais barato
        discountValue = Math.min(
          ...orderItems.map(item => item.price_cents)
        );
        break;
    }

    // Apply max discount limit
    if (coupon.max_discount_cents) {
      discountValue = Math.min(discountValue, coupon.max_discount_cents);
    }

    return {
      coupon,
      discountValue,
      newTotal: orderTotal - discountValue,
    };
  }

  async applyCoupon(orderId: string, couponId: string, userId: string) {
    // Update coupon uses
    await this.couponsRepository.increment(
      { id: couponId },
      { uses_count: 1 }
    );

    // Log usage
    await this.couponUsesRepository.create({
      coupon_id: couponId,
      order_id: orderId,
      user_id: userId,
      discount_value_cents: discountValue, // passed from controller
    });
  }
}
```

---

## 13. SISTEMA DE AFILIADOS

### 13.1 Funcionalidades

```
Programa de Afiliados:
├── Registro de afiliado
├── Painel do afiliado
│   ├── Link único de referência
│   ├── QR code do link
│   ├── Tracking de cliques
│   ├── Conversões (vendas)
│   ├── Comissões ganhas
│   ├── Relatórios
│   └── Pagamento
│
├── Configuração de comissão
│   ├── % por produto
│   ├── % por categoria
│   ├── Bonus por volume
│   └── Payout mínimo
│
├── Marketing materials
│   ├── Banners
│   ├── Emails template
│   ├── Social posts
│   └── Landing page
│
└── Integração
    ├── UTM tracking
    ├── Pixel de conversão
    ├── Deep linking
    └── Webhook de eventos
```

### 13.2 Schema

```sql
CREATE TABLE affiliates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id),
  
  affiliate_code VARCHAR(20) UNIQUE NOT NULL,
  
  -- Bank info
  bank_name VARCHAR(100),
  account_number VARCHAR(20),
  account_type ENUM ('checking', 'savings'),
  cpf VARCHAR(20),
  
  -- Commission
  default_commission_percentage DECIMAL(5,2),
  
  -- Stats
  total_clicks INT DEFAULT 0,
  total_conversions INT DEFAULT 0,
  total_earned_cents INT DEFAULT 0,
  
  status ENUM ('pending', 'approved', 'rejected', 'suspended') DEFAULT 'pending',
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE affiliate_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID NOT NULL REFERENCES affiliates(id),
  
  product_id UUID REFERENCES products(id),
  
  unique_token VARCHAR(50) UNIQUE NOT NULL,
  full_url VARCHAR(500),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE affiliate_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID NOT NULL REFERENCES affiliates(id),
  link_id UUID NOT NULL REFERENCES affiliate_links(id),
  
  visitor_ip VARCHAR(45),
  visitor_user_agent TEXT,
  referrer VARCHAR(500),
  
  clicked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_affiliate_clicked (affiliate_id, clicked_at)
);

CREATE TABLE affiliate_commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID NOT NULL REFERENCES affiliates(id),
  order_id UUID REFERENCES orders(id),
  
  commission_percentage DECIMAL(5,2),
  order_total_cents INT,
  commission_value_cents INT,
  
  status ENUM ('pending', 'approved', 'paid') DEFAULT 'pending',
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  paid_at TIMESTAMP
);

CREATE TABLE affiliate_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID NOT NULL REFERENCES affiliates(id),
  
  total_cents INT,
  status ENUM ('pending', 'processing', 'completed', 'failed') DEFAULT 'pending',
  
  transaction_id VARCHAR(255),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  processed_at TIMESTAMP
);
```

### 13.3 Dashboard do Afiliado

```typescript
// app/affiliate/dashboard/page.tsx
export default function AffiliateDashboard() {
  const { data: affiliate } = useQuery(
    ['affiliate-profile'],
    api.getAffiliateProfile
  );

  const { data: stats } = useQuery(
    ['affiliate-stats'],
    api.getAffiliateStats
  );

  return (
    <div className="space-y-8">
      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          label="Cliques"
          value={stats?.totalClicks}
          change="+12%"
        />
        <StatCard
          label="Conversões"
          value={stats?.totalConversions}
          change="+8%"
        />
        <StatCard
          label="Taxa de Conversão"
          value={`${stats?.conversionRate}%`}
        />
        <StatCard
          label="Ganhos"
          value={`R$ ${formatCurrency(stats?.totalEarned)}`}
          change="+15%"
        />
      </div>

      {/* Referral Link */}
      <Card>
        <CardHeader>
          <CardTitle>Seu Link de Afiliado</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              value={`${APP_URL}?aff=${affiliate.affiliate_code}`}
              readOnly
              className="flex-1"
            />
            <Button onClick={() => copyToClipboard()}>
              <Copy className="mr-2" /> Copiar
            </Button>
          </div>
          
          <QRCode
            value={`${APP_URL}?aff=${affiliate.affiliate_code}`}
            size={200}
            className="mt-4"
          />
        </CardContent>
      </Card>

      {/* Performance Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Performance (últimos 30 dias)</CardTitle>
        </CardHeader>
        <CardContent>
          <LineChart data={stats?.performanceChart} />
        </CardContent>
      </Card>

      {/* Recent Commissions */}
      <Card>
        <CardHeader>
          <CardTitle>Comissões Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={commissionColumns}
            data={stats?.recentCommissions}
          />
        </CardContent>
      </Card>

      {/* Payout */}
      <Card>
        <CardHeader>
          <CardTitle>Saque de Comissões</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p>
              Saldo disponível: <strong>R$ {formatCurrency(stats?.availableBalance)}</strong>
            </p>
            <p className="text-sm text-muted">
              Saque mínimo: R$ 100
            </p>
            <Button
              disabled={stats?.availableBalance < 10000}
            >
              Solicitar Saque
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## 14. ROADMAP DE IMPLEMENTAÇÃO

### **FASE 1: FUNDAÇÃO (Meses 1-2)** 🔴 CRÍTICO

**Objetivos**: Backend robusto + Autenticação + Pagamentos funcionando

#### Sprint 1.1 - Infraestrutura (Semana 1-2)
- [ ] Configurar repositório backend (NestJS)
- [ ] Setup Docker + docker-compose
- [ ] Configurar PostgreSQL + Redis localmente
- [ ] Setup AWS (RDS, S3, ElastiCache)
- [ ] Configurar CI/CD (GitHub Actions)
- [ ] Documentação técnica inicial

#### Sprint 1.2 - Database (Semana 2-3)
- [ ] Criar schemas SQL (users, products, orders, payments)
- [ ] Seed data (produtos, categorias, exames)
- [ ] Migrations setup (TypeORM/Prisma)
- [ ] Índices e constraints
- [ ] Backup/Restore procedures

#### Sprint 1.3 - Autenticação (Semana 3-4)
- [ ] Implementar registro + login (local)
- [ ] JWT + Refresh tokens
- [ ] OAuth (Google, GitHub)
- [ ] 2FA com TOTP
- [ ] Email verification
- [ ] Password reset flow
- [ ] Rate limiting + account lockout

**Testes**: 80%+ coverage, E2E auth flow

**Deliverable**: API com autenticação completa + docs

---

### **FASE 2: VENDAS (Meses 2-3)** 🔴 CRÍTICO

**Objetivos**: Sistema de compra + Pagamentos funcionando

#### Sprint 2.1 - Produtos (Semana 5-6)
- [ ] CRUD de produtos (admin)
- [ ] Upload de PDFs (S3)
- [ ] Variantes de produtos
- [ ] Preços e promoções
- [ ] Bundles/Combos
- [ ] Listar produtos (frontend)

#### Sprint 2.2 - Carrinho e Checkout (Semana 6-7)
- [ ] Carrinho melhorado (sessão persistida)
- [ ] Informações de faturamento
- [ ] Cálculo de impostos
- [ ] Validação de endereço

#### Sprint 2.3 - Integração Stripe (Semana 7-8)
- [ ] Cartão de crédito
- [ ] Pix (via Stripe)
- [ ] Webhooks
- [ ] Tratamento de erros
- [ ] 3D Secure

#### Sprint 2.4 - Boleto (Semana 8)
- [ ] Integração Gerencianet
- [ ] Geração de boleto
- [ ] Webhook de compensação

**Testes**: Pagamentos end-to-end, múltiplos cenários

**Deliverable**: E-commerce funcional com 3 métodos de pagamento

---

### **FASE 3: DOWNLOAD PROTEGIDO (Mês 3)** 🟠 ALTA

**Objetivos**: Downloads seguros + Auditoria

#### Sprint 3.1 - Download Service (Semana 9-10)
- [ ] Presigned URLs do S3
- [ ] Validação de acesso
- [ ] Rate limiting (5/dia)
- [ ] Auditoria de logs
- [ ] Watermark opcional

#### Sprint 3.2 - Frontend (Semana 10)
- [ ] Página de downloads
- [ ] Histórico de downloads
- [ ] Progresso de arquivo

**Deliverable**: Download protegido + auditoria

---

### **FASE 4: DASHBOARD ALUNO (Mês 3-4)** 🟠 ALTA

**Objetivos**: Área pessoal do aluno

#### Sprint 4.1 - Perfil e Compras (Semana 11-12)
- [ ] Dashboard com resumo
- [ ] Histórico de compras
- [ ] Dados pessoais
- [ ] Alterar senha/2FA

#### Sprint 4.2 - Estude e Progresso (Semana 12-13)
- [ ] Marcação de lições concluídas
- [ ] Progresso visual
- [ ] Tempo de estudo
- [ ] Recomendações

**Deliverable**: Dashboard funcional do aluno

---

### **FASE 5: SIMULADOS (Mês 4)** 🟠 ALTA

**Objetivos**: Simulados adaptativos

#### Sprint 5.1 - Base de Dados (Semana 14)
- [ ] Schema de quizzes
- [ ] Importação de questões
- [ ] Gerenciamento de questões

#### Sprint 5.2 - Interface (Semana 14-15)
- [ ] Player de quiz
- [ ] Timer
- [ ] Salvar progresso
- [ ] Resultado com análise

#### Sprint 5.3 - Analytics (Semana 15-16)
- [ ] Relatório de desempenho
- [ ] Questões mais erradas
- [ ] Comparação com turma
- [ ] Recomendações IA

**Deliverable**: Sistema de simulados com 200+ questões

---

### **FASE 6: PAINEL ADMIN (Mês 4-5)** 🟠 ALTA

**Objetivos**: Admin dashboard completo

#### Sprint 6.1 - Analytics (Semana 16-17)
- [ ] KPIs em tempo real
- [ ] Gráficos de receita
- [ ] Análise de usuários
- [ ] Funnel de conversão

#### Sprint 6.2 - Gerenciamento (Semana 17-18)
- [ ] CRUD de produtos
- [ ] Gerenciar pedidos
- [ ] Listar usuários
- [ ] Suporte (tickets)

#### Sprint 6.3 - Configurações (Semana 18-19)
- [ ] Integração Stripe
- [ ] Email SMTP
- [ ] Taxas/Margens
- [ ] Backup/Restore

**Deliverable**: Admin dashboard funcional + docs

---

### **FASE 7: BLOG E SEO (Mês 5-6)** 🟡 MÉDIA

**Objetivos**: Tráfego orgânico + Autoridade

#### Sprint 7.1 - Blog Backend (Semana 20)
- [ ] CRUD de posts
- [ ] Categorias e tags
- [ ] Agendamento
- [ ] Comentários

#### Sprint 7.2 - Frontend (Semana 20-21)
- [ ] Listagem de posts
- [ ] Página individual
- [ ] Busca
- [ ] Trending posts

#### Sprint 7.3 - SEO (Semana 21-22)
- [ ] Meta tags dinâmicas
- [ ] Sitemap + robots.txt
- [ ] JSON-LD schema
- [ ] Core Web Vitals
- [ ] Analytics integrada

**Deliverable**: Blog com 20+ artigos + SEO otimizado

---

### **FASE 8: SISTEMA DE CUPONS (Mês 6)** 🟡 MÉDIA

**Objetivos**: Promoções + Conversão

#### Sprint 8.1 - Backend (Semana 23)
- [ ] CRUD de cupons
- [ ] Validação e aplicação
- [ ] Rastreamento de uso

#### Sprint 8.2 - Frontend (Semana 23-24)
- [ ] Campo para inserir cupom
- [ ] Validação em tempo real
- [ ] Admin de cupons

**Deliverable**: Sistema de cupons funcional

---

### **FASE 9: AFILIADOS (Mês 6-7)** 🟡 MÉDIA

**Objetivos**: Crescimento viral via afiliados

#### Sprint 9.1 - Backend (Semana 25)
- [ ] Registro de afiliado
- [ ] Geração de links únicos
- [ ] Tracking de cliques
- [ ] Cálculo de comissões

#### Sprint 9.2 - Dashboard (Semana 25-26)
- [ ] Painel do afiliado
- [ ] Estatísticas
- [ ] Solicitação de saque
- [ ] Histórico

#### Sprint 9.3 - Marketing (Semana 26)
- [ ] Materiais para divulgação
- [ ] Email templates
- [ ] Banners

**Deliverable**: Programa de afiliados com 50+ participantes

---

### **FASE 10: OTIMIZAÇÕES E SCALE (Mês 7-8)** 🟢 BAIXA

**Objetivos**: Performance + Escalabilidade

#### Sprint 10.1 - Performance (Semana 27-28)
- [ ] Code splitting
- [ ] Image optimization
- [ ] Lazy loading
- [ ] Cache estratégias

#### Sprint 10.2 - Observabilidade (Semana 28)
- [ ] Sentry (error tracking)
- [ ] Prometheus + Grafana
- [ ] ELK Stack (logs)

#### Sprint 10.3 - Automação (Semana 28-29)
- [ ] Notificações por email
- [ ] SMS para pedidos
- [ ] Push notifications
- [ ] Scheduled tasks

**Deliverable**: Plataforma otimizada, pronta para escala

---

### **FASE 11: COMUNIDADE E GAMIFICAÇÃO (Mês 8-9)** 🟢 BAIXA

**Objetivos**: Engajamento + Retenção

#### Sprint 11.1 - Comunidade (Semana 30-31)
- [ ] Fórum por disciplina
- [ ] Sistema de dúvidas
- [ ] Chat em tempo real
- [ ] Moderação

#### Sprint 11.2 - Gamificação (Semana 31-32)
- [ ] Pontos/Badges
- [ ] Ranking
- [ ] Achievements
- [ ] Streaks

**Deliverable**: Comunidade ativa com 5.000+ posts

---

### **FASE 12: MONETIZAÇÃO ADICIONAL (Mês 9-10)** 🟢 BAIXA

**Objetivos**: Múltiplas fontes de receita

- [ ] Assinatura Premium
- [ ] Live sessions pagas
- [ ] Mentoria 1:1
- [ ] Análise de desempenho IA
- [ ] Consultoria para concursos

---

### **FASE 13: MOBILE APP (Mês 10-12)** 🟢 BAIXA

**Objetivos**: Acesso mobile nativo

- [ ] React Native (iOS + Android)
- [ ] Offline support
- [ ] Push notifications
- [ ] Mobile payments

---

### **FASE 14: INTERNACIONALIZAÇÃO (Mês 12+)** 🟢 MUITO BAIXA

**Objetivos**: Expansão internacional

- [ ] I18n (tradução)
- [ ] Múltiplas moedas
- [ ] Pagamentos internacionais
- [ ] Suporte em outras línguas

---

## Cronograma Visual

```
Jan  Feb  Mar  Apr  May  Jun  Jul  Aug  Sep  Oct  Nov  Dec
|----|----|----|----|----|----|----|----|----|----|----|----|
FASE 1: Fundação
     FASE 2: Vendas
          FASE 3-4: Download + Dashboard
               FASE 5-6: Simulados + Admin
                    FASE 7-8: Blog + Cupons
                         FASE 9: Afiliados
                              FASE 10: Otimizações
                                   FASE 11: Comunidade
                                        FASE 12: Monetização
                                             FASE 13-14: Mobile + I18n
```

---

## Métricas de Sucesso

### Por Fase

| Fase | Métrica | Target |
|------|---------|--------|
| 1 | Uptime | 99.9% |
| 2 | Taxa de conversão | 5%+ |
| 3 | Downloads/dia | 100+ |
| 4 | Retenção 7d | 60%+ |
| 5 | Quiz completados/dia | 500+ |
| 6 | Admin tasks | <30s |
| 7 | Tráfego orgânico | 10k+ sesões |
| 8 | Cupons aplicados | 20%+ pedidos |
| 9 | Afiliados ativos | 50+ |
| 10 | LCP | <1.5s |
| 11 | Posts/mês | 100+ |
| 12 | Assinantes | 5k+ |
| 13 | Downloads app | 50k+ |
| 14 | Usuários intl | 20% |

---

## Orçamento Estimado

| Item | Mês 1-3 | Mês 4-6 | Mês 7-12 | Total |
|------|---------|---------|----------|-------|
| **Infraestrutura** |  |  |  |  |
| AWS (RDS, S3, EC2) | R$ 2k | R$ 3k | R$ 5k | R$ 30k |
| CDN/Cloudflare | R$ 100 | R$ 200 | R$ 300 | R$ 1.8k |
| **Ferramentas** |  |  |  |  |
| Stripe | 3% trans | 3% trans | 3% trans | Variável |
| Sentry/Monitoring | R$ 500 | R$ 500 | R$ 1k | R$ 9k |
| Email (SendGrid) | R$ 100 | R$ 200 | R$ 300 | R$ 1.8k |
| **Recursos Humanos** |  |  |  |  |
| Backend (1 dev) | R$ 12k | R$ 12k | R$ 14k | R$ 152k |
| Frontend (1 dev) | R$ 12k | R$ 12k | R$ 14k | R$ 152k |
| DevOps/SRE (part-time) | R$ 6k | R$ 6k | R$ 8k | R$ 68k |
| QA/Testing | R$ 4k | R$ 4k | R$ 5k | R$ 39k |
| **Total** | **R$ 36.7k** | **R$ 38k** | **R$ 48.3k** | **R$ 453.6k** |

> Excludes: Design, Product Manager, Marketing, Sales

---

## Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|--------|-----------|
| Delay em pagamentos | Alta | Alto | Integrar Stripe month 1, fallback manual |
| Churn alto | Alta | Alto | Foco em onboarding, gamificação |
| Segurança (breach) | Média | Crítico | Pentest, SOC2, bug bounty program |
| Infraestrutura (outage) | Baixa | Alto | Multi-region, auto-scaling, RTO <15min |
| Concorrência | Média | Médio | Focar em diferencial (comunidade, IA) |
| Burn rate | Média | Alto | Milestone-based releases, market testing |

---

## Checklist Final

- [ ] Arquitetura aprovada pela leadership
- [ ] Stack técnico validado
- [ ] Roadmap com stakeholders alinhado
- [ ] Budget aprovado
- [ ] Infraestrutura AWS provisionada
- [ ] Time técnico recrutado
- [ ] CI/CD pipeline setup
- [ ] Documentação técnica versionada
- [ ] Processo de QA definido
- [ ] Monitoring e alertas configurados

---

## Conclusão

Este masterplan transforma NORTIS de um MVP em uma **plataforma corporativa de educação para concursos públicos**, escalável, segura e monetizada.

O roadmap é agressivo mas realista, focado em:
1. **Segurança e confiança** (fase 1-2)
2. **Receita** (fase 2-3)
3. **Retenção** (fase 4-6)
4. **Growth** (fase 7-9)
5. **Scale** (fase 10+)

**Próximos passos**: Review com CTO/PM, ajustar timeline, iniciar fase 1.

---

**Documento preparado por**: Arquiteto de Software Sênior  
**Data**: Junho 2026  
**Versão**: 1.0
