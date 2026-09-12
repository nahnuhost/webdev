import React from 'react';
import { useApp } from '../../context/AppContext';
import { formatRupiah } from '../../utils/formatters';
import { CreditCard, CheckCircle, Clock, ShieldCheck, Zap, ArrowUpRight } from 'lucide-react';

export const AdminPayments: React.FC = () => {
  const { transactions, settings, simulatePaymentSuccess } = useApp();

  const totalSuccess = transactions
    .filter((t) => t.status === 'success')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Manajemen Pembayaran & Log Gateway
          </h2>
          <p className="text-xs text-slate-500">
            Log transaksi real-time dari Payment Gateway ({settings.paymentGateway.provider.toUpperCase()}), Virtual Account, dan QRIS.
          </p>
        </div>
      </div>

      {/* Gateway Status Banner */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-emerald-900">
              Payment Gateway {settings.paymentGateway.provider.toUpperCase()} Otomatis: Aktif
            </h4>
            <p className="text-[11px] text-emerald-700">
              Webhook auto-settlement aktif. Setiap pembayaran QRIS & VA akan langsung memperbarui status invoice.
            </p>
          </div>
        </div>

        <span className="font-mono text-xs font-bold text-emerald-800 bg-white px-3 py-1.5 rounded-lg border border-emerald-200">
          Akumulasi Lunas: {formatRupiah(totalSuccess)}
        </span>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">No. Transaksi</th>
                <th className="py-3 px-4">Faktur Terkait</th>
                <th className="py-3 px-4">Pelanggan</th>
                <th className="py-3 px-4">Metode / Channel</th>
                <th className="py-3 px-4">Ref Gateway</th>
                <th className="py-3 px-4 text-right">Nominal</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4">Waktu Selesai</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Belum ada transaksi pembayaran.
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-indigo-600">
                      {tx.transactionNumber}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-800">{tx.invoiceNumber}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{tx.clientName}</td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-slate-700">{tx.channelName}</span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">
                      {tx.gatewayRef}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                      {formatRupiah(tx.amount)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          tx.status === 'success'
                            ? 'bg-emerald-100 text-emerald-800'
                            : tx.status === 'failed'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {tx.status === 'success' ? 'Berhasil' : tx.status === 'failed' ? 'Gagal' : 'Pending'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-[11px]">
                      {tx.paidAt || tx.createdAt}
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
