import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { AppSettings, Coupon, DiscountType, CouponApplicableTo } from '../../types';
import { formatRupiah, formatDateIndo } from '../../utils/formatters';
import {
  Settings,
  CreditCard,
  Tag,
  MessageSquare,
  Building,
  Save,
  Plus,
  Trash2,
  Check,
  ShieldCheck,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Percent,
  Coins,
  Calendar,
  Layers,
  ShoppingBag,
  RefreshCw,
  Info,
  Calculator,
  Database,
  Server,
  Download,
  Copy,
  Terminal,
  CheckCircle,
  AlertCircle,
  FolderDown,
} from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const { settings, updateSettings, coupons, addCoupon, deleteCoupon, toggleCoupon, applyCouponCode, showToast } = useApp();

  const [formSettings, setFormSettings] = useState<AppSettings>(settings);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // MySQL & Full-stack Database Status State
  const [dbStatus, setDbStatus] = useState<{
    connected: boolean;
    message: string;
    config?: { host: string; port: number; user: string; database: string };
    tables?: { clients: number; invoices: number; services: number; products: number };
  } | null>(null);
  const [checkingDb, setCheckingDb] = useState(false);
  const [initDbLoading, setInitDbLoading] = useState(false);
  const [showLocalGuide, setShowLocalGuide] = useState(false);

  const checkDb = async () => {
    setCheckingDb(true);
    try {
      const res = await fetch('/api/db/status');
      const data = await res.json();
      setDbStatus(data);
    } catch {
      setDbStatus({
        connected: false,
        message: 'Endpoint server backend lokal sedang memuat.',
      });
    } finally {
      setCheckingDb(false);
    }
  };

  useEffect(() => {
    checkDb();
  }, []);

  const handleInitDb = async () => {
    setInitDbLoading(true);
    try {
      const res = await fetch('/api/db/init', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        showToast(data.message, 'success', 'MySQL Siap!');
        checkDb();
      } else {
        showToast(data.message, 'warning', 'Perhatian MySQL');
      }
    } catch {
      showToast('Gagal memanggil API inisialisasi tabel.', 'error');
    } finally {
      setInitDbLoading(false);
    }
  };

  const handleDownloadSql = () => {
    window.open('/api/sql-schema', '_blank');
    showToast('File database.sql berhasil diunduh / dibuka.', 'info');
  };

  // New Coupon Form with percentage and fixed options
  const [showNewCoupon, setShowNewCoupon] = useState(false);
  const [couponForm, setCouponForm] = useState<{
    code: string;
    discountType: DiscountType;
    discountValue: number;
    maxDiscount: number;
    validUntil: string;
    minSpend: number;
    applicableTo: CouponApplicableTo;
    usageLimit: number;
    description: string;
    isActive: boolean;
  }>({
    code: '',
    discountType: 'percentage',
    discountValue: 15,
    maxDiscount: 300000,
    validUntil: new Date(Date.now() + 90 * 24 * 3600 * 1000).toISOString().substring(0, 10),
    minSpend: 1500000,
    applicableTo: 'all',
    usageLimit: 50,
    description: '',
    isActive: true,
  });

  // Simulator state for testing coupons
  const [testAmount, setTestAmount] = useState<number>(2500000);
  const [testContext, setTestContext] = useState<'purchase' | 'renewal'>('purchase');
  const [testResult, setTestResult] = useState<{ valid: boolean; discount: number; message: string } | null>(null);
  const [selectedTestCoupon, setSelectedTestCoupon] = useState<string>('');

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formSettings);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleAddCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponForm.code) return;

    addCoupon({
      code: couponForm.code.trim().toUpperCase(),
      discountType: couponForm.discountType,
      discountValue: Number(couponForm.discountValue),
      discountPercent: couponForm.discountType === 'percentage' ? Number(couponForm.discountValue) : 0,
      maxDiscount: couponForm.discountType === 'percentage' ? Number(couponForm.maxDiscount) : Number(couponForm.discountValue),
      validUntil: couponForm.validUntil,
      minSpend: Number(couponForm.minSpend),
      applicableTo: couponForm.applicableTo,
      usageLimit: Number(couponForm.usageLimit) || 0,
      usedCount: 0,
      isActive: couponForm.isActive,
      description: couponForm.description.trim() || undefined,
    });

    setCouponForm({
      code: '',
      discountType: 'percentage',
      discountValue: 15,
      maxDiscount: 300000,
      validUntil: new Date(Date.now() + 90 * 24 * 3600 * 1000).toISOString().substring(0, 10),
      minSpend: 1500000,
      applicableTo: 'all',
      usageLimit: 50,
      description: '',
      isActive: true,
    });
    setShowNewCoupon(false);
  };

  const handleRunSimulator = (code: string) => {
    setSelectedTestCoupon(code);
    const res = applyCouponCode(code, testAmount, testContext);
    setTestResult(res);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Pengaturan Sistem & Integrasi
          </h2>
          <p className="text-xs text-slate-500">
            Konfigurasi profil freelancer, rekening bank, gateway pembayaran, kupon promosi, dan template WhatsApp.
          </p>
        </div>
        {savedSuccess && (
          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl animate-fade-in">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Pengaturan Berhasil Disimpan!</span>
          </span>
        )}
      </div>

      {/* MySQL Full-Stack 1 Project Card */}
      <div className="bg-gradient-to-br from-white via-indigo-50/20 to-slate-50 rounded-2xl border border-indigo-100/90 p-5 sm:p-6 shadow-xs space-y-4 text-xs">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-indigo-100/60 pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-xs">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-900">Database MySQL (Arsitektur 1 Project)</span>
                <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-bold rounded-full">
                  Full-Stack Express + Vite
                </span>
              </div>
              <p className="text-slate-500 text-[11px] mt-0.5">
                Backend API dan frontend dikemas dalam 1 project tunggal tanpa perlu memisahkan repositori.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadSql}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 font-semibold border border-slate-200 rounded-xl shadow-2xs transition-colors cursor-pointer"
              title="Unduh file skema SQL"
            >
              <FolderDown className="w-3.5 h-3.5 text-indigo-600" />
              <span>Download database.sql</span>
            </button>

            <button
              type="button"
              onClick={checkDb}
              disabled={checkingDb}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded-xl transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${checkingDb ? 'animate-spin' : ''}`} />
              <span>{checkingDb ? 'Mengecek...' : 'Cek Status'}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowLocalGuide(!showLocalGuide)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors cursor-pointer"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>{showLocalGuide ? 'Tutup Panduan' : 'Panduan Lokal'}</span>
            </button>
          </div>
        </div>

        {/* Status Display */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2 p-3.5 bg-white rounded-xl border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                <Server className="w-4 h-4 text-indigo-500" />
                Status Koneksi Database
              </span>
              {dbStatus?.connected ? (
                <span className="flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-lg text-[11px]">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  MySQL Terhubung
                </span>
              ) : (
                <span className="flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 font-semibold rounded-lg text-[11px]">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                  Mode Fallback Aktif (Siap Dihubungkan ke MySQL Lokal)
                </span>
              )}
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              {dbStatus?.message || 'Memeriksa status koneksi database MySQL...'}
            </p>

            {dbStatus?.connected && dbStatus.config && (
              <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-3 font-mono text-[10px] text-slate-500">
                <span>Host: <b className="text-slate-700">{dbStatus.config.host}:{dbStatus.config.port}</b></span>
                <span>User: <b className="text-slate-700">{dbStatus.config.user}</b></span>
                <span>Database: <b className="text-slate-700">{dbStatus.config.database}</b></span>
              </div>
            )}
          </div>

          <div className="p-3.5 bg-white rounded-xl border border-slate-200/80 flex flex-col justify-between">
            <div>
              <span className="font-semibold text-slate-700 block mb-1">Aksi Cepat Database</span>
              <p className="text-[11px] text-slate-500 mb-2">
                Buat struktur tabel otomatis langsung dari aplikasi saat MySQL aktif.
              </p>
            </div>
            <button
              type="button"
              onClick={handleInitDb}
              disabled={initDbLoading}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              <Database className="w-3.5 h-3.5" />
              <span>{initDbLoading ? 'Menginisialisasi...' : 'Inisialisasi Tabel Otomatis'}</span>
            </button>
          </div>
        </div>

        {/* Collapsible Local Setup Guide */}
        {showLocalGuide && (
          <div className="p-4 bg-slate-900 text-slate-200 rounded-xl space-y-3 font-mono text-[11px]">
            <div className="flex items-center justify-between text-slate-300 font-bold border-b border-slate-800 pb-2">
              <span className="flex items-center gap-1.5 font-sans text-xs">
                <Terminal className="w-4 h-4 text-emerald-400" />
                Cara Menjalankan 1 Project ini di Komputer Lokal dengan MySQL:
              </span>
              <span className="text-[10px] text-slate-400 font-sans">XAMPP / Laragon / Native MySQL</span>
            </div>

            <ol className="list-decimal list-inside space-y-2 leading-relaxed text-slate-300 font-sans">
              <li>
                <b>Nyalakan MySQL:</b> Buka kontrol panel XAMPP atau Laragon Anda, lalu klik <b>Start MySQL</b>.
              </li>
              <li>
                <b>Buat Database atau Impor:</b> Buka phpMyAdmin (<code>http://localhost/phpmyadmin</code>), buat database bernama <code className="text-amber-300 bg-slate-800 px-1 py-0.5 rounded">billing_nahnuhost</code>, lalu klik menu <b>Import</b> dan pilih file <code className="text-amber-300 bg-slate-800 px-1 py-0.5 rounded">database.sql</code> yang sudah ada di folder proyek ini.
              </li>
              <li>
                <b>Sesuaikan file .env:</b> Di folder proyek, buat/sesuaikan file <code className="text-amber-300 bg-slate-800 px-1 py-0.5 rounded">.env</code>:
                <pre className="mt-1 p-2 bg-slate-950 rounded-lg text-emerald-400 text-[10px] font-mono">
{`DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=billing_nahnuhost`}
                </pre>
              </li>
              <li>
                <b>Jalankan 1 Perintah:</b> Di terminal Anda, cukup ketik:
                <pre className="mt-1 p-2 bg-slate-950 rounded-lg text-emerald-400 text-[10px] font-mono">
{`npm install
npm run dev`}
                </pre>
                Server Express API & frontend React otomatis berjalan bersamaan di <code className="text-indigo-300">http://localhost:3000</code>.
              </li>
            </ol>
          </div>
        )}
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6 text-xs">
        {/* Profil Freelancer & Studio */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm border-b border-slate-100 pb-3">
            <Building className="w-4 h-4 text-indigo-600" />
            <span>Profil Usaha Web Developer</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Nama Brand / Studio *</label>
              <input
                type="text"
                required
                value={formSettings.brandName}
                onChange={(e) => setFormSettings({ ...formSettings, brandName: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-indigo-500"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Nama Pemilik / Freelancer *</label>
              <input
                type="text"
                required
                value={formSettings.freelancerName}
                onChange={(e) =>
                  setFormSettings({ ...formSettings, freelancerName: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Slogan / Tagline Layanan</label>
            <input
              type="text"
              value={formSettings.tagline}
              onChange={(e) => setFormSettings({ ...formSettings, tagline: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Email Resmi *</label>
              <input
                type="email"
                required
                value={formSettings.email}
                onChange={(e) => setFormSettings({ ...formSettings, email: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-indigo-500"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Nomor WhatsApp (628..) *</label>
              <input
                type="text"
                required
                value={formSettings.phone}
                onChange={(e) => setFormSettings({ ...formSettings, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-indigo-500 font-mono"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Alamat Kantor / Domisili</label>
              <input
                type="text"
                value={formSettings.address}
                onChange={(e) => setFormSettings({ ...formSettings, address: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Payment Gateway Config */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              <span>Integrasi Payment Gateway Otomatis</span>
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full">
              Status: Terhubung & Aktif
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Penyedia Gateway</label>
              <select
                value={formSettings.paymentGateway.provider}
                onChange={(e) =>
                  setFormSettings({
                    ...formSettings,
                    paymentGateway: {
                      ...formSettings.paymentGateway,
                      provider: e.target.value as any,
                    },
                  })
                }
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-indigo-500"
              >
                <option value="midtrans">Midtrans (Snap API & Core)</option>
                <option value="xendit">Xendit (QRIS, VA, E-Wallet)</option>
                <option value="tripay">Tripay Payment Gateway</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Merchant / Client Key</label>
              <input
                type="text"
                value={formSettings.paymentGateway.clientKey}
                onChange={(e) =>
                  setFormSettings({
                    ...formSettings,
                    paymentGateway: {
                      ...formSettings.paymentGateway,
                      clientKey: e.target.value,
                    },
                  })
                }
                className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-slate-600"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Server Key (Private)</label>
              <input
                type="password"
                value={formSettings.paymentGateway.serverKey}
                onChange={(e) =>
                  setFormSettings({
                    ...formSettings,
                    paymentGateway: {
                      ...formSettings.paymentGateway,
                      serverKey: e.target.value,
                    },
                  })
                }
                className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-slate-600"
              />
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 flex items-center justify-between">
            <span className="font-mono">
              URL Webhook Otomatis:{' '}
              <strong className="text-indigo-600">{window.location.origin}/api/payment-webhook</strong>
            </span>
            <span className="text-emerald-700 font-bold flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> Auto-Settlement Active
            </span>
          </div>
        </div>

        {/* Template WhatsApp Reminder */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm border-b border-slate-100 pb-3">
            <MessageSquare className="w-4 h-4 text-emerald-600" />
            <span>Template Pesan WhatsApp Pengingat Tagihan</span>
          </div>

          <p className="text-slate-500">
            Variabel otomatis yang didukung: <code className="text-indigo-600 bg-slate-100 px-1 py-0.5 rounded">{'{clientName}'}</code>, <code className="text-indigo-600 bg-slate-100 px-1 py-0.5 rounded">{'{websiteName}'}</code>, <code className="text-indigo-600 bg-slate-100 px-1 py-0.5 rounded">{'{domain}'}</code>, <code className="text-indigo-600 bg-slate-100 px-1 py-0.5 rounded">{'{invoiceNumber}'}</code>, <code className="text-indigo-600 bg-slate-100 px-1 py-0.5 rounded">{'{totalAmount}'}</code>, <code className="text-indigo-600 bg-slate-100 px-1 py-0.5 rounded">{'{dueDate}'}</code>, <code className="text-indigo-600 bg-slate-100 px-1 py-0.5 rounded">{'{portalUrl}'}</code>.
          </p>

          <textarea
            rows={7}
            value={formSettings.whatsappTemplate}
            onChange={(e) =>
              setFormSettings({ ...formSettings, whatsappTemplate: e.target.value })
            }
            className="w-full p-3 rounded-xl border border-slate-300 focus:outline-indigo-500 font-sans leading-relaxed text-slate-800"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Semua Perubahan</span>
          </button>
        </div>
      </form>

      {/* Kupon Diskon Promo Manager */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <Tag className="w-4 h-4 text-rose-600" />
              <span>Sistem Kupon & Diskon Otomatis</span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Kelola voucher diskon persentase (%) atau nominal tetap (Rp) untuk proses pembelian baru dan perpanjangan (renewal).
            </p>
          </div>
          <button
            onClick={() => setShowNewCoupon(!showNewCoupon)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{showNewCoupon ? 'Tutup Formulir' : 'Buat Kupon Baru'}</span>
          </button>
        </div>

        {showNewCoupon && (
          <form onSubmit={handleAddCoupon} className="p-5 bg-slate-50/80 rounded-2xl border border-indigo-100/80 space-y-4 text-xs">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200 text-indigo-900 font-bold text-xs">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Formulir Pembuatan Kupon Diskon Otomatis</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Kode Kupon */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Kode Kupon / Voucher Promo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: HEMAT250K / SETIA2026"
                  value={couponForm.code}
                  onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 uppercase font-mono font-bold rounded-xl border border-slate-300 bg-white focus:outline-indigo-500"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">Huruf kapital tanpa spasi</span>
              </div>

              {/* Tipe Diskon */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Tipe Diskon *
                </label>
                <div className="grid grid-cols-2 gap-1.5 p-1 bg-white border border-slate-300 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setCouponForm({ ...couponForm, discountType: 'percentage', discountValue: 15 })}
                    className={`flex items-center justify-center gap-1 py-1.5 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
                      couponForm.discountType === 'percentage'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Percent className="w-3.5 h-3.5" />
                    <span>Persentase (%)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCouponForm({ ...couponForm, discountType: 'fixed', discountValue: 200000 })}
                    className={`flex items-center justify-center gap-1 py-1.5 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
                      couponForm.discountType === 'fixed'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Coins className="w-3.5 h-3.5" />
                    <span>Nominal Tetap (Rp)</span>
                  </button>
                </div>
              </div>

              {/* Nilai Diskon */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  {couponForm.discountType === 'percentage' ? 'Besaran Diskon (%) *' : 'Nominal Potongan (Rp) *'}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max={couponForm.discountType === 'percentage' ? 100 : 50000000}
                    required
                    value={couponForm.discountValue}
                    onChange={(e) => setCouponForm({ ...couponForm, discountValue: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-mono font-bold focus:outline-indigo-500"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 font-semibold text-slate-400 text-xs">
                    {couponForm.discountType === 'percentage' ? '%' : 'IDR'}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              {/* Berlaku Untuk */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Berlaku Untuk Transaksi *
                </label>
                <select
                  value={couponForm.applicableTo}
                  onChange={(e) => setCouponForm({ ...couponForm, applicableTo: e.target.value as CouponApplicableTo })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-medium focus:outline-indigo-500"
                >
                  <option value="all">Semua (Beli & Perpanjang)</option>
                  <option value="purchase">Khusus Pembelian Baru</option>
                  <option value="renewal">Khusus Perpanjangan (Renewal)</option>
                </select>
              </div>

              {/* Maks. Potongan jika Persentase */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Maks. Potongan Diskon (Rp)
                </label>
                <input
                  type="number"
                  disabled={couponForm.discountType === 'fixed'}
                  value={couponForm.maxDiscount}
                  onChange={(e) => setCouponForm({ ...couponForm, maxDiscount: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-mono disabled:bg-slate-100 disabled:text-slate-400 focus:outline-indigo-500"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  {couponForm.discountType === 'fixed' ? 'Hanya untuk tipe persentase' : '0 = tanpa batasan maksimal'}
                </span>
              </div>

              {/* Min. Nilai Transaksi */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Min. Belanja / Transaksi (Rp)
                </label>
                <input
                  type="number"
                  value={couponForm.minSpend}
                  onChange={(e) => setCouponForm({ ...couponForm, minSpend: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-mono focus:outline-indigo-500"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">Contoh: Rp 1.000.000</span>
              </div>

              {/* Batas Kuota Pemakaian */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Batas Kuota Pemakaian
                </label>
                <input
                  type="number"
                  min="0"
                  value={couponForm.usageLimit}
                  onChange={(e) => setCouponForm({ ...couponForm, usageLimit: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-mono focus:outline-indigo-500"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">0 = tak terbatas kuota</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Tanggal Kadaluarsa */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Masa Berlaku Sampai *
                </label>
                <input
                  type="date"
                  required
                  value={couponForm.validUntil}
                  onChange={(e) => setCouponForm({ ...couponForm, validUntil: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-indigo-500"
                />
              </div>

              {/* Deskripsi Promo */}
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Deskripsi / Keterangan Promo (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Promo loyalitas perpanjangan domain & hosting tahun kedua"
                  value={couponForm.description}
                  onChange={(e) => setCouponForm({ ...couponForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-indigo-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowNewCoupon(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-xs transition-colors cursor-pointer"
              >
                Simpan & Aktifkan Kupon
              </button>
            </div>
          </form>
        )}

        {/* Interactive Coupon Simulator */}
        <div className="p-4 bg-gradient-to-r from-slate-50 to-indigo-50/40 rounded-2xl border border-slate-200/80">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800 mb-2">
            <Calculator className="w-4 h-4 text-indigo-600" />
            <span>Simulator Pengujian Kupon Otomatis</span>
            <span className="text-[10px] font-normal text-slate-500">
              (Uji perhitungan diskon untuk nominal & tipe transaksi tertentu)
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-600 font-medium">Nominal Transaksi:</span>
              <input
                type="number"
                value={testAmount}
                onChange={(e) => setTestAmount(Number(e.target.value))}
                className="w-32 px-2.5 py-1 rounded-lg border border-slate-300 bg-white font-mono text-xs"
              />
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-600 font-medium">Proses:</span>
              <select
                value={testContext}
                onChange={(e) => setTestContext(e.target.value as 'purchase' | 'renewal')}
                className="px-2.5 py-1 rounded-lg border border-slate-300 bg-white text-xs"
              >
                <option value="purchase">Pembelian Baru</option>
                <option value="renewal">Perpanjangan (Renewal)</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-600 font-medium">Klik kupon untuk tes:</span>
              <div className="flex flex-wrap gap-1">
                {coupons.map((cp) => (
                  <button
                    key={cp.id}
                    type="button"
                    onClick={() => handleRunSimulator(cp.code)}
                    className={`px-2 py-1 rounded-md font-mono text-[11px] font-bold border transition-colors cursor-pointer ${
                      selectedTestCoupon === cp.code
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-indigo-700 border-indigo-200 hover:bg-indigo-50'
                    }`}
                  >
                    {cp.code}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {testResult && (
            <div
              className={`mt-3 p-3 rounded-xl border text-xs flex items-center justify-between ${
                testResult.valid
                  ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                  : 'bg-rose-50/80 border-rose-200 text-rose-900'
              }`}
            >
              <div className="flex items-center gap-2">
                {testResult.valid ? (
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <Info className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span>{testResult.message}</span>
              </div>
              {testResult.valid && (
                <div className="font-mono font-bold text-emerald-700 ml-4">
                  Sisa Bayar: {formatRupiah(Math.max(0, testAmount - testResult.discount))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Daftar Kupon Aktif */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {coupons.map((cp) => {
            const isExpired = cp.validUntil && cp.validUntil < new Date().toISOString().substring(0, 10);
            const isQuotasFull = cp.usageLimit && cp.usageLimit > 0 && (cp.usedCount || 0) >= cp.usageLimit;
            const isFixed = cp.discountType === 'fixed';

            return (
              <div
                key={cp.id}
                className={`p-4 rounded-2xl border flex flex-col justify-between space-y-3 text-xs transition-all ${
                  !cp.isActive || isExpired || isQuotasFull
                    ? 'bg-slate-50 border-slate-200/80 opacity-70'
                    : 'bg-white border-slate-200 shadow-xs hover:border-indigo-300'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-mono font-bold text-sm text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">
                        {cp.code}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 ${
                          isFixed
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-indigo-100 text-indigo-800'
                        }`}
                      >
                        {isFixed ? <Coins className="w-3 h-3" /> : <Percent className="w-3 h-3" />}
                        <span>{isFixed ? 'Potongan Tetap' : 'Persentase'}</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => toggleCoupon(cp.id)}
                        className="cursor-pointer"
                        title={cp.isActive ? 'Nonaktifkan Kupon' : 'Aktifkan Kupon'}
                      >
                        {cp.isActive ? (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                            Aktif
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">
                            Nonaktif
                          </span>
                        )}
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Hapus kupon promo ${cp.code}?`)) {
                            deleteCoupon(cp.id);
                          }
                        }}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                        title="Hapus Kupon"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-2.5">
                    <p className="font-bold text-slate-900 text-sm">
                      {isFixed
                        ? `Hemat ${formatRupiah(cp.discountValue)}`
                        : `Diskon ${cp.discountValue || cp.discountPercent}%`}
                      {!isFixed && cp.maxDiscount ? (
                        <span className="text-xs font-normal text-slate-500 ml-1">
                          (Maks. {formatRupiah(cp.maxDiscount)})
                        </span>
                      ) : null}
                    </p>
                    {cp.description && (
                      <p className="text-[11px] text-slate-500 mt-0.5">{cp.description}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 mt-2">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1 ${
                        cp.applicableTo === 'renewal'
                          ? 'bg-purple-100 text-purple-800'
                          : cp.applicableTo === 'purchase'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {cp.applicableTo === 'renewal' ? (
                        <RefreshCw className="w-3 h-3" />
                      ) : cp.applicableTo === 'purchase' ? (
                        <ShoppingBag className="w-3 h-3" />
                      ) : (
                        <Layers className="w-3 h-3" />
                      )}
                      <span>
                        {cp.applicableTo === 'renewal'
                          ? 'Khusus Perpanjangan'
                          : cp.applicableTo === 'purchase'
                          ? 'Khusus Pembelian Baru'
                          : 'Semua Transaksi'}
                      </span>
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                  <div className="flex justify-between">
                    <span>Min. Belanja:</span>
                    <span className="font-mono text-slate-700">{formatRupiah(cp.minSpend || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Kuota Terpakai:</span>
                    <span className="font-mono text-slate-700">
                      {cp.usedCount || 0} / {cp.usageLimit && cp.usageLimit > 0 ? `${cp.usageLimit}x` : 'Tanpa Batas'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] pt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>Berlaku s/d:</span>
                    </span>
                    <span className={`font-medium ${isExpired ? 'text-rose-600 font-bold' : 'text-slate-700'}`}>
                      {formatDateIndo(cp.validUntil)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
