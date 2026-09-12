import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ClientService } from '../../types';
import { formatRupiah, formatDateIndo, getDaysRemaining } from '../../utils/formatters';
import {
  Globe,
  Key,
  Eye,
  EyeOff,
  Copy,
  Check,
  Shield,
  Server,
  Mail,
  ExternalLink,
  RotateCw,
  AlertTriangle,
  HelpCircle,
  MessageCircle,
  X,
  Tag,
  Sparkles,
  Percent,
  Coins,
  Calendar,
} from 'lucide-react';

interface ClientServicesProps {
  onOpenPaymentModal: (inv: any) => void;
}

export const ClientServices: React.FC<ClientServicesProps> = ({ onOpenPaymentModal }) => {
  const { activeClient, services, invoices, coupons, applyCouponCode, createRenewalInvoice, settings } = useApp();

  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Renewal Modal State
  const [renewModalService, setRenewModalService] = useState<ClientService | null>(null);
  const [renewDurationMonths, setRenewDurationMonths] = useState<number>(12);
  const [renewCouponCode, setRenewCouponCode] = useState<string>('');
  const [renewAppliedCoupon, setRenewAppliedCoupon] = useState<{
    code: string;
    discount: number;
    discountType: string;
    message: string;
  } | null>(null);
  const [renewCouponError, setRenewCouponError] = useState<string>('');
  const [renewNotes, setRenewNotes] = useState<string>('');

  const clientServices = services
    .filter((s) => s.clientId === activeClient?.id)
    .map((s) => ({ ...s, daysLeft: getDaysRemaining(s.expiryDate) }));

  const togglePassword = (key: string) => {
    setShowPasswords((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const calculateRenewBasePrice = (service: ClientService, months: number) => {
    if (service.billingCycle === 'monthly') {
      return service.price * months;
    }
    if (months === 24) {
      return Math.round(service.price * 1.85); // 2-year package discount
    }
    if (months === 6) {
      return Math.round(service.price * 0.55);
    }
    return service.price;
  };

  const handleOpenRenewModal = (service: ClientService) => {
    // Check if there is already an unpaid invoice for this service
    const existingUnpaid = invoices.find((i) => i.serviceId === service.id && i.status !== 'paid');
    if (existingUnpaid) {
      onOpenPaymentModal(existingUnpaid);
      return;
    }

    setRenewModalService(service);
    setRenewDurationMonths(12);
    setRenewCouponCode('');
    setRenewAppliedCoupon(null);
    setRenewCouponError('');
    setRenewNotes('');
  };

  const handleApplyRenewCoupon = (codeToTry?: string) => {
    if (!renewModalService) return;
    setRenewCouponError('');

    const targetCode = (codeToTry || renewCouponCode).trim().toUpperCase();
    if (!targetCode) {
      setRenewCouponError('Masukkan kode kupon terlebih dahulu.');
      setRenewAppliedCoupon(null);
      return;
    }

    const basePrice = calculateRenewBasePrice(renewModalService, renewDurationMonths);
    const result = applyCouponCode(targetCode, basePrice, 'renewal');

    if (!result.valid) {
      setRenewCouponError(result.message);
      setRenewAppliedCoupon(null);
    } else {
      setRenewCouponCode(targetCode);
      setRenewAppliedCoupon({
        code: targetCode,
        discount: result.discount,
        discountType: result.coupon?.discountType || 'percentage',
        message: result.message,
      });
    }
  };

  const handleConfirmRenewal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!renewModalService) return;

    const result = createRenewalInvoice({
      serviceId: renewModalService.id,
      durationMonths: renewDurationMonths,
      couponCode: renewAppliedCoupon ? renewAppliedCoupon.code : undefined,
      notes: renewNotes,
    });

    setRenewModalService(null);
    onOpenPaymentModal(result.invoice);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Layanan Website & Akses Kredensial Saya
        </h2>
        <p className="text-xs text-slate-500">
          Catatan lengkap akses website, login dashboard WordPress, hosting cPanel, serta email bisnis Anda.
        </p>
      </div>

      {clientServices.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center space-y-3">
          <Globe className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-sm">Belum Ada Layanan Website</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Anda belum memiliki website aktif. Silakan pilih paket website kami di menu Beli Layanan.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {clientServices.map((service) => {
            const isOverdue = service.daysLeft < 0;
            const isExpiring = service.daysLeft <= 30 && service.daysLeft >= 0;

            return (
              <div
                key={service.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden"
              >
                {/* Header Banner */}
                <div className="bg-slate-900 text-white p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-black">{service.websiteName}</h3>
                      <a
                        href={service.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-slate-400 hover:text-emerald-400"
                        title="Buka Website"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                    <span className="font-mono text-emerald-400 text-xs mt-0.5 block">
                      {service.domain}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full ${
                        isOverdue
                          ? 'bg-rose-500 text-white'
                          : isExpiring
                          ? 'bg-amber-400 text-slate-950'
                          : 'bg-emerald-500 text-white'
                      }`}
                    >
                      {isOverdue
                        ? 'Expired'
                        : isExpiring
                        ? `Sisa ${service.daysLeft} Hari`
                        : 'Masa Aktif Normal'}
                    </span>

                    <button
                      onClick={() => handleOpenRenewModal(service)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                      <span>Perpanjang Sekarang</span>
                    </button>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-6 space-y-6 text-xs">
                  {/* Status Box */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">Paket Layanan</span>
                      <span className="font-bold text-slate-800">{service.packageName}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">Jatuh Tempo Perpanjangan</span>
                      <span className={`font-bold ${isOverdue ? 'text-rose-600' : 'text-slate-900'}`}>
                        {formatDateIndo(service.expiryDate)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">Biaya Perpanjangan</span>
                      <span className="font-mono font-bold text-slate-900">
                        {formatRupiah(service.price)} / tahun
                      </span>
                    </div>
                  </div>

                  {/* Vault 3 Column Cards */}
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs mb-3 flex items-center gap-1.5">
                      <Key className="w-4 h-4 text-emerald-600" />
                      <span>Kredensial Login Akses Mandiri</span>
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* WP-Admin Login */}
                      <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2.5">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                          <span className="font-bold text-slate-900 flex items-center gap-1.5">
                            <Shield className="w-3.5 h-3.5 text-indigo-600" />
                            <span>Akses WordPress (CMS)</span>
                          </span>
                          {service.credentials.cmsAdminUrl && (
                            <a
                              href={service.credentials.cmsAdminUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-indigo-600 hover:underline flex items-center gap-0.5 text-[11px]"
                            >
                              <span>Login</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center">
                            <span className="text-slate-400 text-[11px]">User:</span>
                            <div className="flex items-center gap-1 font-mono font-medium text-slate-800">
                              <span>{service.credentials.cmsUser || '-'}</span>
                              {service.credentials.cmsUser && (
                                <button
                                  onClick={() => copyText(service.credentials.cmsUser!, `u-${service.id}`)}
                                  className="p-1 hover:bg-slate-100 rounded"
                                >
                                  {copiedKey === `u-${service.id}` ? (
                                    <Check className="w-3 h-3 text-emerald-600" />
                                  ) : (
                                    <Copy className="w-3 h-3 text-slate-400" />
                                  )}
                                </button>
                              )}
                            </div>
                          </div>

                          <div className="flex justify-between items-center">
                            <span className="text-slate-400 text-[11px]">Password:</span>
                            <div className="flex items-center gap-1 font-mono font-medium text-slate-800">
                              <span>
                                {showPasswords[`wp-${service.id}`]
                                  ? service.credentials.cmsPassword
                                  : '••••••••••••'}
                              </span>
                              <button
                                onClick={() => togglePassword(`wp-${service.id}`)}
                                className="p-1 hover:bg-slate-100 rounded"
                              >
                                {showPasswords[`wp-${service.id}`] ? (
                                  <EyeOff className="w-3 h-3 text-slate-400" />
                                ) : (
                                  <Eye className="w-3 h-3 text-slate-400" />
                                )}
                              </button>
                              {service.credentials.cmsPassword && (
                                <button
                                  onClick={() => copyText(service.credentials.cmsPassword!, `p-${service.id}`)}
                                  className="p-1 hover:bg-slate-100 rounded"
                                >
                                  {copiedKey === `p-${service.id}` ? (
                                    <Check className="w-3 h-3 text-emerald-600" />
                                  ) : (
                                    <Copy className="w-3 h-3 text-slate-400" />
                                  )}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* cPanel Login */}
                      <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2.5">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                          <span className="font-bold text-slate-900 flex items-center gap-1.5">
                            <Server className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Akses cPanel Hosting</span>
                          </span>
                          {service.credentials.cpanelUrl && (
                            <a
                              href={service.credentials.cpanelUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-emerald-700 hover:underline flex items-center gap-0.5 text-[11px]"
                            >
                              <span>Login</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center">
                            <span className="text-slate-400 text-[11px]">User:</span>
                            <div className="flex items-center gap-1 font-mono font-medium text-slate-800">
                              <span>{service.credentials.cpanelUser || '-'}</span>
                              {service.credentials.cpanelUser && (
                                <button
                                  onClick={() => copyText(service.credentials.cpanelUser!, `cpu-${service.id}`)}
                                  className="p-1 hover:bg-slate-100 rounded"
                                >
                                  {copiedKey === `cpu-${service.id}` ? (
                                    <Check className="w-3 h-3 text-emerald-600" />
                                  ) : (
                                    <Copy className="w-3 h-3 text-slate-400" />
                                  )}
                                </button>
                              )}
                            </div>
                          </div>

                          <div className="flex justify-between items-center">
                            <span className="text-slate-400 text-[11px]">Password:</span>
                            <div className="flex items-center gap-1 font-mono font-medium text-slate-800">
                              <span>
                                {showPasswords[`cp-${service.id}`]
                                  ? service.credentials.cpanelPassword
                                  : '••••••••••••'}
                              </span>
                              <button
                                onClick={() => togglePassword(`cp-${service.id}`)}
                                className="p-1 hover:bg-slate-100 rounded"
                              >
                                {showPasswords[`cp-${service.id}`] ? (
                                  <EyeOff className="w-3 h-3 text-slate-400" />
                                ) : (
                                  <Eye className="w-3 h-3 text-slate-400" />
                                )}
                              </button>
                              {service.credentials.cpanelPassword && (
                                <button
                                  onClick={() => copyText(service.credentials.cpanelPassword!, `cpp-${service.id}`)}
                                  className="p-1 hover:bg-slate-100 rounded"
                                >
                                  {copiedKey === `cpp-${service.id}` ? (
                                    <Check className="w-3 h-3 text-emerald-600" />
                                  ) : (
                                    <Copy className="w-3 h-3 text-slate-400" />
                                  )}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Email Bisnis */}
                      <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2.5">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                          <span className="font-bold text-slate-900 flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-sky-600" />
                            <span>Akses Email Bisnis</span>
                          </span>
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center">
                            <span className="text-slate-400 text-[11px]">Email:</span>
                            <div className="flex items-center gap-1 font-mono font-medium text-slate-800">
                              <span className="truncate max-w-[140px]">{service.credentials.emailAddress || '-'}</span>
                              {service.credentials.emailAddress && (
                                <button
                                  onClick={() => copyText(service.credentials.emailAddress!, `ea-${service.id}`)}
                                  className="p-1 hover:bg-slate-100 rounded"
                                >
                                  {copiedKey === `ea-${service.id}` ? (
                                    <Check className="w-3 h-3 text-emerald-600" />
                                  ) : (
                                    <Copy className="w-3 h-3 text-slate-400" />
                                  )}
                                </button>
                              )}
                            </div>
                          </div>

                          <div className="flex justify-between items-center">
                            <span className="text-slate-400 text-[11px]">Password:</span>
                            <div className="flex items-center gap-1 font-mono font-medium text-slate-800">
                              <span>
                                {showPasswords[`em-${service.id}`]
                                  ? service.credentials.emailPassword
                                  : '••••••••••••'}
                              </span>
                              <button
                                onClick={() => togglePassword(`em-${service.id}`)}
                                className="p-1 hover:bg-slate-100 rounded"
                              >
                                {showPasswords[`em-${service.id}`] ? (
                                  <EyeOff className="w-3 h-3 text-slate-400" />
                                ) : (
                                  <Eye className="w-3 h-3 text-slate-400" />
                                )}
                              </button>
                              {service.credentials.emailPassword && (
                                <button
                                  onClick={() => copyText(service.credentials.emailPassword!, `emp-${service.id}`)}
                                  className="p-1 hover:bg-slate-100 rounded"
                                >
                                  {copiedKey === `emp-${service.id}` ? (
                                    <Check className="w-3 h-3 text-emerald-600" />
                                  ) : (
                                    <Copy className="w-3 h-3 text-slate-400" />
                                  )}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Technical Server Info & Support */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="text-[11px] text-slate-500 space-y-0.5">
                      <p><strong>Server IP:</strong> {service.credentials.serverIp || '103.145.22.88'}</p>
                      <p><strong>Nameservers:</strong> {service.credentials.nameservers?.join(', ') || 'ns1.naufalcloud.id, ns2.naufalcloud.id'}</p>
                    </div>

                    <a
                      href={`https://wa.me/${settings.phone}?text=Halo%20${encodeURIComponent(settings.freelancerName)},%20saya%20butuh%20bantuan%20terkait%20website%20${encodeURIComponent(service.domain)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-lg flex items-center gap-1.5 transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Hubungi Pengembang Website</span>
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Renewal Checkout Modal with Automated Coupons */}
      {renewModalService && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 my-auto">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-1">
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Perpanjangan Layanan Mandiri</span>
                </span>
                <h3 className="font-bold text-base text-slate-900">
                  {renewModalService.websiteName}
                </h3>
                <span className="font-mono text-xs text-slate-500">{renewModalService.domain}</span>
              </div>
              <button
                onClick={() => setRenewModalService(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmRenewal} className="space-y-4 text-xs">
              {/* Service Info Banner */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-600">Paket Website:</span>
                  <span className="font-semibold text-slate-900">{renewModalService.packageName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Jatuh Tempo Saat Ini:</span>
                  <span className="font-medium text-amber-700">{formatDateIndo(renewModalService.expiryDate)}</span>
                </div>
              </div>

              {/* Renewal Duration Selector */}
              <div>
                <label className="block font-semibold text-slate-800 mb-1.5">
                  Pilih Durasi Perpanjangan *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { months: 6, label: '6 Bulan', desc: 'Fleksibel' },
                    { months: 12, label: '1 Tahun', desc: 'Standar (Direkomendasikan)' },
                    { months: 24, label: '2 Tahun', desc: 'Paket Hemat Diskon' },
                  ].map((dur) => {
                    const price = calculateRenewBasePrice(renewModalService, dur.months);
                    const isSelected = renewDurationMonths === dur.months;
                    return (
                      <button
                        key={dur.months}
                        type="button"
                        onClick={() => {
                          setRenewDurationMonths(dur.months);
                          setRenewAppliedCoupon(null);
                          setRenewCouponError('');
                        }}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-500/20'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="font-bold text-slate-900 text-xs">{dur.label}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">{dur.desc}</div>
                        <div className="font-mono font-bold text-slate-900 text-xs mt-2">
                          {formatRupiah(price)}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Coupon Code Section */}
              <div className="border-t border-slate-200 pt-3">
                <div className="flex justify-between items-center mb-1">
                  <label className="font-semibold text-slate-700 text-xs flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Kupon Promo Perpanjangan</span>
                  </label>
                  {renewAppliedCoupon && (
                    <button
                      type="button"
                      onClick={() => {
                        setRenewAppliedCoupon(null);
                        setRenewCouponCode('');
                        setRenewCouponError('');
                      }}
                      className="text-[11px] text-rose-500 hover:underline cursor-pointer"
                    >
                      Hapus Kupon
                    </button>
                  )}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Contoh: SETIA2026 / RENEWAL100K"
                    value={renewCouponCode}
                    onChange={(e) => {
                      setRenewCouponCode(e.target.value.toUpperCase());
                      setRenewCouponError('');
                    }}
                    className="flex-1 px-3 py-2 uppercase font-mono font-bold rounded-xl border border-slate-300 focus:outline-emerald-500 bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => handleApplyRenewCoupon()}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl cursor-pointer text-xs transition-colors"
                  >
                    Terapkan
                  </button>
                </div>

                {renewAppliedCoupon && (
                  <div className="mt-2 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] text-emerald-800 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-semibold">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{renewAppliedCoupon.message}</span>
                    </div>
                    <span className="font-mono font-bold text-emerald-700">
                      -{formatRupiah(renewAppliedCoupon.discount)}
                    </span>
                  </div>
                )}

                {renewCouponError && (
                  <p className="text-rose-600 text-[11px] mt-1 font-medium">{renewCouponError}</p>
                )}

                {/* Available Renewal Coupons Clickable List */}
                {coupons.filter(
                  (c) =>
                    c.isActive &&
                    (c.applicableTo === 'all' || c.applicableTo === 'renewal') &&
                    (!c.validUntil || c.validUntil >= new Date().toISOString().substring(0, 10))
                ).length > 0 && (
                  <div className="mt-2 pt-2 border-t border-dashed border-slate-200">
                    <span className="text-[10px] text-slate-500 font-medium block mb-1">
                      Kupon perpanjangan yang tersedia:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {coupons
                        .filter(
                          (c) =>
                            c.isActive &&
                            (c.applicableTo === 'all' || c.applicableTo === 'renewal') &&
                            (!c.validUntil || c.validUntil >= new Date().toISOString().substring(0, 10))
                        )
                        .map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => handleApplyRenewCoupon(c.code)}
                            className="px-2 py-0.5 rounded-lg border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-800 font-mono text-[10px] font-bold transition-colors cursor-pointer"
                          >
                            {c.code} ({c.discountType === 'fixed' ? `-${formatRupiah(c.discountValue)}` : `-${c.discountValue || c.discountPercent}%`})
                          </button>
                        ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Price Calculation Summary */}
              {(() => {
                const basePrice = calculateRenewBasePrice(renewModalService, renewDurationMonths);
                const discount = renewAppliedCoupon ? renewAppliedCoupon.discount : 0;
                const finalTotal = Math.max(0, basePrice - discount);

                return (
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5">
                    <div className="flex justify-between text-slate-600">
                      <span>Biaya Perpanjangan:</span>
                      <span className="font-mono">{formatRupiah(basePrice)}</span>
                    </div>
                    {renewAppliedCoupon && (
                      <div className="flex justify-between text-emerald-600 font-medium">
                        <span>Potongan Diskon Kupon ({renewAppliedCoupon.code}):</span>
                        <span className="font-mono font-bold">-{formatRupiah(discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center pt-2 border-t border-slate-200 text-sm font-bold text-slate-900">
                      <span>Total Tagihan:</span>
                      <span className="font-mono text-base text-emerald-700">
                        {formatRupiah(finalTotal)}
                      </span>
                    </div>
                  </div>
                );
              })()}

              <div>
                <label className="block font-medium text-slate-700 mb-1">Catatan (Opsional)</label>
                <input
                  type="text"
                  placeholder="Catatan tambahan untuk perpanjangan domain & hosting"
                  value={renewNotes}
                  onChange={(e) => setRenewNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-emerald-500 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setRenewModalService(null)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Lanjut ke Pembayaran Mandiri
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
