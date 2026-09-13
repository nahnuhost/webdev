import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import {
  checkDbConnection,
  initMySQLTables,
  resetMySQLTables,
  getFullDataFromMySQL,
  seedMySQLData,
  getDbPool,
  createAllTables,
} from './server/db';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Accept up to 10mb for full json sync
  app.use(express.json({ limit: '10mb' }));

  // --------------------------------------------------------------------------
  // API Routes (FIRST, before Vite middleware)
  // --------------------------------------------------------------------------

  // 1. Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // 2. MySQL Status Check (Returns counts of all tables)
  app.get('/api/db/status', async (req, res) => {
    const status = await checkDbConnection();
    res.json(status);
  });

  // 3. MySQL Auto-Initialize (Creates ALL 11+ tables + seed if empty)
  app.post('/api/db/init', async (req, res) => {
    const result = await initMySQLTables();
    res.json(result);
  });

  // 4. MySQL Reset Demo Data (Truncate and reseed all tables)
  app.post('/api/db/reset', async (req, res) => {
    const customData = req.body?.data || null;
    const result = await resetMySQLTables(customData);
    res.json(result);
  });

  // 5. Get Full Data from MySQL
  app.get('/api/db/full-data', async (req, res) => {
    const data = await getFullDataFromMySQL();
    if (data) {
      res.json({ success: true, source: 'mysql', data });
    } else {
      res.json({ success: false, source: 'local', message: 'Tidak ada data di MySQL atau belum terhubung.' });
    }
  });

  // 6. Sync entire state from frontend to MySQL
  app.post('/api/db/sync-all', async (req, res) => {
    const pool = getDbPool();
    if (!pool) {
      return res.status(503).json({ success: false, message: 'Database MySQL tidak terhubung.' });
    }
    try {
      const conn = await pool.getConnection();
      try {
        await createAllTables(conn);
        await seedMySQLData(conn, req.body);
        return res.json({ success: true, message: 'Semua data berhasil disinkronkan ke MySQL!' });
      } finally {
        conn.release();
      }
    } catch (err: any) {
      return res.status(500).json({ success: false, message: `Gagal sinkronisasi ke MySQL: ${err.message}` });
    }
  });

  // 7. Download / View Raw SQL Schema
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

  // 8. CRUD: Clients
  app.get('/api/clients', async (req, res) => {
    const pool = getDbPool();
    if (pool) {
      try {
        const [rows] = await pool.query('SELECT * FROM clients ORDER BY created_at DESC');
        return res.json({ success: true, source: 'mysql', data: rows });
      } catch {}
    }
    return res.json({ success: true, source: 'local', data: [] });
  });

  app.post('/api/clients', async (req, res) => {
    const pool = getDbPool();
    const c = req.body;
    if (pool && c?.id) {
      try {
        await pool.query(
          `INSERT INTO clients (id, name, company, email, phone, address, status, segment, notes, avatar, joined_date)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE 
             name=VALUES(name), 
             company=VALUES(company), 
             email=VALUES(email),
             phone=VALUES(phone), 
             address=VALUES(address),
             status=VALUES(status),
             segment=VALUES(segment),
             notes=VALUES(notes)`,
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
        return res.json({ success: true, source: 'mysql', client: c });
      } catch (err: any) {
        console.warn('[API Clients Insert Error]', err.message);
      }
    }
    return res.json({ success: true, source: 'local', client: c });
  });

  app.delete('/api/clients/:id', async (req, res) => {
    const pool = getDbPool();
    const { id } = req.params;
    if (pool && id) {
      try {
        await pool.query('DELETE FROM clients WHERE id = ?', [id]);
        return res.json({ success: true, source: 'mysql', id });
      } catch (err: any) {
        console.warn('[API Client Delete Error]', err.message);
      }
    }
    return res.json({ success: true, source: 'local', id });
  });

  // 9. CRUD: Services
  app.post('/api/services', async (req, res) => {
    const pool = getDbPool();
    const s = req.body;
    if (pool && s?.id) {
      try {
        await pool.query(
          `INSERT INTO client_services (id, client_id, client_name, product_id, package_id, product_name, package_name, website_name, domain, url, billing_cycle, price, start_date, expiry_date, status, credentials, auto_renew_reminder)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE 
             client_name=VALUES(client_name),
             website_name=VALUES(website_name),
             domain=VALUES(domain),
             url=VALUES(url),
             price=VALUES(price),
             expiry_date=VALUES(expiry_date),
             status=VALUES(status),
             credentials=VALUES(credentials)`,
          [
            s.id,
            s.clientId,
            s.clientName,
            s.productId || 'prod-custom',
            s.packageId || 'pkg-custom',
            s.productName || s.websiteName,
            s.packageName || 'Paket Layanan',
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
        return res.json({ success: true, source: 'mysql', service: s });
      } catch (err: any) {
        console.warn('[API Service Insert Error]', err.message);
      }
    }
    return res.json({ success: true, source: 'local', service: s });
  });

  app.delete('/api/services/:id', async (req, res) => {
    const pool = getDbPool();
    const { id } = req.params;
    if (pool && id) {
      try {
        await pool.query('DELETE FROM client_services WHERE id = ?', [id]);
        return res.json({ success: true, source: 'mysql', id });
      } catch (err: any) {
        console.warn('[API Service Delete Error]', err.message);
      }
    }
    return res.json({ success: true, source: 'local', id });
  });

  // 10. CRUD: Invoices
  app.post('/api/invoices', async (req, res) => {
    const pool = getDbPool();
    const inv = req.body;
    if (pool && inv?.id) {
      try {
        await pool.query(
          `INSERT INTO invoices (id, invoice_number, client_id, client_name, service_id, website_name, subtotal, discount, coupon_code, total, issue_date, due_date, status, payment_method, notes, items_json)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE 
             status=VALUES(status), 
             total=VALUES(total), 
             payment_method=VALUES(payment_method),
             paid_at=IF(VALUES(status)='paid', CURRENT_TIMESTAMP, paid_at)`,
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

        if (inv.items && Array.isArray(inv.items)) {
          for (const it of inv.items) {
            await pool.query(
              `INSERT INTO invoice_items (id, invoice_id, description, quantity, unit_price, total)
               VALUES (?, ?, ?, ?, ?, ?)
               ON DUPLICATE KEY UPDATE description=VALUES(description), total=VALUES(total)`,
              [it.id, inv.id, it.description, it.quantity || 1, it.unitPrice, it.total]
            );
          }
        }
        return res.json({ success: true, source: 'mysql', invoice: inv });
      } catch (err: any) {
        console.warn('[API Invoice Insert Error]', err.message);
      }
    }
    return res.json({ success: true, source: 'local', invoice: inv });
  });

  app.delete('/api/invoices/:id', async (req, res) => {
    const pool = getDbPool();
    const { id } = req.params;
    if (pool && id) {
      try {
        await pool.query('DELETE FROM invoices WHERE id = ?', [id]);
        return res.json({ success: true, source: 'mysql', id });
      } catch (err: any) {
        console.warn('[API Invoice Delete Error]', err.message);
      }
    }
    return res.json({ success: true, source: 'local', id });
  });

  // 11. CRUD: Orders
  app.post('/api/orders', async (req, res) => {
    const pool = getDbPool();
    const o = req.body;
    if (pool && o?.id) {
      try {
        await pool.query(
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
        return res.json({ success: true, source: 'mysql', order: o });
      } catch (err: any) {
        console.warn('[API Order Insert Error]', err.message);
      }
    }
    return res.json({ success: true, source: 'local', order: o });
  });

  // 12. CRUD: Transactions
  app.post('/api/transactions', async (req, res) => {
    const pool = getDbPool();
    const tx = req.body;
    if (pool && tx?.id) {
      try {
        await pool.query(
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
        return res.json({ success: true, source: 'mysql', transaction: tx });
      } catch (err: any) {
        console.warn('[API Transaction Insert Error]', err.message);
      }
    }
    return res.json({ success: true, source: 'local', transaction: tx });
  });

  // 13. CRUD: Coupons
  app.post('/api/coupons', async (req, res) => {
    const pool = getDbPool();
    const cp = req.body;
    if (pool && cp?.id) {
      try {
        await pool.query(
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
        return res.json({ success: true, source: 'mysql', coupon: cp });
      } catch (err: any) {
        console.warn('[API Coupon Insert Error]', err.message);
      }
    }
    return res.json({ success: true, source: 'local', coupon: cp });
  });

  app.delete('/api/coupons/:id', async (req, res) => {
    const pool = getDbPool();
    const { id } = req.params;
    if (pool && id) {
      try {
        await pool.query('DELETE FROM coupons WHERE id = ?', [id]);
        return res.json({ success: true, source: 'mysql', id });
      } catch (err: any) {
        console.warn('[API Coupon Delete Error]', err.message);
      }
    }
    return res.json({ success: true, source: 'local', id });
  });

  // 14. Settings
  app.post('/api/settings', async (req, res) => {
    const pool = getDbPool();
    const settings = req.body;
    if (pool && settings) {
      try {
        await pool.query(
          `INSERT INTO settings (key_name, value_json)
           VALUES ('app_settings', ?)
           ON DUPLICATE KEY UPDATE value_json=VALUES(value_json)`,
          [JSON.stringify(settings)]
        );
        return res.json({ success: true, source: 'mysql', settings });
      } catch (err: any) {
        console.warn('[API Settings Update Error]', err.message);
      }
    }
    return res.json({ success: true, source: 'local', settings });
  });

  // 15. Activity Logs
  app.post('/api/logs', async (req, res) => {
    const pool = getDbPool();
    const lg = req.body;
    if (pool && lg?.id) {
      try {
        await pool.query(
          `INSERT INTO activity_logs (id, actor, actor_name, action, details, category, timestamp)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [lg.id, lg.actor, lg.actorName, lg.action, lg.details, lg.category || 'system', lg.timestamp]
        );
        return res.json({ success: true, source: 'mysql', log: lg });
      } catch (err: any) {
        console.warn('[API Log Insert Error]', err.message);
      }
    }
    return res.json({ success: true, source: 'local', log: lg });
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
