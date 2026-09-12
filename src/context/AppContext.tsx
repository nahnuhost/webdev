import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  ActivityLog,
  AppSettings,
  AuthView,
  Client,
  ClientService,
  Coupon,
  Invoice,
  NotificationItem,
  OrderItem,
  PaymentTransaction,
  Product,
  Role,
  ToastMessage,
} from '../types';
import {
  initialActivityLogs,
  initialClients,
  initialCoupons,
  initialInvoices,
  initialNotifications,
  initialOrders,
  initialProducts,
  initialServices,
  initialSettings,
  initialTransactions,
} from '../data/mockData';

interface AppContextType {
  role: Role;
  setRole: (role: Role) => void;
  activeClientId: string;
  setActiveClientId: (id: string) => void;
  activeClient: Client | undefined;

  // Auth & Session
  isAuthenticated: boolean;
  setIsAuthenticated: (val: boolean) => void;
  authView: AuthView | null;
  setAuthView: (view: AuthView | null) => void;
  loginAdmin: (password?: string, pin?: string) => Promise<boolean>;
  loginClient: (emailOrPhone: string, password?: string) => Promise<boolean>;
  registerClientAccount: (formData: {
    name: string;
    company: string;
    email: string;
    phone: string;
    password?: string;
    segment?: 'enterprise' | 'umkm' | 'personal';
    address?: string;
  }) => Promise<Client>;
  forgotPasswordClient: (emailOrPhone: string, newPassword?: string) => Promise<boolean>;
  logout: (targetPortal?: Role) => void;

  // Modern Toast system
  toasts: ToastMessage[];
  showToast: (
    message: string,
    type?: 'success' | 'error' | 'info' | 'warning',
    title?: string,
    duration?: number
  ) => void;
  dismissToast: (id: string) => void;

  runWithLoading: <T>(action: () => Promise<T> | T, message?: string, minDelayMs?: number) => Promise<T>;
  
  clients: Client[];
  products: Product[];
  services: ClientService[];
  invoices: Invoice[];
  orders: OrderItem[];
  transactions: PaymentTransaction[];
  coupons: Coupon[];
  logs: ActivityLog[];
  notifications: NotificationItem[];
  settings: AppSettings;

  // Actions
  addClient: (client: Omit<Client, 'id' | 'joinedDate'>) => Client;
  updateClient: (id: string, updates: Partial<Client>) => void;
  deleteClient: (id: string) => void;

  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;

  addService: (service: Omit<ClientService, 'id'>) => ClientService;
  updateService: (id: string, updates: Partial<ClientService>) => void;
  deleteService: (id: string) => void;
  renewService: (serviceId: string, durationMonths: number) => void;

  createInvoice: (inv: Omit<Invoice, 'id' | 'invoiceNumber'>) => Invoice;
  updateInvoiceStatus: (id: string, status: Invoice['status'], paymentMethod?: string) => void;
  deleteInvoice: (id: string) => void;

  createOrder: (orderData: {
    clientId: string;
    productId: string;
    packageId: string;
    websiteName: string;
    requestedDomain: string;
    couponCode?: string;
    notes?: string;
  }) => { order: OrderItem; invoice: Invoice };
  
  updateOrderStatus: (id: string, status: OrderItem['status']) => void;

  initiatePayment: (
    invoiceId: string,
    method: PaymentTransaction['paymentMethod'],
    channelName: string
  ) => PaymentTransaction;

  simulatePaymentSuccess: (transactionId: string) => void;

  addCoupon: (coupon: Omit<Coupon, 'id'>) => void;
  updateCoupon: (id: string, updates: Partial<Coupon>) => void;
  deleteCoupon: (id: string) => void;
  toggleCoupon: (id: string) => void;
  recordCouponUsage: (code: string) => void;
  applyCouponCode: (
    code: string,
    amount: number,
    contextType?: 'purchase' | 'renewal'
  ) => { valid: boolean; discount: number; coupon?: Coupon; message: string };

  createRenewalInvoice: (params: {
    serviceId: string;
    durationMonths: number;
    couponCode?: string;
    notes?: string;
  }) => { invoice: Invoice; order?: OrderItem; discount: number };

  updateSettings: (newSettings: AppSettings) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  addNotification: (notif: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) => void;
  addLog: (log: Omit<ActivityLog, 'id' | 'timestamp'>) => void;
  resetAllData: () => void;
}

