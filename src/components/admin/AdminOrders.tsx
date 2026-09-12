import React from 'react';
import { useApp } from '../../context/AppContext';
import { formatRupiah } from '../../utils/formatters';
import { ShoppingBag, CheckCircle, Clock, ArrowRight, ExternalLink, Globe } from 'lucide-react';

interface AdminOrdersProps {
  onOpenInvoiceModal: (inv: any) => void;
}

export const AdminOrders: React.FC<AdminOrdersProps> = ({ onOpenInvoiceModal }) => {
  const { orders, invoices, updateOrderStatus } = useApp();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Manajemen Pembelian (Orders)</h2>
          <p className="text-xs text-slate-500">
            Daftar pesanan baru yang dibuat mandiri oleh pelanggan dari portal klien.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">No. Order</th>
                <th className="py-3 px-4">Pelanggan</th>
                <th className="py-3 px-4">Layanan & Paket</th>
                <th className="py-3 px-4">Domain Diminta</th>
                <th className="py-3 px-4">Waktu Order</th>
                <th className="py-3 px-4 text-right">Nilai Pesanan</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Belum ada pesanan masuk.
                  </td>
                </tr>
              ) : (
                orders.map((ord) => {
                  const inv = invoices.find((i) => i.id === ord.invoiceId);

                  return (
                    <tr key={ord.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-indigo-600">
                        {ord.orderNumber}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900">{ord.clientName}</td>
                      <td className="py-3 px-4">
                        <p className="font-medium text-slate-800">{ord.productName}</p>
                        <p className="text-[10px] text-slate-400">{ord.packageName}</p>
                      </td>
                      <td className="py-3 px-4 font-mono text-indigo-600">
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
                            ? 'Diproses'
                            : 'Menunggu Bayar'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {inv && (
                            <button
                              onClick={() => onOpenInvoiceModal(inv)}
                              className="px-2.5 py-1 text-[11px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                            >
                              Faktur
                            </button>
                          )}
                          {ord.status !== 'active' && (
                            <button
                              onClick={() => updateOrderStatus(ord.id, 'active')}
                              className="px-2.5 py-1 text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                            >
                              Aktifkan
                            </button>
                          )}
                        </div>
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
