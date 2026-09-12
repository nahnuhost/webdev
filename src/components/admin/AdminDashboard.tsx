import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { formatRupiah, formatDateIndo, getDaysRemaining } from '../../utils/formatters';
import {
  DollarSign,
  TrendingUp,
  AlertCircle,
  Users,
  Globe,
  Clock,
  ArrowUpRight,
  PlusCircle,
  FileText,
  ShieldCheck,
  Send,
  CreditCard,
  Calendar,
  Filter,
  RotateCcw,
  Download,
  Building2,
  Store,
  User,
  Tag,
  ChevronDown,
  BarChart3,
  CheckCircle2,
  X,
  Layers,
  Sparkles,
  PieChart,
} from 'lucide-react';
import { Client, ClientService, Invoice } from '../../types';

interface AdminDashboardProps {
  onNavigateTab: (tab: string) => void;
  onOpenInvoiceModal: (inv: any) => void;
  onOpenReminderModal: (inv: any) => void;
  onOpenNewInvoiceModal: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onNavigateTab,
  onOpenInvoiceModal,
  onOpenReminderModal,
  onOpenNewInvoiceModal,
}) => {
  const { clients, services, invoices, transactions, logs, products } = useApp();

  // Filter States for Revenue Analysis
  const [dateRangePreset, setDateRangePreset] = useState<string>('all');
  const [customStartDate, setCustomStartDate] = useState<string>('2026-01-01');
  const [customEndDate, setCustomEndDate] = useState<string>('2026-12-31');
  const [selectedServiceFilter, setSelectedServiceFilter] = useState<string>('all');
  const [selectedSegmentFilter, setSelectedSegmentFilter] = useState<string>('all');
  const [selectedPaymentMethodFilter, setSelectedPaymentMethodFilter] = useState<string>('all');
  const [showLedgerTable, setShowLedgerTable] = useState<boolean>(true);

  // Mappings
  const clientMap = useMemo(() => {
    const map = new Map<string, Client>();
    clients.forEach((c) => map.set(c.id, c));
    return map;
  }, [clients]);

  const serviceMap = useMemo(() => {
    const map = new Map<string, ClientService>();
    services.forEach((s) => map.set(s.id, s));
    return map;
  }, [services]);

  // Base Metrics
  const paidInvoices = invoices.filter((i) => i.status === 'paid');
  const unpaidInvoices = invoices.filter((i) => i.status === 'unpaid');
  const overdueInvoices = invoices.filter((i) => i.status === 'overdue');

  const totalRevenue = paidInvoices.reduce((sum, i) => sum + i.total, 0);
  const pendingRevenue = unpaidInvoices.reduce((sum, i) => sum + i.total, 0);
  const overdueRevenue = overdueInvoices.reduce((sum, i) => sum + i.total, 0);

  // MRR: Services with monthly cycle + 1/12 of yearly maintenance
  const mrr = services.reduce((sum, s) => {
    if (s.status === 'active' || s.status === 'expiring_soon') {
      if (s.billingCycle === 'monthly') return sum + s.price;
      if (s.billingCycle === 'yearly' && s.productName.toLowerCase().includes('maintenance')) {
        return sum + Math.round(s.price / 12);
      }
    }
    return sum;
  }, 0);

  // Expiring soon services (< 30 days)
  const expiringServices = services
    .map((s) => ({ ...s, daysLeft: getDaysRemaining(s.expiryDate) }))
    .filter((s) => s.daysLeft <= 30)
    .sort((a, b) => a.daysLeft - b.daysLeft);

  // Check if any filter is active
  const hasActiveFilters =
    dateRangePreset !== 'all' ||
    selectedServiceFilter !== 'all' ||
    selectedSegmentFilter !== 'all' ||
    selectedPaymentMethodFilter !== 'all';

  const resetFilters = () => {
    setDateRangePreset('all');
    setCustomStartDate('2026-01-01');
    setCustomEndDate('2026-12-31');
    setSelectedServiceFilter('all');
    setSelectedSegmentFilter('all');
    setSelectedPaymentMethodFilter('all');
  };

  // Filtered Invoices Dataset for Deep Financial Analysis
  const filteredPaidInvoices = useMemo(() => {
    return paidInvoices.filter((inv) => {
      const invDate = inv.paidDate || inv.issueDate;

      // 1. Date Range
      if (dateRangePreset === 'this_month') {
        if (!invDate.startsWith('2026-09')) return false;
      } else if (dateRangePreset === 'last_month') {
        if (!invDate.startsWith('2026-08')) return false;
      } else if (dateRangePreset === 'q3') {
        const m = invDate.substring(5, 7);
        if (m !== '07' && m !== '08' && m !== '09') return false;
      } else if (dateRangePreset === 'this_year') {
        if (!invDate.startsWith('2026')) return false;
      } else if (dateRangePreset === 'custom') {
        if (customStartDate && invDate < customStartDate) return false;
        if (customEndDate && invDate > customEndDate) return false;
      }

      // 2. Specific Service Filter
      if (selectedServiceFilter !== 'all') {
        const service = inv.serviceId ? serviceMap.get(inv.serviceId) : null;
        const matchesServiceId = inv.serviceId === selectedServiceFilter;
        const matchesProductId = service?.productId === selectedServiceFilter;
        const matchesWebsiteName = inv.websiteName
          ?.toLowerCase()
          .includes(selectedServiceFilter.toLowerCase());
        const matchesItems = inv.items.some((it) =>
          it.description.toLowerCase().includes(selectedServiceFilter.toLowerCase())
        );

        if (!matchesServiceId && !matchesProductId && !matchesWebsiteName && !matchesItems) {
          return false;
        }
      }

      // 3. Customer Segment Filter
      if (selectedSegmentFilter !== 'all') {
        const client = clientMap.get(inv.clientId);
        const segment = client?.segment || 'personal';
        if (segment !== selectedSegmentFilter) return false;
      }

      // 4. Payment Method Filter
      if (selectedPaymentMethodFilter !== 'all') {
        const method = inv.paymentMethod || 'Lainnya';
        if (
          !method.toLowerCase().includes(selectedPaymentMethodFilter.toLowerCase()) &&
          selectedPaymentMethodFilter !== method
        ) {
          return false;
        }
      }

      return true;
    });
  }, [
    paidInvoices,
    dateRangePreset,
    customStartDate,
    customEndDate,
    selectedServiceFilter,
    selectedSegmentFilter,
    selectedPaymentMethodFilter,
    clientMap,
    serviceMap,
  ]);

  // Financial Stats from Filtered Invoices
  const filteredRevenue = filteredPaidInvoices.reduce((sum, i) => sum + i.total, 0);
  const filteredCount = filteredPaidInvoices.length;
  const filteredAov = filteredCount > 0 ? Math.round(filteredRevenue / filteredCount) : 0;
  const filteredDiscounts = filteredPaidInvoices.reduce((sum, i) => sum + (i.discount || 0), 0);

  // Dynamic Monthly Aggregation for Visual Chart
  const monthlyRevenueData = useMemo(() => {
    const months = [
      { key: '2026-04', label: 'Apr' },
      { key: '2026-05', label: 'Mei' },
      { key: '2026-06', label: 'Jun' },
      { key: '2026-07', label: 'Jul' },
      { key: '2026-08', label: 'Agu' },
      { key: '2026-09', label: 'Sep' },
    ];

    return months.map((m) => {
      const monthInvoices = filteredPaidInvoices.filter((inv) => {
        const date = inv.paidDate || inv.issueDate;
        return date.startsWith(m.key);
      });
      const rev = monthInvoices.reduce((sum, inv) => sum + inv.total, 0);
      return {
        month: m.label,
        key: m.key,
        revenue: rev,
        count: monthInvoices.length,
      };
    });
  }, [filteredPaidInvoices]);

  const maxChartRevenue = Math.max(...monthlyRevenueData.map((d) => d.revenue), 1);

  // Segment Contribution Breakdown
  const segmentStats = useMemo(() => {
    const counts: Record<string, { total: number; count: number }> = {
      enterprise: { total: 0, count: 0 },
      umkm: { total: 0, count: 0 },
      personal: { total: 0, count: 0 },
    };

    filteredPaidInvoices.forEach((inv) => {
      const client = clientMap.get(inv.clientId);
      const seg = client?.segment || 'personal';
      if (!counts[seg]) counts[seg] = { total: 0, count: 0 };
      counts[seg].total += inv.total;
      counts[seg].count += 1;
    });

    return counts;
  }, [filteredPaidInvoices, clientMap]);

  // Payment Method Breakdown
  const paymentMethodStats = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredPaidInvoices.forEach((inv) => {
      const method = inv.paymentMethod || 'Manual / Lainnya';
      counts[method] = (counts[method] || 0) + inv.total;
    });
    return counts;
  }, [filteredPaidInvoices]);

  // Export CSV Handler
  const handleExportCSV = () => {
    const headers = [
      'No. Invoice',
      'Tanggal Bayar',
      'Klien',
      'Segmen Klien',
      'Website/Layanan',
      'Metode Pembayaran',
      'Kupon Promo',
      'Diskon (Rp)',
      'Total Penerimaan (Rp)',
    ];

    const rows = filteredPaidInvoices.map((inv) => {
      const client = clientMap.get(inv.clientId);
      return [
        `"${inv.invoiceNumber}"`,
        `"${inv.paidDate || inv.issueDate}"`,
        `"${inv.clientName}"`,
        `"${client?.segment || 'personal'}"`,
        `"${inv.websiteName || '-'}"`,
        `"${inv.paymentMethod || '-'}"`,
        `"${inv.couponCode || '-'}"`,
        inv.discount || 0,
        inv.total,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Laporan_Pendapatan_WebDev_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner & Quick Action Buttons */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 rounded-full inline-block mb-2">
            Ikhtisar Usaha Freelance Website
          </span>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight">
            Dashboard Manajemen Pelanggan & Billing
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Pantau seluruh website klien, masa aktif domain & hosting, status invoice jatuh tempo, dan penerimaan pembayaran otomatis dari satu tempat.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={onOpenNewInvoiceModal}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-md transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Buat Tagihan Baru</span>
          </button>
          <button
            onClick={() => onNavigateTab('services')}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-white/10 hover:bg-white/20 text-white rounded-xl border border-white/10 transition-all"
          >
            <Globe className="w-4 h-4" />
            <span>Lihat Semua Website</span>
          </button>
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Pendapatan */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Pendapatan Lunas</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 font-mono tracking-tight">
            {formatRupiah(totalRevenue)}
          </p>
          <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{paidInvoices.length} invoice telah terbayar</span>
          </div>
        </div>

        {/* Monthly Recurring Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Estimasi MRR (Rutin Bulanan)</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-indigo-700 font-mono tracking-tight">
            {formatRupiah(mrr)}
          </p>
          <p className="text-[11px] text-slate-500">
            Dari paket maintenance & hosting kelolaan
          </p>
        </div>

        {/* Tagihan Tertunggak / Belum Lunas */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Tagihan Belum Lunas</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-600 font-mono tracking-tight">
            {formatRupiah(pendingRevenue + overdueRevenue)}
          </p>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-amber-800 font-medium">{unpaidInvoices.length} pending</span>
            {overdueInvoices.length > 0 && (
              <span className="text-rose-600 font-bold">{overdueInvoices.length} overdue!</span>
            )}
          </div>
        </div>

        {/* Total Klien & Website */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Klien & Website</span>
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-black text-slate-900 tracking-tight">{clients.length}</p>
            <span className="text-xs text-slate-500">Klien</span>
            <span className="text-slate-300">/</span>
            <p className="text-2xl font-black text-slate-900 tracking-tight">{services.length}</p>
            <span className="text-xs text-slate-500">Website Aktif</span>
          </div>
          <p className="text-[11px] text-emerald-600 font-medium">
            100% status hosting terkelola aman
          </p>
        </div>
      </div>

      {/* Enhanced Revenue Report & Financial Analytics Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
        {/* Section Header & Export Action */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700">
                <BarChart3 className="w-4 h-4" />
              </span>
              <h3 className="font-bold text-base text-slate-900">
                Laporan Arus Pendapatan & Analisis Finansial
              </h3>
              {hasActiveFilters && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 animate-pulse">
                  Filter Aktif
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Analisis pendapatan berbasis rentang tanggal kustom, kategori layanan, segmen pelanggan, dan metode pembayaran.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Filter</span>
              </button>
            )}
            <button
              onClick={handleExportCSV}
              disabled={filteredPaidInvoices.length === 0}
              className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh CSV Laporan</span>
            </button>
          </div>
        </div>

        {/* Customizable Date Range & Filters Toolbar */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 text-xs">
          <div className="flex items-center gap-2 font-semibold text-slate-700">
            <Filter className="w-3.5 h-3.5 text-indigo-600" />
            <span>Kustomisasi Parameter Laporan:</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* 1. Date Range Preset */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Rentang Waktu
              </label>
              <select
                value={dateRangePreset}
                onChange={(e) => setDateRangePreset(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-medium text-slate-800 focus:outline-indigo-500 text-xs"
              >
                <option value="all">Semua Waktu</option>
                <option value="this_month">Bulan Ini (Sep 2026)</option>
                <option value="last_month">Bulan Lalu (Agu 2026)</option>
                <option value="q3">Kuartal 3 (Jul - Sep 2026)</option>
                <option value="this_year">Tahun Berjalan (2026)</option>
                <option value="custom">Pilih Tanggal Kustom...</option>
              </select>
            </div>

            {/* 2. Service / Product Filter */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Layanan / Website
              </label>
              <select
                value={selectedServiceFilter}
                onChange={(e) => setSelectedServiceFilter(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-medium text-slate-800 focus:outline-indigo-500 text-xs"
              >
                <option value="all">Semua Layanan & Website</option>
                <optgroup label="Berdasarkan Produk">
                  {products.map((p) => (
                    <option key={p.id} value={p.name}>
                      {p.name}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Berdasarkan Website Klien">
                  {services.map((s) => (
                    <option key={s.id} value={s.websiteName}>
                      {s.websiteName} ({s.domain})
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            {/* 3. Customer Segment Filter */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Segmen Pelanggan
              </label>
              <select
                value={selectedSegmentFilter}
                onChange={(e) => setSelectedSegmentFilter(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-medium text-slate-800 focus:outline-indigo-500 text-xs"
              >
                <option value="all">Semua Segmen Pelanggan</option>
                <option value="enterprise">🏢 Korporasi / Enterprise</option>
                <option value="umkm">🏪 UMKM & Bisnis Berkembang</option>
                <option value="personal">👤 Personal / Profesional</option>
              </select>
            </div>

            {/* 4. Payment Method Filter */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Metode Pembayaran
              </label>
              <select
                value={selectedPaymentMethodFilter}
                onChange={(e) => setSelectedPaymentMethodFilter(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-medium text-slate-800 focus:outline-indigo-500 text-xs"
              >
                <option value="all">Semua Channel Pembayaran</option>
                <option value="QRIS">QRIS Instan (Semua Dompet Digital)</option>
                <option value="BCA">BCA Virtual Account</option>
                <option value="Mandiri">Mandiri Virtual Account</option>
                <option value="BRI">BRI Virtual Account</option>
                <option value="Transfer">Bank Transfer Manual</option>
              </select>
            </div>
          </div>

          {/* Custom Date Pickers (Shown when 'custom' is selected) */}
          {dateRangePreset === 'custom' && (
            <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center gap-3">
              <span className="text-[11px] font-semibold text-slate-600">Tentukan Rentang:</span>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="px-2.5 py-1 rounded-lg border border-slate-300 bg-white text-xs font-mono"
                />
                <span className="text-slate-400">s/d</span>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="px-2.5 py-1 rounded-lg border border-slate-300 bg-white text-xs font-mono"
                />
              </div>
            </div>
          )}
        </div>

        {/* Dynamic Financial KPIs for Active Filter */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-100">
            <span className="text-[11px] font-semibold text-indigo-700 block">
              Total Pendapatan Terfilter
            </span>
            <p className="text-xl font-black text-indigo-950 font-mono mt-0.5">
              {formatRupiah(filteredRevenue)}
            </p>
            <span className="text-[10px] text-indigo-600 mt-1 block">
              {filteredCount} pembayaran sukses
            </span>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-100">
            <span className="text-[11px] font-semibold text-emerald-700 block">
              Rata-rata Order (AOV)
            </span>
            <p className="text-xl font-black text-emerald-950 font-mono mt-0.5">
              {formatRupiah(filteredAov)}
            </p>
            <span className="text-[10px] text-emerald-600 mt-1 block">
              Per transaksi lunas
            </span>
          </div>

          <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-100">
            <span className="text-[11px] font-semibold text-purple-700 block">
              Total Diskon Kupon
            </span>
            <p className="text-xl font-black text-purple-950 font-mono mt-0.5">
              {formatRupiah(filteredDiscounts)}
            </p>
            <span className="text-[10px] text-purple-600 mt-1 block">
              Penghematan promo klien
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-600 block">
              Porsi dari Seluruh Waktu
            </span>
            <p className="text-xl font-black text-slate-900 font-mono mt-0.5">
              {totalRevenue > 0 ? `${Math.round((filteredRevenue / totalRevenue) * 100)}%` : '0%'}
            </p>
            <span className="text-[10px] text-slate-500 mt-1 block">
              Basis: {formatRupiah(totalRevenue)}
            </span>
          </div>
        </div>

        {/* Dynamic Monthly Chart & Breakdown Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
          {/* Monthly Revenue Bar Chart (2 Cols) */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-indigo-600" />
                <span>Distribusi Pendapatan per Bulan (6 Bulan Terakhir)</span>
              </h4>
              <span className="text-slate-500 font-mono text-[11px]">
                Skala Maks: {formatRupiah(maxChartRevenue)}
              </span>
            </div>

            <div className="pt-6 pb-2 border border-slate-100 rounded-xl bg-slate-50/50 p-4">
              <div className="h-44 flex items-end justify-between gap-3 sm:gap-6 border-b border-slate-200 px-2">
                {monthlyRevenueData.map((d, index) => {
                  const heightPercent = maxChartRevenue > 0 ? (d.revenue / maxChartRevenue) * 100 : 0;
                  const isCurrent = index === monthlyRevenueData.length - 1;
                  return (
                    <div key={d.key} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                      <span className="text-[10px] font-mono text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-white px-1.5 py-0.5 rounded shadow-xs border border-slate-200">
                        {formatRupiah(d.revenue)} ({d.count} trx)
                      </span>
                      <div className="w-full max-w-[48px] bg-slate-200/70 rounded-t-lg overflow-hidden flex items-end h-full">
                        <div
                          style={{ height: `${Math.max(heightPercent, d.revenue > 0 ? 8 : 0)}%` }}
                          className={`w-full rounded-t-md transition-all duration-500 ${
                            isCurrent
                              ? 'bg-gradient-to-t from-indigo-600 to-indigo-500'
                              : 'bg-gradient-to-t from-slate-400 to-slate-500 group-hover:from-indigo-400 group-hover:to-indigo-300'
                          }`}
                        />
                      </div>
                      <span
                        className={`text-[11px] truncate max-w-full font-medium ${
                          isCurrent ? 'text-indigo-700 font-bold' : 'text-slate-500'
                        }`}
                      >
                        {d.month}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Customer Segment & Payment Distribution (1 Col) */}
          <div className="space-y-4 text-xs">
            {/* Segmen Pelanggan Share */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2.5">
              <h5 className="font-bold text-slate-900 flex items-center justify-between">
                <span>Porsi Segmen Pelanggan</span>
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
              </h5>

              {(['enterprise', 'umkm', 'personal'] as const).map((seg) => {
                const amount = segmentStats[seg]?.total || 0;
                const count = segmentStats[seg]?.count || 0;
                const percent = filteredRevenue > 0 ? Math.round((amount / filteredRevenue) * 100) : 0;
                const label =
                  seg === 'enterprise'
                    ? '🏢 Enterprise'
                    : seg === 'umkm'
                    ? '🏪 UMKM'
                    : '👤 Personal';

                return (
                  <div key={seg} className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="font-semibold text-slate-700">{label} ({count})</span>
                      <span className="font-mono text-slate-900 font-bold">
                        {formatRupiah(amount)} ({percent}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-1.5 rounded-full ${
                          seg === 'enterprise'
                            ? 'bg-indigo-600'
                            : seg === 'umkm'
                            ? 'bg-emerald-500'
                            : 'bg-amber-500'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Metode Pembayaran Share */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <h5 className="font-bold text-slate-900 flex items-center justify-between">
                <span>Metode Pembayaran</span>
                <CreditCard className="w-3.5 h-3.5 text-slate-400" />
              </h5>

              <div className="space-y-1.5 text-[11px]">
                {Object.entries(paymentMethodStats).length === 0 ? (
                  <p className="text-slate-400 text-[10px]">Tidak ada transaksi pada filter ini.</p>
                ) : (
                  Object.entries(paymentMethodStats).map(([method, amount]) => (
                    <div key={method} className="flex justify-between items-center">
                      <span className="text-slate-600 truncate max-w-[150px]">{method}</span>
                      <span className="font-mono font-bold text-slate-900">{formatRupiah(amount as number)}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Ledger Table of Filtered Paid Invoices */}
        <div className="border-t border-slate-100 pt-4">
          <div className="flex justify-between items-center mb-3">
            <div>
              <h4 className="font-bold text-xs text-slate-900">
                Buku Besar Transaksi Terfilter ({filteredPaidInvoices.length} Faktur)
              </h4>
              <p className="text-[11px] text-slate-500">
                Daftar lengkap invoice lunas yang cocok dengan parameter filter saat ini.
              </p>
            </div>
            <button
              onClick={() => setShowLedgerTable(!showLedgerTable)}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer"
            >
              {showLedgerTable ? 'Sembunyikan Rincian' : 'Tampilkan Rincian'}
            </button>
          </div>

          {showLedgerTable && (
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="overflow-x-auto max-h-80 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-[10px] border-b border-slate-200 sticky top-0">
                    <tr>
                      <th className="py-2.5 px-3">No. Invoice & Tanggal</th>
                      <th className="py-2.5 px-3">Pelanggan & Segmen</th>
                      <th className="py-2.5 px-3">Website / Layanan</th>
                      <th className="py-2.5 px-3">Metode Bayar</th>
                      <th className="py-2.5 px-3 text-right">Diskon Kupon</th>
                      <th className="py-2.5 px-3 text-right">Nominal Diterima</th>
                      <th className="py-2.5 px-3 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredPaidInvoices.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-6 text-center text-slate-400 text-xs">
                          Tidak ditemukan data transaksi untuk kombinasi filter ini.
                        </td>
                      </tr>
                    ) : (
                      filteredPaidInvoices.map((inv) => {
                        const client = clientMap.get(inv.clientId);
                        const segment = client?.segment || 'personal';

                        return (
                          <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="py-2.5 px-3">
                              <span className="font-mono font-semibold text-indigo-600 block">
                                {inv.invoiceNumber}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                {inv.paidDate || inv.issueDate}
                              </span>
                            </td>
                            <td className="py-2.5 px-3">
                              <span className="font-semibold text-slate-800 block">
                                {inv.clientName}
                              </span>
                              <span
                                className={`inline-block text-[9px] font-bold px-1.5 py-0.2 rounded ${
                                  segment === 'enterprise'
                                    ? 'bg-indigo-100 text-indigo-800'
                                    : segment === 'umkm'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {segment.toUpperCase()}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-slate-600 font-medium">
                              {inv.websiteName || inv.items[0]?.description || '-'}
                            </td>
                            <td className="py-2.5 px-3 text-slate-600 text-[11px]">
                              {inv.paymentMethod || 'Otomatis Gateway'}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono text-emerald-600">
                              {inv.discount > 0 ? (
                                <span>
                                  -{formatRupiah(inv.discount)}
                                  {inv.couponCode && (
                                    <span className="block text-[9px] text-slate-400">
                                      ({inv.couponCode})
                                    </span>
                                  )}
                                </span>
                              ) : (
                                <span className="text-slate-300">-</span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                              {formatRupiah(inv.total)}
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <button
                                onClick={() => onOpenInvoiceModal(inv)}
                                className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                                title="Lihat Faktur"
                              >
                                <FileText className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Website Expiring Soon & Alerts Box */}
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-bold text-sm text-slate-900">Perpanjangan Website Klien</h3>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full">
                {expiringServices.length} butuh perhatian
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Website yang mendekati masa habis berlaku domain & hosting (&lt; 30 hari).
            </p>

            <div className="space-y-3">
              {expiringServices.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  Semua website klien masih aktif dalam jangka panjang.
                </div>
              ) : (
                expiringServices.map((srv) => {
                  const isOverdue = srv.daysLeft < 0;
                  const relatedInvoice = invoices.find(
                    (inv) => inv.serviceId === srv.id && inv.status !== 'paid'
                  );

                  return (
                    <div
                      key={srv.id}
                      className={`p-3 rounded-xl border text-xs space-y-2 transition-all ${
                        isOverdue
                          ? 'bg-rose-50/70 border-rose-200 text-rose-950'
                          : srv.daysLeft <= 14
                          ? 'bg-amber-50/70 border-amber-200 text-amber-950'
                          : 'bg-slate-50 border-slate-200 text-slate-800'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold">{srv.websiteName}</p>
                          <a
                            href={srv.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[11px] text-indigo-600 hover:underline inline-flex items-center gap-0.5"
                          >
                            <span>{srv.domain}</span>
                            <ArrowUpRight className="w-3 h-3" />
                          </a>
                        </div>
                        <span
                          className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${
                            isOverdue
                              ? 'bg-rose-200 text-rose-800'
                              : 'bg-amber-200 text-amber-900'
                          }`}
                        >
                          {isOverdue ? `Expired ${Math.abs(srv.daysLeft)} hari lalu` : `Sisa ${srv.daysLeft} hari`}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[11px]">
                        <span className="text-slate-500 truncate max-w-[120px]">
                          {srv.clientName}
                        </span>
                        {relatedInvoice ? (
                          <button
                            onClick={() => onOpenReminderModal(relatedInvoice)}
                            className="text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1"
                          >
                            <Send className="w-3 h-3" />
                            <span>Kirim WA</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => onNavigateTab('invoices')}
                            className="text-indigo-600 hover:text-indigo-800 font-medium"
                          >
                            Buat Tagihan
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('services')}
            className="w-full py-2 text-center text-xs font-semibold text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
          >
            Buka Kredensial & Manajemen Layanan &rarr;
          </button>
        </div>
      </div>

      {/* Invoices List Table & Quick Reminder */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h3 className="font-bold text-sm text-slate-900">Daftar Tagihan Terkini</h3>
            <p className="text-xs text-slate-500">Invoice yang baru diterbitkan dan status pembayarannya</p>
          </div>
          <button
            onClick={() => onNavigateTab('invoices')}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
          >
            Lihat Semua Tagihan ({invoices.length}) &rarr;
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">No. Invoice</th>
                <th className="py-3 px-4">Pelanggan</th>
                <th className="py-3 px-4">Website</th>
                <th className="py-3 px-4">Jatuh Tempo</th>
                <th className="py-3 px-4 text-right">Total</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoices.slice(0, 5).map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4 font-mono font-semibold text-indigo-600">
                    {inv.invoiceNumber}
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-900">{inv.clientName}</td>
                  <td className="py-3 px-4 text-slate-600">{inv.websiteName || '-'}</td>
                  <td className="py-3 px-4 text-slate-600">{formatDateIndo(inv.dueDate)}</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                    {formatRupiah(inv.total)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        inv.status === 'paid'
                          ? 'bg-emerald-100 text-emerald-800'
                          : inv.status === 'overdue'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {inv.status === 'paid' ? 'Lunas' : inv.status === 'overdue' ? 'Overdue' : 'Pending'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onOpenInvoiceModal(inv)}
                        className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Lihat Faktur / Cetak"
                      >
                        <FileText className="w-3.5 h-3.5" />
                      </button>
                      {inv.status !== 'paid' && (
                        <button
                          onClick={() => onOpenReminderModal(inv)}
                          className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Kirim Pengingat WhatsApp"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
