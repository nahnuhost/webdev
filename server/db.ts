import mysql from 'mysql2/promise';
import { defaultSeedData } from './seedData';

export interface DbStatus {
  connected: boolean;
  message: string;
  config: {
    host: string;
    port: number;
    user: string;
    database: string;
  };
  tables?: Record<string, number>;
}

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'billing_nahnuhost',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

let pool: mysql.Pool | null = null;
let lastError = '';

export function getDbPool(): mysql.Pool | null {
  if (!pool) {
    try {
      pool = mysql.createPool(dbConfig);
    } catch (err: any) {
      console.warn('[MySQL] Failed to create connection pool:', err.message);
      lastError = err.message;
      return null;
    }
  }
  return pool;
}

const ALL_TABLE_NAMES = [
  'admins',
  'clients',
  'products',
  'product_packages',
  'client_services',
  'invoices',
  'invoice_items',
  'orders',
  'payment_transactions',
  'coupons',
  'settings',
  'activity_logs',
  'notifications',
];

export async function checkDbConnection(): Promise<DbStatus> {
  const currentPool = getDbPool();
  if (!currentPool) {
    return {
      connected: false,
      message: lastError || 'Pool database MySQL belum dapat dibuat.',
      config: {
        host: dbConfig.host,
        port: dbConfig.port,
        user: dbConfig.user,
        database: dbConfig.database,
      },
    };
  }

  try {
    const connection = await currentPool.getConnection();
    try {
      await connection.ping();

      const counts: Record<string, number> = {};
      for (const table of ALL_TABLE_NAMES) {
        try {
          const [rows]: any = await connection.query(`SELECT COUNT(*) as count FROM \`${table}\``);
          counts[table] = rows[0]?.count || 0;
        } catch {
          counts[table] = 0;
        }
      }

      const totalTablesExisting = Object.values(counts).filter((c) => c >= 0).length;

      return {
        connected: true,
        message: `Koneksi MySQL aktif (${totalTablesExisting} tabel terdeteksi).`,
        config: {
          host: dbConfig.host,
          port: dbConfig.port,
          user: dbConfig.user,
          database: dbConfig.database,
        },
        tables: counts,
      };
    } finally {
      connection.release();
    }
  } catch (err: any) {
    lastError = err.message;
    return {
      connected: false,
      message: `Gagal terhubung ke MySQL (${err.code || err.message}). Pastikan server MySQL (XAMPP/Laragon) berjalan di ${dbConfig.host}:${dbConfig.port}.`,
      config: {
        host: dbConfig.host,
        port: dbConfig.port,
        user: dbConfig.user,
        database: dbConfig.database,
      },
    };
  }
}

/**
 * Buat SEMUA 11+ tabel MySQL jika belum ada
 */
