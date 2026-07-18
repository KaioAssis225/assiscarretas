# Deploy — Railway (API + Postgres) e Vercel (frontend)

Arquitetura: o Vercel serve o frontend **e faz proxy de `/api/*` para o
Railway** (`frontend/vercel.json`). Assim o cookie de refresh é first-party
e funciona também no Safari/iPhone, que bloqueia cookies de terceiros.

```
navegador ── https://seu-app.vercel.app ──┬─ /            → SPA (dist/)
                                          └─ /api/v1/...  → proxy → Railway
Railway: API (Docker) ── Postgres (plugin, rede interna)
```

## 1. GitHub

O deploy dos dois lados é feito a partir de um repositório GitHub.

```bash
# na raiz do projeto (o repo git já existe e está commitado)
gh repo create assiscarretas --private --source . --push
# ou manualmente: crie o repo vazio no github.com e
git remote add origin https://github.com/SEU-USUARIO/assiscarretas.git
git push -u origin main
```

## 2. Railway — banco e API

1. Em https://railway.app → **New Project** → **Deploy PostgreSQL**.
2. No mesmo projeto: **New → GitHub Repo** → selecione `assiscarretas`.
3. No serviço criado → **Settings**:
   - **Root Directory**: `backend` (ele achará `railway.json` e `Dockerfile`).
4. **Variables** do serviço da API:
   - `DATABASE_URL` → **Add Reference** → escolha a variável `DATABASE_URL`
     do serviço Postgres (o código aceita `postgres://` e converte sozinho).
   - `ASSISCARRETAS_ENVIRONMENT` = `production`
   - `ASSISCARRETAS_SECRET_KEY` = gere na sua máquina:
     `python -c "import secrets; print(secrets.token_urlsafe(48))"`
   - `ASSISCARRETAS_CORS_ORIGINS` = `https://SEU-APP.vercel.app`
     (volte aqui depois do passo 3 com o domínio real)
5. Deploy roda sozinho. O `railway.json` já cuida de:
   - `alembic upgrade head` **antes** de trocar a versão (pre-deploy);
   - iniciar o uvicorn na porta do Railway com `--proxy-headers`;
   - health check em `/api/v1/health`.
6. **Settings → Networking → Generate Domain** e anote o domínio
   (ex.: `assiscarretas-api-production.up.railway.app`).
7. Crie o primeiro ADMIN (uma vez): instale a CLI (`npm i -g @railway/cli`),
   depois:
   ```bash
   railway login
   railway link   # escolha o projeto e o serviço da API
   railway run --service <nome-do-servico-da-api> \
     env ADMIN_EMAIL=voce@empresa.com ADMIN_PASSWORD='SenhaForte123!' \
     python scripts/create_admin.py
   ```
   (Alternativa sem CLI: defina `ADMIN_EMAIL`/`ADMIN_PASSWORD` como
   variáveis temporárias, abra um one-off shell no painel, rode
   `python scripts/create_admin.py` e **remova as variáveis**.)

## 3. Vercel — frontend

1. Edite `frontend/vercel.json` e troque
   `SUBSTITUA-PELO-DOMINIO-DO-RAILWAY.up.railway.app` pelo domínio do
   passo 2.6. Commit + push.
2. Em https://vercel.com → **Add New → Project** → importe o repo.
   - **Root Directory**: `frontend`
   - Framework: Vite (detectado; build `npm run build`, output `dist`)
   - **Não** defina `VITE_API_URL` (produção usa o próprio domínio via proxy).
3. Deploy. Anote o domínio (ex.: `assiscarretas.vercel.app`).
4. Volte ao Railway e ajuste `ASSISCARRETAS_CORS_ORIGINS` com esse domínio.

## 4. Smoke test (sempre após deploy)

1. `https://SEU-APP.vercel.app/api/v1/health` → `{"status":"ok","environment":"production",...}`.
2. Abra o app, faça login com o ADMIN criado → deve exigir troca de senha.
3. Troque a senha, faça login de novo, F5 (sessão deve persistir via cookie).
4. `https://.../docs` **não** deve abrir em produção (OpenAPI desligada).

## Notas de operação

- **Migrations**: automáticas a cada deploy (pre-deploy). Rollback de app é
  seguro enquanto a migration for compatível (expand-contract).
- **Backup**: o Postgres do Railway tem backups; configure a retenção no
  painel e ensaie uma restauração antes de dados reais (Bloco 10).
- **Rate limit** é por processo; a instância única atual atende. Ao escalar
  para 2+ réplicas, migrar para Redis (decisão 3.4).
- **Uploads de vistoria (Bloco 6+)**: exigirão storage S3-compatível
  (Cloudflare R2/Backblaze); o filesystem do Railway é efêmero.
- Segredos **nunca** entram no repositório — só nos painéis.
