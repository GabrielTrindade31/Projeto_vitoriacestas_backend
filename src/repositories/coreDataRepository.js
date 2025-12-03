const pool = require('../db/pool');

async function findAllAddresses() {
  const { rows } = await pool.query('SELECT id, rua, cep, numero FROM endereco ORDER BY id DESC');
  return rows;
}

async function createAddress(address) {
  const { rows } = await pool.query(
    'INSERT INTO endereco (rua, cep, numero) VALUES ($1,$2,$3) RETURNING id, rua, cep, numero',
    [address.rua, address.cep, address.numero],
  );
  return rows[0];
}

async function findCustomerByCpf(cpf) {
  const { rows } = await pool.query(
    'SELECT id, cnpj, cpf, nome, email, data_nascimento AS "dataNascimento", endereco_id AS "enderecoId" FROM cliente WHERE cpf = $1 LIMIT 1',
    [cpf],
  );
  return rows[0];
}

async function findCustomerByCnpj(cnpj) {
  const { rows } = await pool.query(
    'SELECT id, cnpj, cpf, nome, email, data_nascimento AS "dataNascimento", endereco_id AS "enderecoId" FROM cliente WHERE cnpj = $1 LIMIT 1',
    [cnpj],
  );
  return rows[0];
}

async function findAllCustomers() {
  const { rows } = await pool.query(
    'SELECT id, cnpj, cpf, nome, email, data_nascimento AS "dataNascimento", endereco_id AS "enderecoId" FROM cliente ORDER BY id DESC',
  );
  return rows;
}

async function createCustomer(customer) {
  const { rows } = await pool.query(
    'INSERT INTO cliente (cnpj, cpf, nome, email, data_nascimento, endereco_id) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id, cnpj, cpf, nome, email, data_nascimento AS "dataNascimento", endereco_id AS "enderecoId"',
    [customer.cnpj || null, customer.cpf || null, customer.nome, customer.email || null, customer.dataNascimento, customer.enderecoId],
  );
  return rows[0];
}

async function findAllMaterials() {
  const { rows } = await pool.query(
    'SELECT id, nome, tipo, custo, datavalidade AS "dataValidade", descricao, tamanho, material, acessorio FROM materia_prima ORDER BY id DESC',
  );
  return rows;
}

async function createMaterial(material) {
  const { rows } = await pool.query(
    'INSERT INTO materia_prima (nome, tipo, custo, datavalidade, descricao, tamanho, material, acessorio) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id, nome, tipo, custo, datavalidade AS "dataValidade", descricao, tamanho, material, acessorio',
    [
      material.nome,
      material.tipo || null,
      material.custo || 0,
      material.dataValidade || null,
      material.descricao || null,
      material.tamanho || null,
      material.material || null,
      material.acessorio || null,
    ],
  );
  return rows[0];
}

async function findAllMaterialDeliveries() {
  const { rows } = await pool.query(
    'SELECT id, material_id AS "materialId", fornecedor_id AS "fornecedorId", quantidade, data_entrada AS "dataEntrada", custo FROM entrega_material ORDER BY id DESC',
  );
  return rows;
}

async function createMaterialDelivery(delivery) {
  const { rows } = await pool.query(
    'INSERT INTO entrega_material (material_id, fornecedor_id, quantidade, data_entrada, custo) VALUES ($1,$2,$3,$4,$5) RETURNING id, material_id AS "materialId", fornecedor_id AS "fornecedorId", quantidade, data_entrada AS "dataEntrada", custo',
    [delivery.materialId, delivery.fornecedorId || null, delivery.quantidade || 0, delivery.dataEntrada || null, delivery.custo || 0],
  );
  return rows[0];
}

async function findAllManufacturing() {
  const { rows } = await pool.query(
    'SELECT id, produto_id AS "produtoId", material_id AS "materialId", quantidade_material AS "quantidadeMaterial" FROM manufatura ORDER BY id DESC',
  );
  return rows;
}

