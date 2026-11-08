-- Executar no MySQL com o usuario root.
SET NAMES utf8mb4;

CREATE DATABASE IF NOT EXISTS techbox_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE techbox_db;

-- Tela de cadastro: cada jogador cadastrado vira uma linha aqui.
CREATE TABLE IF NOT EXISTS jogadores (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nome VARCHAR(60) NOT NULL,
  email VARCHAR(120) NOT NULL,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_jogadores_email (email)
) ENGINE=InnoDB;

-- Computadores que podem sair na caixa. O site sorteia daqui.
CREATE TABLE IF NOT EXISTS computadores (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nome VARCHAR(40) NOT NULL,
  artigo VARCHAR(3) NOT NULL,
  uso VARCHAR(80) NOT NULL,
  placa_mae VARCHAR(40) NOT NULL,
  processador VARCHAR(40) NOT NULL,
  memoria VARCHAR(40) NOT NULL,
  video VARCHAR(40) NOT NULL,
  armazenamento VARCHAR(40) NOT NULL,
  fonte VARCHAR(40) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_computadores_nome (nome)
) ENGINE=InnoDB;

-- Curiosidades mostradas no site.
CREATE TABLE IF NOT EXISTS curiosidades (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  texto VARCHAR(255) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_curiosidades_texto (texto)
) ENGINE=InnoDB;

-- Resultado de cada jogo: liga um jogador a um computador.
CREATE TABLE IF NOT EXISTS partidas (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  jogador_id INT UNSIGNED NOT NULL,
  computador_id INT UNSIGNED NOT NULL,
  pontos SMALLINT UNSIGNED NOT NULL,
  tempo_seg SMALLINT UNSIGNED NOT NULL,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_partidas_jogador FOREIGN KEY (jogador_id) REFERENCES jogadores (id),
  CONSTRAINT fk_partidas_computador FOREIGN KEY (computador_id) REFERENCES computadores (id)
) ENGINE=InnoDB;

INSERT IGNORE INTO computadores
  (nome, artigo, uso, placa_mae, processador, memoria, video, armazenamento, fonte) VALUES
  ('PC gamer', 'um', 'pronto para jogos pesados', 'Chipset com PCIe 4.0', '8 núcleos, 16 threads', '32 GB DDR5', '12 GB de memória', 'NVMe de 1 TB', '750 W, 80 Plus Gold'),
  ('PC de escritório', 'um', 'silencioso e econômico', 'Micro-ATX', '6 núcleos, 12 threads', '16 GB DDR4', 'Modelo básico, 4 GB', 'SATA de 512 GB', '400 W, 80 Plus Bronze'),
  ('Workstation', 'uma', 'feita para vídeo e modelagem 3D', 'ATX com 4 slots de RAM', '16 núcleos, 32 threads', '64 GB DDR5', '16 GB de memória', 'NVMe de 2 TB', '1000 W, 80 Plus Platinum'),
  ('Mini PC', 'um', 'pequeno, cabe atrás do monitor', 'Mini-ITX', '6 núcleos, 12 threads', '16 GB DDR5', 'Perfil baixo, 4 GB', 'NVMe de 500 GB', '300 W, formato SFX');

INSERT IGNORE INTO curiosidades (texto) VALUES
  ('O formato ATX, usado até hoje em muitas placas-mãe, foi criado pela Intel em 1995.'),
  ('O Intel 4004, de 1971, tinha cerca de 2.300 transistores. Os processadores atuais têm bilhões.'),
  ('DDR significa Double Data Rate: a memória transfere dados duas vezes em cada ciclo do clock.'),
  ('O termo GPU foi popularizado pela NVIDIA em 1999, no lançamento da GeForce 256.'),
  ('O SSD não tem partes móveis. O primeiro HD comercial, o IBM 305 RAMAC de 1956, guardava cerca de 3,75 MB e pesava perto de uma tonelada.'),
  ('Uma fonte 80 Plus Bronze precisa ter pelo menos 85% de eficiência com metade da carga, na rede de 115 V.'),
  ('O ENIAC, concluído em 1945, usava quase 18 mil válvulas e pesava cerca de 27 toneladas.'),
  ('Em 1947, a equipe de Grace Hopper achou uma mariposa presa em um relé do Harvard Mark II e colou o inseto no diário de operação como um caso real de "bug".'),
  ('A memória RAM é volátil: quando a energia acaba, o conteúdo dela se perde. Por isso os arquivos ficam no SSD.'),
  ('A bateria redonda da placa-mãe, normalmente uma CR2032, mantém o relógio do computador funcionando com ele desligado da tomada.'),
  ('Uma GPU tem centenas ou milhares de núcleos simples trabalhando em paralelo, enquanto um processador tem poucos núcleos muito mais complexos.');

-- Usuario usado pelo site. Se trocar a senha, troque tambem em config.env.
CREATE USER IF NOT EXISTS 'techbox_app'@'%' IDENTIFIED BY 'TechBox@2026';
GRANT SELECT, INSERT ON techbox_db.* TO 'techbox_app'@'%';
FLUSH PRIVILEGES;

SHOW TABLES;
