const pool = require('../db/pool');

const baseSelect = `SELECT
  p.id,
  p.codigo,
  p.nome,
  p.descricao,
  p.categoria,
  p.quantidade,
  p.preco,
  p.fornecedor_id AS "fornecedorId",
  pi.blob_url AS "imagemUrl"
FROM produto p
LEFT JOIN produto_imagem pi ON pi.produto_id = p.id`;

async function findByCode(code) {
  const { rows } = await pool.query(`${baseSelect} WHERE p.codigo = $1 LIMIT 1`, [code]);
  return rows[0];
}

async function findById(id) {
  const { rows } = await pool.query(`${baseSelect} WHERE p.id = $1 LIMIT 1`, [id]);
  return rows[0];
}

async function findAll() {
  const { rows } = await pool.query(`${baseSelect} ORDER BY p.id DESC`);
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
    `${baseSelect}
      WHERE p.codigo ILIKE $1 OR p.nome ILIKE $1 OR p.categoria ILIKE $1 OR p.descricao ILIKE $1
      ORDER BY p.id DESC`,
    [wildcard],
  );
  return rows;
}

async function upsertImage(produtoId, imagemUrl) {
  const { rows } = await pool.query(
    `INSERT INTO produto_imagem (produto_id, blob_url)
      VALUES ($1, $2)
      ON CONFLICT (produto_id) DO UPDATE SET blob_url = EXCLUDED.blob_url
      RETURNING id, produto_id AS "produtoId", blob_url AS "imagemUrl"`,
    [produtoId, imagemUrl],
  );

  return rows[0];
}

async function deleteImageByProductId(produtoId) {
  await pool.query('DELETE FROM produto_imagem WHERE produto_id = $1', [produtoId]);
}

async function findImageByProductId(produtoId) {
  const { rows } = await pool.query('SELECT id, produto_id AS "produtoId", blob_url AS "imagemUrl" FROM produto_imagem WHERE produto_id = $1', [produtoId]);
  return rows[0];
}

async function findAllImages() {
  const { rows } = await pool.query('SELECT id, produto_id AS "produtoId", blob_url AS "imagemUrl" FROM produto_imagem ORDER BY produto_id DESC');
  return rows;
}

module.exports = {
  findByCode,
  findById,
  findAll,
  create,
  update,
  search,
  upsertImage,
  deleteImageByProductId,
  findImageByProductId,
  findAllImages,
};
