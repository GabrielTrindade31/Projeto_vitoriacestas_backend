-- Schema baseado no diagrama fornecido
CREATE TABLE endereco (
  id SERIAL PRIMARY KEY,
  rua TEXT NOT NULL,
  cep VARCHAR(10) NOT NULL,
  numero VARCHAR(10) NOT NULL
);

CREATE TABLE cliente (
  id SERIAL PRIMARY KEY,
  cnpj VARCHAR(18) UNIQUE,
  cpf VARCHAR(14) UNIQUE,
  nome TEXT NOT NULL,
  email TEXT,
  endereco_id INTEGER REFERENCES endereco(id)
);

CREATE TABLE fornecedor (
  id SERIAL PRIMARY KEY,
  cnpj VARCHAR(18) NOT NULL UNIQUE,
  razao_social TEXT NOT NULL,
  contato TEXT NOT NULL,
  email TEXT,
  telefone VARCHAR(20),
  endereco_id INTEGER REFERENCES endereco(id)
);

CREATE TABLE produto (
  id SERIAL PRIMARY KEY,
  codigo VARCHAR(50) NOT NULL UNIQUE,
  nome TEXT NOT NULL,
  descricao TEXT,
  categoria TEXT,
  quantidade INTEGER DEFAULT 0 CHECK (quantidade >= 0),
  preco NUMERIC(12,2) DEFAULT 0,
  fornecedor_id INTEGER REFERENCES fornecedor(id)
);

CREATE TABLE materia_prima (
  id SERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  tipo TEXT,
  custo NUMERIC(12,2),
  datavalidade DATE,
  descricao TEXT,
  tamanho TEXT,
  material TEXT,
  acessorio TEXT
);

CREATE TABLE manufatura (
  id SERIAL PRIMARY KEY,
  produto_id INTEGER REFERENCES produto(id),
  material_id INTEGER REFERENCES materia_prima(id),
  quantidade_material INTEGER
);

CREATE TABLE entrega_material (
  id SERIAL PRIMARY KEY,
  material_id INTEGER REFERENCES materia_prima(id),
  fornecedor_id INTEGER REFERENCES fornecedor(id),
  quantidade INTEGER,
  data_entrada DATE,
  custo NUMERIC(12,2)
);

CREATE TABLE pedido (
  id SERIAL PRIMARY KEY,
  cliente_id INTEGER REFERENCES cliente(id),
  endereco TEXT,
  preco NUMERIC(12,2),
  data_pedido DATE,
  cpf_presentado VARCHAR(14),
  nome_presentado TEXT,
  email_presentado TEXT,
  endereco_presentado TEXT
);

CREATE TABLE envio_produto (
  id SERIAL PRIMARY KEY,
  pedido_id INTEGER REFERENCES pedido(id),
  produto_id INTEGER REFERENCES produto(id),
  quantidade INTEGER,
  data_envio DATE,
  preco NUMERIC(12,2)
);

CREATE TABLE feedback (
  id SERIAL PRIMARY KEY,
  cliente_id INTEGER REFERENCES cliente(id),
  data DATE,
  nota INTEGER,
  contato TEXT,
  observacao TEXT
);

CREATE TABLE telefones (
  id SERIAL PRIMARY KEY,
  cliente_id INTEGER REFERENCES cliente(id),
  ddd VARCHAR(3),
  numero VARCHAR(15)
);
