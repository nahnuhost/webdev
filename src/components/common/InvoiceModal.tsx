import React from 'react';
import { Invoice } from '../../types';
import { useApp } from '../../context/AppContext';
import { formatRupiah, formatDateIndo } from '../../utils/formatters';
import { Printer, X, CheckCircle, Clock, AlertTriangle, CreditCard, ShieldCheck } from 'lucide-react';

interface InvoiceModalProps {
  invoice: Invoice | null;
  onClose: () => void;
  onPayNow?: (invoice: Invoice) => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ invoice, onClose, onPayNow }) => {
  const { settings, clients } = useApp();

  if (!invoice) return null;

  const client = clients.find((c) => c.id === invoice.clientId);

  const handlePrint = () => {
    window.print();
  };

  const getStatusBadge = (status: Invoice['status']) => {
    switch (status) {
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle className="w-3.5 h-3.5" /> LUNAS
          </span>
        );
      case 'overdue':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
            <AlertTriangle className="w-3.5 h-3.5" /> JATUH TEMPO (OVERDUE)
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800 border border-slate-300">
            DIBATALKAN
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <Clock className="w-3.5 h-3.5" /> MENUNGGU PEMBAYARAN
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto">
        {/* Top bar controls */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Dokumen Tagihan Resmi
            </span>
            <span className="text-xs text-slate-300">#{invoice.invoiceNumber}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Invoice Printable Sheet */}
        <div className="p-6 sm:p-8 space-y-6 text-slate-800">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b border-slate-200">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                {settings.brandName}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">{settings.tagline}</p>
              <div className="text-xs text-slate-600 mt-2 space-y-0.5">
                <p>{settings.address}</p>
                <p>Email: {settings.email} | WA: +{settings.phone}</p>
              </div>
            </div>
            <div className="sm:text-right">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">FAKTUR TAGIHAN</h1>
              <p className="text-xs font-mono font-bold text-indigo-600 mt-1">
                {invoice.invoiceNumber}
              </p>
              <div className="mt-2">{getStatusBadge(invoice.status)}</div>
            </div>
          </div>

          {/* Client & Date Meta */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Ditagihkan Kepada:
              </span>
              <p className="font-bold text-slate-900 text-sm">{invoice.clientName}</p>
              <p className="text-slate-600 font-medium">{client?.company}</p>
              <p className="text-slate-500 mt-1">{client?.address}</p>
              <p className="text-slate-500">{client?.email} | +{client?.phone}</p>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Tanggal Terbit:</span>
                <span className="font-semibold text-slate-800">{formatDateIndo(invoice.issueDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Jatuh Tempo:</span>
                <span className="font-bold text-rose-600">{formatDateIndo(invoice.dueDate)}</span>
              </div>
              {invoice.paidDate && (
                <div className="flex justify-between pt-1 border-t border-slate-200">
                  <span className="text-slate-500">Tanggal Bayar:</span>
                  <span className="font-semibold text-emerald-700">{formatDateIndo(invoice.paidDate)}</span>
                </div>
              )}
              {invoice.paymentMethod && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Metode Bayar:</span>
                  <span className="font-medium text-slate-800">{invoice.paymentMethod}</span>
                </div>
              )}
            </div>
          </div>

          {/* Items Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/80 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px]">
                <tr>
                  <th className="py-2.5 px-4">Deskripsi Layanan</th>
                  <th className="py-2.5 px-3 text-center">Qty</th>
                  <th className="py-2.5 px-4 text-right">Harga Satuan</th>
                  <th className="py-2.5 px-4 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoice.items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-900">{item.description}</p>
                    </td>
                    <td className="py-3 px-3 text-center text-slate-600">{item.quantity}</td>
                    <td className="py-3 px-4 text-right text-slate-600 font-mono">
                      {formatRupiah(item.unitPrice)}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900 font-mono">
                      {formatRupiah(item.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Calculation */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div className="text-xs text-slate-500 max-w-xs space-y-1">
              <p className="font-semibold text-slate-700">Catatan:</p>
              <p className="leading-relaxed">
                {invoice.notes || 'Pembayaran dapat dilakukan melalui QRIS instan atau Transfer Virtual Account secara mandiri.'}
              </p>
            </div>

            <div className="w-full sm:w-64 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-mono font-medium">{formatRupiah(invoice.subtotal)}</span>
              </div>
              {invoice.discount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Diskon Promo {invoice.couponCode ? `(${invoice.couponCode})` : ''}:</span>
                  <span className="font-mono font-medium">- {formatRupiah(invoice.discount)}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-slate-300 text-sm font-bold text-slate-900">
                <span>Total Tagihan:</span>
                <span className="font-mono text-base text-indigo-700">{formatRupiah(invoice.total)}</span>
              </div>
            </div>
          </div>

          {/* Payment Info / Bank Instructions */}
          {invoice.status !== 'paid' && (
            <div className="bg-indigo-50/60 p-4 rounded-xl border border-indigo-100 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-indigo-900 mb-2">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                <span>Instruksi Pembayaran Mandiri:</span>
              </div>
              <p className="text-slate-600 mb-2">
                Pelanggan dapat melakukan verifikasi pembayaran instan via Payment Gateway (QRIS, VA Bank) langsung melalui portal klien.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700">
                {settings.bankAccounts.slice(0, 2).map((acc, idx) => (
                  <div key={idx} className="bg-white p-2.5 rounded-lg border border-indigo-100">
                    <p className="font-bold text-slate-900">{acc.bank}</p>
                    <p className="font-mono text-indigo-700 font-semibold">{acc.accountNumber}</p>
                    <p className="text-[11px] text-slate-500">a.n {acc.accountHolder}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex flex-wrap justify-between items-center gap-3 print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Tutup
          </button>

          {invoice.status !== 'paid' && onPayNow && (
            <button
              onClick={() => {
                onClose();
                onPayNow(invoice);
              }}
              className="flex items-center gap-2 px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm transition-all"
            >
              <CreditCard className="w-4 h-4" />
              <span>Bayar Mandiri Sekarang (QRIS / VA)</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
