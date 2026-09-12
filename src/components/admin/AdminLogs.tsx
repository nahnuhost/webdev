import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Activity, Shield, FileText, ShoppingBag, CreditCard, Key, Filter } from 'lucide-react';

export const AdminLogs: React.FC = () => {
  const { logs } = useApp();
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const filteredLogs = logs.filter((log) => {
    if (filterCategory === 'all') return true;
    return log.category === filterCategory;
  });

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'billing':
        return <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-[10px] font-bold">Billing</span>;
      case 'payment':
        return <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold">Payment</span>;
      case 'service':
        return <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-[10px] font-bold">Service</span>;
      case 'credential':
        return <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded text-[10px] font-bold">Akses Kredensial</span>;
      case 'order':
        return <span className="bg-sky-100 text-sky-800 px-2 py-0.5 rounded text-[10px] font-bold">Pesanan</span>;
      default:
        return <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-[10px] font-bold">Sistem</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Log Aktifitas & Riwayat Audit</h2>
          <p className="text-xs text-slate-500">
            Jejak aktivitas pembuatan invoice, pembayaran gateway, pesanan baru, dan akses kredensial.
          </p>
        </div>

        <div className="flex gap-1.5 p-1 bg-white rounded-xl border border-slate-200 text-xs">
          <button
            onClick={() => setFilterCategory('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              filterCategory === 'all' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600'
            }`}
          >
            Semua
          </button>
          <button
            onClick={() => setFilterCategory('billing')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              filterCategory === 'billing' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600'
            }`}
          >
            Tagihan
          </button>
          <button
            onClick={() => setFilterCategory('payment')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              filterCategory === 'payment' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600'
            }`}
          >
            Pembayaran
          </button>
          <button
            onClick={() => setFilterCategory('service')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              filterCategory === 'service' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600'
            }`}
          >
            Layanan
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="divide-y divide-slate-100 text-xs">
          {filteredLogs.map((log) => (
            <div key={log.id} className="p-4 hover:bg-slate-50/70 transition-colors flex items-start gap-3.5">
              <div className="mt-0.5 w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                <Activity className="w-3.5 h-3.5" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{log.action}</span>
                    {getCategoryBadge(log.category)}
                  </div>
                  <span className="text-[11px] text-slate-400 whitespace-nowrap">{log.timestamp}</span>
                </div>

                <p className="text-slate-600 mt-1 leading-relaxed">{log.details}</p>

                <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-2">
                  <span>Pelaku: <strong className="text-slate-700">{log.actorName}</strong></span>
                  <span>•</span>
                  <span className="uppercase tracking-wider text-[10px]">{log.actor}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
