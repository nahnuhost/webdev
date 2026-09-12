import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Invoice } from '../../types';
import { formatRupiah, formatDateIndo } from '../../utils/formatters';
import {
  FileText,
  CreditCard,
  CheckCircle,
  Clock,
  AlertTriangle,
  Printer,
  Search,
} from 'lucide-react';

interface ClientInvoicesProps {
  onOpenInvoiceModal: (inv: Invoice) => void;
  onOpenPaymentModal: (inv: Invoice) => void;
}

export const ClientInvoices: React.FC<ClientInvoicesProps> = ({
  onOpenInvoiceModal,
  onOpenPaymentModal,
}) => {
  const { activeClient, invoices } = useApp();
  const [filter, setFilter] = useState<'all' | 'unpaid' | 'paid'>('all');

  const clientInvoices = invoices.filter((i) => i.clientId === activeClient?.id);
  const filtered = clientInvoices.filter((i) => {
    if (filter === 'all') return true;
    if (filter === 'unpaid') return i.status === 'unpaid' || i.status === 'overdue';
    if (filter === 'paid') return i.status === 'paid';
    return true;
  });

  const totalUnpaid = clientInvoices
    .filter((i) => i.status === 'unpaid' || i.status === 'overdue')
    .reduce((sum, i) => sum + i.total, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Tagihan & Faktur Saya</h2>
          <p className="text-xs text-slate-500">
            Daftar seluruh invoice pembuatan website dan perpanjangan langganan.
          </p>
        </div>

        <div className="flex gap-1.5 p-1 bg-white rounded-xl border border-slate-200 text-xs">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              filter === 'all' ? 'bg-emerald-50 text-emerald-800 font-bold' : 'text-slate-600'
            }`}
          >
            Semua ({clientInvoices.length})
          </button>
          <button
            onClick={() => setFilter('unpaid')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              filter === 'unpaid' ? 'bg-amber-50 text-amber-800 font-bold' : 'text-slate-600'
            }`}
          >
            Belum Lunas
          </button>
          <button
            onClick={() => setFilter('paid')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              filter === 'paid' ? 'bg-emerald-50 text-emerald-800 font-bold' : 'text-slate-600'
            }`}
          >
            Lunas
          </button>
        </div>
      </div>

      {totalUnpaid > 0 && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-xs text-amber-900">
            <Clock className="w-4 h-4 text-amber-600" />
            <span>
              Total tagihan belum terbayar:{' '}
              <strong className="font-mono text-sm font-bold">{formatRupiah(totalUnpaid)}</strong>
            </span>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">No. Invoice</th>
                <th className="py-3 px-4">Deskripsi / Website</th>
                <th className="py-3 px-4">Tanggal Terbit</th>
                <th className="py-3 px-4">Jatuh Tempo</th>
                <th className="py-3 px-4 text-right">Total Tagihan</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Tidak ada data tagihan.
                  </td>
                </tr>
              ) : (
                filtered.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-indigo-600">
                      {inv.invoiceNumber}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">
                      {inv.websiteName || inv.items[0]?.description || 'Layanan Website'}
                    </td>
                    <td className="py-3 px-4 text-slate-500">{formatDateIndo(inv.issueDate)}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`font-semibold ${
                          inv.status === 'overdue'
                            ? 'text-rose-600'
                            : inv.status === 'unpaid'
                            ? 'text-amber-600'
                            : 'text-slate-600'
                        }`}
                      >
                        {formatDateIndo(inv.dueDate)}
                      </span>
                    </td>
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
                        {inv.status === 'paid'
                          ? 'Lunas'
                          : inv.status === 'overdue'
                          ? 'Overdue'
                          : 'Belum Lunas'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onOpenInvoiceModal(inv)}
                          className="px-2.5 py-1 text-[11px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors flex items-center gap-1"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Faktur</span>
                        </button>

                        {inv.status !== 'paid' && (
                          <button
                            onClick={() => onOpenPaymentModal(inv)}
                            className="px-3 py-1 text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>Bayar Mandiri</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
