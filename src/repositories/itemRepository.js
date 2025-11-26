const pool = require('../db/pool');

async function findByCode(code) {
  const { rows } = await pool.query('SELECT * FROM produto WHERE codigo = $1 LIMIT 1', [code]);
  return rows[0];
}

async function create(item) {
  const query = `INSERT INTO produto (codigo, nome, descricao, categoria, quantidade, preco, fornecedor_id)
    VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`;
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

module.exports = {
  findByCode,
  create,
};
