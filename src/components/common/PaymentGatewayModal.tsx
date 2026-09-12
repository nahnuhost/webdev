import React, { useState, useEffect } from 'react';
import { Invoice, PaymentTransaction } from '../../types';
import { useApp } from '../../context/AppContext';
import { formatRupiah } from '../../utils/formatters';
import {
  X,
  QrCode,
  CreditCard,
  Building,
  CheckCircle2,
  Copy,
  Check,
  Zap,
  ShieldCheck,
  Clock,
  ArrowRight,
  Sparkles,
  Download,
} from 'lucide-react';

interface PaymentGatewayModalProps {
  invoice: Invoice | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export const PaymentGatewayModal: React.FC<PaymentGatewayModalProps> = ({
  invoice,
  onClose,
  onSuccess,
}) => {
  const { settings, initiatePayment, simulatePaymentSuccess, activeClient, runWithLoading, showToast } = useApp();

  const [activeTab, setActiveTab] = useState<
    'qris' | 'bca_va' | 'mandiri_va' | 'bri_va' | 'manual'
  >('qris');
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(895); // ~15 minutes countdown
  const [currentTx, setCurrentTx] = useState<PaymentTransaction | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Initialize transaction when modal opens
  useEffect(() => {
    if (invoice) {
      const channelName =
        activeTab === 'qris'
          ? 'QRIS Realtime Scan'
          : activeTab === 'bca_va'
          ? 'BCA Virtual Account'
          : activeTab === 'mandiri_va'
          ? 'Mandiri Virtual Account'
          : activeTab === 'bri_va'
          ? 'BRI Virtual Account'
          : 'Transfer Bank Manual';

      const method =
        activeTab === 'manual'
          ? 'bank_transfer'
          : (activeTab as PaymentTransaction['paymentMethod']);

      const tx = initiatePayment(invoice.id, method, channelName);
      setCurrentTx(tx);
    }
  }, [invoice, activeTab]);

  // Timer countdown
  useEffect(() => {
    if (paymentSuccess) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [paymentSuccess]);

  if (!invoice) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const vaNumberBCA = `88019${(activeClient?.phone || '081234567890').replace(/[^0-9]/g, '').slice(-9)}`;
  const vaNumberMandiri = `89201${(activeClient?.phone || '081234567890').replace(/[^0-9]/g, '').slice(-9)}`;
  const vaNumberBRI = `12890${(activeClient?.phone || '081234567890').replace(/[^0-9]/g, '').slice(-9)}`;

  // Simulate payment completion via Webhook
  const handleSimulatePayment = async () => {
    if (!currentTx) return;
    setIsProcessing(true);

    await runWithLoading(
      async () => {
        await new Promise((r) => setTimeout(r, 1100));
        simulatePaymentSuccess(currentTx.id);
        setIsProcessing(false);
        setPaymentSuccess(true);
        if (onSuccess) onSuccess();
        showToast(
          'Pembayaran lunas dan status layanan website telah diperpanjang/diaktifkan otomatis.',
          'success',
          'Pembayaran Sukses'
        );
      },
      'Memverifikasi settlement pembayaran dari gateway bank...'
    );
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto">
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-tight">
                {settings.paymentGateway.provider.toUpperCase()} Gateway Pembayaran Mandiri
              </h3>
              <p className="text-[11px] text-slate-400">
                Sistem Otomatis & Terverifikasi Real-Time
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {paymentSuccess ? (
          /* Payment Success State */
          <div className="p-8 text-center space-y-5">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <h4 className="text-xl font-extrabold text-slate-900">Pembayaran Berhasil!</h4>
              <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto">
                Webhook payment gateway telah memverifikasi pembayaran Anda secara otomatis. Tagihan telah LUNAS dan layanan website Anda telah aktif/diperpanjang.
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-left text-xs space-y-2 max-w-sm mx-auto">
              <div className="flex justify-between">
                <span className="text-slate-500">Nomor Faktur:</span>
                <span className="font-bold text-slate-800">{invoice.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Dibayar:</span>
                <span className="font-bold text-emerald-700 font-mono">
                  {formatRupiah(invoice.total)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Metode:</span>
                <span className="font-medium text-slate-800">{currentTx?.channelName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Waktu Verifikasi:</span>
                <span className="font-medium text-slate-800">Instan (Otomatis Webhook)</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full max-w-sm mx-auto py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors block"
            >
              Lihat Layanan & Akses Kredensial
            </button>
          </div>
        ) : (
          /* Payment Processing / Selection State */
          <div className="p-5 sm:p-6 space-y-5">
            {/* Amount & Timer Header */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center bg-slate-50 p-4 rounded-xl border border-slate-200 gap-3">
              <div>
                <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
                  Total Pembayaran
                </span>
                <p className="text-2xl font-black text-indigo-700 font-mono mt-0.5">
                  {formatRupiah(invoice.total)}
                </p>
                <p className="text-xs text-slate-600 mt-0.5 font-medium">
                  {invoice.websiteName ? `${invoice.websiteName} (${invoice.invoiceNumber})` : invoice.invoiceNumber}
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs bg-amber-50 text-amber-900 border border-amber-200 px-3 py-1.5 rounded-lg self-start sm:self-center">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>Batas Waktu: <strong>{timeFormatted}</strong></span>
              </div>
            </div>

            {/* Payment Methods Nav */}
            <div className="flex gap-1.5 p-1 bg-slate-100 rounded-xl overflow-x-auto text-xs">
              <button
                onClick={() => setActiveTab('qris')}
                className={`flex-1 min-w-[90px] py-2 px-3 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === 'qris'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>QRIS Instan</span>
              </button>
              <button
                onClick={() => setActiveTab('bca_va')}
                className={`flex-1 min-w-[90px] py-2 px-3 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === 'bca_va'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                <span>BCA VA</span>
              </button>
              <button
                onClick={() => setActiveTab('mandiri_va')}
                className={`flex-1 min-w-[90px] py-2 px-3 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === 'mandiri_va'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5 text-amber-600" />
                <span>Mandiri VA</span>
              </button>
              <button
                onClick={() => setActiveTab('bri_va')}
                className={`flex-1 min-w-[90px] py-2 px-3 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === 'bri_va'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5 text-sky-600" />
                <span>BRI VA</span>
              </button>
              <button
                onClick={() => setActiveTab('manual')}
                className={`flex-1 min-w-[90px] py-2 px-3 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === 'manual'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Building className="w-3.5 h-3.5 text-slate-600" />
                <span>Transfer Manual</span>
              </button>
            </div>

            {/* Tab Details */}
            {activeTab === 'qris' && (
              <div className="space-y-4 text-center">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 inline-block mx-auto shadow-inner">
                  {/* Dynamic QRIS code rendering using SVG */}
                  <div className="w-48 h-48 bg-white p-3 rounded-xl border border-slate-200 mx-auto flex flex-col items-center justify-center">
                    <svg viewBox="0 0 100 100" className="w-full h-full text-slate-900">
                      {/* Stylized QR Code Pattern */}
                      <rect x="0" y="0" width="30" height="30" fill="currentColor" rx="4" />
                      <rect x="5" y="5" width="20" height="20" fill="white" rx="2" />
                      <rect x="9" y="9" width="12" height="12" fill="currentColor" rx="1" />

                      <rect x="70" y="0" width="30" height="30" fill="currentColor" rx="4" />
                      <rect x="75" y="5" width="20" height="20" fill="white" rx="2" />
                      <rect x="79" y="9" width="12" height="12" fill="currentColor" rx="1" />

                      <rect x="0" y="70" width="30" height="30" fill="currentColor" rx="4" />
                      <rect x="5" y="75" width="20" height="20" fill="white" rx="2" />
                      <rect x="9" y="79" width="12" height="12" fill="currentColor" rx="1" />

                      {/* Data Dots */}
                      <rect x="36" y="8" width="6" height="6" fill="currentColor" />
                      <rect x="46" y="8" width="6" height="6" fill="currentColor" />
                      <rect x="56" y="8" width="6" height="6" fill="currentColor" />
                      <rect x="36" y="20" width="6" height="6" fill="currentColor" />
                      <rect x="56" y="20" width="6" height="6" fill="currentColor" />

                      <rect x="8" y="38" width="6" height="6" fill="currentColor" />
                      <rect x="20" y="38" width="6" height="6" fill="currentColor" />
                      <rect x="38" y="38" width="8" height="8" fill="#4f46e5" rx="1" />
                      <rect x="54" y="38" width="8" height="8" fill="currentColor" />
                      <rect x="70" y="38" width="6" height="6" fill="currentColor" />
                      <rect x="86" y="38" width="6" height="6" fill="currentColor" />

                      <rect x="38" y="54" width="8" height="8" fill="currentColor" />
                      <rect x="54" y="54" width="8" height="8" fill="#4f46e5" rx="1" />
                      <rect x="70" y="54" width="6" height="6" fill="currentColor" />
                      <rect x="86" y="54" width="6" height="6" fill="currentColor" />

                      <rect x="38" y="70" width="6" height="6" fill="currentColor" />
                      <rect x="48" y="76" width="6" height="6" fill="currentColor" />
                      <rect x="62" y="70" width="6" height="6" fill="currentColor" />
                      <rect x="76" y="76" width="6" height="6" fill="currentColor" />
                      <rect x="86" y="86" width="6" height="6" fill="currentColor" />
                    </svg>
                  </div>
                  <p className="text-[11px] font-bold text-slate-700 mt-2">
                    NMID: ID1029837492819
                  </p>
                  <p className="text-[10px] text-slate-500">{settings.brandName}</p>
                </div>

                <p className="text-xs text-slate-600 max-w-sm mx-auto">
                  Scan dengan aplikasi e-wallet apa saja (GoPay, OVO, DANA, ShopeePay, LinkAja) atau Mobile Banking BCA, Mandiri, BRI, BNI, Jago.
                </p>
              </div>
            )}

            {(activeTab === 'bca_va' || activeTab === 'mandiri_va' || activeTab === 'bri_va') && (
              <div className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <span className="text-[11px] text-slate-500 font-semibold block">
                    Nomor Virtual Account{' '}
                    {activeTab === 'bca_va' ? 'BCA' : activeTab === 'mandiri_va' ? 'Mandiri' : 'BRI'}:
                  </span>
                  <div className="flex items-center justify-between mt-1">
                    <span className="font-mono text-xl sm:text-2xl font-bold text-slate-900 tracking-wider">
                      {activeTab === 'bca_va'
                        ? vaNumberBCA
                        : activeTab === 'mandiri_va'
                        ? vaNumberMandiri
                        : vaNumberBRI}
                    </span>
                    <button
                      onClick={() =>
                        copyToClipboard(
                          activeTab === 'bca_va'
                            ? vaNumberBCA
                            : activeTab === 'mandiri_va'
                            ? vaNumberMandiri
                            : vaNumberBRI
                        )
                      }
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 transition-colors"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Tersalin' : 'Salin'}</span>
                    </button>
                  </div>
                </div>

                <div className="text-xs text-slate-600 space-y-1 bg-slate-50/70 p-3.5 rounded-xl">
                  <p className="font-semibold text-slate-800">Petunjuk Pembayaran:</p>
                  <ol className="list-decimal list-inside space-y-0.5 text-slate-600 pl-1 leading-relaxed">
                    <li>Buka Mobile Banking atau ATM bank Anda.</li>
                    <li>Pilih menu <strong>Transfer &gt; Virtual Account</strong>.</li>
                    <li>Masukkan nomor Virtual Account di atas.</li>
                    <li>Periksa nama penerima: <strong>{settings.brandName}</strong>.</li>
                    <li>Masukkan PIN Anda. Pembayaran terverifikasi otomatis dalam detik!</li>
                  </ol>
                </div>
              </div>
            )}

            {activeTab === 'manual' && (
              <div className="space-y-3">
                <p className="text-xs text-slate-600">
                  Silakan transfer ke salah satu rekening resmi di bawah ini:
                </p>
                <div className="space-y-2">
                  {settings.bankAccounts.map((acc, idx) => (
                    <div key={idx} className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-slate-900">{acc.bank}</p>
                        <p className="font-mono text-sm font-bold text-indigo-700">{acc.accountNumber}</p>
                        <p className="text-[10px] text-slate-500">a.n {acc.accountHolder}</p>
                      </div>
                      <button
                        onClick={() => copyToClipboard(acc.accountNumber)}
                        className="p-1.5 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg text-slate-600 text-xs flex items-center gap-1"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Gateway Interactive Simulator Box */}
            <div className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-emerald-500/10 p-4 rounded-2xl border border-indigo-200/80 space-y-2.5">
              <div className="flex items-center gap-2 text-indigo-900">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold">Simulasi Integrasi Payment Gateway Otomatis</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Di lingkungan produksi, saat pelanggan menyelesaikan scan QRIS atau bayar Virtual Account, server gateway mengirimkan webhook otomatis secara instan.
              </p>

              <button
                id="btn-simulate-gateway-webhook"
                disabled={isProcessing}
                onClick={handleSimulatePayment}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Memproses Webhook Gateway...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>⚡ Simulasikan Pelanggan Bayar Sekarang (Trigger Webhook Otomatis)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
