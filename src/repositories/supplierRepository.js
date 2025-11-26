const pool = require('../db/pool');

async function findByCnpj(cnpj) {
  const { rows } = await pool.query('SELECT * FROM fornecedor WHERE cnpj = $1 LIMIT 1', [cnpj]);
  return rows[0];
}

async function create(supplier) {
  const query = `INSERT INTO fornecedor (cnpj, razao_social, contato, email, telefone, endereco_id)
    VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`;
  const values = [
    supplier.cnpj,
    supplier.razaoSocial,
    supplier.contato,
    supplier.email,
    supplier.telefone,
    supplier.enderecoId || null,
  ];
  const { rows } = await pool.query(query, values);
  return rows[0];
}

module.exports = {
  findByCnpj,
  create,
};
