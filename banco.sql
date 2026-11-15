-- TechBox: executar no MySQL Workbench com o usuario root.
-- Pode rodar mais de uma vez: nao apaga nada do que ja foi gravado.
SET NAMES utf8mb4;

CREATE DATABASE IF NOT EXISTS techbox_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE techbox_db;

-- Cadastro de quem joga (e-mail opcional).
CREATE TABLE IF NOT EXISTS jogadores (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nome VARCHAR(60) NOT NULL,
  email VARCHAR(120) NULL,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_jogadores_email (email)
) ENGINE=InnoDB;
-- Na versao antiga o e-mail era obrigatorio. Agora e opcional.
ALTER TABLE jogadores MODIFY email VARCHAR(120) NULL;

-- Jogos e requisitos minimos oficiais. O site le daqui.
CREATE TABLE IF NOT EXISTS jogos (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  slug VARCHAR(30) NOT NULL,
  nome VARCHAR(60) NOT NULL,
  nivel CHAR(1) NOT NULL,
  nivel_nome VARCHAR(20) NOT NULL,
  descricao VARCHAR(120) NOT NULL,
  preco DECIMAL(8,2) NOT NULL,
  loja VARCHAR(40) NOT NULL,
  cpu_texto VARCHAR(120) NOT NULL,
  cpu_forca TINYINT UNSIGNED NOT NULL,
  cpu_nucleos TINYINT UNSIGNED NOT NULL,
  cpu_threads TINYINT UNSIGNED NOT NULL,
  ram_gb TINYINT UNSIGNED NOT NULL,
  ram_gb_integrado TINYINT UNSIGNED NULL,
  video_texto VARCHAR(120) NOT NULL,
  video_forca TINYINT UNSIGNED NOT NULL,
  espaco_gb SMALLINT UNSIGNED NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_jogos_slug (slug)
) ENGINE=InnoDB;

-- Pecas da loja, com preco e forca (nota de 0 a 100 em jogos).
CREATE TABLE IF NOT EXISTS pecas (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  slug VARCHAR(30) NOT NULL,
  categoria ENUM('cpu','ram','gpu','ssd','psu') NOT NULL,
  nome VARCHAR(60) NOT NULL,
  spec VARCHAR(120) NOT NULL,
  preco DECIMAL(8,2) NOT NULL,
  forca TINYINT UNSIGNED NULL,
  nucleos TINYINT UNSIGNED NULL,
  threads TINYINT UNSIGNED NULL,
  video TINYINT UNSIGNED NULL,
  gb SMALLINT UNSIGNED NULL,
  watts SMALLINT UNSIGNED NULL,
  fonte_recomendada SMALLINT UNSIGNED NULL,
  selo VARCHAR(30) NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_pecas_slug (slug)
) ENGINE=InnoDB;

-- Cada PC montado e testado no site.
CREATE TABLE IF NOT EXISTS montagens (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  jogador_id INT UNSIGNED NOT NULL,
  jogo_id INT UNSIGNED NOT NULL,
  cpu_id INT UNSIGNED NOT NULL,
  ram_id INT UNSIGNED NOT NULL,
  gpu_id INT UNSIGNED NOT NULL,
  ssd_id INT UNSIGNED NOT NULL,
  psu_id INT UNSIGNED NOT NULL,
  gasto DECIMAL(9,2) NOT NULL,
  rodou TINYINT(1) NOT NULL,
  estrelas TINYINT UNSIGNED NOT NULL DEFAULT 0,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_montagens_jogador FOREIGN KEY (jogador_id) REFERENCES jogadores (id),
  CONSTRAINT fk_montagens_jogo FOREIGN KEY (jogo_id) REFERENCES jogos (id),
  CONSTRAINT fk_montagens_cpu FOREIGN KEY (cpu_id) REFERENCES pecas (id),
  CONSTRAINT fk_montagens_ram FOREIGN KEY (ram_id) REFERENCES pecas (id),
  CONSTRAINT fk_montagens_gpu FOREIGN KEY (gpu_id) REFERENCES pecas (id),
  CONSTRAINT fk_montagens_ssd FOREIGN KEY (ssd_id) REFERENCES pecas (id),
  CONSTRAINT fk_montagens_psu FOREIGN KEY (psu_id) REFERENCES pecas (id)
) ENGINE=InnoDB;

