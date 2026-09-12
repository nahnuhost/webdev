import React from 'react';
import { useApp } from '../../context/AppContext';
import { Activity, Clock } from 'lucide-react';

export const ClientLogs: React.FC = () => {
  const { logs, activeClient } = useApp();

  // Filter logs relevant to the client
  const clientLogs = logs.filter(
    (l) =>
      l.details.toLowerCase().includes(activeClient?.name.toLowerCase() || '') ||
      l.details.toLowerCase().includes(activeClient?.company.toLowerCase() || '') ||
      l.actorName.toLowerCase().includes(activeClient?.name.toLowerCase() || '')
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Log Aktifitas Akun Saya</h2>
        <p className="text-xs text-slate-500">
          Riwayat aktivitas akun, pembuatan pesanan, dan pembayaran tagihan Anda.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="divide-y divide-slate-100 text-xs">
          {clientLogs.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              Belum ada catatan aktifitas khusus akun Anda.
            </div>
          ) : (
            clientLogs.map((log) => (
              <div key={log.id} className="p-4 hover:bg-slate-50/70 transition-colors flex items-start gap-3.5">
                <div className="mt-0.5 w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Activity className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-slate-900">{log.action}</span>
                    <span className="text-[11px] text-slate-400">{log.timestamp}</span>
                  </div>
                  <p className="text-slate-600 mt-1 leading-relaxed">{log.details}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