export async function createAllTables(conn: mysql.PoolConnection) {
  // 1. Admins
  await conn.query(`
    CREATE TABLE IF NOT EXISTS \`admins\` (
      \`id\` VARCHAR(50) NOT NULL,
      \`name\` VARCHAR(100) NOT NULL,
      \`email\` VARCHAR(150) NOT NULL UNIQUE,
      \`password_hash\` VARCHAR(255) NOT NULL,
      \`role\` VARCHAR(20) DEFAULT 'admin',
      \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // 2. Clients
  await conn.query(`
    CREATE TABLE IF NOT EXISTS \`clients\` (
      \`id\` VARCHAR(50) NOT NULL,
      \`name\` VARCHAR(150) NOT NULL,
      \`company\` VARCHAR(150) DEFAULT NULL,
      \`email\` VARCHAR(150) NOT NULL UNIQUE,
      \`phone\` VARCHAR(30) NOT NULL,
      \`password_hash\` VARCHAR(255) DEFAULT NULL,
      \`address\` TEXT DEFAULT NULL,
      \`status\` VARCHAR(20) DEFAULT 'active',
      \`segment\` VARCHAR(30) DEFAULT 'umkm',
      \`notes\` TEXT DEFAULT NULL,
      \`avatar\` VARCHAR(255) DEFAULT NULL,
      \`joined_date\` DATE DEFAULT NULL,
      \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // 3. Products
  await conn.query(`
    CREATE TABLE IF NOT EXISTS \`products\` (
      \`id\` VARCHAR(50) NOT NULL,
      \`name\` VARCHAR(150) NOT NULL,
      \`category\` VARCHAR(50) NOT NULL,
      \`description\` TEXT NOT NULL,
      \`features\` JSON DEFAULT NULL,
      \`badge\` VARCHAR(50) DEFAULT NULL,
      \`active\` TINYINT(1) DEFAULT 1,
      \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // 4. Product Packages
  await conn.query(`
    CREATE TABLE IF NOT EXISTS \`product_packages\` (
      \`id\` VARCHAR(50) NOT NULL,
      \`product_id\` VARCHAR(50) NOT NULL,
      \`name\` VARCHAR(100) NOT NULL,
      \`billing_cycle\` VARCHAR(20) DEFAULT 'yearly',
      \`price\` DECIMAL(12, 2) NOT NULL,
      \`renewal_price\` DECIMAL(12, 2) NOT NULL,
      \`description\` VARCHAR(255) DEFAULT NULL,
      \`popular\` TINYINT(1) DEFAULT 0,
      PRIMARY KEY (\`id\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // 5. Client Services
  await conn.query(`
    CREATE TABLE IF NOT EXISTS \`client_services\` (
      \`id\` VARCHAR(50) NOT NULL,
      \`client_id\` VARCHAR(50) NOT NULL,
      \`client_name\` VARCHAR(150) NOT NULL,
      \`product_id\` VARCHAR(50) NOT NULL,
      \`package_id\` VARCHAR(50) NOT NULL,
      \`product_name\` VARCHAR(150) NOT NULL,
      \`package_name\` VARCHAR(100) NOT NULL,
      \`website_name\` VARCHAR(150) NOT NULL,
      \`domain\` VARCHAR(150) NOT NULL,
      \`url\` VARCHAR(255) NOT NULL,
      \`billing_cycle\` VARCHAR(20) DEFAULT 'yearly',
      \`price\` DECIMAL(12, 2) NOT NULL,
      \`start_date\` DATE NOT NULL,
      \`expiry_date\` DATE NOT NULL,
      \`status\` ENUM('active', 'expiring_soon', 'expired', 'suspended') DEFAULT 'active',
      \`credentials\` JSON DEFAULT NULL,
      \`auto_renew_reminder\` TINYINT(1) DEFAULT 1,
      \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // 6. Invoices
  await conn.query(`
    CREATE TABLE IF NOT EXISTS \`invoices\` (
      \`id\` VARCHAR(50) NOT NULL,
      \`invoice_number\` VARCHAR(50) NOT NULL UNIQUE,
      \`client_id\` VARCHAR(50) NOT NULL,
      \`client_name\` VARCHAR(150) NOT NULL,
      \`service_id\` VARCHAR(50) DEFAULT NULL,
      \`website_name\` VARCHAR(150) DEFAULT NULL,
      \`subtotal\` DECIMAL(12, 2) NOT NULL,
      \`discount\` DECIMAL(12, 2) DEFAULT 0,
      \`coupon_code\` VARCHAR(50) DEFAULT NULL,
      \`total\` DECIMAL(12, 2) NOT NULL,
      \`issue_date\` DATE NOT NULL,
      \`due_date\` DATE NOT NULL,
      \`status\` ENUM('unpaid', 'paid', 'overdue', 'cancelled') DEFAULT 'unpaid',
      \`payment_method\` VARCHAR(50) DEFAULT NULL,
      \`paid_at\` TIMESTAMP NULL DEFAULT NULL,
      \`notes\` TEXT DEFAULT NULL,
      \`payment_proof_url\` VARCHAR(255) DEFAULT NULL,
      \`items_json\` JSON DEFAULT NULL,
      \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // 7. Invoice Items
  await conn.query(`
    CREATE TABLE IF NOT EXISTS \`invoice_items\` (
      \`id\` VARCHAR(50) NOT NULL,
      \`invoice_id\` VARCHAR(50) NOT NULL,
      \`description\` VARCHAR(255) NOT NULL,
      \`quantity\` INT DEFAULT 1,
      \`unit_price\` DECIMAL(12, 2) NOT NULL,
      \`total\` DECIMAL(12, 2) NOT NULL,
      PRIMARY KEY (\`id\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // 8. Orders
  await conn.query(`
    CREATE TABLE IF NOT EXISTS \`orders\` (
      \`id\` VARCHAR(50) NOT NULL,
      \`order_number\` VARCHAR(50) NOT NULL UNIQUE,
      \`client_id\` VARCHAR(50) NOT NULL,
      \`client_name\` VARCHAR(150) NOT NULL,
      \`product_id\` VARCHAR(50) NOT NULL,
      \`product_name\` VARCHAR(150) NOT NULL,
      \`package_id\` VARCHAR(50) NOT NULL,
      \`package_name\` VARCHAR(100) NOT NULL,
      \`price\` DECIMAL(12, 2) NOT NULL,
      \`website_name\` VARCHAR(150) NOT NULL,
      \`requested_domain\` VARCHAR(150) NOT NULL,
      \`billing_cycle\` VARCHAR(20) DEFAULT 'yearly',
      \`status\` ENUM('pending_payment', 'in_progress', 'active', 'cancelled') DEFAULT 'pending_payment',
      \`created_at\` VARCHAR(50) DEFAULT NULL,
      \`invoice_id\` VARCHAR(50) DEFAULT NULL,
      \`notes\` TEXT DEFAULT NULL,
      PRIMARY KEY (\`id\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // 9. Payment Transactions
  await conn.query(`
    CREATE TABLE IF NOT EXISTS \`payment_transactions\` (
      \`id\` VARCHAR(50) NOT NULL,
      \`transaction_number\` VARCHAR(50) NOT NULL UNIQUE,
      \`invoice_id\` VARCHAR(50) NOT NULL,
      \`invoice_number\` VARCHAR(50) DEFAULT NULL,
      \`client_id\` VARCHAR(50) NOT NULL,
      \`client_name\` VARCHAR(150) NOT NULL,
      \`amount\` DECIMAL(12, 2) NOT NULL,
      \`payment_method\` VARCHAR(50) NOT NULL,
      \`channel_name\` VARCHAR(100) NOT NULL,
      \`status\` ENUM('pending', 'success', 'failed') DEFAULT 'pending',
      \`gateway_ref\` VARCHAR(100) DEFAULT NULL,
      \`created_at\` VARCHAR(50) DEFAULT NULL,
      \`paid_at\` VARCHAR(50) DEFAULT NULL,
      PRIMARY KEY (\`id\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // 10. Coupons
  await conn.query(`
    CREATE TABLE IF NOT EXISTS \`coupons\` (
      \`id\` VARCHAR(50) NOT NULL,
      \`code\` VARCHAR(50) NOT NULL UNIQUE,
      \`discount_type\` ENUM('percentage', 'fixed') DEFAULT 'percentage',
      \`discount_value\` DECIMAL(12, 2) NOT NULL,
      \`max_discount\` DECIMAL(12, 2) DEFAULT NULL,
      \`min_spend\` DECIMAL(12, 2) DEFAULT 0,
      \`applicable_to\` VARCHAR(30) DEFAULT 'all',
      \`usage_limit\` INT DEFAULT 50,
      \`used_count\` INT DEFAULT 0,
      \`is_active\` TINYINT(1) DEFAULT 1,
      \`valid_until\` DATE NOT NULL,
      \`description\` VARCHAR(255) DEFAULT NULL,
      PRIMARY KEY (\`id\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // 11. Settings
  await conn.query(`
    CREATE TABLE IF NOT EXISTS \`settings\` (
      \`key_name\` VARCHAR(50) NOT NULL,
      \`value_json\` JSON NOT NULL,
      \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (\`key_name\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // 12. Activity Logs
  await conn.query(`
    CREATE TABLE IF NOT EXISTS \`activity_logs\` (
      \`id\` VARCHAR(50) NOT NULL,
      \`actor\` VARCHAR(30) NOT NULL,
      \`actor_name\` VARCHAR(100) NOT NULL,
      \`action\` VARCHAR(150) NOT NULL,
      \`details\` TEXT NOT NULL,
      \`category\` VARCHAR(50) DEFAULT 'system',
      \`timestamp\` VARCHAR(50) NOT NULL,
      PRIMARY KEY (\`id\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // 13. Notifications
  await conn.query(`
    CREATE TABLE IF NOT EXISTS \`notifications\` (
      \`id\` VARCHAR(50) NOT NULL,
      \`target\` VARCHAR(30) NOT NULL,
      \`client_id\` VARCHAR(50) DEFAULT NULL,
      \`title\` VARCHAR(150) NOT NULL,
      \`message\` TEXT NOT NULL,
      \`type\` VARCHAR(30) DEFAULT 'info',
      \`timestamp\` VARCHAR(50) NOT NULL,
      \`is_read\` TINYINT(1) DEFAULT 0,
      \`link_tab\` VARCHAR(50) DEFAULT NULL,
      PRIMARY KEY (\`id\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
}

/**
 * Masukkan data awal (seed) ke MySQL
 */
export async function seedMySQLData(conn: mysql.PoolConnection, customData?: any) {
  const data = customData || defaultSeedData;

  // 1. Admins
  if (data.admins) {
    for (const a of data.admins) {
      await conn.query(
        `INSERT INTO admins (id, name, email, password_hash, role)
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE name=VALUES(name)`,
        [a.id, a.name, a.email, a.passwordHash || 'admin123', a.role || 'admin']
      );
    }
  }

  // 2. Clients
  if (data.clients) {
    for (const c of data.clients) {
      await conn.query(
        `INSERT INTO clients (id, name, company, email, phone, address, status, segment, notes, avatar, joined_date)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE name=VALUES(name), company=VALUES(company), phone=VALUES(phone), status=VALUES(status)`,
        [
          c.id,
          c.name,
          c.company || null,
          c.email,
          c.phone,
          c.address || null,
          c.status || 'active',
          c.segment || 'umkm',
          c.notes || null,
          c.avatar || null,
          c.joinedDate || new Date().toISOString().slice(0, 10),
        ]
      );
    }
  }

  // 3. Products & Packages
  if (data.products) {
    for (const p of data.products) {
      await conn.query(
        `INSERT INTO products (id, name, category, description, features, badge, active)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description)`,
        [
          p.id,
          p.name,
          p.category,
          p.description,
          JSON.stringify(p.features || []),
          p.badge || null,
          p.active ? 1 : 0,
        ]
      );

      if (p.packages) {
        for (const pkg of p.packages) {
          await conn.query(
            `INSERT INTO product_packages (id, product_id, name, billing_cycle, price, renewal_price, description, popular)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE price=VALUES(price), renewal_price=VALUES(renewal_price)`,
            [
              pkg.id,
              p.id,
              pkg.name,
              pkg.billingCycle || 'yearly',
              pkg.price,
              pkg.renewalPrice || pkg.price,
              pkg.description || null,
              pkg.popular ? 1 : 0,
            ]
          );
        }
      }
    }
  }

  // 4. Client Services
  if (data.services) {
    for (const s of data.services) {
      await conn.query(
        `INSERT INTO client_services (id, client_id, client_name, product_id, package_id, product_name, package_name, website_name, domain, url, billing_cycle, price, start_date, expiry_date, status, credentials, auto_renew_reminder)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE status=VALUES(status), expiry_date=VALUES(expiry_date), credentials=VALUES(credentials)`,
        [
          s.id,
          s.clientId,
          s.clientName,
          s.productId || 'prod-custom',
          s.packageId || 'pkg-custom',
          s.productName || s.websiteName,
          s.packageName || 'Default Package',
          s.websiteName,
          s.domain,
          s.url,
          s.billingCycle || 'yearly',
          s.price,
          s.startDate,
          s.expiryDate,
          s.status || 'active',
          JSON.stringify(s.credentials || {}),
          s.autoRenewReminder ? 1 : 0,
        ]
      );
    }
  }

  // 5. Invoices & Items
  if (data.invoices) {
    for (const inv of data.invoices) {
      await conn.query(
        `INSERT INTO invoices (id, invoice_number, client_id, client_name, service_id, website_name, subtotal, discount, coupon_code, total, issue_date, due_date, status, payment_method, notes, items_json)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE status=VALUES(status), total=VALUES(total)`,
        [
          inv.id,
          inv.invoiceNumber,
          inv.clientId,
          inv.clientName,
          inv.serviceId || null,
          inv.websiteName || null,
          inv.subtotal,
          inv.discount || 0,
          inv.couponCode || null,
          inv.total,
          inv.issueDate,
          inv.dueDate,
          inv.status || 'unpaid',
          inv.paymentMethod || null,
          inv.notes || null,
          JSON.stringify(inv.items || []),
        ]
      );

      if (inv.items) {
        for (const it of inv.items) {
          await conn.query(
            `INSERT INTO invoice_items (id, invoice_id, description, quantity, unit_price, total)
             VALUES (?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE description=VALUES(description), total=VALUES(total)`,
            [it.id, inv.id, it.description, it.quantity || 1, it.unitPrice, it.total]
          );
        }
      }
    }
  }

  // 6. Orders
  if (data.orders) {
    for (const o of data.orders) {
      await conn.query(
        `INSERT INTO orders (id, order_number, client_id, client_name, product_id, product_name, package_id, package_name, price, website_name, requested_domain, billing_cycle, status, created_at, invoice_id, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE status=VALUES(status)`,
        [
          o.id,
          o.orderNumber,
          o.clientId,
          o.clientName,
          o.productId,
          o.productName,
          o.packageId,
          o.packageName,
          o.price,
          o.websiteName,
          o.requestedDomain,
          o.billingCycle || 'yearly',
          o.status || 'pending_payment',
          o.createdAt || new Date().toISOString(),
          o.invoiceId || null,
          o.notes || null,
        ]
      );
    }
  }

  // 7. Payment Transactions
  if (data.transactions) {
    for (const tx of data.transactions) {
      await conn.query(
        `INSERT INTO payment_transactions (id, transaction_number, invoice_id, invoice_number, client_id, client_name, amount, payment_method, channel_name, status, gateway_ref, created_at, paid_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE status=VALUES(status)`,
        [
          tx.id,
          tx.transactionNumber,
          tx.invoiceId,
          tx.invoiceNumber || null,
          tx.clientId,
          tx.clientName,
          tx.amount,
          tx.paymentMethod,
          tx.channelName,
          tx.status,
          tx.gatewayRef || null,
          tx.createdAt,
          tx.paidAt || null,
        ]
      );
    }
  }

  // 8. Coupons
  if (data.coupons) {
    for (const cp of data.coupons) {
      await conn.query(
        `INSERT INTO coupons (id, code, discount_type, discount_value, max_discount, min_spend, applicable_to, usage_limit, used_count, is_active, valid_until, description)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE discount_value=VALUES(discount_value), is_active=VALUES(is_active)`,
        [
          cp.id,
          cp.code,
          cp.discountType,
          cp.discountValue,
          cp.maxDiscount || null,
          cp.minSpend || 0,
          cp.applicableTo || 'all',
          cp.usageLimit || 50,
          cp.usedCount || 0,
          cp.isActive ? 1 : 0,
          cp.validUntil || '2027-12-31',
          cp.description || null,
        ]
      );
    }
  }

  // 9. Settings
  if (data.settings) {
    await conn.query(
      `INSERT INTO settings (key_name, value_json)
       VALUES ('app_settings', ?)
       ON DUPLICATE KEY UPDATE value_json=VALUES(value_json)`,
      [JSON.stringify(data.settings)]
    );
  }

  // 10. Activity Logs
  if (data.logs) {
    for (const lg of data.logs) {
      await conn.query(
        `INSERT INTO activity_logs (id, actor, actor_name, action, details, category, timestamp)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE details=VALUES(details)`,
        [lg.id, lg.actor, lg.actorName, lg.action, lg.details, lg.category || 'system', lg.timestamp]
      );
    }
  }

  // 11. Notifications
  if (data.notifications) {
    for (const n of data.notifications) {
      await conn.query(
        `INSERT INTO notifications (id, target, client_id, title, message, type, timestamp, is_read, link_tab)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE is_read=VALUES(is_read)`,
        [
          n.id,
          n.target,
          n.clientId || null,
          n.title,
          n.message,
          n.type || 'info',
          n.timestamp,
          n.isRead ? 1 : 0,
          n.linkTab || null,
        ]
      );
    }
  }
}

/**
 * Inisialisasi Tabel MySQL lengkap (semua 11 tabel) + isi data demo jika kosong
 */
export async function initMySQLTables(): Promise<{ success: boolean; message: string; tableCount: number }> {
  const currentPool = getDbPool();
  if (!currentPool) {
    return { success: false, message: 'Koneksi MySQL tidak tersedia.', tableCount: 0 };
  }

  try {
    const conn = await currentPool.getConnection();
    try {
      await createAllTables(conn);

      // Cek apakah tabel clients kosong, jika ya, masukkan seed data awal
      const [rows]: any = await conn.query('SELECT COUNT(*) as count FROM clients');
      const isClientsEmpty = (rows[0]?.count || 0) === 0;

      if (isClientsEmpty) {
        await seedMySQLData(conn);
      }

      return {
        success: true,
        message: `Semua 11+ tabel MySQL (clients, invoices, services, orders, coupons, settings, logs, dll) berhasil disiapkan${
          isClientsEmpty ? ' dan diisi dengan data demo awal' : ''
        }!`,
        tableCount: ALL_TABLE_NAMES.length,
      };
    } finally {
      conn.release();
    }
  } catch (err: any) {
    return { success: false, message: `Gagal membuat tabel: ${err.message}`, tableCount: 0 };
  }
}

/**
 * Reset penuh database MySQL ke data demo awal
 */
export async function resetMySQLTables(customSeedData?: any): Promise<{ success: boolean; message: string }> {
  const currentPool = getDbPool();
  if (!currentPool) {
    return { success: false, message: 'Koneksi MySQL tidak tersedia untuk reset.' };
  }

  try {
    const conn = await currentPool.getConnection();
    try {
      await conn.query('SET FOREIGN_KEY_CHECKS = 0');
      for (const table of ALL_TABLE_NAMES) {
        try {
          await conn.query(`TRUNCATE TABLE \`${table}\``);
        } catch {
          await conn.query(`DELETE FROM \`${table}\``);
        }
      }
      await conn.query('SET FOREIGN_KEY_CHECKS = 1');

      // Masukkan seed data awal kembali
      await seedMySQLData(conn, customSeedData);

      return {
        success: true,
        message: 'Database MySQL berhasil di-reset penuh ke data demo awal!',
      };
    } finally {
      conn.release();
    }
  } catch (err: any) {
    return { success: false, message: `Gagal me-reset MySQL: ${err.message}` };
  }
}

