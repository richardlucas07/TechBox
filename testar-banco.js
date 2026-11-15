const { pool, config } = require('./db');

(async () => {
  console.log(`Conectando em ${config.DB_HOST}:${config.DB_PORT}, banco ${config.DB_NAME}...`);
  try {
    const [[info]] = await pool.query('SELECT VERSION() AS versao');
    const [[c]] = await pool.query('SELECT (SELECT COUNT(*) FROM jogos) AS jogos, (SELECT COUNT(*) FROM pecas) AS pecas, (SELECT COUNT(*) FROM jogadores) AS jogadores, (SELECT COUNT(*) FROM montagens) AS montagens');
    console.log(`OK: conectado ao MySQL ${info.versao}.`);
    console.log(`Jogos: ${c.jogos} | Pecas: ${c.pecas} | Jogadores: ${c.jogadores} | Montagens: ${c.montagens}`);
  } catch (erro) {
    console.error(`ERRO (${erro.code || 'desconhecido'}): ${erro.message}`);
    if (erro.code === 'ECONNREFUSED') console.error('Dica: o MySQL esta parado ou o IP/porta no config.env esta errado.');
    if (erro.code === 'ETIMEDOUT') console.error('Dica: confira o IP no config.env, a rede e a porta 3306 no firewall.');
    if (erro.code === 'ER_ACCESS_DENIED_ERROR') console.error('Dica: usuario ou senha diferentes entre config.env e banco.sql.');
    if (erro.code === 'ER_NO_SUCH_TABLE' || erro.code === 'ER_BAD_DB_ERROR') console.error('Dica: execute o banco.sql novo no MySQL Workbench.');
    if (erro.code === 'MODULE_NOT_FOUND') console.error('Dica: rode npm.cmd install nesta pasta.');
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
})();
