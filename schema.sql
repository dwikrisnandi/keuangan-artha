-- ============================================
-- Artha — Dasbor Keuangan Pribadi
-- Database Schema
-- ============================================

CREATE DATABASE IF NOT EXISTS artha_keuangan
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE artha_keuangan;

-- --------------------------------------------
-- Tabel: users
-- Setiap pengguna diidentifikasi oleh kode akses unik
-- --------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  access_code  VARCHAR(20) NOT NULL UNIQUE,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- --------------------------------------------
-- Tabel: transactions
-- Catatan pemasukan, pengeluaran, dan hutang per user
-- --------------------------------------------
CREATE TABLE IF NOT EXISTS transactions (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  user_id      INT NOT NULL,
  type         ENUM('income', 'expense', 'debt') NOT NULL,
  amount       DECIMAL(15,2) NOT NULL,
  category     VARCHAR(100) NOT NULL,
  description  VARCHAR(255) DEFAULT NULL,
  date         DATE NOT NULL,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_date (user_id, date),
  INDEX idx_user_type (user_id, type)
) ENGINE=InnoDB;
