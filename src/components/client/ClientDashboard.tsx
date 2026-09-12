import React from 'react';
import { useApp } from '../../context/AppContext';
import { formatRupiah, formatDateIndo, getDaysRemaining } from '../../utils/formatters';
import {
  Globe,
  CreditCard,
  AlertTriangle,
  Key,
  ShoppingBag,
  ExternalLink,
  ArrowRight,
  Clock,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

interface ClientDashboardProps {
  onNavigateTab: (tab: string) => void;
  onOpenInvoiceModal: (inv: any) => void;
  onOpenPaymentModal: (inv: any) => void;
}

export const ClientDashboard: React.FC<ClientDashboardProps> = ({
  onNavigateTab,
  onOpenInvoiceModal,
  onOpenPaymentModal,
}) => {
  const { activeClient, services, invoices, settings } = useApp();

  // Filter for active client
  const clientServices = services
    .filter((s) => s.clientId === activeClient?.id)
    .map((s) => ({ ...s, daysLeft: getDaysRemaining(s.expiryDate) }));

  const clientInvoices = invoices.filter((i) => i.clientId === activeClient?.id);
  const unpaidInvoices = clientInvoices.filter((i) => i.status === 'unpaid' || i.status === 'overdue');
  const totalUnpaidAmount = unpaidInvoices.reduce((sum, i) => sum + i.total, 0);

  const urgentExpiryService = clientServices.find((s) => s.daysLeft <= 14);

  return (
    <div className="space-y-6">
      {/* Welcome & Account Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-full inline-block mb-2">
            Portal Pelanggan Mandiri
          </span>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight">
            Selamat Datang, {activeClient?.name || 'Pelanggan'}!
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Kelola website bisnis Anda ({activeClient?.company}), pantau masa aktif domain & hosting, dan lakukan pembayaran perpanjangan secara mandiri.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => onNavigateTab('shop')}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-md transition-all cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Beli Layanan / Website Baru</span>
          </button>
          <button
            onClick={() => onNavigateTab('services')}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-white/10 hover:bg-white/20 text-white rounded-xl border border-white/10 transition-all"
          >
            <Key className="w-4 h-4" />
            <span>Lihat Akses Kredensial</span>
          </button>
        </div>
      </div>

      {/* Urgent Alert Banner if there are unpaid invoices */}
      {unpaidInvoices.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-amber-950">
                Pemberitahuan Tagihan Perpanjangan Menunggu Pembayaran
              </h3>
              <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                Anda memiliki <strong>{unpaidInvoices.length} tagihan</strong> sebesar{' '}
                <strong className="font-mono text-amber-950 font-bold">{formatRupiah(totalUnpaidAmount)}</strong> yang belum lunas.
                {urgentExpiryService && (
                  <span> Layanan <strong>{urgentExpiryService.websiteName}</strong> akan habis masa berlakunya dalam {urgentExpiryService.daysLeft} hari.</span>
                )}
              </p>
            </div>
          </div>

          <button
            onClick={() => onOpenPaymentModal(unpaidInvoices[0])}
            className="w-full sm:w-auto px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm flex items-center justify-center gap-1.5 shrink-0 transition-colors cursor-pointer"
          >
            <CreditCard className="w-4 h-4" />
            <span>Bayar Mandiri Sekarang (QRIS / VA)</span>
          </button>
        </div>
      )}

      {/* Quick KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Website Aktif Anda</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Globe className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 tracking-tight">
            {clientServices.length} Website
          </p>
          <p className="text-[11px] text-slate-500">
            Hosting & SSL berjalan normal 100%
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Tagihan Menunggu Bayar</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-600 font-mono tracking-tight">
            {formatRupiah(totalUnpaidAmount)}
          </p>
          <p className="text-[11px] text-slate-500">
            {unpaidInvoices.length} tagihan belum lunas
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Bantuan & Dukungan Teknis</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-base font-bold text-slate-900 truncate">
            {settings.brandName}
          </p>
          <a
            href={`https://wa.me/${settings.phone}`}
            target="_blank"
            rel="noreferrer"
            className="text-[11px] text-emerald-700 hover:underline font-bold inline-flex items-center gap-1"
          >
            <span>WhatsApp Support (+{settings.phone})</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Active Websites & Credential Preview */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-sm text-slate-900">Website & Layanan Aktif Anda</h3>
            <p className="text-xs text-slate-500">
              Pantau tanggal perpanjangan domain dan akses kredensial login CMS atau cPanel Anda.
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('services')}
            className="text-xs text-emerald-700 hover:text-emerald-900 font-semibold flex items-center gap-1"
          >
            <span>Buka Vault Kredensial Lengkap</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {clientServices.map((srv) => {
            const isOverdue = srv.daysLeft < 0;
            const isExpiring = srv.daysLeft <= 30 && srv.daysLeft >= 0;

            return (
              <div
                key={srv.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{srv.websiteName}</h4>
                      <a
                        href={srv.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-mono text-indigo-600 hover:underline flex items-center gap-1 mt-0.5"
                      >
                        <span>{srv.domain}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isOverdue
                          ? 'bg-rose-100 text-rose-800'
                          : isExpiring
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {isOverdue ? 'Masa Aktif Habis' : isExpiring ? `Sisa ${srv.daysLeft} Hari` : 'Aktif'}
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs bg-white p-2.5 rounded-lg border border-slate-200">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Jatuh Tempo Perpanjangan:</span>
                      <span className={`font-semibold ${isOverdue ? 'text-rose-600 font-bold' : 'text-slate-800'}`}>
                        {formatDateIndo(srv.expiryDate)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Biaya Perpanjangan:</span>
                      <span className="font-mono font-bold text-slate-900">
                        {formatRupiah(srv.price)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs">
                  <button
                    onClick={() => onNavigateTab('services')}
                    className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 text-[11px]"
                  >
                    <Key className="w-3.5 h-3.5" />
                    <span>Lihat Akses WP-Admin / cPanel</span>
                  </button>

                  <button
                    onClick={() => {
                      const relatedInv = invoices.find(
                        (i) => i.serviceId === srv.id && i.status !== 'paid'
                      );
                      if (relatedInv) {
                        onOpenPaymentModal(relatedInv);
                      } else {
                        onNavigateTab('invoices');
                      }
                    }}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] shadow-xs"
                  >
                    Perpanjang Mandiri
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
