# Projeto Vitória Cestas - Backend

API em Node.js/Express para gerenciamento de estoque, com cadastro de itens, fornecedores e autenticação de administrador via JWT.

## Configuração
1. Duplique `.env.example` para `.env` e informe `DATABASE_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` e `JWT_SECRET`.
2. Instale dependências com `npm install`.
3. Rode a aplicação com `npm start` (porta padrão 3000).
4. Acesse `/docs` para documentação Swagger e `/` para o formulário de cadastro de itens.

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
- `POST /api/items`: cria item com validação de campos obrigatórios e código único (Admin/Gestor).
- `GET /api/suppliers`: lista fornecedores (exige Authorization: Bearer <token> para Admin/Gestor/Operador).
- `POST /api/suppliers`: cria fornecedor com validação de CNPJ, email e telefone (Admin).
- `GET /health`: verificação de status.

## Banco de dados
O arquivo `db/schema.sql` contém a modelagem baseada no diagrama fornecido, incluindo constraints de unicidade para código de produto e CNPJ de fornecedor.

## Testes
- Testes unitários cobrem validações de negócios para itens e fornecedores.
- Teste de integração valida o fluxo do endpoint `POST /api/items`.
Execute `npm test` para rodar a suíte.
