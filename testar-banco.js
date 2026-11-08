const { pool, config } = require('./db');

(async () => {
  console.log(`Conectando em ${config.DB_HOST}:${config.DB_PORT}, banco ${config.DB_NAME}...`);
  try {
    const [[info]] = await pool.query('SELECT VERSION() AS versao');
    const [[{ total }]] = await pool.query('SELECT COUNT(*) AS total FROM jogadores');
    console.log(`OK: conectado ao MySQL ${info.versao}. Jogadores cadastrados: ${total}`);
  } catch (erro) {
    console.error(`ERRO (${erro.code || 'desconhecido'}): ${erro.message}`);
    if (erro.code === 'ECONNREFUSED') console.error('Dica: o MySQL esta parado ou o IP/porta em config.env esta errado.');
    if (erro.code === 'ETIMEDOUT') console.error('Dica: confira o IP em config.env, a rede e a porta 3306 no firewall.');
    if (erro.code === 'ER_ACCESS_DENIED_ERROR') console.error('Dica: usuario ou senha diferentes entre config.env e banco.sql.');
    if (erro.code === 'ER_NO_SUCH_TABLE' || erro.code === 'ER_BAD_DB_ERROR') console.error('Dica: execute o banco.sql no MySQL.');
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
})();
