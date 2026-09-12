import mysql from 'mysql2/promise';

export interface DbStatus {
  connected: boolean;
  message: string;
  config: {
    host: string;
    port: number;
    user: string;
    database: string;
  };
  tables?: {
    clients: number;
    invoices: number;
    services: number;
    products: number;
  };
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
let isConnected = false;
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
      isConnected = true;

      // Query table counts if available
      let clientsCount = 0;
      let invoicesCount = 0;
      let servicesCount = 0;
      let productsCount = 0;

      try {
        const [cRows]: any = await connection.query('SELECT COUNT(*) as count FROM clients');
        clientsCount = cRows[0]?.count || 0;
        const [iRows]: any = await connection.query('SELECT COUNT(*) as count FROM invoices');
        invoicesCount = iRows[0]?.count || 0;
        const [sRows]: any = await connection.query('SELECT COUNT(*) as count FROM client_services');
        servicesCount = sRows[0]?.count || 0;
        const [pRows]: any = await connection.query('SELECT COUNT(*) as count FROM products');
        productsCount = pRows[0]?.count || 0;
      } catch {
        // Tables might not be initialized yet
      }

      return {
        connected: true,
        message: 'Koneksi MySQL aktif dan terhubung dengan sukses.',
        config: {
          host: dbConfig.host,
          port: dbConfig.port,
          user: dbConfig.user,
          database: dbConfig.database,
        },
        tables: {
          clients: clientsCount,
          invoices: invoicesCount,
          services: servicesCount,
          products: productsCount,
        },
      };
    } finally {
      connection.release();
    }
  } catch (err: any) {
    isConnected = false;
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

export async function initMySQLTables(): Promise<{ success: boolean; message: string }> {
  const currentPool = getDbPool();
  if (!currentPool) {
    return { success: false, message: 'Koneksi MySQL tidak tersedia.' };
  }

  try {
    const conn = await currentPool.getConnection();
    try {
      // 1. Clients
      await conn.query(`
        CREATE TABLE IF NOT EXISTS \`clients\` (
          \`id\` VARCHAR(50) NOT NULL,
          \`name\` VARCHAR(150) NOT NULL,
          \`company\` VARCHAR(150) DEFAULT NULL,
          \`email\` VARCHAR(150) NOT NULL UNIQUE,
          \`phone\` VARCHAR(30) NOT NULL,
          \`password_hash\` VARCHAR(255) DEFAULT NULL,
          \`address\` TEXT DEFAULT NULL,
          \`notes\` TEXT DEFAULT NULL,
          \`avatar\` VARCHAR(255) DEFAULT NULL,
          \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (\`id\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);

      // 2. Invoices
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
          \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (\`id\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);

      // 3. Client Services
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
          PRIMARY KEY (\`id\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);

      // 4. Products & Packages
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
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);

      return {
        success: true,
        message: 'Tabel-tabel database MySQL berhasil disiapkan secara otomatis!',
      };
    } finally {
      conn.release();
    }
  } catch (err: any) {
    return { success: false, message: `Gagal membuat tabel: ${err.message}` };
  }
}
