# Projeto Vitória Cestas - Backend

API em Node.js/Express para gerenciamento de estoque, com cadastro de itens, fornecedores e autenticação de administrador via JWT.

## Configuração
1. Duplique `.env.example` para `.env` e informe `DATABASE_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` e `JWT_SECRET`.
2. Configure as credenciais do Redis serverless (Upstash) com as variáveis `UPSTASH_REDIS_REST_URL` e `UPSTASH_REDIS_REST_TOKEN`.
3. Opcional: ajuste o TTL do cache de imagens via `IMAGE_CACHE_TTL_SECONDS` (padrão 1800 segundos = 30 minutos) e defina `BLOB_READ_WRITE_TOKEN` para publicar as imagens no Vercel Blob (o arquivo fica salvo no Blob e o Redis mantém a cópia em memória/base64 com a URL pública guardada).
4. Instale dependências com `npm install`.
5. Rode a aplicação com `npm start` (porta padrão 3000).
6. Acesse `/docs` para documentação Swagger e `/` para o formulário de cadastro de itens.

### Cache e upload de imagens
- Todas as imagens servidas do diretório `public/` passam pela camada de cache Redis antes de serem lidas do disco, incluindo entradas que foram previamente armazenadas como **URL absoluta**, **data URL** ou **base64 bruto** (todas as variantes são reidratadas e devolvidas com o `Content-Type` correto).
- Quando `BLOB_READ_WRITE_TOKEN` estiver definido, as imagens ausentes no cache serão enviadas automaticamente para o **Vercel Blob** com `access: public`. O arquivo fica persistido no Blob, e o Redis salva **tanto a URL pública quanto uma cópia base64** para servir diretamente da memória nas próximas requisições (evita ter que reprocessar ou reler do disco / Blob).
- A chave segue o padrão `image:public:<caminho-da-imagem>` (ex.: `image:public:logo.png`).
- Cada entrada expira conforme `IMAGE_CACHE_TTL_SECONDS` (ou 30 minutos por padrão) para evitar dados desatualizados.
- O Upstash é um banco chave-valor (não há tabelas a criar). Para depurar, use o painel do Upstash ou o console/CLI executando `redis.get("image:public:seu/arquivo.png")` e verificando se o valor base64 ou URL foi persistido com o content-type correspondente.
- O endpoint `POST /api/upload` (alias `/upload`) agora recebe `multipart/form-data` com o campo `file`, salva o arquivo em `public/uploads/`, publica no Blob (quando configurado) e grava a entrada de cache `image:public:uploads/<arquivo>` contendo a URL pública e o base64. A resposta retorna tanto `url` (Blob ou `/uploads/...`) quanto a `cacheKey` usada no Redis, além do `cacheTtlSeconds` aplicado e de flags `blobConfigured`, `blobTimedOut` e `cacheTimedOut` para indicar se algum backend ficou indisponível — evitando que o upload fique em carregamento infinito.

### Login e usuários padrão
- O login já vem pré-carregado em memória (não depende do banco) com os perfis abaixo. Use-os no Swagger/`curl` ou sobrescreva via variáveis de ambiente (`ADMIN_EMAIL`, `ADMIN_PASSWORD`, `MANAGER_PASSWORD`, `OPERATOR_PASSWORD` etc.):
  - Administrador: `admin@vitoriacestas.com` / `admin123`
  - Gestor: `gestor@vitoriacestas.com` / `gestor123`
  - Operador: `operador@vitoriacestas.com` / `operador123`
- Para evitar erros de "Failed to fetch" no Swagger local, mantenha o servidor e a página da documentação em **http://localhost:3000** (usar `https://localhost` causa bloqueio de conteúdo misto pelo navegador).

### Ambiente publicado
- Backend em produção: https://projeto-vitoriacestas-backend.vercel.app
- Swagger em produção: https://projeto-vitoriacestas-backend.vercel.app/docs (renderizado pela mesma API via Express serverless)

## Endpoints
- `POST /api/auth/login`: retorna token JWT para admin.
- `GET /api/items`: lista itens (exige Authorization: Bearer <token> para Admin/Gestor/Operador).
- `GET /api/items/images`: retorna o vínculo entre ID do item e a URL pública da imagem salva no Blob (mesmos perfis do endpoint de listagem de itens). Alias disponível em `/api/products/images`.
- `POST /api/items`: cria item com validação de campos obrigatórios e código único (Admin/Gestor).
- `GET /api/suppliers`: lista fornecedores (exige Authorization: Bearer <token> para Admin/Gestor/Operador).
- `POST /api/suppliers`: cria fornecedor com validação de CNPJ, email e telefone (Admin).
- `GET /health`: verificação de status.

## Banco de dados
O arquivo `db/schema.sql` contém a modelagem baseada no diagrama fornecido, incluindo constraints de unicidade para código de produto e CNPJ de fornecedor.
Há também a tabela `produto_imagem`, responsável por vincular o `produto_id` à URL pública armazenada no Blob; ela é preenchida/atualizada ao informar `imagemUrl` na criação ou edição de um item.

## Testes
- Testes unitários cobrem validações de negócios para itens e fornecedores.
- Teste de integração valida o fluxo do endpoint `POST /api/items`.
Execute `npm test` para rodar a suíte.
