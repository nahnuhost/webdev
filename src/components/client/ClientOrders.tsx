import React from 'react';
import { useApp } from '../../context/AppContext';
import { formatRupiah } from '../../utils/formatters';
import { ShoppingBag, Globe, CheckCircle2, Clock, FileText } from 'lucide-react';

interface ClientOrdersProps {
  onOpenInvoiceModal: (inv: any) => void;
}

export const ClientOrders: React.FC<ClientOrdersProps> = ({ onOpenInvoiceModal }) => {
  const { activeClient, orders, invoices } = useApp();

  const clientOrders = orders.filter((o) => o.clientId === activeClient?.id);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Riwayat Pembelian Layanan</h2>
        <p className="text-xs text-slate-500">
          Daftar seluruh pesanan website dan paket pemeliharaan yang pernah Anda beli secara mandiri.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">No. Pesanan</th>
                <th className="py-3 px-4">Layanan & Paket</th>
                <th className="py-3 px-4">Domain Terkait</th>
                <th className="py-3 px-4">Tanggal Pesan</th>
                <th className="py-3 px-4 text-right">Total Biaya</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {clientOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Belum ada riwayat pembelian.
                  </td>
                </tr>
              ) : (
                clientOrders.map((ord) => {
                  const inv = invoices.find((i) => i.id === ord.invoiceId);

                  return (
                    <tr key={ord.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-emerald-600">
                        {ord.orderNumber}
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-slate-900">{ord.productName}</p>
                        <p className="text-[10px] text-slate-400">{ord.packageName}</p>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-700">
                        <span className="flex items-center gap-1">
                          <Globe className="w-3 h-3 text-slate-400" />
                          <span>{ord.requestedDomain}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500">{ord.createdAt}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                        {formatRupiah(ord.price)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            ord.status === 'active'
                              ? 'bg-emerald-100 text-emerald-800'
                              : ord.status === 'processing'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {ord.status === 'active'
                            ? 'Aktif'
                            : ord.status === 'processing'
                            ? 'Sedang Diproses'
                            : 'Menunggu Pembayaran'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {inv && (
                          <button
                            onClick={() => onOpenInvoiceModal(inv)}
                            className="px-2.5 py-1 text-[11px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors inline-flex items-center gap-1"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Lihat Faktur</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
