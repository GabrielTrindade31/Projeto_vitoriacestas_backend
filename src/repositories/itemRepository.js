const pool = require('../db/pool');

async function findByCode(code) {
  const { rows } = await pool.query(
    'SELECT id, codigo, nome, descricao, categoria, quantidade, preco, fornecedor_id AS "fornecedorId" FROM produto WHERE codigo = $1 LIMIT 1',
    [code],
  );
  return rows[0];
}

async function findById(id) {
  const { rows } = await pool.query(
    'SELECT id, codigo, nome, descricao, categoria, quantidade, preco, fornecedor_id AS "fornecedorId" FROM produto WHERE id = $1 LIMIT 1',
    [id],
  );
  return rows[0];
}

async function findAll() {
  const { rows } = await pool.query(
    'SELECT id, codigo, nome, descricao, categoria, quantidade, preco, fornecedor_id AS "fornecedorId" FROM produto ORDER BY id DESC',
  );
  return rows;
}

async function create(item) {
  const query = `INSERT INTO produto (codigo, nome, descricao, categoria, quantidade, preco, fornecedor_id)
    VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id, codigo, nome, descricao, categoria, quantidade, preco, fornecedor_id AS "fornecedorId"`;
  const values = [
    item.codigo,
    item.nome,
    item.descricao,
    item.categoria,
    item.quantidade,
    item.preco,
    item.fornecedorId || null,
  ];
  const { rows } = await pool.query(query, values);
  return rows[0];
}

async function update(id, item) {
  const query = `UPDATE produto
    SET codigo = $1, nome = $2, descricao = $3, categoria = $4, quantidade = $5, preco = $6, fornecedor_id = $7
    WHERE id = $8
    RETURNING id, codigo, nome, descricao, categoria, quantidade, preco, fornecedor_id AS "fornecedorId"`;
  const values = [
    item.codigo,
    item.nome,
    item.descricao,
    item.categoria,
    item.quantidade,
    item.preco,
    item.fornecedorId || null,
    id,
  ];
  const { rows } = await pool.query(query, values);
  return rows[0];
}

async function search(term) {
  const wildcard = `%${term}%`;
  const { rows } = await pool.query(
    `SELECT id, codigo, nome, descricao, categoria, quantidade, preco, fornecedor_id AS "fornecedorId"
      FROM produto
      WHERE codigo ILIKE $1 OR nome ILIKE $1 OR categoria ILIKE $1 OR descricao ILIKE $1
      ORDER BY id DESC`,
    [wildcard],
  );
  return rows;
}

module.exports = {
  findByCode,
  findById,
  findAll,
  create,
  update,
  search,
};