async function createManufacturing(manufacturing) {
  const { rows } = await pool.query(
    'INSERT INTO manufatura (produto_id, material_id, quantidade_material) VALUES ($1,$2,$3) RETURNING id, produto_id AS "produtoId", material_id AS "materialId", quantidade_material AS "quantidadeMaterial"',
    [manufacturing.produtoId, manufacturing.materialId, manufacturing.quantidadeMaterial || 0],
  );
  return rows[0];
}

async function findAllOrders() {
  const { rows } = await pool.query(
    'SELECT id, cliente_id AS "clienteId", endereco, preco, data_pedido AS "dataPedido", cpf_presentado AS "cpfPresentado", nome_presentado AS "nomePresentado", email_presentado AS "emailPresentado", endereco_presentado AS "enderecoPresentado" FROM pedido ORDER BY id DESC',
  );
  return rows;
}

async function createOrder(order) {
  const { rows } = await pool.query(
    'INSERT INTO pedido (cliente_id, endereco, preco, data_pedido, cpf_presentado, nome_presentado, email_presentado, endereco_presentado) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id, cliente_id AS "clienteId", endereco, preco, data_pedido AS "dataPedido", cpf_presentado AS "cpfPresentado", nome_presentado AS "nomePresentado", email_presentado AS "emailPresentado", endereco_presentado AS "enderecoPresentado"',
    [
      order.clienteId || null,
      order.endereco || null,
      order.preco || 0,
      order.dataPedido || null,
      order.cpfPresentado || null,
      order.nomePresentado || null,
      order.emailPresentado || null,
      order.enderecoPresentado || null,
    ],
  );
  return rows[0];
}

async function findAllShipments() {
  const { rows } = await pool.query(
    'SELECT id, pedido_id AS "pedidoId", produto_id AS "produtoId", quantidade, data_envio AS "dataEnvio", preco FROM envio_produto ORDER BY id DESC',
  );
  return rows;
}

async function createShipment(shipment) {
  const { rows } = await pool.query(
    'INSERT INTO envio_produto (pedido_id, produto_id, quantidade, data_envio, preco) VALUES ($1,$2,$3,$4,$5) RETURNING id, pedido_id AS "pedidoId", produto_id AS "produtoId", quantidade, data_envio AS "dataEnvio", preco',
    [shipment.pedidoId || null, shipment.produtoId || null, shipment.quantidade || 0, shipment.dataEnvio || null, shipment.preco || 0],
  );
  return rows[0];
}

async function findAllFeedbacks() {
  const { rows } = await pool.query(
    'SELECT id, cliente_id AS "clienteId", data, nota, contato, observacao FROM feedback ORDER BY id DESC',
  );
  return rows;
}

async function createFeedback(feedback) {
  const { rows } = await pool.query(
    'INSERT INTO feedback (cliente_id, data, nota, contato, observacao) VALUES ($1,$2,$3,$4,$5) RETURNING id, cliente_id AS "clienteId", data, nota, contato, observacao',
    [feedback.clienteId || null, feedback.data || null, feedback.nota || 0, feedback.contato || null, feedback.observacao || null],
  );
  return rows[0];
}

async function findAllPhones() {
  const { rows } = await pool.query(
    'SELECT id, cliente_id AS "clienteId", ddd, numero FROM telefones ORDER BY id DESC',
  );
  return rows;
}

async function createPhone(phone) {
  const { rows } = await pool.query(
    'INSERT INTO telefones (cliente_id, ddd, numero) VALUES ($1,$2,$3) RETURNING id, cliente_id AS "clienteId", ddd, numero',
    [phone.clienteId, phone.ddd || null, phone.numero],
  );
  return rows[0];
}

module.exports = {
  findAllAddresses,
  createAddress,
  findCustomerByCpf,
  findCustomerByCnpj,
  findAllCustomers,
  createCustomer,
  findAllMaterials,
  createMaterial,
  findAllMaterialDeliveries,
  createMaterialDelivery,
  findAllManufacturing,
  createManufacturing,
  findAllOrders,
  createOrder,
  findAllShipments,
  createShipment,
  findAllFeedbacks,
  createFeedback,
  findAllPhones,
  createPhone,
};
