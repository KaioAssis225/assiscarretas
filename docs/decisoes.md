# Registro de decisões

Decisões técnicas tomadas durante a implementação, com justificativa.
Decisões de negócio pendentes ficam em aberto no Bloco 0 do
[06-plano-de-implementacao.md](../06-plano-de-implementacao.md) até aprovação.

## Bloco 1 — Fundações e ambiente (2026-07-13)

| # | Decisão | Justificativa |
|---|---|---|
| 1.1 | `carreta-livre-referencia/` excluída do git via `.gitignore` | O protótipo contém `.env` com chaves do Supabase; versioná-lo publicaria segredos. A pasta permanece intocada no disco, como manda o prompt mestre. |
| 1.2 | Linter do frontend é **oxlint** (default do template Vite atual) em vez de ESLint | Zero configuração extra, mais rápido, cobre as regras necessárias neste estágio. Pode ser trocado por ESLint se alguma regra específica fizer falta. |
| 1.3 | shadcn/ui **ainda não instalado**; Tailwind configurado com paleta neutra compatível | O Bloco 1 pede apenas layout e roteamento base. Componentes shadcn entram no Bloco 3/4 junto com as primeiras telas reais, evitando dependências sem uso. |
| 1.4 | `Dockerfile` fica em `backend/` (não em `infra/docker/`) | Mantém o contexto de build pequeno e o caminho simples no Compose e no CI. `infra/` recebe scripts de infraestrutura quando existirem. |
| 1.5 | Logging estruturado com `logging` da stdlib + formatter JSON próprio | Evita dependência extra (structlog) sem necessidade comprovada, conforme restrição de dependências do prompt mestre. |
| 1.6 | Configuração via `pydantic-settings` com prefixo `ASSISCARRETAS_` | Evita colisão de variáveis de ambiente e documenta o contrato de configuração. |
| 1.7 | Correlation ID: aceita apenas UUID válido vindo do cliente; caso contrário gera novo | Impede injeção de conteúdo arbitrário em logs através do header. |
| 1.8 | Portas do Compose vinculadas a `127.0.0.1` | PostgreSQL e API de desenvolvimento não ficam expostos na rede local. |
| 1.9 | Python 3.13 local/CI/Docker; `requires-python >= 3.12` | 3.13 é o disponível no ambiente; manter compatibilidade 3.12 dá folga para o deploy. |

## Bloco 2 — Banco, migrations e dados de desenvolvimento (2026-07-14)

| # | Decisão | Justificativa |
|---|---|---|
| 2.1 | Enums como `VARCHAR + CHECK` (`native_enum=False`), não tipos ENUM nativos | Alterar enum nativo no Postgres exige migrations especiais; VARCHAR+CHECK evolui com `ALTER CONSTRAINT` simples. |
| 2.2 | EXCLUDE constraint (`btree_gist`) contra sobreposição de locações RESERVED/ACTIVE/OVERDUE | Defesa no próprio banco contra dupla reserva sob concorrência (ponytail: constraint de banco antes de código de aplicação). Complementa a transação do serviço (Bloco 5), não a substitui. |
| 2.3 | Intervalo de agenda com fim exclusivo (`tstzrange`) | Devolver às 8h e retirar às 8h do mesmo dia não conflita — comportamento esperado de balcão. |
| 2.4 | FKs de histórico com `ON DELETE RESTRICT` (rentals→clients/trailers, inspections→rentals); CASCADE apenas em `refresh_tokens` e `inspection_photos` | Histórico comercial nunca desaparece por exclusão; filhas técnicas diretas podem cascatear. |
| 2.5 | Convenção de nomes no `MetaData` (uq_/ck_/fk_/ix_/pk_) | Constraints nomeadas tornam migrations futuras determinísticas e mensagens de erro mapeáveis a códigos da API. |
| 2.6 | Migration inicial autogerada e revisada, com up+down testados (up→down→up) | Segue ecc/database-migrations: toda migration reversível e testada bidirecionalmente. |
| 2.7 | Seed com CPFs sintéticos com dígitos verificadores válidos e senha dev com `must_change_password=true`; recusa rodar em `production` | Dados 100% fictícios (LGPD) mas que passam validação real; contas de seed nunca ficam utilizáveis em produção. |
| 2.8 | `DATABASE_URL` sem prefixo `ASSISCARRETAS_` | Convenção universal de PaaS/plataformas gerenciadas. |
| 2.9 | argon2-cffi adicionado já no Bloco 2 | O seed precisa criar usuários com hash real; será reutilizado pela autenticação no Bloco 3. |
| 2.10 | Testes de integração usam banco `assiscarretas_test` recriado do zero por migration a cada sessão; `pytest.skip` se Postgres indisponível | Testa o caminho real (migrations + constraints Postgres); suíte unitária continua rodando sem Docker. |

## Bloco 3 — Autenticação, usuários e RBAC (2026-07-17)

| # | Decisão | Justificativa |
|---|---|---|
| 3.1 | PyJWT (HS256) para access token; refresh token aleatório (`secrets.token_urlsafe`) com SHA-256 no banco | PyJWT é leve e suficiente; refresh não precisa ser JWT — hash simples permite revogação e nunca persiste o token em claro. |
| 3.2 | Reuso de refresh token já revogado derruba TODAS as sessões do usuário | Sinal clássico de roubo de cookie; a rotação garante que o portador legítimo sempre tem o token mais novo. |
| 3.3 | Cookie de refresh com `Path=/api/v1/auth`, HttpOnly, SameSite=Lax; `Secure` fora de `local` | O cookie só trafega nas rotas de auth; Lax funciona porque frontend e API compartilham o site (localhost/localhost, e em produção subdomínios do mesmo domínio). |
| 3.4 | Rate limit de login em memória por processo (`ponytail:` teto documentado) | Suficiente para uma instância; trocar por Redis quando houver múltiplos workers. Instância vive em `app.state` — isolada por app em testes. |
| 3.5 | `must_change_password` bloqueia rotas de negócio via dependência (`403 troca_de_senha_obrigatoria`); troca de senha revoga todas as sessões | Implementa a troca obrigatória do doc 05 sem espalhar `if` pelos routers. |
| 3.6 | E-mails de seed/teste em domínios reais fictícios (`.com`), nunca `.local` | Descoberto em teste: `email-validator` rejeita domínios reservados (`.local`) — o login dos usuários seedados retornaria 422. |
| 3.7 | Mensagem única para e-mail inexistente e senha errada; auditoria de `login_failed`/`login_success`/`refresh_reuse_detected` | Anti-enumeração de usuários (doc 05) + trilha exigida pela seção de auditoria. |
| 3.8 | Access token apenas em memória no frontend; restauração de sessão via `POST /auth/refresh` no boot | Nada de token em localStorage; o cookie HttpOnly é a única persistência. |
| 3.9 | IDOR em `/users/{id}`: papéis sem permissão recebem 403 tanto para recurso existente quanto inexistente | Não vaza a existência de recursos de terceiros (doc 05 §5.3). |
