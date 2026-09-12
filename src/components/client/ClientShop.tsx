import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Product, ProductPackage } from '../../types';
import { formatRupiah } from '../../utils/formatters';
import {
  ShoppingBag,
  Check,
  Globe,
  Tag,
  ArrowRight,
  Sparkles,
  Shield,
  Zap,
  Clock,
  X,
  Percent,
  Coins,
} from 'lucide-react';

interface ClientShopProps {
  onOpenPaymentModal: (inv: any) => void;
}

export const ClientShop: React.FC<ClientShopProps> = ({ onOpenPaymentModal }) => {
  const { products, activeClient, coupons, createOrder, applyCouponCode, runWithLoading, showToast } = useApp();

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<ProductPackage | null>(null);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);

  // Form State
  const [domainRequested, setDomainRequested] = useState('');
  const [websiteName, setWebsiteName] = useState('');
  const [notes, setNotes] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discount: number;
    discountType: string;
    message: string;
  } | null>(null);
  const [couponError, setCouponError] = useState('');

  const handleSelectPackage = (prod: Product, pkg: ProductPackage) => {
    setSelectedProduct(prod);
    setSelectedPackage(pkg);
    setDomainRequested('');
    setWebsiteName(activeClient?.company || '');
    setCouponCode('');
    setAppliedCoupon(null);
    setCouponError('');
    setShowCheckoutModal(true);
  };

  const handleApplyCoupon = (e?: React.FormEvent, codeToTry?: string) => {
    if (e) e.preventDefault();
    setCouponError('');
    if (!selectedPackage) return;

    const targetCode = (codeToTry || couponCode).trim().toUpperCase();
    if (!targetCode) {
      setCouponError('Masukkan kode kupon terlebih dahulu.');
      setAppliedCoupon(null);
      return;
    }

    const result = applyCouponCode(targetCode, selectedPackage.price, 'purchase');
    if (!result.valid) {
      setCouponError(result.message);
      setAppliedCoupon(null);
      showToast(result.message, 'error', 'Kupon Gagal');
    } else {
      setCouponCode(targetCode);
      setAppliedCoupon({
        code: targetCode,
        discount: result.discount,
        discountType: result.coupon?.discountType || 'percentage',
        message: result.message,
      });
      showToast(`Kupon diskon ${targetCode} berhasil dipasang!`, 'success');
    }
  };

  const calculateFinalPrice = () => {
    if (!selectedPackage) return 0;
    const discount = appliedCoupon?.discount || 0;
    return Math.max(0, selectedPackage.price - discount);
  };

  const handleConfirmOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !selectedPackage || !activeClient) return;

    await runWithLoading(
      async () => {
        await new Promise((r) => setTimeout(r, 600));
        const newInvoice = createOrder({
          clientId: activeClient.id,
          productId: selectedProduct.id,
          packageId: selectedPackage.id,
          websiteName: websiteName || selectedProduct.name,
          requestedDomain: domainRequested || `${websiteName.toLowerCase().replace(/\s+/g, '')}.com`,
          couponCode: appliedCoupon ? appliedCoupon.code : undefined,
          notes,
        });

        setShowCheckoutModal(false);
        showToast(
          `Pesanan baru berhasil diproses! Tagihan digital telah diterbitkan.`,
          'success',
          'Pemesanan Berhasil'
        );
        // Directly open payment gateway modal for seamless self-service payment!
        onOpenPaymentModal(newInvoice);
      },
      'Menerbitkan invoice pemesanan layanan website...'
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Beli Layanan & Website Mandiri
        </h2>
        <p className="text-xs text-slate-500">
          Pilih paket pembuatan website profesional, maintenance berkala, atau penambahan fitur dengan aktivasi instan.
        </p>
      </div>

      {/* Products Catalog */}
      <div className="space-y-8">
        {products.map((product) => (
          <div key={product.id} className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 uppercase">
                {product.category}
              </span>
              <h3 className="text-base font-bold text-slate-900">{product.name}</h3>
            </div>
            <p className="text-xs text-slate-500 max-w-2xl">{product.description}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
              {product.packages.map((pkg) => (
                <div
                  key={pkg.id}
                  className={`bg-white rounded-2xl border p-5 shadow-xs flex flex-col justify-between space-y-4 transition-all hover:shadow-md ${
                    pkg.popular
                      ? 'border-emerald-500 ring-2 ring-emerald-500/10'
                      : 'border-slate-200'
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-start gap-1">
                      <h4 className="font-bold text-sm text-slate-900">{pkg.name}</h4>
                      {pkg.popular && (
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-600 text-white rounded-full">
                          Paling Diminati
                        </span>
                      )}
                    </div>

                    <div className="mt-3">
                      <span className="font-mono text-xl font-black text-slate-900">
                        {formatRupiah(pkg.price)}
                      </span>
                      <span className="text-xs text-slate-500 ml-1">
                        /{pkg.billingCycle === 'monthly' ? 'bulan' : pkg.billingCycle === 'yearly' ? 'tahun' : 'proyek'}
                      </span>
                    </div>

                    <ul className="mt-4 space-y-2 text-xs text-slate-600">
                      {pkg.features.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    onClick={() => handleSelectPackage(product, pkg)}
                    className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      pkg.popular
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                        : 'bg-slate-900 hover:bg-slate-800 text-white'
                    }`}
                  >
                    <span>Pilih & Pesan Sekarang</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Checkout Self-Service Modal */}
      {showCheckoutModal && selectedProduct && selectedPackage && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 my-auto">
            <div className="flex justify-between items-center mb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                  Formulir Pembelian Mandiri
                </span>
                <h3 className="font-bold text-base text-slate-900">
                  {selectedProduct.name} - {selectedPackage.name}
                </h3>
              </div>
              <button
                onClick={() => setShowCheckoutModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmOrder} className="space-y-4 text-xs">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-600">Pemesan:</span>
                  <span className="font-bold text-slate-900">{activeClient?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Harga Paket:</span>
                  <span className="font-mono font-bold text-slate-900">
                    {formatRupiah(selectedPackage.price)}
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Nama Brand / Judul Website *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Toko Kopi Senja"
                  value={websiteName}
                  onChange={(e) => setWebsiteName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-emerald-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Nama Domain yang Diinginkan (misal: kopisenja.id) *
                </label>
                <div className="relative">
                  <Globe className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="namabisnis.com / namabisnis.id"
                    value={domainRequested}
                    onChange={(e) => setDomainRequested(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 focus:outline-emerald-500 font-mono"
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Sudah termasuk registrasi nama domain dan instalasi SSL gratis.
                </span>
              </div>

              {/* Coupon input */}
              <div className="border-t border-slate-200 pt-3">
                <div className="flex justify-between items-center mb-1">
                  <label className="font-semibold text-slate-700 text-xs flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Kode Kupon / Voucher Diskon</span>
                  </label>
                  {appliedCoupon && (
                    <button
                      type="button"
                      onClick={() => {
                        setAppliedCoupon(null);
                        setCouponCode('');
                        setCouponError('');
                      }}
                      className="text-[11px] text-rose-500 hover:underline cursor-pointer"
                    >
                      Hapus Kupon
                    </button>
                  )}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Contoh: HEMAT250K / DISKONWEB10"
                    value={couponCode}
                    onChange={(e) => {
                      setCouponCode(e.target.value.toUpperCase());
                      setCouponError('');
                    }}
                    className="flex-1 px-3 py-2 uppercase font-mono font-bold rounded-xl border border-slate-300 focus:outline-emerald-500 bg-white"
                  />
                  <button
                    type="button"
                    onClick={(e) => handleApplyCoupon(e)}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl cursor-pointer text-xs transition-colors"
                  >
                    Terapkan
                  </button>
                </div>

                {appliedCoupon && (
                  <div className="mt-2 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] text-emerald-800 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-semibold">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{appliedCoupon.message}</span>
                    </div>
                    <span className="font-mono font-bold text-emerald-700">
                      -{formatRupiah(appliedCoupon.discount)}
                    </span>
                  </div>
                )}

                {couponError && (
                  <p className="text-rose-600 text-[11px] mt-1 font-medium">{couponError}</p>
                )}

                {/* Clickable available coupons recommendation */}
                {coupons.filter(
                  (c) =>
                    c.isActive &&
                    (c.applicableTo === 'all' || c.applicableTo === 'purchase') &&
                    (!c.validUntil || c.validUntil >= new Date().toISOString().substring(0, 10))
                ).length > 0 && (
                  <div className="mt-2 pt-2 border-t border-dashed border-slate-200">
                    <span className="text-[10px] text-slate-500 font-medium block mb-1">
                      Kupon promo yang dapat digunakan:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {coupons
                        .filter(
                          (c) =>
                            c.isActive &&
                            (c.applicableTo === 'all' || c.applicableTo === 'purchase') &&
                            (!c.validUntil || c.validUntil >= new Date().toISOString().substring(0, 10))
                        )
                        .map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => handleApplyCoupon(undefined, c.code)}
                            className="px-2 py-0.5 rounded-lg border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold transition-colors cursor-pointer"
                          >
                            {c.code} ({c.discountType === 'fixed' ? `-${formatRupiah(c.discountValue)}` : `-${c.discountValue || c.discountPercent}%`})
                          </button>
                        ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Total Calculation */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal Paket:</span>
                  <span className="font-mono">{formatRupiah(selectedPackage.price)}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Potongan Diskon Kupon ({appliedCoupon.code}):</span>
                    <span className="font-mono font-bold">-{formatRupiah(appliedCoupon.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-2 border-t border-slate-200 text-sm font-bold text-slate-900">
                  <span>Total Tagihan:</span>
                  <span className="font-mono text-base text-emerald-700">
                    {formatRupiah(calculateFinalPrice())}
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Catatan Tambahan (Opsional)</label>
                <textarea
                  rows={2}
                  placeholder="Catatan desain, referensi website yang disukai, dll."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCheckoutModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm flex items-center gap-1.5"
                >
                  <span>Lanjutkan ke Pembayaran Mandiri</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
