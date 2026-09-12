import React, { useState, useEffect } from 'react';
import { Invoice, Client } from '../../types';
import { useApp } from '../../context/AppContext';
import { formatRupiah, formatDateIndo, buildWhatsAppLink } from '../../utils/formatters';
import { X, Send, Copy, Check, MessageSquare, ExternalLink, Sparkles } from 'lucide-react';

interface WhatsAppReminderModalProps {
  invoice: Invoice | null;
  onClose: () => void;
}

export const WhatsAppReminderModal: React.FC<WhatsAppReminderModalProps> = ({ invoice, onClose }) => {
  const { settings, clients, addLog, showToast, runWithLoading } = useApp();
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState(false);

  const client = clients.find((c) => c.id === invoice?.clientId);

  useEffect(() => {
    if (!invoice) return;

    const portalUrl = window.location.origin;
    let template = settings.whatsappTemplate;

    template = template
      .replace(/{clientName}/g, invoice.clientName || 'Kak')
      .replace(/{websiteName}/g, invoice.websiteName || 'Layanan Website')
      .replace(/{domain}/g, invoice.websiteName ? `${invoice.websiteName}` : '')
      .replace(/{invoiceNumber}/g, invoice.invoiceNumber)
      .replace(/{totalAmount}/g, formatRupiah(invoice.total))
      .replace(/{dueDate}/g, formatDateIndo(invoice.dueDate))
      .replace(/{portalUrl}/g, portalUrl);

    setMessage(template);
  }, [invoice, settings]);

  if (!invoice) return null;

  const phone = client?.phone || '6281234567890';
  const whatsappUrl = buildWhatsAppLink(phone, message);

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    showToast('Teks pesan pengingat tagihan berhasil disalin ke clipboard!', 'info');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendWA = async () => {
    await runWithLoading(
      async () => {
        addLog({
          actor: 'admin',
          actorName: settings.freelancerName,
          action: 'Kirim Pengingat WhatsApp',
          details: `Mengirimkan pengingat tagihan ${invoice.invoiceNumber} ke WhatsApp ${invoice.clientName} (+${phone}).`,
          category: 'billing',
        });
        showToast(
          `Membuka WhatsApp API untuk klien ${invoice.clientName} (+${phone})...`,
          'success',
          'Pesan Terkirim'
        );
        window.open(whatsappUrl, '_blank');
        onClose();
      },
      'Menyiapkan tautan WhatsApp Direct...'
    );
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto">
        <div className="bg-emerald-700 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-800 flex items-center justify-center text-emerald-200">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Kirim Pengingat Tagihan WhatsApp</h3>
              <p className="text-[11px] text-emerald-100">Kirim langsung ke kontak {invoice.clientName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-emerald-200 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-slate-500">Nomor WhatsApp Tujuan:</span>
              <p className="font-bold text-slate-800 font-mono text-sm">+{phone}</p>
            </div>
            <div className="text-right">
              <span className="text-slate-500">Total Tagihan:</span>
              <p className="font-bold text-emerald-700 font-mono text-sm">{formatRupiah(invoice.total)}</p>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Draft Pesan WhatsApp (Bisa Diedit):
              </label>
              <button
                onClick={handleCopy}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Tersalin!' : 'Salin Pesan'}</span>
              </button>
            </div>

            <textarea
              rows={8}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full text-xs font-sans p-3 rounded-xl border border-slate-300 focus:outline-emerald-600 leading-relaxed text-slate-800 bg-slate-50/50"
            />
          </div>

          <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              Pesan ini otomatis memuat tautan portal klien tempat pelanggan dapat login, melihat detail rincian tagihan, dan melakukan pembayaran instan via QRIS / VA.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSendWA}
              className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Kirim via WhatsApp Web / App</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
