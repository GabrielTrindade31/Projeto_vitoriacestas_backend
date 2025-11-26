# Projeto Vitória Cestas - Backend

API em Node.js/Express para gerenciamento de estoque, com cadastro de itens, fornecedores e autenticação de administrador via JWT.

## Configuração
1. Duplique `.env.example` para `.env` e informe `DATABASE_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` e `JWT_SECRET`.
2. Instale dependências com `npm install`.
3. Rode a aplicação com `npm start` (porta padrão 3000).
4. Acesse `/docs` para documentação Swagger e `/` para o formulário de cadastro de itens.

## Endpoints
- `POST /api/auth/login`: retorna token JWT para admin.
- `POST /api/items`: cria item com validação de campos obrigatórios e código único.
- `POST /api/suppliers`: cria fornecedor com validação de CNPJ, email e telefone.
- `GET /health`: verificação de status.

## Banco de dados
O arquivo `db/schema.sql` contém a modelagem baseada no diagrama fornecido, incluindo constraints de unicidade para código de produto e CNPJ de fornecedor.

## Testes
- Testes unitários cobrem validações de negócios para itens e fornecedores.
- Teste de integração valida o fluxo do endpoint `POST /api/items`.
Execute `npm test` para rodar a suíte.
