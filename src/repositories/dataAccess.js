const pool = require('../db/pool');

async function createEndereco(payload) {
  const { rows } = await pool.query(
    'INSERT INTO endereco (rua, cep, numero) VALUES ($1,$2,$3) RETURNING *',
    [payload.rua, payload.cep, payload.numero],
  );
  return rows[0];
}

async function createCliente(payload) {
  const { rows } = await pool.query(
    'INSERT INTO cliente (cnpj, cpf, nome, email, endereco_id) VALUES ($1,$2,$3,$4,$5) RETURNING *',
    [payload.cnpj, payload.cpf, payload.nome, payload.email, payload.enderecoId],
  );
  return rows[0];
}

async function createFeedback(payload) {
  const { rows } = await pool.query(
    'INSERT INTO feedback (cliente_id, data, nota, contato, observacao) VALUES ($1,$2,$3,$4,$5) RETURNING *',
    [payload.clienteId, payload.data, payload.nota, payload.contato, payload.observacao],
  );
  return rows[0];
}

async function createTelefone(payload) {
  const { rows } = await pool.query(
    'INSERT INTO telefones (cliente_id, ddd, numero) VALUES ($1,$2,$3) RETURNING *',
    [payload.clienteId, payload.ddd, payload.numero],
  );
  return rows[0];
}

async function createMateriaPrima(payload) {
  const { rows } = await pool.query(
    'INSERT INTO materia_prima (nome, tipo, custo, datavalidade, descricao, tamanho, material, acessorio) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *',
    [
      payload.nome,
      payload.tipo,
      payload.custo,
      payload.dataValidade,
      payload.descricao,
      payload.tamanho,
      payload.material,
      payload.acessorio,
    ],
  );
  return rows[0];
}

async function createEntregaMaterial(payload) {
  const { rows } = await pool.query(
    'INSERT INTO entrega_material (material_id, fornecedor_id, quantidade, data_entrada, custo) VALUES ($1,$2,$3,$4,$5) RETURNING *',
    [payload.materialId, payload.fornecedorId, payload.quantidade, payload.dataEntrada, payload.custo],
  );
  return rows[0];
}

async function createManufatura(payload) {
  const { rows } = await pool.query(
    'INSERT INTO manufatura (produto_id, material_id, quantidade_material) VALUES ($1,$2,$3) RETURNING *',
    [payload.produtoId, payload.materialId, payload.quantidadeMaterial],
  );
  return rows[0];
}

async function createPedido(payload) {
  const { rows } = await pool.query(
    'INSERT INTO pedido (cliente_id, endereco, preco, data_pedido, cpf_presentado, nome_presentado, email_presentado, endereco_presentado) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *',
    [
      payload.clienteId,
      payload.endereco,
      payload.preco,
      payload.dataPedido,
      payload.cpfPresentado,
      payload.nomePresentado,
      payload.emailPresentado,
      payload.enderecoPresentado,
    ],
  );
  return rows[0];
}

async function createEnvioProduto(payload) {
  const { rows } = await pool.query(
    'INSERT INTO envio_produto (pedido_id, produto_id, quantidade, data_envio, preco) VALUES ($1,$2,$3,$4,$5) RETURNING *',
    [payload.pedidoId, payload.produtoId, payload.quantidade, payload.dataEnvio, payload.preco],
  );
  return rows[0];
}

module.exports = {
  createEndereco,
  createCliente,
  createFeedback,
  createTelefone,
  createMateriaPrima,
  createEntregaMaterial,
  createManufatura,
  createPedido,
  createEnvioProduto,
};
