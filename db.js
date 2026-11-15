const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

const config = {};
const texto = fs.readFileSync(path.join(__dirname, 'config.env'), 'utf8').replace(/^﻿/, '');
for (const linha of texto.split(/\r?\n/)) {
  const limpa = linha.trim();
  if (!limpa || limpa.startsWith('#')) continue;
  const i = limpa.indexOf('=');
  if (i > 0) config[limpa.slice(0, i).trim()] = limpa.slice(i + 1).trim();
}

const pool = mysql.createPool({
  host: config.DB_HOST,
  port: Number(config.DB_PORT || 3306),
  database: config.DB_NAME,
  user: config.DB_USER,
  password: config.DB_PASSWORD,
  charset: 'utf8mb4',
  connectTimeout: 5000,
  waitForConnections: true,
  connectionLimit: 5,
  enableKeepAlive: true,
});

module.exports = { pool, config };