/**
 * Ambil semua data lengkap dari MySQL untuk disinkronkan ke client saat pertama kali load
 */
export async function getFullDataFromMySQL(): Promise<any | null> {
  const currentPool = getDbPool();
  if (!currentPool) return null;

  try {
    const conn = await currentPool.getConnection();
    try {
      const [clients]: any = await conn.query('SELECT * FROM clients ORDER BY created_at DESC');
      if (!clients || clients.length === 0) {
        return null; // Belum ada data di MySQL
      }

      const [services]: any = await conn.query('SELECT * FROM client_services ORDER BY expiry_date ASC');
      const [invoices]: any = await conn.query('SELECT * FROM invoices ORDER BY issue_date DESC');
      const [orders]: any = await conn.query('SELECT * FROM orders ORDER BY created_at DESC');
      const [transactions]: any = await conn.query('SELECT * FROM payment_transactions ORDER BY created_at DESC');
      const [coupons]: any = await conn.query('SELECT * FROM coupons');
      const [settingsRows]: any = await conn.query("SELECT value_json FROM settings WHERE key_name = 'app_settings'");
      const [logs]: any = await conn.query('SELECT * FROM activity_logs ORDER BY id DESC LIMIT 50');
      const [notifications]: any = await conn.query('SELECT * FROM notifications ORDER BY id DESC LIMIT 20');

      // Map parsed objects
      const parsedClients = clients.map((c: any) => ({
        id: c.id,
        name: c.name,
        company: c.company || '',
        email: c.email,
        phone: c.phone,
        address: c.address || '',
        status: c.status || 'active',
        segment: c.segment || 'umkm',
        notes: c.notes || '',
        joinedDate: c.joined_date || c.created_at?.toISOString()?.slice(0, 10) || '2025-01-01',
      }));

      const parsedServices = services.map((s: any) => ({
        id: s.id,
        clientId: s.client_id,
        clientName: s.client_name,
        productId: s.product_id,
        packageId: s.package_id,
        productName: s.product_name,
        packageName: s.package_name,
        websiteName: s.website_name,
        domain: s.domain,
        url: s.url,
        billingCycle: s.billing_cycle,
        price: Number(s.price),
        startDate: s.start_date instanceof Date ? s.start_date.toISOString().slice(0, 10) : String(s.start_date),
        expiryDate: s.expiry_date instanceof Date ? s.expiry_date.toISOString().slice(0, 10) : String(s.expiry_date),
        status: s.status,
        autoRenewReminder: Boolean(s.auto_renew_reminder),
        credentials: typeof s.credentials === 'string' ? JSON.parse(s.credentials || '{}') : s.credentials || {},
      }));

      const parsedInvoices = invoices.map((inv: any) => {
        let items = [];
        try {
          items = typeof inv.items_json === 'string' ? JSON.parse(inv.items_json) : inv.items_json || [];
        } catch {
          items = [];
        }
        return {
          id: inv.id,
          invoiceNumber: inv.invoice_number,
          clientId: inv.client_id,
          clientName: inv.client_name,
          serviceId: inv.service_id,
          websiteName: inv.website_name,
          subtotal: Number(inv.subtotal),
          discount: Number(inv.discount),
          couponCode: inv.coupon_code || undefined,
          total: Number(inv.total),
          issueDate: inv.issue_date instanceof Date ? inv.issue_date.toISOString().slice(0, 10) : String(inv.issue_date),
          dueDate: inv.due_date instanceof Date ? inv.due_date.toISOString().slice(0, 10) : String(inv.due_date),
          paidDate: inv.paid_at ? (inv.paid_at instanceof Date ? inv.paid_at.toISOString().slice(0, 10) : String(inv.paid_at)) : undefined,
          status: inv.status,
          paymentMethod: inv.payment_method,
          notes: inv.notes,
          items: items.length > 0 ? items : [{
            id: `item-${inv.id}`,
            description: `Tagihan Layanan ${inv.websiteName || inv.invoice_number}`,
            quantity: 1,
            unitPrice: Number(inv.total),
            total: Number(inv.total),
          }],
        };
      });

      const parsedOrders = orders.map((o: any) => ({
        id: o.id,
        orderNumber: o.order_number,
        clientId: o.client_id,
        clientName: o.client_name,
        productId: o.product_id,
        productName: o.product_name,
        packageId: o.package_id,
        packageName: o.package_name,
        price: Number(o.price),
        websiteName: o.website_name,
        requestedDomain: o.requested_domain,
        billingCycle: o.billing_cycle,
        status: o.status,
        createdAt: o.created_at,
        invoiceId: o.invoice_id,
        notes: o.notes,
      }));

      const parsedTransactions = transactions.map((t: any) => ({
        id: t.id,
        transactionNumber: t.transaction_number,
        invoiceId: t.invoice_id,
        invoiceNumber: t.invoice_number,
        clientId: t.client_id,
        clientName: t.client_name,
        amount: Number(t.amount),
        paymentMethod: t.payment_method,
        channelName: t.channel_name,
        status: t.status,
        gatewayRef: t.gateway_ref,
        createdAt: t.created_at,
        paidAt: t.paid_at,
      }));

      const parsedCoupons = coupons.map((cp: any) => ({
        id: cp.id,
        code: cp.code,
        discountType: cp.discount_type,
        discountValue: Number(cp.discount_value),
        maxDiscount: cp.max_discount ? Number(cp.max_discount) : undefined,
        minSpend: Number(cp.min_spend || 0),
        applicableTo: cp.applicable_to || 'all',
        usageLimit: cp.usage_limit || 50,
        usedCount: cp.used_count || 0,
        isActive: Boolean(cp.is_active),
        validUntil: cp.valid_until instanceof Date ? cp.valid_until.toISOString().slice(0, 10) : String(cp.valid_until),
        description: cp.description,
      }));

      let parsedSettings = null;
      if (settingsRows && settingsRows.length > 0) {
        try {
          parsedSettings = typeof settingsRows[0].value_json === 'string'
            ? JSON.parse(settingsRows[0].value_json)
            : settingsRows[0].value_json;
        } catch {}
      }

      return {
        clients: parsedClients,
        services: parsedServices,
        invoices: parsedInvoices,
        orders: parsedOrders,
        transactions: parsedTransactions,
        coupons: parsedCoupons,
        settings: parsedSettings,
        logs: logs.map((l: any) => ({
          id: l.id,
          actor: l.actor,
          actorName: l.actor_name,
          action: l.action,
          details: l.details,
          category: l.category,
          timestamp: l.timestamp,
        })),
        notifications: notifications.map((n: any) => ({
          id: n.id,
          target: n.target,
          clientId: n.client_id,
          title: n.title,
          message: n.message,
          type: n.type,
          timestamp: n.timestamp,
          read: Boolean(n.is_read),
          linkTab: n.link_tab,
        })),
      };
    } finally {
      conn.release();
    }
  } catch (err: any) {
    console.warn('[MySQL] Failed to get full data:', err.message);
    return null;
  }
}
