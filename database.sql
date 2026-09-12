-- ==============================================================================
-- WebDev Client & Billing Hub - Database Schema (MySQL / MariaDB)
-- Siap diimpor ke phpMyAdmin / MySQL CLI
-- ==============================================================================

CREATE DATABASE IF NOT EXISTS `billing_nahnuhost` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `billing_nahnuhost`;

-- ------------------------------------------------------------------------------
-- 1. Tabel Admins (Pengelola Web Developer)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `admins` (
  `id` VARCHAR(50) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` VARCHAR(20) DEFAULT 'admin',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 2. Tabel Clients (Pelanggan / Klien Web)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `clients` (
  `id` VARCHAR(50) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `company` VARCHAR(150) DEFAULT NULL,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `phone` VARCHAR(30) NOT NULL,
  `password_hash` VARCHAR(255) DEFAULT NULL,
  `address` TEXT DEFAULT NULL,
  `notes` TEXT DEFAULT NULL,
  `avatar` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 3. Tabel Products & Packages (Katalog Paket Jasa Pembuatan Website & Hosting)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `products` (
  `id` VARCHAR(50) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `category` VARCHAR(50) NOT NULL,
  `description` TEXT NOT NULL,
  `features` JSON DEFAULT NULL,
  `badge` VARCHAR(50) DEFAULT NULL,
  `active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `product_packages` (
  `id` VARCHAR(50) NOT NULL,
  `product_id` VARCHAR(50) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `billing_cycle` VARCHAR(20) DEFAULT 'yearly',
  `price` DECIMAL(12, 2) NOT NULL,
  `renewal_price` DECIMAL(12, 2) NOT NULL,
  `description` VARCHAR(255) DEFAULT NULL,
  `popular` TINYINT(1) DEFAULT 0,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 4. Tabel Client Services (Layanan Aktif, Domain, Hosting & Kredensial)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `client_services` (
  `id` VARCHAR(50) NOT NULL,
  `client_id` VARCHAR(50) NOT NULL,
  `client_name` VARCHAR(150) NOT NULL,
  `product_id` VARCHAR(50) NOT NULL,
  `package_id` VARCHAR(50) NOT NULL,
  `product_name` VARCHAR(150) NOT NULL,
  `package_name` VARCHAR(100) NOT NULL,
  `website_name` VARCHAR(150) NOT NULL,
  `domain` VARCHAR(150) NOT NULL,
  `url` VARCHAR(255) NOT NULL,
  `billing_cycle` VARCHAR(20) DEFAULT 'yearly',
  `price` DECIMAL(12, 2) NOT NULL,
  `start_date` DATE NOT NULL,
  `expiry_date` DATE NOT NULL,
  `status` ENUM('active', 'expiring_soon', 'expired', 'suspended') DEFAULT 'active',
  `credentials` JSON DEFAULT NULL,
  `auto_renew_reminder` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 5. Tabel Invoices & Items (Tagihan Digital & Rincian Pembayaran)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `invoices` (
  `id` VARCHAR(50) NOT NULL,
  `invoice_number` VARCHAR(50) NOT NULL UNIQUE,
  `client_id` VARCHAR(50) NOT NULL,
  `client_name` VARCHAR(150) NOT NULL,
  `service_id` VARCHAR(50) DEFAULT NULL,
  `website_name` VARCHAR(150) DEFAULT NULL,
  `subtotal` DECIMAL(12, 2) NOT NULL,
  `discount` DECIMAL(12, 2) DEFAULT 0,
  `coupon_code` VARCHAR(50) DEFAULT NULL,
  `total` DECIMAL(12, 2) NOT NULL,
  `issue_date` DATE NOT NULL,
  `due_date` DATE NOT NULL,
  `status` ENUM('unpaid', 'paid', 'overdue', 'cancelled') DEFAULT 'unpaid',
  `payment_method` VARCHAR(50) DEFAULT NULL,
  `paid_at` TIMESTAMP NULL DEFAULT NULL,
  `notes` TEXT DEFAULT NULL,
  `payment_proof_url` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `invoice_items` (
  `id` VARCHAR(50) NOT NULL,
  `invoice_id` VARCHAR(50) NOT NULL,
  `description` VARCHAR(255) NOT NULL,
  `qty` INT DEFAULT 1,
  `unit_price` DECIMAL(12, 2) NOT NULL,
  `total` DECIMAL(12, 2) NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`invoice_id`) REFERENCES `invoices`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 6. Tabel Payment Transactions (Transaksi Pembayaran QRIS / VA / Bank)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `payment_transactions` (
  `id` VARCHAR(50) NOT NULL,
  `invoice_id` VARCHAR(50) NOT NULL,
  `client_id` VARCHAR(50) NOT NULL,
  `amount` DECIMAL(12, 2) NOT NULL,
  `channel` VARCHAR(50) NOT NULL,
  `payment_type` VARCHAR(50) NOT NULL,
  `status` ENUM('pending', 'success', 'failed') DEFAULT 'pending',
  `reference_code` VARCHAR(100) NOT NULL,
  `qris_data` TEXT DEFAULT NULL,
  `va_number` VARCHAR(50) DEFAULT NULL,
  `bank_name` VARCHAR(50) DEFAULT NULL,
  `paid_at` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`invoice_id`) REFERENCES `invoices`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 7. Tabel Coupons (Kode Promo Diskon)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `coupons` (
  `id` VARCHAR(50) NOT NULL,
  `code` VARCHAR(50) NOT NULL UNIQUE,
  `discount_type` ENUM('percentage', 'fixed') DEFAULT 'percentage',
  `discount_value` DECIMAL(12, 2) NOT NULL,
  `min_purchase` DECIMAL(12, 2) DEFAULT 0,
  `max_discount` DECIMAL(12, 2) DEFAULT NULL,
  `active` TINYINT(1) DEFAULT 1,
  `expiry_date` DATE NOT NULL,
  `description` VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 8. Tabel Settings (Pengaturan Brand Developer & Rekening)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `settings` (
  `key_name` VARCHAR(50) NOT NULL,
  `value_json` JSON NOT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`key_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- DATA AWAL / SEED DATA
-- ==============================================================================

-- 1. Admin Default
INSERT INTO `admins` (`id`, `name`, `email`, `password_hash`, `role`)
VALUES ('admin-1', 'NahnuHost Developer', 'admin@nahnuhost.com', 'admin123', 'admin')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- 2. Klien Default
INSERT INTO `clients` (`id`, `name`, `company`, `email`, `phone`, `password_hash`, `address`, `notes`)
VALUES 
('c-1', 'Budi Santoso', 'Toko Berkah Jaya', 'budi@berkahjaya.com', '6281234567890', 'client123', 'Jl. Malioboro No. 45, Yogyakarta', 'Klien prioritas toko online UMKM'),
('c-2', 'dr. Hendra Kusuma', 'Klinik Sehat Prima', 'hendra@sehatprima.com', '6281987654321', 'client123', 'Jl. Sudirman No. 12, Jakarta Selatan', 'Klinik spesialis gigi dan estetika'),
('c-3', 'Siti Rahmawati', 'Rahma Wedding Organizer', 'siti@rahmawo.com', '6285211223344', 'client123', 'Jl. Pemuda No. 88, Semarang', 'Portofolio dan reservasi wedding online')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- 3. Produk Website
INSERT INTO `products` (`id`, `name`, `category`, `description`, `features`, `badge`, `active`)
VALUES
('prod-1', 'Website Company Profile', 'Web Development', 'Solusi website profesional untuk profil perusahaan, UMKM, dan agensi agar kredibel di mata klien.', '["Domain .com gratis 1 tahun", "Desain responsif mobile-friendly", "Integrasi WhatsApp Chat langsung", "Optimasi SEO dasar Google", "Email bisnis nama@perusahaan.com"]', 'Populer', 1),
('prod-2', 'Website Toko Online (E-Commerce)', 'E-Commerce', 'Website toko online lengkap dengan katalog produk, kalkulator ongkir otomatis, dan checkout WhatsApp.', '["Katalog produk tanpa batas", "Integrasi kurir JNE, J&T, SiCepat", "Checkout WhatsApp otomatis", "Payment gateway QRIS & VA", "Panel admin kelola stok & pesanan"]', 'Rekomendasi', 1),
('prod-3', 'Cloud VPS & Maintenance Hosting', 'Infrastructure', 'Layanan hosting dedicated, backup berkala harian, update plugin, dan jaminan website selalu uptime.', '["Server SSD NVMe Cloud cepat", "SSL Certificate HTTPS gratis", "Daily automated backup", "Monitoring uptime 24/7", "Pembersihan malware & update sistem"]', 'Best Value', 1)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- 4. Paket Produk
INSERT INTO `product_packages` (`id`, `product_id`, `name`, `billing_cycle`, `price`, `renewal_price`, `description`, `popular`)
VALUES
('pkg-1a', 'prod-1', 'Paket Starter Profile', 'yearly', 1500000, 600000, 'Cocok untuk bisnis rintisan yang ingin segera tampil di Google', 0),
('pkg-1b', 'prod-1', 'Paket Professional Company', 'yearly', 2500000, 850000, 'Solusi lengkap dengan 5 halaman custom dan integrasi email bisnis', 1),
('pkg-2a', 'prod-2', 'Paket UMKM Toko Online', 'yearly', 3200000, 1100000, 'Lengkap dengan katalog, hitung ongkir otomatis & pembayaran', 1),
('pkg-3a', 'prod-3', 'Paket Maintenance & Hosting Premium', 'yearly', 950000, 950000, 'Perawatan website dan server selama 1 tahun penuh', 0)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- 5. Kupon Promo
INSERT INTO `coupons` (`id`, `code`, `discount_type`, `discount_value`, `min_purchase`, `max_discount`, `active`, `expiry_date`, `description`)
VALUES
('cp-1', 'HEMAT10', 'percentage', 10, 500000, 300000, 1, '2027-12-31', 'Diskon 10% untuk pesanan website baru'),
('cp-2', 'POTONGAN100K', 'fixed', 100000, 1000000, NULL, 1, '2027-12-31', 'Potongan langsung Rp 100.000'),
('cp-3', 'RESELLERVIP', 'percentage', 20, 2000000, 800000, 1, '2027-12-31', 'Diskon 20% khusus langganan reseller/partner')
ON DUPLICATE KEY UPDATE `code` = VALUES(`code`);
