import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { checkDbConnection, initMySQLTables, getDbPool } from './server/db';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --------------------------------------------------------------------------
  // API Routes (FIRST, before Vite middleware)
  // --------------------------------------------------------------------------

  // 1. Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // 2. MySQL Status Check
  app.get('/api/db/status', async (req, res) => {
    const status = await checkDbConnection();
    res.json(status);
  });

  // 3. MySQL Auto-Initialize Tables
  app.post('/api/db/init', async (req, res) => {
    const result = await initMySQLTables();
    res.json(result);
  });

  // 4. Download / View Raw SQL Schema
  app.get('/api/sql-schema', (req, res) => {
    const sqlPath = path.join(process.cwd(), 'database.sql');
    if (fs.existsSync(sqlPath)) {
      const sqlContent = fs.readFileSync(sqlPath, 'utf-8');
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.send(sqlContent);
    } else {
      res.status(404).send('-- database.sql not found');
    }
  });

  // 5. REST API: Clients (with MySQL support & fallback)
  app.get('/api/clients', async (req, res) => {
    const pool = getDbPool();
    if (pool) {
      try {
        const [rows] = await pool.query('SELECT * FROM clients ORDER BY created_at DESC');
        return res.json({ source: 'mysql', data: rows });
      } catch (err: any) {
        // Fallback or table missing
      }
    }
    return res.json({ source: 'client_store', message: 'Menggunakan penyimpanan aktif client.' });
  });

  app.post('/api/clients', async (req, res) => {
    const pool = getDbPool();
    const client = req.body;
    if (pool && client?.id) {
      try {
        await pool.query(
          `INSERT INTO clients (id, name, company, email, phone, address, notes, avatar)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE name=VALUES(name), company=VALUES(company), phone=VALUES(phone)`,
          [
            client.id,
            client.name,
            client.company || null,
            client.email,
            client.phone,
            client.address || null,
            client.notes || null,
            client.avatar || null,
          ]
        );
        return res.json({ success: true, source: 'mysql', client });
      } catch (err: any) {
        console.warn('MySQL Insert error:', err.message);
      }
    }
    return res.json({ success: true, source: 'local', client });
  });

  // 6. REST API: Invoices
  app.get('/api/invoices', async (req, res) => {
    const pool = getDbPool();
    if (pool) {
      try {
        const [rows] = await pool.query('SELECT * FROM invoices ORDER BY created_at DESC');
        return res.json({ source: 'mysql', data: rows });
      } catch (err: any) {
        // Fallback
      }
    }
    return res.json({ source: 'client_store', message: 'Menggunakan data aktif.' });
  });

  // 7. REST API: Services
  app.get('/api/services', async (req, res) => {
    const pool = getDbPool();
    if (pool) {
      try {
        const [rows] = await pool.query('SELECT * FROM client_services ORDER BY expiry_date ASC');
        return res.json({ source: 'mysql', data: rows });
      } catch (err: any) {
        // Fallback
      }
    }
    return res.json({ source: 'client_store', message: 'Menggunakan data aktif.' });
  });

  // --------------------------------------------------------------------------
  // Vite Middleware (Development) & Static Serving (Production)
  // --------------------------------------------------------------------------
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] WebDev Hub Full-Stack running on http://localhost:${PORT}`);
  });
}

startServer();
