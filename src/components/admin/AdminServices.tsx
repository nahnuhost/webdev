import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ClientService } from '../../types';
import { formatRupiah, formatDateIndo, getDaysRemaining, buildWhatsAppLink } from '../../utils/formatters';
import {
  Globe,
  Plus,
  Key,
  Eye,
  EyeOff,
  Copy,
  Check,
  Calendar,
  ExternalLink,
  Edit2,
  Trash2,
  RotateCw,
  Clock,
  Shield,
  Server,
  Mail,
  Send,
  X,
  Search,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export const AdminServices: React.FC = () => {
  const { clients, products, services, addService, updateService, deleteService, renewService, runWithLoading, showToast } = useApp();

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedService, setSelectedService] = useState<ClientService | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Form State
  const [form, setForm] = useState({
    clientId: clients[0]?.id || '',
    productId: products[0]?.id || '',
    packageId: products[0]?.packages[0]?.id || '',
    websiteName: '',
    domain: '',
    url: '',
    billingCycle: 'yearly' as ClientService['billingCycle'],
    price: 1500000,
    startDate: new Date().toISOString().substring(0, 10),
    expiryDate: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString().substring(0, 10),
    status: 'active' as ClientService['status'],
    credentials: {
      cpanelUrl: '',
      cpanelUser: '',
      cpanelPassword: '',
      cmsAdminUrl: '',
      cmsUser: '',
      cmsPassword: '',
      emailProvider: 'Webmail Cpanel',
      emailAddress: '',
      emailPassword: '',
      serverIp: '103.145.22.88',
      nameservers: ['ns1.naufalcloud.id', 'ns2.naufalcloud.id'],
      notes: '',
    },
    autoRenewReminder: true,
  });

  const filteredServices = services
    .map((s) => ({ ...s, daysLeft: getDaysRemaining(s.expiryDate) }))
    .filter((s) => {
      const matchSearch =
        s.websiteName.toLowerCase().includes(search.toLowerCase()) ||
        s.domain.toLowerCase().includes(search.toLowerCase()) ||
        s.clientName.toLowerCase().includes(search.toLowerCase());

      if (!matchSearch) return false;
      if (filterStatus === 'all') return true;
      if (filterStatus === 'expiring') return s.daysLeft <= 30 && s.daysLeft >= 0;
      if (filterStatus === 'expired') return s.daysLeft < 0;
      if (filterStatus === 'active') return s.daysLeft > 30;
      return true;
    });

  const togglePasswordVisibility = (key: string) => {
    setShowPasswords((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(key);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleOpenAdd = () => {
    const defaultClient = clients[0];
    const defaultProduct = products[0];
    const defaultPackage = defaultProduct?.packages[0];

    setForm({
      clientId: defaultClient?.id || '',
      productId: defaultProduct?.id || '',
      packageId: defaultPackage?.id || '',
      websiteName: '',
      domain: '',
      url: '',
      billingCycle: defaultPackage?.billingCycle || 'yearly',
      price: defaultPackage?.price || 1500000,
      startDate: new Date().toISOString().substring(0, 10),
      expiryDate: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString().substring(0, 10),
      status: 'active',
      credentials: {
        cpanelUrl: 'https://cpanel.domainanda.com:2083',
        cpanelUser: 'cp_user',
        cpanelPassword: 'SecurePassword#2026',
        cmsAdminUrl: 'https://domainanda.com/wp-admin',
        cmsUser: 'admin_web',
        cmsPassword: 'AdminPassword!2026',
        emailProvider: 'Webmail Cpanel (Roundcube)',
        emailAddress: 'admin@domainanda.com',
        emailPassword: 'EmailPassword!2026',
        serverIp: '103.145.22.88',
        nameservers: ['ns1.naufalcloud.id', 'ns2.naufalcloud.id'],
        notes: '',
      },
      autoRenewReminder: true,
    });
    setShowAddModal(true);
  };

  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const client = clients.find((c) => c.id === form.clientId);
    const prod = products.find((p) => p.id === form.productId);
    const pkg = prod?.packages.find((p) => p.id === form.packageId);

    const domainClean = form.domain.replace(/https?:\/\//, '').replace(/\/$/, '');
    const fullUrl = form.url || `https://${domainClean}`;

    await runWithLoading(
      async () => {
        await new Promise((r) => setTimeout(r, 500));
        addService({
          clientId: form.clientId,
          clientName: client?.name || 'Pelanggan',
          productId: form.productId,
          packageId: form.packageId,
          productName: prod?.name || 'Layanan Website',
          packageName: pkg?.name || 'Paket Website',
          websiteName: form.websiteName || domainClean,
          domain: domainClean,
          url: fullUrl,
          billingCycle: form.billingCycle,
          price: Number(form.price),
          startDate: form.startDate,
          expiryDate: form.expiryDate,
          status: form.status,
          credentials: form.credentials,
          autoRenewReminder: form.autoRenewReminder,
        });

        setShowAddModal(false);
        showToast(`Layanan website ${domainClean} berhasil ditambahkan!`, 'success');
      },
      'Mendaftarkan layanan website & mengamankan kredensial...'
    );
  };

  const handleSendCredentialsWA = (service: ClientService) => {
    const client = clients.find((c) => c.id === service.clientId);
    const phone = client?.phone || '6281234567890';

    const text = `Halo Kak *${service.clientName}*, berikut adalah rincian akses kredensial website Anda yang tersimpan aman:

🌐 *Nama Website:* ${service.websiteName}
🔗 *URL Website:* ${service.url}
📅 *Masa Aktif Hingga:* ${formatDateIndo(service.expiryDate)}

🔑 *Akses CMS Admin (WordPress):*
- Login: ${service.credentials.cmsAdminUrl || '-'}
- User: ${service.credentials.cmsUser || '-'}
- Password: ${service.credentials.cmsPassword || '-'}

⚙️ *Akses Control Panel (cPanel/Hosting):*
- Login: ${service.credentials.cpanelUrl || '-'}
- User: ${service.credentials.cpanelUser || '-'}
- Password: ${service.credentials.cpanelPassword || '-'}

✉️ *Akses Email Bisnis:*
- Akun: ${service.credentials.emailAddress || '-'}
- Password: ${service.credentials.emailPassword || '-'}

Semua data ini juga dapat Anda lihat secara mandiri melalui Portal Pelanggan. Terima kasih! 🙏`;

    window.open(buildWhatsAppLink(phone, text), '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Manajemen Layanan & Kredensial Klien
          </h2>
          <p className="text-xs text-slate-500">
            Catatan rapi seluruh website klien, masa aktif domain, hosting, cPanel, WP Admin, dan email bisnis.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Layanan / Website Klien</span>
        </button>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari domain, nama website, atau nama klien..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-indigo-500 shadow-xs"
          />
        </div>

        <div className="flex gap-1.5 p-1 bg-white rounded-xl border border-slate-200 text-xs overflow-x-auto">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              filterStatus === 'all' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600'
            }`}
          >
            Semua ({services.length})
          </button>
          <button
            onClick={() => setFilterStatus('expiring')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              filterStatus === 'expiring' ? 'bg-amber-50 text-amber-700 font-bold' : 'text-slate-600'
            }`}
          >
            Segera Habis (&lt;30 hr)
          </button>
          <button
            onClick={() => setFilterStatus('expired')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              filterStatus === 'expired' ? 'bg-rose-50 text-rose-700 font-bold' : 'text-slate-600'
            }`}
          >
            Expired
          </button>
        </div>
      </div>

      {/* Services Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredServices.map((service) => {
          const isOverdue = service.daysLeft < 0;
          const isExpiringSoon = service.daysLeft <= 30 && service.daysLeft >= 0;

          return (
            <div
              key={service.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-slate-300 transition-all space-y-4"
            >
              <div className="flex justify-between items-start gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-slate-900">{service.websiteName}</h3>
                    <a
                      href={service.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-slate-400 hover:text-indigo-600"
                      title="Buka Website"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                  <p className="text-xs font-mono text-indigo-600 font-medium">{service.domain}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Klien: <strong className="text-slate-700">{service.clientName}</strong>
                  </p>
                </div>

                <span
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                    isOverdue
                      ? 'bg-rose-100 text-rose-800 border border-rose-200'
                      : isExpiringSoon
                      ? 'bg-amber-100 text-amber-800 border border-amber-200'
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  }`}
                >
                  {isOverdue
                    ? `Expired ${Math.abs(service.daysLeft)} hr lalu`
                    : isExpiringSoon
                    ? `Sisa ${service.daysLeft} hari`
                    : 'Aktif'}
                </span>
              </div>

              {/* Service Meta Details */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">Paket Layanan</span>
                  <span className="font-medium text-slate-800">{service.packageName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">Siklus & Biaya</span>
                  <span className="font-mono font-bold text-slate-900">
                    {formatRupiah(service.price)} / {service.billingCycle === 'monthly' ? 'bln' : 'thn'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">Mulai Aktif</span>
                  <span className="text-slate-700">{formatDateIndo(service.startDate)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">Jatuh Tempo Perpanjangan</span>
                  <span className={`font-bold ${isOverdue ? 'text-rose-600' : 'text-slate-800'}`}>
                    {formatDateIndo(service.expiryDate)}
                  </span>
                </div>
              </div>

              {/* Quick Credential Glance */}
              <div className="text-xs space-y-1.5">
                <div className="flex items-center justify-between text-slate-600">
                  <span className="flex items-center gap-1.5 text-[11px]">
                    <Shield className="w-3.5 h-3.5 text-indigo-500" />
                    <span>WP-Admin:</span>
                  </span>
                  <span className="font-mono text-[11px] text-slate-800">
                    {service.credentials.cmsUser || '-'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span className="flex items-center gap-1.5 text-[11px]">
                    <Server className="w-3.5 h-3.5 text-emerald-500" />
                    <span>cPanel Host:</span>
                  </span>
                  <span className="font-mono text-[11px] text-slate-800">
                    {service.credentials.cpanelUser || '-'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span className="flex items-center gap-1.5 text-[11px]">
                    <Mail className="w-3.5 h-3.5 text-sky-500" />
                    <span>Email Bisnis:</span>
                  </span>
                  <span className="font-mono text-[11px] text-slate-800">
                    {service.credentials.emailAddress || '-'}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      setSelectedService(service);
                      setShowCredentialsModal(true);
                    }}
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    <Key className="w-3.5 h-3.5" />
                    <span>Buka Vault Kredensial</span>
                  </button>

                  <button
                    onClick={() => handleSendCredentialsWA(service)}
                    className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg transition-colors"
                    title="Kirim Info Kredensial ke WA Klien"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={async () => {
                      if (confirm(`Perpanjang masa aktif ${service.websiteName} selama 1 tahun?`)) {
                        await runWithLoading(
                          async () => {
                            await new Promise((r) => setTimeout(r, 600));
                            renewService(service.id, 12);
                            showToast(
                              `Masa aktif ${service.websiteName} berhasil diperpanjang 1 tahun!`,
                              'success',
                              'Layanan Diperpanjang'
                            );
                          },
                          'Memperpanjang masa aktif layanan & memperbarui invoice...'
                        );
                      }
                    }}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                    title="Perpanjang +1 Tahun"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>+1 Tahun</span>
                  </button>

                  <button
                    onClick={async () => {
                      if (confirm(`Hapus layanan website ${service.websiteName}?`)) {
                        await runWithLoading(
                          async () => {
                            await new Promise((r) => setTimeout(r, 400));
                            deleteService(service.id);
                            showToast(`Layanan ${service.websiteName} telah dihapus.`, 'info');
                          },
                          'Menghapus layanan website...'
                        );
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Hapus Layanan"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Credential Vault Modal */}
      {showCredentialsModal && selectedService && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto">
            <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">{selectedService.websiteName}</h3>
                  <p className="text-[11px] text-slate-400 font-mono">{selectedService.domain}</p>
                </div>
              </div>
              <button
                onClick={() => setShowCredentialsModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs">
              {/* CMS Admin Card */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-indigo-600" />
                    <span>Akses CMS Admin (WordPress / Backend)</span>
                  </span>
                  {selectedService.credentials.cmsAdminUrl && (
                    <a
                      href={selectedService.credentials.cmsAdminUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-indigo-600 hover:underline flex items-center gap-1 text-[11px]"
                    >
                      <span>Buka URL</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Login URL:</span>
                    <span className="font-mono text-slate-800 truncate max-w-[240px]">
                      {selectedService.credentials.cmsAdminUrl || '-'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Username:</span>
                    <div className="flex items-center gap-1 font-mono text-slate-800">
                      <span>{selectedService.credentials.cmsUser || '-'}</span>
                      {selectedService.credentials.cmsUser && (
                        <button
                          onClick={() => copyToClipboard(selectedService.credentials.cmsUser!, 'cmsUser')}
                          className="p-1 hover:bg-slate-200 rounded"
                        >
                          {copiedField === 'cmsUser' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-slate-400" />}
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Password:</span>
                    <div className="flex items-center gap-1 font-mono text-slate-800">
                      <span>
                        {showPasswords['cmsPass']
                          ? selectedService.credentials.cmsPassword
                          : '••••••••••••'}
                      </span>
                      <button
                        onClick={() => togglePasswordVisibility('cmsPass')}
                        className="p-1 hover:bg-slate-200 rounded"
                      >
                        {showPasswords['cmsPass'] ? <EyeOff className="w-3 h-3 text-slate-400" /> : <Eye className="w-3 h-3 text-slate-400" />}
                      </button>
                      {selectedService.credentials.cmsPassword && (
                        <button
                          onClick={() => copyToClipboard(selectedService.credentials.cmsPassword!, 'cmsPass')}
                          className="p-1 hover:bg-slate-200 rounded"
                        >
                          {copiedField === 'cmsPass' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-slate-400" />}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* cPanel / Hosting Card */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Server className="w-4 h-4 text-emerald-600" />
                    <span>Akses cPanel / Control Panel Server</span>
                  </span>
                  {selectedService.credentials.cpanelUrl && (
                    <a
                      href={selectedService.credentials.cpanelUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-700 hover:underline flex items-center gap-1 text-[11px]"
                    >
                      <span>Buka cPanel</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">cPanel URL:</span>
                    <span className="font-mono text-slate-800 truncate max-w-[240px]">
                      {selectedService.credentials.cpanelUrl || '-'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Username:</span>
                    <div className="flex items-center gap-1 font-mono text-slate-800">
                      <span>{selectedService.credentials.cpanelUser || '-'}</span>
                      {selectedService.credentials.cpanelUser && (
                        <button
                          onClick={() => copyToClipboard(selectedService.credentials.cpanelUser!, 'cpUser')}
                          className="p-1 hover:bg-slate-200 rounded"
                        >
                          {copiedField === 'cpUser' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-slate-400" />}
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Password:</span>
                    <div className="flex items-center gap-1 font-mono text-slate-800">
                      <span>
                        {showPasswords['cpPass']
                          ? selectedService.credentials.cpanelPassword
                          : '••••••••••••'}
                      </span>
                      <button
                        onClick={() => togglePasswordVisibility('cpPass')}
                        className="p-1 hover:bg-slate-200 rounded"
                      >
                        {showPasswords['cpPass'] ? <EyeOff className="w-3 h-3 text-slate-400" /> : <Eye className="w-3 h-3 text-slate-400" />}
                      </button>
                      {selectedService.credentials.cpanelPassword && (
                        <button
                          onClick={() => copyToClipboard(selectedService.credentials.cpanelPassword!, 'cpPass')}
                          className="p-1 hover:bg-slate-200 rounded"
                        >
                          {copiedField === 'cpPass' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-slate-400" />}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Email Bisnis */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Mail className="w-4 h-4 text-sky-600" />
                    <span>Akses Email Bisnis ({selectedService.credentials.emailProvider || 'Webmail'})</span>
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Email:</span>
                    <div className="flex items-center gap-1 font-mono text-slate-800">
                      <span>{selectedService.credentials.emailAddress || '-'}</span>
                      {selectedService.credentials.emailAddress && (
                        <button
                          onClick={() => copyToClipboard(selectedService.credentials.emailAddress!, 'mailAddr')}
                          className="p-1 hover:bg-slate-200 rounded"
                        >
                          {copiedField === 'mailAddr' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-slate-400" />}
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Password:</span>
                    <div className="flex items-center gap-1 font-mono text-slate-800">
                      <span>
                        {showPasswords['mailPass']
                          ? selectedService.credentials.emailPassword
                          : '••••••••••••'}
                      </span>
                      <button
                        onClick={() => togglePasswordVisibility('mailPass')}
                        className="p-1 hover:bg-slate-200 rounded"
                      >
                        {showPasswords['mailPass'] ? <EyeOff className="w-3 h-3 text-slate-400" /> : <Eye className="w-3 h-3 text-slate-400" />}
                      </button>
                      {selectedService.credentials.emailPassword && (
                        <button
                          onClick={() => copyToClipboard(selectedService.credentials.emailPassword!, 'mailPass')}
                          className="p-1 hover:bg-slate-200 rounded"
                        >
                          {copiedField === 'mailPass' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-slate-400" />}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Technical Server Note */}
              <div className="text-[11px] text-slate-500 space-y-1 bg-white p-3 rounded-xl border border-slate-200">
                <p><strong>Server IP:</strong> {selectedService.credentials.serverIp || '103.145.22.88'}</p>
                <p><strong>Nameservers:</strong> {selectedService.credentials.nameservers?.join(', ') || 'ns1.naufalcloud.id, ns2.naufalcloud.id'}</p>
                {selectedService.credentials.notes && (
                  <p><strong>Catatan:</strong> {selectedService.credentials.notes}</p>
                )}
              </div>
            </div>

            <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-between items-center">
              <button
                onClick={() => handleSendCredentialsWA(selectedService)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Kirim Rekap ke WA Klien</span>
              </button>

              <button
                onClick={() => setShowCredentialsModal(false)}
                className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-semibold"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Service Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-base text-slate-900">
                Tambah Layanan Website & Kredensial Klien
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitAdd} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Pilih Klien *</label>
                  <select
                    value={form.clientId}
                    onChange={(e) => setForm({ ...form, clientId: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-indigo-500"
                  >
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.company})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Pilih Paket Produk *</label>
                  <select
                    value={form.productId}
                    onChange={(e) => {
                      const p = products.find((prod) => prod.id === e.target.value);
                      const pkg = p?.packages[0];
                      setForm({
                        ...form,
                        productId: e.target.value,
                        packageId: pkg?.id || '',
                        price: pkg?.price || 1500000,
                        billingCycle: pkg?.billingCycle || 'yearly',
                      });
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-indigo-500"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Nama Website / Bisnis *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Toko Berkah Mandiri"
                    value={form.websiteName}
                    onChange={(e) => setForm({ ...form, websiteName: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Nama Domain (URL) *</label>
                  <input
                    type="text"
                    required
                    placeholder="tokoberkah.id"
                    value={form.domain}
                    onChange={(e) => setForm({ ...form, domain: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Biaya Perpanjangan (Rp)</label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Siklus Tagihan</label>
                  <select
                    value={form.billingCycle}
                    onChange={(e) => setForm({ ...form, billingCycle: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-indigo-500"
                  >
                    <option value="yearly">Tahunan</option>
                    <option value="monthly">Bulanan</option>
                    <option value="one-time">One-Time</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Jatuh Tempo Expired</label>
                  <input
                    type="date"
                    value={form.expiryDate}
                    onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-indigo-500"
                  />
                </div>
              </div>

              {/* Credential Inputs */}
              <div className="border-t border-slate-200 pt-3 space-y-3">
                <span className="font-bold text-slate-900 block">Kredensial Login Website & Hosting</span>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-0.5">WP / CMS Admin User</label>
                    <input
                      type="text"
                      placeholder="admin_web"
                      value={form.credentials.cmsUser}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          credentials: { ...form.credentials, cmsUser: e.target.value },
                        })
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-0.5">WP / CMS Password</label>
                    <input
                      type="text"
                      placeholder="Password!2026"
                      value={form.credentials.cmsPassword}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          credentials: { ...form.credentials, cmsPassword: e.target.value },
                        })
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-0.5">cPanel Username</label>
                    <input
                      type="text"
                      placeholder="cp_user"
                      value={form.credentials.cpanelUser}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          credentials: { ...form.credentials, cpanelUser: e.target.value },
                        })
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-0.5">cPanel Password</label>
                    <input
                      type="text"
                      placeholder="cPanelPass!2026"
                      value={form.credentials.cpanelPassword}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          credentials: { ...form.credentials, cpanelPassword: e.target.value },
                        })
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Email Bisnis</label>
                    <input
                      type="text"
                      placeholder="info@domain.com"
                      value={form.credentials.emailAddress}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          credentials: { ...form.credentials, emailAddress: e.target.value },
                        })
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Password Email</label>
                    <input
                      type="text"
                      placeholder="MailPass!2026"
                      value={form.credentials.emailPassword}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          credentials: { ...form.credentials, emailPassword: e.target.value },
                        })
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm"
                >
                  Simpan Layanan & Kredensial
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