-- Resultado do desafio Tecnico por um dia.
CREATE TABLE IF NOT EXISTS diagnosticos (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  jogador_id INT UNSIGNED NOT NULL,
  acertos TINYINT UNSIGNED NOT NULL,
  total TINYINT UNSIGNED NOT NULL,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_diagnosticos_jogador FOREIGN KEY (jogador_id) REFERENCES jogadores (id)
) ENGINE=InnoDB;

-- Dados iniciais (precos pesquisados entre set. e nov. de 2026).
INSERT IGNORE INTO jogos
  (slug, nome, nivel, nivel_nome, descricao, preco, loja, cpu_texto, cpu_forca, cpu_nucleos, cpu_threads, ram_gb, ram_gb_integrado, video_texto, video_forca, espaco_gb) VALUES
  ('valorant', 'Valorant', 'f', 'Fácil', 'Tiro tático em equipe.', 0, 'Grátis na Riot', 'Intel Core 2 Duo E8400 ou AMD Athlon 200GE', 5, 2, 2, 4, NULL, 'Intel HD 4000 ou Radeon R5 200', 2, NULL),
  ('fortnite', 'Fortnite', 'f', 'Fácil', 'Battle royale com construção.', 0, 'Grátis na Epic', 'Intel Core i3-3225', 10, 2, 4, 8, NULL, 'Intel HD 4000 ou AMD Vega 8', 3, NULL),
  ('cs2', 'Counter-Strike 2', 'f', 'Fácil', 'Tiro competitivo clássico.', 0, 'Grátis na Steam', '4 threads, como o Intel Core i5 750', 9, 2, 4, 8, NULL, '1 GB de memória de vídeo e DirectX 11', 3, 85),
  ('minecraft', 'Minecraft', 'm', 'Médio', 'Construir mundos de blocos.', 99, 'R$ 99 (Java e Bedrock)', '4 núcleos, como Core i3-10100 ou Ryzen 3 3100', 35, 4, 4, 8, 12, 'GTX 950, RX 460 ou vídeo integrado com Vulkan 1.3', 6, NULL),
  ('gta', 'GTA V', 'd', 'Difícil', 'Mundo aberto em Los Santos (versão Enhanced).', 149.9, 'R$ 149,90 na Steam', 'Intel Core i7-4770 ou AMD FX-9590', 25, 4, 4, 8, NULL, 'GTX 1630 (4 GB) ou RX 6400 (4 GB)', 10, 105);

