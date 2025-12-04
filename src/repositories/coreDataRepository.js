const pool = require('../db/pool');

async function findAllAddresses() {
  const { rows } = await pool.query('SELECT id, rua, cep, numero FROM endereco ORDER BY id DESC');
  return rows;
}

async function findAddressById(id) {
  const { rows } = await pool.query('SELECT id, rua, cep, numero FROM endereco WHERE id = $1 LIMIT 1', [id]);
  return rows[0];
}

async function searchAddresses(term) {
  const like = `%${term}%`;
  const { rows } = await pool.query(
    'SELECT id, rua, cep, numero FROM endereco WHERE rua ILIKE $1 OR cep ILIKE $1 OR numero ILIKE $1 ORDER BY id DESC',
    [like],
  );
  return rows;
}

async function createAddress(address) {
  const { rows } = await pool.query(
    'INSERT INTO endereco (rua, cep, numero) VALUES ($1,$2,$3) RETURNING id, rua, cep, numero',
    [address.rua, address.cep, address.numero],
  );
  return rows[0];
}

async function updateAddress(id, address) {
  const { rows } = await pool.query(
    'UPDATE endereco SET rua = $1, cep = $2, numero = $3 WHERE id = $4 RETURNING id, rua, cep, numero',
    [address.rua, address.cep, address.numero, id],
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

async function findCustomerById(id) {
  const { rows } = await pool.query(
    'SELECT id, cnpj, cpf, nome, email, data_nascimento AS "dataNascimento", endereco_id AS "enderecoId" FROM cliente WHERE id = $1 LIMIT 1',
    [id],
  );
  return rows[0];
}

async function searchCustomers(term) {
  const like = `%${term}%`;
  const { rows } = await pool.query(
    'SELECT id, cnpj, cpf, nome, email, data_nascimento AS "dataNascimento", endereco_id AS "enderecoId" FROM cliente WHERE nome ILIKE $1 OR email ILIKE $1 OR cpf ILIKE $1 OR cnpj ILIKE $1 ORDER BY id DESC',
    [like],
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

async function updateCustomer(id, customer) {
  const { rows } = await pool.query(
    'UPDATE cliente SET cnpj = $1, cpf = $2, nome = $3, email = $4, data_nascimento = $5, endereco_id = $6 WHERE id = $7 RETURNING id, cnpj, cpf, nome, email, data_nascimento AS "dataNascimento", endereco_id AS "enderecoId"',
    [customer.cnpj || null, customer.cpf || null, customer.nome, customer.email || null, customer.dataNascimento, customer.enderecoId, id],
  );
  return rows[0];
}

async function findAllMaterials() {
  const { rows } = await pool.query(
    'SELECT id, nome, tipo, custo, datavalidade AS "dataValidade", descricao, tamanho, material, acessorio FROM materia_prima ORDER BY id DESC',
  );
  return rows;
}

async function findMaterialById(id) {
  const { rows } = await pool.query(
    'SELECT id, nome, tipo, custo, datavalidade AS "dataValidade", descricao, tamanho, material, acessorio FROM materia_prima WHERE id = $1 LIMIT 1',
    [id],
  );
  return rows[0];
}

async function searchMaterials(term) {
  const like = `%${term}%`;
  const { rows } = await pool.query(
    'SELECT id, nome, tipo, custo, datavalidade AS "dataValidade", descricao, tamanho, material, acessorio FROM materia_prima WHERE nome ILIKE $1 OR tipo ILIKE $1 OR descricao ILIKE $1 OR material ILIKE $1 OR acessorio ILIKE $1 ORDER BY id DESC',
    [like],
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

async function updateMaterial(id, material) {
  const { rows } = await pool.query(
    'UPDATE materia_prima SET nome = $1, tipo = $2, custo = $3, datavalidade = $4, descricao = $5, tamanho = $6, material = $7, acessorio = $8 WHERE id = $9 RETURNING id, nome, tipo, custo, datavalidade AS "dataValidade", descricao, tamanho, material, acessorio',
    [
      material.nome,
      material.tipo || null,
      material.custo || 0,
      material.dataValidade || null,
      material.descricao || null,
      material.tamanho || null,
      material.material || null,
      material.acessorio || null,
      id,
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

async function findMaterialDeliveryById(id) {
  const { rows } = await pool.query(
    'SELECT id, material_id AS "materialId", fornecedor_id AS "fornecedorId", quantidade, data_entrada AS "dataEntrada", custo FROM entrega_material WHERE id = $1 LIMIT 1',
    [id],
  );
  return rows[0];
}

async function searchMaterialDeliveries(term) {
  const like = `%${term}%`;
  const numeric = Number(term);
  const numericFilter = Number.isNaN(numeric) ? null : numeric;
  const { rows } = await pool.query(
    'SELECT id, material_id AS "materialId", fornecedor_id AS "fornecedorId", quantidade, data_entrada AS "dataEntrada", custo FROM entrega_material WHERE CAST(material_id AS TEXT) ILIKE $1 OR CAST(fornecedor_id AS TEXT) ILIKE $1 OR CAST(quantidade AS TEXT) ILIKE $1 OR CAST(custo AS TEXT) ILIKE $1 OR ($2::int IS NOT NULL AND material_id = $2) OR ($2::int IS NOT NULL AND fornecedor_id = $2) ORDER BY id DESC',
    [like, numericFilter],
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

async function updateMaterialDelivery(id, delivery) {
  const { rows } = await pool.query(
    'UPDATE entrega_material SET material_id = $1, fornecedor_id = $2, quantidade = $3, data_entrada = $4, custo = $5 WHERE id = $6 RETURNING id, material_id AS "materialId", fornecedor_id AS "fornecedorId", quantidade, data_entrada AS "dataEntrada", custo',
    [delivery.materialId, delivery.fornecedorId || null, delivery.quantidade || 0, delivery.dataEntrada || null, delivery.custo || 0, id],
  );
  return rows[0];
}

async function findAllManufacturing() {
  const { rows } = await pool.query(
    'SELECT id, produto_id AS "produtoId", material_id AS "materialId", quantidade_material AS "quantidadeMaterial" FROM manufatura ORDER BY id DESC',
  );
  return rows;
}

async function findManufacturingById(id) {
  const { rows } = await pool.query(
    'SELECT id, produto_id AS "produtoId", material_id AS "materialId", quantidade_material AS "quantidadeMaterial" FROM manufatura WHERE id = $1 LIMIT 1',
    [id],
  );
  return rows[0];
}

async function searchManufacturing(term) {
  const like = `%${term}%`;
  const numeric = Number(term);
  const numericFilter = Number.isNaN(numeric) ? null : numeric;
  const { rows } = await pool.query(
    'SELECT id, produto_id AS "produtoId", material_id AS "materialId", quantidade_material AS "quantidadeMaterial" FROM manufatura WHERE CAST(produto_id AS TEXT) ILIKE $1 OR CAST(material_id AS TEXT) ILIKE $1 OR CAST(quantidade_material AS TEXT) ILIKE $1 OR ($2::int IS NOT NULL AND produto_id = $2) OR ($2::int IS NOT NULL AND material_id = $2) ORDER BY id DESC',
    [like, numericFilter],
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

async function updateManufacturing(id, manufacturing) {
  const { rows } = await pool.query(
    'UPDATE manufatura SET produto_id = $1, material_id = $2, quantidade_material = $3 WHERE id = $4 RETURNING id, produto_id AS "produtoId", material_id AS "materialId", quantidade_material AS "quantidadeMaterial"',
    [manufacturing.produtoId, manufacturing.materialId, manufacturing.quantidadeMaterial || 0, id],
  );
  return rows[0];
}

async function findAllOrders() {
  const { rows } = await pool.query(
    'SELECT id, cliente_id AS "clienteId", endereco, preco, data_pedido AS "dataPedido", cpf_presentado AS "cpfPresentado", nome_presentado AS "nomePresentado", email_presentado AS "emailPresentado", endereco_presentado AS "enderecoPresentado" FROM pedido ORDER BY id DESC',
  );
  return rows;
}

async function findOrderById(id) {
  const { rows } = await pool.query(
    'SELECT id, cliente_id AS "clienteId", endereco, preco, data_pedido AS "dataPedido", cpf_presentado AS "cpfPresentado", nome_presentado AS "nomePresentado", email_presentado AS "emailPresentado", endereco_presentado AS "enderecoPresentado" FROM pedido WHERE id = $1 LIMIT 1',
    [id],
  );
  return rows[0];
}

async function searchOrders(term) {
  const like = `%${term}%`;
  const numeric = Number(term);
  const numericFilter = Number.isNaN(numeric) ? null : numeric;
  const { rows } = await pool.query(
    'SELECT id, cliente_id AS "clienteId", endereco, preco, data_pedido AS "dataPedido", cpf_presentado AS "cpfPresentado", nome_presentado AS "nomePresentado", email_presentado AS "emailPresentado", endereco_presentado AS "enderecoPresentado" FROM pedido WHERE endereco ILIKE $1 OR cpf_presentado ILIKE $1 OR nome_presentado ILIKE $1 OR email_presentado ILIKE $1 OR endereco_presentado ILIKE $1 OR CAST(preco AS TEXT) ILIKE $1 OR ($2::int IS NOT NULL AND cliente_id = $2) ORDER BY id DESC',
    [like, numericFilter],
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

async function updateOrder(id, order) {
  const { rows } = await pool.query(
    'UPDATE pedido SET cliente_id = $1, endereco = $2, preco = $3, data_pedido = $4, cpf_presentado = $5, nome_presentado = $6, email_presentado = $7, endereco_presentado = $8 WHERE id = $9 RETURNING id, cliente_id AS "clienteId", endereco, preco, data_pedido AS "dataPedido", cpf_presentado AS "cpfPresentado", nome_presentado AS "nomePresentado", email_presentado AS "emailPresentado", endereco_presentado AS "enderecoPresentado"',
    [
      order.clienteId || null,
      order.endereco || null,
      order.preco || 0,
      order.dataPedido || null,
      order.cpfPresentado || null,
      order.nomePresentado || null,
      order.emailPresentado || null,
      order.enderecoPresentado || null,
      id,
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

async function findShipmentById(id) {
  const { rows } = await pool.query(
    'SELECT id, pedido_id AS "pedidoId", produto_id AS "produtoId", quantidade, data_envio AS "dataEnvio", preco FROM envio_produto WHERE id = $1 LIMIT 1',
    [id],
  );
  return rows[0];
}

async function searchShipments(term) {
  const like = `%${term}%`;
  const numeric = Number(term);
  const numericFilter = Number.isNaN(numeric) ? null : numeric;
  const { rows } = await pool.query(
    'SELECT id, pedido_id AS "pedidoId", produto_id AS "produtoId", quantidade, data_envio AS "dataEnvio", preco FROM envio_produto WHERE CAST(pedido_id AS TEXT) ILIKE $1 OR CAST(produto_id AS TEXT) ILIKE $1 OR CAST(quantidade AS TEXT) ILIKE $1 OR CAST(preco AS TEXT) ILIKE $1 OR ($2::int IS NOT NULL AND pedido_id = $2) OR ($2::int IS NOT NULL AND produto_id = $2) ORDER BY id DESC',
    [like, numericFilter],
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

async function updateShipment(id, shipment) {
  const { rows } = await pool.query(
    'UPDATE envio_produto SET pedido_id = $1, produto_id = $2, quantidade = $3, data_envio = $4, preco = $5 WHERE id = $6 RETURNING id, pedido_id AS "pedidoId", produto_id AS "produtoId", quantidade, data_envio AS "dataEnvio", preco',
    [shipment.pedidoId || null, shipment.produtoId || null, shipment.quantidade || 0, shipment.dataEnvio || null, shipment.preco || 0, id],
  );
  return rows[0];
}

async function findAllFeedbacks() {
  const { rows } = await pool.query(
    'SELECT id, cliente_id AS "clienteId", data, nota, contato, observacao FROM feedback ORDER BY id DESC',
  );
  return rows;
}

async function findFeedbackById(id) {
  const { rows } = await pool.query(
    'SELECT id, cliente_id AS "clienteId", data, nota, contato, observacao FROM feedback WHERE id = $1 LIMIT 1',
    [id],
  );
  return rows[0];
}

async function searchFeedbacks(term) {
  const like = `%${term}%`;
  const numeric = Number(term);
  const numericFilter = Number.isNaN(numeric) ? null : numeric;
  const { rows } = await pool.query(
    'SELECT id, cliente_id AS "clienteId", data, nota, contato, observacao FROM feedback WHERE contato ILIKE $1 OR observacao ILIKE $1 OR CAST(nota AS TEXT) ILIKE $1 OR ($2::int IS NOT NULL AND cliente_id = $2) ORDER BY id DESC',
    [like, numericFilter],
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

async function updateFeedback(id, feedback) {
  const { rows } = await pool.query(
    'UPDATE feedback SET cliente_id = $1, data = $2, nota = $3, contato = $4, observacao = $5 WHERE id = $6 RETURNING id, cliente_id AS "clienteId", data, nota, contato, observacao',
    [feedback.clienteId || null, feedback.data || null, feedback.nota || 0, feedback.contato || null, feedback.observacao || null, id],
  );
  return rows[0];
}

async function findAllPhones() {
  const { rows } = await pool.query(
    'SELECT id, cliente_id AS "clienteId", ddd, numero FROM telefones ORDER BY id DESC',
  );
  return rows;
}

async function findPhoneById(id) {
  const { rows } = await pool.query('SELECT id, cliente_id AS "clienteId", ddd, numero FROM telefones WHERE id = $1 LIMIT 1', [id]);
  return rows[0];
}

async function searchPhones(term) {
  const like = `%${term}%`;
  const numeric = Number(term);
  const numericFilter = Number.isNaN(numeric) ? null : numeric;
  const { rows } = await pool.query(
    'SELECT id, cliente_id AS "clienteId", ddd, numero FROM telefones WHERE ddd ILIKE $1 OR numero ILIKE $1 OR ($2::int IS NOT NULL AND cliente_id = $2) ORDER BY id DESC',
    [like, numericFilter],
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

async function updatePhone(id, phone) {
  const { rows } = await pool.query(
    'UPDATE telefones SET cliente_id = $1, ddd = $2, numero = $3 WHERE id = $4 RETURNING id, cliente_id AS "clienteId", ddd, numero',
    [phone.clienteId, phone.ddd || null, phone.numero, id],
  );
  return rows[0];
}

module.exports = {
  findAllAddresses,
  findAddressById,
  searchAddresses,
  createAddress,
  updateAddress,
  findCustomerByCpf,
  findCustomerByCnpj,
  findCustomerById,
  searchCustomers,
  findAllCustomers,
  createCustomer,
  updateCustomer,
  findMaterialById,
  searchMaterials,
  findAllMaterials,
  createMaterial,
  updateMaterial,
  findMaterialDeliveryById,
  searchMaterialDeliveries,
  findAllMaterialDeliveries,
  createMaterialDelivery,
  updateMaterialDelivery,
  findManufacturingById,
  searchManufacturing,
  findAllManufacturing,
  createManufacturing,
  updateManufacturing,
  findOrderById,
  searchOrders,
  findAllOrders,
  createOrder,
  updateOrder,
  findShipmentById,
  searchShipments,
  findAllShipments,
  createShipment,
  updateShipment,
  findFeedbackById,
  searchFeedbacks,
  findAllFeedbacks,
  createFeedback,
  updateFeedback,
  findPhoneById,
  searchPhones,
  findAllPhones,
  createPhone,
  updatePhone,
};