const STORAGE_KEY = 'webdev_billing_v1_state';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<Role>('admin');
  const [activeClientId, setActiveClientId] = useState<string>('cli-1');

  // Load from local storage or fallback to seed
  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_clients`);
    return saved ? JSON.parse(saved) : initialClients;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_products`);
    return saved ? JSON.parse(saved) : initialProducts;
  });

  const [services, setServices] = useState<ClientService[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_services`);
    return saved ? JSON.parse(saved) : initialServices;
  });

  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_invoices`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.length < initialInvoices.length ? initialInvoices : parsed;
      } catch (e) {
        return initialInvoices;
      }
    }
    return initialInvoices;
  });

  const [orders, setOrders] = useState<OrderItem[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_orders`);
    return saved ? JSON.parse(saved) : initialOrders;
  });

  const [transactions, setTransactions] = useState<PaymentTransaction[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_transactions`);
    return saved ? JSON.parse(saved) : initialTransactions;
  });

  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_coupons`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.length < initialCoupons.length) return initialCoupons;
        return parsed.map((c: any) => ({
          ...c,
          discountType: c.discountType || 'percentage',
          discountValue: c.discountValue ?? c.discountPercent ?? 10,
          applicableTo: c.applicableTo || 'all',
          usageLimit: c.usageLimit ?? 50,
          usedCount: c.usedCount ?? 0,
        }));
      } catch (e) {
        return initialCoupons;
      }
    }
    return initialCoupons;
  });

  const [logs, setLogs] = useState<ActivityLog[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_logs`);
    return saved ? JSON.parse(saved) : initialActivityLogs;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_notifications`);
    return saved ? JSON.parse(saved) : initialNotifications;
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_settings`);
    return saved ? JSON.parse(saved) : initialSettings;
  });

  // Auth & Session State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_is_auth`);
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [authView, setAuthView] = useState<AuthView | null>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_is_auth`);
    const isAuth = saved !== null ? JSON.parse(saved) : true;
    return isAuth ? null : 'client_login';
  });

  // Modern Toast System State
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (
    message: string,
    type: 'success' | 'error' | 'info' | 'warning' = 'info',
    title?: string,
    duration = 3800
  ) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newToast: ToastMessage = { id, message, type, title, duration };
    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        dismissToast(id);
      }, duration);
    }
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const runWithLoading = async <T,>(
    action: () => Promise<T> | T,
    _message?: string,
    _minDelayMs?: number
  ): Promise<T> => {
    try {
      return await action();
    } catch (err: any) {
      showToast(err?.message || 'Terjadi kendala saat memproses permintaan', 'error', 'Gagal');
      throw err;
    }
  };

  const loginAdmin = async (password?: string): Promise<boolean> => {
    return runWithLoading(async () => {
      if (password && password !== 'admin123' && password !== 'admin') {
        showToast('Password administrator salah! Gunakan password demo "admin123".', 'error', 'Login Admin Gagal');
        return false;
      }

      setRole('admin');
      setIsAuthenticated(true);
      setAuthView(null);
      localStorage.setItem(`${STORAGE_KEY}_is_auth`, JSON.stringify(true));
      localStorage.setItem(`${STORAGE_KEY}_role`, JSON.stringify('admin'));

      addLog({
        actor: 'admin',
        actorName: 'Administrator (Freelancer)',
        action: 'Login Admin',
        details: 'Admin berhasil masuk ke portal dashboard manajemen',
        category: 'auth',
      });

      showToast('Berhasil masuk sebagai Administrator!', 'success', 'Selamat Datang');
      return true;
    }, 'Memverifikasi kredensial administrator...');
  };

  const loginClient = async (emailOrPhone: string): Promise<boolean> => {
    return runWithLoading(async () => {
      const query = emailOrPhone.trim().toLowerCase();
      const found = clients.find(
        (c) =>
          c.email.toLowerCase() === query ||
          c.phone.replace(/[^0-9]/g, '').includes(query.replace(/[^0-9]/g, '')) ||
          c.name.toLowerCase().includes(query)
      );

      const target = found || clients[0];
      if (!target) {
        showToast('Akun pelanggan tidak ditemukan.', 'error', 'Login Klien Gagal');
        return false;
      }

      setRole('client');
      setActiveClientId(target.id);
      setIsAuthenticated(true);
      setAuthView(null);
      localStorage.setItem(`${STORAGE_KEY}_is_auth`, JSON.stringify(true));
      localStorage.setItem(`${STORAGE_KEY}_role`, JSON.stringify('client'));
      localStorage.setItem(`${STORAGE_KEY}_active_client`, JSON.stringify(target.id));

      addLog({
        actor: 'client',
        actorName: target.name,
        action: 'Login Klien',
        details: `Pelanggan ${target.name} (${target.company}) berhasil login ke portal`,
        category: 'auth',
      });

      showToast(`Selamat datang kembali, ${target.name}!`, 'success', 'Login Klien Berhasil');
      return true;
    }, 'Mengautentikasi akun pelanggan...');
  };

  const registerClientAccount = async (formData: {
    name: string;
    company: string;
    email: string;
    phone: string;
    password?: string;
    segment?: 'enterprise' | 'umkm' | 'personal';
    address?: string;
  }): Promise<Client> => {
    return runWithLoading(async () => {
      const created = addClient({
        name: formData.name,
        company: formData.company || formData.name,
        email: formData.email,
        phone: formData.phone.startsWith('62') ? formData.phone : `62${formData.phone.replace(/^0+/, '')}`,
        address: formData.address || 'Indonesia',
        status: 'active',
        segment: formData.segment || 'umkm',
        notes: 'Pendaftaran mandiri via Portal Registrasi Klien',
      });

      setRole('client');
      setActiveClientId(created.id);
      setIsAuthenticated(true);
      setAuthView(null);
      localStorage.setItem(`${STORAGE_KEY}_is_auth`, JSON.stringify(true));
      localStorage.setItem(`${STORAGE_KEY}_role`, JSON.stringify('client'));
      localStorage.setItem(`${STORAGE_KEY}_active_client`, JSON.stringify(created.id));

      addNotification({
        target: 'admin',
        title: 'Pendaftaran Klien Baru',
        message: `${created.name} (${created.company}) baru saja mendaftar akun pelanggan.`,
        type: 'info',
        linkTab: 'clients',
      });

      addLog({
        actor: 'client',
        actorName: created.name,
        action: 'Registrasi Mandiri',
        details: `Klien baru terdaftar dengan email ${created.email}`,
        category: 'auth',
      });

      showToast(`Pendaftaran berhasil! Akun Anda aktif, selamat datang ${created.name}.`, 'success', 'Akun Berhasil Dibuat');
      return created;
    }, 'Mendaftarkan akun klien baru & menyiapkan dashboard...');
  };

  const forgotPasswordClient = async (emailOrPhone: string): Promise<boolean> => {
    return runWithLoading(async () => {
      showToast(
        'Kata sandi baru berhasil disimpan! Silakan masuk kembali.',
        'success',
        'Reset Sandi Sukses'
      );
      setAuthView('client_login');
      return true;
    }, 'Memproses reset kata sandi pelanggan...');
  };

  const logout = (targetPortal?: Role) => {
    setIsAuthenticated(false);
    localStorage.setItem(`${STORAGE_KEY}_is_auth`, JSON.stringify(false));
    if (targetPortal === 'admin') {
      setAuthView('admin_login');
      setRole('admin');
    } else {
      setAuthView('client_login');
      setRole('client');
    }
    showToast('Anda telah berhasil keluar.', 'info', 'Logout');
  };

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_clients`, JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_products`, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_services`, JSON.stringify(services));
  }, [services]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_invoices`, JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_orders`, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_transactions`, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_coupons`, JSON.stringify(coupons));
  }, [coupons]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_logs`, JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_notifications`, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_settings`, JSON.stringify(settings));
  }, [settings]);

  const activeClient = clients.find((c) => c.id === activeClientId) || clients[0];

  // Helper log & notif
  const addLog = (log: Omit<ActivityLog, 'id' | 'timestamp'>) => {
    const newLog: ActivityLog = {
      ...log,
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };
    setLogs((prev) => [newLog, ...prev]);
  };

  const addNotification = (notif: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) => {
    const newNotif: NotificationItem = {
      ...notif,
      id: `notif-${Date.now()}`,
      timestamp: 'Baru saja',
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  // Clients
  const addClient = (clientData: Omit<Client, 'id' | 'joinedDate'>): Client => {
    const newClient: Client = {
      ...clientData,
      id: `cli-${Date.now()}`,
      joinedDate: new Date().toISOString().substring(0, 10),
    };
    setClients((prev) => [newClient, ...prev]);
    addLog({
      actor: 'admin',
      actorName: settings.freelancerName,
      action: 'Tambah Pelanggan Baru',
      details: `Menambahkan klien baru ${newClient.name} (${newClient.company}).`,
      category: 'auth',
    });
    return newClient;
  };

  const updateClient = (id: string, updates: Partial<Client>) => {
    setClients((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
    // Also update clientName in services, invoices, orders
    if (updates.name) {
      setServices((prev) =>
        prev.map((s) => (s.clientId === id ? { ...s, clientName: updates.name! } : s))
      );
      setInvoices((prev) =>
        prev.map((inv) => (inv.clientId === id ? { ...inv, clientName: updates.name! } : inv))
      );
    }
  };

  const deleteClient = (id: string) => {
    const target = clients.find((c) => c.id === id);
    setClients((prev) => prev.filter((c) => c.id !== id));
    addLog({
      actor: 'admin',
      actorName: settings.freelancerName,
      action: 'Hapus Pelanggan',
      details: `Menghapus data klien ${target?.name || id}.`,
      category: 'auth',
    });
  };

  // Products
  const addProduct = (prodData: Omit<Product, 'id'>) => {
    const newProd: Product = {
      ...prodData,
      id: `prod-${Date.now()}`,
    };
    setProducts((prev) => [newProd, ...prev]);
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  // Services
  const addService = (srvData: Omit<ClientService, 'id'>): ClientService => {
    const newService: ClientService = {
      ...srvData,
      id: `srv-${Date.now()}`,
    };
    setServices((prev) => [newService, ...prev]);
    addLog({
      actor: 'admin',
      actorName: settings.freelancerName,
      action: 'Aktivasi Layanan Website',
      details: `Aktivasi layanan ${newService.websiteName} (${newService.domain}) untuk klien ${newService.clientName}.`,
      category: 'service',
    });
    return newService;
  };

  const updateService = (id: string, updates: Partial<ClientService>) => {
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
  };

  const deleteService = (id: string) => {
    setServices((prev) => prev.filter((s) => s.id !== id));
  };

  const renewService = (serviceId: string, durationMonths: number) => {
    setServices((prev) =>
      prev.map((s) => {
        if (s.id !== serviceId) return s;
        const currentExp = new Date(s.expiryDate);
        const baseDate = currentExp > new Date() ? currentExp : new Date();
        baseDate.setMonth(baseDate.getMonth() + durationMonths);
        const newExpiryDate = baseDate.toISOString().substring(0, 10);
        return {
          ...s,
          expiryDate: newExpiryDate,
          status: 'active',
        };
      })
    );
  };

  // Invoices
  const createInvoice = (invData: Omit<Invoice, 'id' | 'invoiceNumber'>): Invoice => {
    const randomSeq = Math.floor(100 + Math.random() * 900);
    const datePart = new Date().toISOString().slice(0, 7).replace('-', '/');
    const invoiceNumber = `INV/${datePart}/${randomSeq}`;

    const newInvoice: Invoice = {
      ...invData,
      id: `inv-${Date.now()}`,
      invoiceNumber,
    };
    setInvoices((prev) => [newInvoice, ...prev]);

    addNotification({
      target: 'client',
      clientId: newInvoice.clientId,
      title: 'Tagihan Baru Diterbitkan',
      message: `Tagihan #${invoiceNumber} sebesar Rp ${newInvoice.total.toLocaleString('id-ID')} telah dibuat.`,
      type: 'info',
      linkTab: 'invoices',
    });

    addLog({
      actor: 'admin',
      actorName: settings.freelancerName,
      action: 'Buat Tagihan Baru',
      details: `Invoice #${invoiceNumber} sebesar Rp ${newInvoice.total.toLocaleString('id-ID')} dibuat untuk ${newInvoice.clientName}.`,
      category: 'billing',
    });

    return newInvoice;
  };

  const updateInvoiceStatus = (
    id: string,
    status: Invoice['status'],
    paymentMethod?: string
  ) => {
    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id !== id) return inv;
        return {
          ...inv,
          status,
          paidDate: status === 'paid' ? new Date().toISOString().substring(0, 10) : inv.paidDate,
          paymentMethod: paymentMethod || inv.paymentMethod,
        };
      })
    );
  };

  const deleteInvoice = (id: string) => {
    setInvoices((prev) => prev.filter((i) => i.id !== id));
  };

  // Order & Checkout
  const createOrder = ({
    clientId,
    productId,
    packageId,
    websiteName,
    requestedDomain,
    couponCode,
    notes,
  }: {
    clientId: string;
    productId: string;
    packageId: string;
    websiteName: string;
    requestedDomain: string;
    couponCode?: string;
    notes?: string;
  }) => {
    const client = clients.find((c) => c.id === clientId);
    const prod = products.find((p) => p.id === productId);
    const pkg = prod?.packages.find((p) => p.id === packageId);

    const price = pkg?.price || 0;
    let discount = 0;

    if (couponCode) {
      const applied = applyCouponCode(couponCode, price, 'purchase');
      if (applied.valid) {
        discount = applied.discount;
        recordCouponUsage(couponCode);
      }
    }

    const total = Math.max(0, price - discount);

    // Create Invoice first
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 3); // due in 3 days

    const randomSeq = Math.floor(100 + Math.random() * 900);
    const datePart = new Date().toISOString().slice(0, 7).replace('-', '/');
    const invoiceNumber = `INV/${datePart}/${randomSeq}`;

    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber,
      clientId,
      clientName: client?.name || 'Pelanggan',
      websiteName,
      items: [
        {
          id: `item-${Date.now()}`,
          description: `${prod?.name || 'Layanan Website'} - Paket ${pkg?.name || ''} (${requestedDomain})`,
          quantity: 1,
          unitPrice: price,
          total: price,
        },
      ],
      subtotal: price,
      discount,
      couponCode,
      total,
      issueDate: new Date().toISOString().substring(0, 10),
      dueDate: dueDate.toISOString().substring(0, 10),
      status: 'unpaid',
      notes: notes || `Pemesanan layanan ${pkg?.name} untuk domain ${requestedDomain}`,
    };

    const orderNumber = `ORD-${Date.now().toString().slice(-6)}`;
    const newOrder: OrderItem = {
      id: `ord-${Date.now()}`,
      orderNumber,
      clientId,
      clientName: client?.name || 'Pelanggan',
      productId,
      productName: prod?.name || '',
      packageId,
      packageName: pkg?.name || '',
      price: total,
      websiteName,
      requestedDomain,
      billingCycle: pkg?.billingCycle || 'yearly',
      status: 'pending_payment',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      invoiceId: newInvoice.id,
      notes,
    };

    setInvoices((prev) => [newInvoice, ...prev]);
    setOrders((prev) => [newOrder, ...prev]);

    addNotification({
      target: 'admin',
      title: 'Pesanan Baru Masuk!',
      message: `${client?.name} memesan ${prod?.name} (${pkg?.name}) untuk domain ${requestedDomain}.`,
      type: 'info',
      linkTab: 'orders',
    });

    addLog({
      actor: 'client',
      actorName: client?.name || 'Pelanggan',
      action: 'Order Layanan Mandiri',
      details: `Klien membuat pesanan #${orderNumber} (${prod?.name}) total Rp ${total.toLocaleString('id-ID')}.`,
      category: 'order',
    });

    return { order: newOrder, invoice: newInvoice };
  };

  const updateOrderStatus = (id: string, status: OrderItem['status']) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status } : o))
    );
  };

  // Payment
  const initiatePayment = (
    invoiceId: string,
    method: PaymentTransaction['paymentMethod'],
    channelName: string
  ): PaymentTransaction => {
    const inv = invoices.find((i) => i.id === invoiceId);
    const txId = `tx-${Date.now()}`;
    const txNumber = `PAY-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`;

    const newTx: PaymentTransaction = {
      id: txId,
      transactionNumber: txNumber,
      invoiceId,
      invoiceNumber: inv?.invoiceNumber || '',
      clientId: inv?.clientId || activeClientId,
      clientName: inv?.clientName || 'Pelanggan',
      amount: inv?.total || 0,
      paymentMethod: method,
      channelName,
      status: 'pending',
      gatewayRef: `${settings.paymentGateway.provider.toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };

    setTransactions((prev) => [newTx, ...prev]);
    return newTx;
  };

  const simulatePaymentSuccess = (transactionId: string) => {
    const tx = transactions.find((t) => t.id === transactionId);
    if (!tx) return;

    const paidAt = new Date().toISOString().replace('T', ' ').substring(0, 16);

    // 1. Update Transaction to success
    setTransactions((prev) =>
      prev.map((t) => (t.id === transactionId ? { ...t, status: 'success', paidAt } : t))
    );

    // 2. Update Invoice to paid
    updateInvoiceStatus(tx.invoiceId, 'paid', tx.channelName);

    // 3. Find related order and update to active / processing
    const relatedOrder = orders.find((o) => o.invoiceId === tx.invoiceId);
    if (relatedOrder) {
      updateOrderStatus(relatedOrder.id, 'active');

      // Check if service already exists or create new service
      const existingService = services.find((s) => s.domain.toLowerCase() === relatedOrder.requestedDomain.toLowerCase());
      if (existingService) {
        // Renew service by 12 months (or 1 month if monthly)
        const duration = existingService.billingCycle === 'monthly' ? 1 : 12;
        renewService(existingService.id, duration);
      } else {
        // Automatically provision new service
        const expDate = new Date();
        if (relatedOrder.billingCycle === 'monthly') {
          expDate.setMonth(expDate.getMonth() + 1);
        } else {
          expDate.setFullYear(expDate.getFullYear() + 1);
        }

        const domainClean = relatedOrder.requestedDomain.replace(/https?:\/\//, '').replace(/\/$/, '');
        addService({
          clientId: relatedOrder.clientId,
          clientName: relatedOrder.clientName,
          productId: relatedOrder.productId,
          packageId: relatedOrder.packageId,
          productName: relatedOrder.productName,
          packageName: relatedOrder.packageName,
          websiteName: relatedOrder.websiteName,
          domain: domainClean,
          url: `https://${domainClean}`,
          billingCycle: relatedOrder.billingCycle,
          price: relatedOrder.price,
          startDate: new Date().toISOString().substring(0, 10),
          expiryDate: expDate.toISOString().substring(0, 10),
          status: 'active',
          autoRenewReminder: true,
          credentials: {
            cpanelUrl: `https://cpanel.${domainClean}:2083`,
            cpanelUser: domainClean.split('.')[0].slice(0, 8),
            cpanelPassword: `SecPass#${Math.floor(1000 + Math.random() * 9000)}!`,
            cmsAdminUrl: `https://${domainClean}/wp-admin`,
            cmsUser: `admin_${domainClean.split('.')[0].slice(0, 6)}`,
            cmsPassword: `WPpass*${Math.floor(1000 + Math.random() * 9000)}`,
            emailAddress: `halo@${domainClean}`,
            emailPassword: `Mail#${Math.floor(1000 + Math.random() * 9000)}`,
            nameservers: ['ns1.naufalcloud.id', 'ns2.naufalcloud.id'],
            notes: 'Aktivasi otomatis setelah pembayaran gateway instan dikonfirmasi.',
          },
        });
      }
    } else {
      // If invoice has serviceId directly (perpanjangan invoice)
      const inv = invoices.find((i) => i.id === tx.invoiceId);
      if (inv?.serviceId) {
        renewService(inv.serviceId, 12);
      }
    }

    // 4. Notifications & Logs
    addNotification({
      target: 'admin',
      title: 'Pembayaran Diterima Otomatis! 💰',
      message: `Invoice #${tx.invoiceNumber} sebesar Rp ${tx.amount.toLocaleString('id-ID')} telah dibayar via ${tx.channelName}.`,
      type: 'success',
      linkTab: 'payments',
    });

    addNotification({
      target: 'client',
      clientId: tx.clientId,
      title: 'Pembayaran Berhasil! ✅',
      message: `Terima kasih! Pembayaran invoice #${tx.invoiceNumber} berhasil. Layanan website Anda telah aktif/diperpanjang.`,
      type: 'success',
      linkTab: 'services',
    });

    addLog({
      actor: 'system',
      actorName: `${settings.paymentGateway.provider.toUpperCase()} Gateway Webhook`,
      action: 'Pembayaran Gateway Berhasil',
      details: `Transaksi ${tx.transactionNumber} untuk Invoice ${tx.invoiceNumber} sebesar Rp ${tx.amount.toLocaleString('id-ID')} lunas.`,
      category: 'payment',
    });
  };

  // Coupons
  const addCoupon = (couponData: Omit<Coupon, 'id'>) => {
    const newCoupon: Coupon = {
      ...couponData,
      id: `cp-${Date.now()}`,
      usedCount: couponData.usedCount || 0,
      usageLimit: couponData.usageLimit || 0,
      discountType: couponData.discountType || 'percentage',
      discountValue: couponData.discountValue || couponData.discountPercent || 0,
      applicableTo: couponData.applicableTo || 'all',
    };
    setCoupons((prev) => [newCoupon, ...prev]);
    addLog({
      actor: 'admin',
      actorName: settings.freelancerName,
      action: 'Tambah Kupon Promo',
      details: `Membuat kupon diskon ${newCoupon.code} (${newCoupon.discountType === 'percentage' ? `${newCoupon.discountValue}%` : `Rp ${newCoupon.discountValue.toLocaleString('id-ID')}`}). Target: ${newCoupon.applicableTo}.`,
      category: 'billing',
    });
  };

  const updateCoupon = (id: string, updates: Partial<Coupon>) => {
    setCoupons((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
  };

  const deleteCoupon = (id: string) => {
    const cp = coupons.find((c) => c.id === id);
    setCoupons((prev) => prev.filter((c) => c.id !== id));
    if (cp) {
      addLog({
        actor: 'admin',
        actorName: settings.freelancerName,
        action: 'Hapus Kupon Promo',
        details: `Menghapus kupon diskon ${cp.code}.`,
        category: 'billing',
      });
    }
  };

  const toggleCoupon = (id: string) => {
    setCoupons((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isActive: !c.isActive } : c))
    );
  };

  const recordCouponUsage = (code: string) => {
    if (!code) return;
    setCoupons((prev) =>
      prev.map((c) => {
        if (c.code.toUpperCase() === code.trim().toUpperCase()) {
          return { ...c, usedCount: (c.usedCount || 0) + 1 };
        }
        return c;
      })
    );
  };

  const applyCouponCode = (
    code: string,
    amount: number,
    contextType?: 'purchase' | 'renewal'
  ) => {
    if (!code || !code.trim()) {
      return { valid: false, discount: 0, message: 'Silakan masukkan kode kupon.' };
    }
    const cp = coupons.find(
      (c) => c.code.toUpperCase() === code.trim().toUpperCase() && c.isActive
    );
    if (!cp) {
      return { valid: false, discount: 0, message: 'Kupon tidak valid atau telah kedaluwarsa.' };
    }

    // Expiry verification
    const todayStr = new Date().toISOString().substring(0, 10);
    if (cp.validUntil && cp.validUntil < todayStr) {
      return {
        valid: false,
        discount: 0,
        coupon: cp,
        message: `Kupon telah kedaluwarsa sejak tanggal ${cp.validUntil}.`,
      };
    }

    // Usage limit verification
    if (cp.usageLimit && cp.usageLimit > 0 && (cp.usedCount || 0) >= cp.usageLimit) {
      return {
        valid: false,
        discount: 0,
        coupon: cp,
        message: 'Batas kuota penukaran kupon ini sudah habis.',
      };
    }

    // Context applicability verification
    if (contextType && cp.applicableTo && cp.applicableTo !== 'all') {
      if (cp.applicableTo !== contextType) {
        return {
          valid: false,
          discount: 0,
          coupon: cp,
          message:
            cp.applicableTo === 'renewal'
              ? 'Kupon ini khusus digunakan untuk perpanjangan (renewal) website.'
              : 'Kupon ini khusus digunakan untuk pembelian paket website baru.',
        };
      }
    }

    // Minimum spend verification
    if (amount < (cp.minSpend || 0)) {
      return {
        valid: false,
        discount: 0,
        coupon: cp,
        message: `Minimal transaksi untuk kupon ini adalah Rp ${(cp.minSpend || 0).toLocaleString('id-ID')}.`,
      };
    }

    // Discount computation: Percentage or Fixed
    let calculated = 0;
    if (cp.discountType === 'fixed') {
      calculated = Math.min(cp.discountValue || 0, amount);
    } else {
      const percent = cp.discountValue ?? cp.discountPercent ?? 0;
      calculated = (amount * percent) / 100;
      if (cp.maxDiscount && cp.maxDiscount > 0 && calculated > cp.maxDiscount) {
        calculated = cp.maxDiscount;
      }
    }

    const rounded = Math.round(calculated);
    const label =
      cp.discountType === 'fixed'
        ? `Rp ${rounded.toLocaleString('id-ID')}`
        : `${cp.discountValue || cp.discountPercent}% (Hemat Rp ${rounded.toLocaleString('id-ID')})`;

    return {
      valid: true,
      discount: rounded,
      coupon: cp,
      message: `Kupon ${cp.code} berhasil dipasang! Potongan diskon ${label}.`,
    };
  };

  // Renewal Checkout & Invoice Generator
  const createRenewalInvoice = ({
    serviceId,
    durationMonths,
    couponCode,
    notes,
  }: {
    serviceId: string;
    durationMonths: number;
    couponCode?: string;
    notes?: string;
  }) => {
    const service = services.find((s) => s.id === serviceId);
    if (!service) throw new Error('Layanan tidak ditemukan');
    const client = clients.find((c) => c.id === service.clientId);

    // Compute base price based on duration
    let basePrice = service.price;
    if (service.billingCycle === 'monthly') {
      basePrice = service.price * durationMonths;
    } else if (service.billingCycle === 'yearly') {
      if (durationMonths === 24) {
        basePrice = Math.round(service.price * 1.85); // 2-year package discount
      } else if (durationMonths === 6) {
        basePrice = Math.round(service.price * 0.55);
      } else {
        basePrice = service.price;
      }
    }

    let discount = 0;
    if (couponCode) {
      const applied = applyCouponCode(couponCode, basePrice, 'renewal');
      if (applied.valid) {
        discount = applied.discount;
        recordCouponUsage(couponCode);
      }
    }

    const total = Math.max(0, basePrice - discount);

    const randomSeq = Math.floor(100 + Math.random() * 900);
    const datePart = new Date().toISOString().slice(0, 7).replace('-', '/');
    const invoiceNumber = `INV/${datePart}/${randomSeq}`;

    const durationLabel =
      durationMonths >= 12
        ? `${durationMonths / 12} Tahun`
        : `${durationMonths} Bulan`;

    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber,
      clientId: service.clientId,
      clientName: client?.name || service.clientName,
      serviceId: service.id,
      websiteName: service.websiteName,
      items: [
        {
          id: `item-renew-${Date.now()}`,
          description: `Perpanjangan Domain & Hosting ${service.domain} (${durationLabel})`,
          quantity: 1,
          unitPrice: basePrice,
          total: basePrice,
        },
      ],
      subtotal: basePrice,
      discount,
      couponCode: discount > 0 ? couponCode : undefined,
      total,
      issueDate: new Date().toISOString().substring(0, 10),
      dueDate:
        service.expiryDate < new Date().toISOString().substring(0, 10)
          ? new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString().substring(0, 10)
          : service.expiryDate,
      status: 'unpaid',
      notes: notes || `Perpanjangan mandiri layanan website ${service.domain} oleh pelanggan (${durationLabel}).`,
    };

    const orderNumber = `ORD-RNW-${Date.now().toString().slice(-5)}`;
    const newOrder: OrderItem = {
      id: `ord-${Date.now()}`,
      orderNumber,
      clientId: service.clientId,
      clientName: client?.name || service.clientName,
      productId: service.productId || 'prod-renewal',
      productName: `Perpanjangan ${service.productName || service.websiteName}`,
      packageId: service.packageId || 'pkg-renewal',
      packageName: `Renewal ${durationLabel}`,
      price: total,
      websiteName: service.websiteName,
      requestedDomain: service.domain,
      billingCycle: durationMonths >= 12 ? 'yearly' : 'monthly',
      status: 'pending_payment',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      invoiceId: newInvoice.id,
      notes: `Perpanjangan website ${service.domain} (${durationLabel})`,
    };

    setInvoices((prev) => [newInvoice, ...prev]);
    setOrders((prev) => [newOrder, ...prev]);

    addNotification({
      target: 'admin',
      title: 'Perpanjangan Website Baru!',
      message: `${service.clientName} mengajukan perpanjangan untuk ${service.domain} senilai Rp ${total.toLocaleString('id-ID')}.`,
      type: 'info',
      linkTab: 'invoices',
    });

    addLog({
      actor: 'client',
      actorName: service.clientName,
      action: 'Perpanjangan Mandiri Layanan',
      details: `Klien membuat tagihan perpanjangan #${invoiceNumber} untuk ${service.domain}. Kupon: ${couponCode || '-'}, Diskon: Rp ${discount.toLocaleString('id-ID')}, Total: Rp ${total.toLocaleString('id-ID')}.`,
      category: 'billing',
    });

    return { invoice: newInvoice, order: newOrder, discount };
  };

  const updateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    addLog({
      actor: 'admin',
      actorName: settings.freelancerName,
      action: 'Update Pengaturan',
      details: 'Memperbarui konfigurasi sistem, payment gateway, atau template WhatsApp.',
      category: 'billing',
    });
  };

  const resetAllData = () => {
    setClients(initialClients);
    setProducts(initialProducts);
    setServices(initialServices);
    setInvoices(initialInvoices);
    setOrders(initialOrders);
    setTransactions(initialTransactions);
    setCoupons(initialCoupons);
    setLogs(initialActivityLogs);
    setNotifications(initialNotifications);
    setSettings(initialSettings);
    localStorage.clear();
  };

  return (
    <AppContext.Provider
      value={{
        role,
        setRole,
        activeClientId,
        setActiveClientId,
        activeClient,

        // Auth & Session
        isAuthenticated,
        setIsAuthenticated,
        authView,
        setAuthView,
        loginAdmin,
        loginClient,
        registerClientAccount,
        forgotPasswordClient,
        logout,

        // Modern Toast
        toasts,
        showToast,
        dismissToast,

        runWithLoading,

        clients,
        products,
        services,
        invoices,
        orders,
        transactions,
        coupons,
        logs,
        notifications,
        settings,

        addClient,
        updateClient,
        deleteClient,

        addProduct,
        updateProduct,
        deleteProduct,

        addService,
        updateService,
        deleteService,
        renewService,

        createInvoice,
        updateInvoiceStatus,
        deleteInvoice,

        createOrder,
        updateOrderStatus,

        initiatePayment,
        simulatePaymentSuccess,

        addCoupon,
        updateCoupon,
        deleteCoupon,
        toggleCoupon,
        recordCouponUsage,
        applyCouponCode,
        createRenewalInvoice,

        updateSettings,
        markNotificationRead,
        markAllNotificationsRead,
        addNotification,
        addLog,
        resetAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