INSERT IGNORE INTO pecas
  (slug, categoria, nome, spec, preco, forca, nucleos, threads, video, gb, watts, fonte_recomendada, selo) VALUES
  ('cpu-4500', 'cpu', 'AMD Ryzen 5 4500', '6 núcleos, sem vídeo integrado', 529, 45, 6, 12, 0, NULL, NULL, NULL, NULL),
  ('cpu-5500', 'cpu', 'AMD Ryzen 5 5500', '6 núcleos, sem vídeo integrado', 540, 52, 6, 12, 0, NULL, NULL, NULL, NULL),
  ('cpu-12100f', 'cpu', 'Intel Core i3-12100F', '4 núcleos, sem vídeo integrado', 729, 55, 4, 8, 0, NULL, NULL, NULL, NULL),
  ('cpu-5600gt', 'cpu', 'AMD Ryzen 5 5600GT', '6 núcleos, com vídeo integrado', 1032, 56, 6, 12, 6, NULL, NULL, NULL, 'Vídeo integrado'),
  ('cpu-12400f', 'cpu', 'Intel Core i5-12400F', '6 núcleos, sem vídeo integrado', 1102, 68, 6, 12, 0, NULL, NULL, NULL, NULL),
  ('cpu-5700', 'cpu', 'AMD Ryzen 7 5700', '8 núcleos, sem vídeo integrado', 1106, 64, 8, 16, 0, NULL, NULL, NULL, NULL),
  ('cpu-5700x', 'cpu', 'AMD Ryzen 7 5700X', '8 núcleos, sem vídeo integrado', 1199, 72, 8, 16, 0, NULL, NULL, NULL, NULL),
  ('ram-8', 'ram', 'Kingston Fury 8 GB', 'DDR4, 1 pente', 650, NULL, NULL, NULL, NULL, 8, NULL, NULL, NULL),
  ('ram-16p', 'ram', 'Puskill 16 GB', 'DDR4, 1 pente, marca de entrada', 700, NULL, NULL, NULL, NULL, 16, NULL, NULL, NULL),
  ('ram-16', 'ram', 'Kingston Fury 16 GB', 'DDR4, 1 pente', 1200, NULL, NULL, NULL, NULL, 16, NULL, NULL, NULL),
  ('ram-32', 'ram', 'Corsair Vengeance 32 GB', 'DDR4, 2 pentes de 16 GB', 2750, NULL, NULL, NULL, NULL, 32, NULL, NULL, NULL),
  ('gpu-none', 'gpu', 'Sem placa de vídeo', 'Usa o vídeo integrado do processador, se ele tiver', 0, 0, NULL, NULL, NULL, NULL, NULL, 0, NULL),
  ('gpu-3050', 'gpu', 'GeForce RTX 3050', '6 GB, pede fonte de 550 W', 1400, 26, NULL, NULL, NULL, NULL, NULL, 550, NULL),
  ('gpu-7600', 'gpu', 'Radeon RX 7600', '8 GB, pede fonte de 550 W', 2000, 48, NULL, NULL, NULL, NULL, NULL, 550, NULL),
  ('gpu-5060', 'gpu', 'GeForce RTX 5060', '8 GB, pede fonte de 550 W', 2700, 55, NULL, NULL, NULL, NULL, NULL, 550, NULL),
  ('gpu-5060ti', 'gpu', 'GeForce RTX 5060 Ti', '8 GB, pede fonte de 600 W', 3200, 64, NULL, NULL, NULL, NULL, NULL, 600, NULL),
  ('gpu-5060ti16', 'gpu', 'GeForce RTX 5060 Ti 16 GB', '16 GB, pede fonte de 600 W', 4500, 66, NULL, NULL, NULL, NULL, NULL, 600, NULL),
  ('gpu-5070', 'gpu', 'GeForce RTX 5070', '12 GB, pede fonte de 650 W', 5300, 100, NULL, NULL, NULL, NULL, NULL, 650, NULL),
  ('ssd-480', 'ssd', 'SSD SATA 480 GB', 'Kingston A400', 200, NULL, NULL, NULL, NULL, 480, NULL, NULL, NULL),
  ('ssd-500', 'ssd', 'SSD NVMe 500 GB', 'Mais rápido que o SATA', 325, NULL, NULL, NULL, NULL, 500, NULL, NULL, NULL),
  ('ssd-1000', 'ssd', 'SSD NVMe 1 TB', 'Kingston NV3', 575, NULL, NULL, NULL, NULL, 1000, NULL, NULL, NULL),
  ('ssd-2000', 'ssd', 'SSD NVMe 2 TB', 'Para quem tem muitos jogos', 1150, NULL, NULL, NULL, NULL, 2000, NULL, NULL, NULL),
  ('psu-500', 'psu', 'Fonte 500 W', 'Pcfort, 80 Plus Bronze', 363, NULL, NULL, NULL, NULL, NULL, 500, NULL, NULL),
  ('psu-550', 'psu', 'Fonte 550 W', 'MSI MAG A550BN, 80 Plus Bronze', 317, NULL, NULL, NULL, NULL, NULL, 550, NULL, NULL),
  ('psu-650', 'psu', 'Fonte 650 W', 'Corsair CX650, 80 Plus Bronze', 350, NULL, NULL, NULL, NULL, NULL, 650, NULL, NULL);

-- Usuario usado pelo site. Se trocar a senha, troque tambem no config.env.
CREATE USER IF NOT EXISTS 'techbox_app'@'%' IDENTIFIED BY 'TechBox@2026';
CREATE USER IF NOT EXISTS 'techbox_app'@'localhost' IDENTIFIED BY 'TechBox@2026';
GRANT SELECT, INSERT ON techbox_db.* TO 'techbox_app'@'%';
GRANT SELECT, INSERT ON techbox_db.* TO 'techbox_app'@'localhost';
FLUSH PRIVILEGES;

SHOW TABLES;
SELECT slug, nome, preco FROM jogos;
SELECT categoria, nome, preco FROM pecas ORDER BY categoria, preco;
