-- ==============================================================================
-- WebDev Client & Billing Hub - Complete Database Schema (MySQL / MariaDB)
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
  `status` VARCHAR(20) DEFAULT 'active',
  `segment` VARCHAR(30) DEFAULT 'umkm',
  `notes` TEXT DEFAULT NULL,
  `avatar` VARCHAR(255) DEFAULT NULL,
  `joined_date` DATE DEFAULT NULL,
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
  `items_json` JSON DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `invoice_items` (
  `id` VARCHAR(50) NOT NULL,
  `invoice_id` VARCHAR(50) NOT NULL,
  `description` VARCHAR(255) NOT NULL,
  `quantity` INT DEFAULT 1,
  `unit_price` DECIMAL(12, 2) NOT NULL,
  `total` DECIMAL(12, 2) NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`invoice_id`) REFERENCES `invoices`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 6. Tabel Orders (Pesanan Layanan & Project Baru)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `orders` (
  `id` VARCHAR(50) NOT NULL,
  `order_number` VARCHAR(50) NOT NULL UNIQUE,
  `client_id` VARCHAR(50) NOT NULL,
  `client_name` VARCHAR(150) NOT NULL,
  `product_id` VARCHAR(50) NOT NULL,
  `product_name` VARCHAR(150) NOT NULL,
  `package_id` VARCHAR(50) NOT NULL,
  `package_name` VARCHAR(100) NOT NULL,
  `price` DECIMAL(12, 2) NOT NULL,
  `website_name` VARCHAR(150) NOT NULL,
  `requested_domain` VARCHAR(150) NOT NULL,
  `billing_cycle` VARCHAR(20) DEFAULT 'yearly',
  `status` ENUM('pending_payment', 'in_progress', 'active', 'cancelled') DEFAULT 'pending_payment',
  `created_at` VARCHAR(50) DEFAULT NULL,
  `invoice_id` VARCHAR(50) DEFAULT NULL,
  `notes` TEXT DEFAULT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 7. Tabel Payment Transactions (Transaksi Pembayaran QRIS / VA / Bank)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `payment_transactions` (
  `id` VARCHAR(50) NOT NULL,
  `transaction_number` VARCHAR(50) NOT NULL UNIQUE,
  `invoice_id` VARCHAR(50) NOT NULL,
  `invoice_number` VARCHAR(50) DEFAULT NULL,
  `client_id` VARCHAR(50) NOT NULL,
  `client_name` VARCHAR(150) NOT NULL,
  `amount` DECIMAL(12, 2) NOT NULL,
  `payment_method` VARCHAR(50) NOT NULL,
  `channel_name` VARCHAR(100) NOT NULL,
  `status` ENUM('pending', 'success', 'failed') DEFAULT 'pending',
  `gateway_ref` VARCHAR(100) DEFAULT NULL,
  `created_at` VARCHAR(50) DEFAULT NULL,
  `paid_at` VARCHAR(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`invoice_id`) REFERENCES `invoices`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 8. Tabel Coupons (Kode Promo Diskon)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `coupons` (
  `id` VARCHAR(50) NOT NULL,
  `code` VARCHAR(50) NOT NULL UNIQUE,
  `discount_type` ENUM('percentage', 'fixed') DEFAULT 'percentage',
  `discount_value` DECIMAL(12, 2) NOT NULL,
  `max_discount` DECIMAL(12, 2) DEFAULT NULL,
  `min_spend` DECIMAL(12, 2) DEFAULT 0,
  `applicable_to` VARCHAR(30) DEFAULT 'all',
  `usage_limit` INT DEFAULT 50,
  `used_count` INT DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `valid_until` DATE NOT NULL,
  `description` VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 9. Tabel Settings (Pengaturan Brand Developer & Rekening)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `settings` (
  `key_name` VARCHAR(50) NOT NULL,
  `value_json` JSON NOT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`key_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 10. Tabel Activity Logs (Log Aktivitas & Audit Trail)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `activity_logs` (
  `id` VARCHAR(50) NOT NULL,
  `actor` VARCHAR(30) NOT NULL,
  `actor_name` VARCHAR(100) NOT NULL,
  `action` VARCHAR(150) NOT NULL,
  `details` TEXT NOT NULL,
  `category` VARCHAR(50) DEFAULT 'system',
  `timestamp` VARCHAR(50) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 11. Tabel Notifications (Notifikasi Sistem & Pengingat)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` VARCHAR(50) NOT NULL,
  `target` VARCHAR(30) NOT NULL,
  `client_id` VARCHAR(50) DEFAULT NULL,
  `title` VARCHAR(150) NOT NULL,
  `message` TEXT NOT NULL,
  `type` VARCHAR(30) DEFAULT 'info',
  `timestamp` VARCHAR(50) NOT NULL,
  `is_read` TINYINT(1) DEFAULT 0,
  `link_tab` VARCHAR(50) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- SEED DATA AWAL LENGKAP
-- ==============================================================================

-- Admin Default
INSERT INTO `admins` (`id`, `name`, `email`, `password_hash`, `role`)
VALUES ('admin-1', 'NahnuHost Developer', 'admin@nahnuhost.com', 'admin123', 'admin')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- Klien Default
INSERT INTO `clients` (`id`, `name`, `company`, `email`, `phone`, `password_hash`, `address`, `status`, `segment`, `notes`, `joined_date`)
VALUES 
('cli-1', 'Budi Santoso', 'Toko Berkah Mandiri', 'budi@tokoberkah.id', '6281298765432', 'client123', 'Jl. Pahlawan No. 12, Bandung, Jawa Barat', 'active', 'umkm', 'Klien e-commerce fashion & herbal', '2025-08-15'),
('cli-2', 'Siti Rahmah', 'PT Cahaya Abadi Logistik', 'siti@cahayaabadilogistik.com', '6281355588990', 'client123', 'Gedung Wisma Niaga Lt. 4, Surabaya', 'active', 'enterprise', 'Klien corporate logistik ekspor-impor', '2025-04-10'),
('cli-3', 'dr. Hendro Wijaya', 'Klinik Sehat Medika', 'hendro@sehatmedika.co.id', '6285712349988', 'client123', 'Jl. Boulevard Raya Blok A2, Gading Serpong', 'active', 'enterprise', 'Website reservasi dokter & profil poliklinik', '2025-01-20'),
('cli-4', 'Dewi Lestari', 'Artha Interior Studio', 'dewi@arthainterior.com', '6281809001122', 'client123', 'Jl. Danau Toba No. 8, Denpasar, Bali', 'active', 'personal', 'Studio desain interior arsitek', '2025-11-05')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- Produk
INSERT INTO `products` (`id`, `name`, `category`, `description`, `features`, `badge`, `active`)
VALUES
('prod-landing', 'Jasa Pembuatan Landing Page', 'website', 'Halaman promosi penjualan single-page berkonversi tinggi, mobile responsive, dan terintegrasi WhatsApp checkout.', '["Single Page High Converting", "Free Domain .com (1 Tahun)", "High Speed Cloud Hosting 1GB", "Copywriting Sales & CTA WhatsApp", "Integrasi Pixel & Google Analytics", "Revisi 2x & Garansi 30 Hari"]', 'Populer', 1),
('prod-company', 'Website Company Profile', 'website', 'Website resmi perusahaan & bisnis untuk meningkatkan kredibilitas, branding, dan daya tarik partner bisnis.', '["Hingga 5 Halaman Utama", "Free Domain .com / .co.id (1 Tahun)", "Cloud Hosting 5GB SSD CPanel", "3 Akun Email Bisnis Profesional", "CMS WordPress / Admin Dashboard", "SSL Security Certificate"]', 'Rekomendasi', 1),
('prod-ecommerce', 'Toko Online & E-Commerce', 'website', 'Platform toko online mandiri dengan hitung ongkir otomatis JNE/J&T/SiCepat dan pembayaran otomatis.', '["Katalog produk tanpa batas", "Integrasi kurir JNE, J&T, SiCepat", "Checkout WhatsApp otomatis", "Payment gateway QRIS & VA", "Panel admin kelola stok & pesanan"]', 'Best Value', 1),
('prod-hosting', 'Managed Hosting & Domain', 'hosting', 'Layanan sewa server cloud cepat dan perpanjangan nama domain dengan dukungan teknis langsung.', '["Storage 10GB Pure NVMe", "Unmetered Bandwidth", "Free SSL Certificate Auto-Renew", "cPanel / DirectAdmin Control Panel", "Daily Automated Backup"]', 'Infrastruktur', 1)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- Kupon
INSERT INTO `coupons` (`id`, `code`, `discount_type`, `discount_value`, `max_discount`, `min_spend`, `applicable_to`, `usage_limit`, `used_count`, `is_active`, `valid_until`, `description`)
VALUES
('cp-1', 'DISKONWEB10', 'percentage', 10, 300000, 1500000, 'all', 50, 14, 1, '2027-12-31', 'Diskon 10% untuk semua layanan web & perpanjangan (Maks. Rp 300rb)'),
('cp-2', 'SETIA2026', 'percentage', 15, 500000, 1500000, 'renewal', 30, 8, 1, '2027-12-31', 'Diskon 15% khusus perpanjangan domain & hosting tahunan'),
('cp-3', 'HEMAT250K', 'fixed', 250000, 250000, 1500000, 'all', 40, 15, 1, '2027-12-31', 'Potongan langsung Rp 250.000 untuk pembelian atau perpanjangan')
ON DUPLICATE KEY UPDATE `code` = VALUES(`code`);
