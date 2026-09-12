import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Product, ProductPackage } from '../../types';
import { formatRupiah } from '../../utils/formatters';
import {
  Package,
  Plus,
  Check,
  Edit2,
  Trash2,
  Layers,
  Sparkles,
  DollarSign,
  X,
  PlusCircle,
} from 'lucide-react';

export const AdminProducts: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [form, setForm] = useState({
    name: '',
    category: 'website' as Product['category'],
    description: '',
    iconName: 'Globe',
    active: true,
    packages: [
      {
        id: `pkg-${Date.now()}-1`,
        name: 'Paket Standard',
        price: 2500000,
        billingCycle: 'yearly' as ProductPackage['billingCycle'],
        features: ['Domain Gratis 1 Tahun', 'Cloud Hosting 5GB', 'SSL Gratis', 'Desain Responsive'],
        popular: true,
      },
    ],
  });

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setForm({
      name: '',
      category: 'website',
      description: '',
      iconName: 'Globe',
      active: true,
      packages: [
        {
          id: `pkg-${Date.now()}-1`,
          name: 'Paket Standard',
          price: 2500000,
          billingCycle: 'yearly',
          features: ['Domain Gratis 1 Tahun', 'Cloud Hosting 5GB', 'SSL Gratis', 'Desain Responsive'],
          popular: true,
        },
      ],
    });
    setShowAddModal(true);
  };

  const handleAddPackageRow = () => {
    setForm({
      ...form,
      packages: [
        ...form.packages,
        {
          id: `pkg-${Date.now()}-${form.packages.length + 1}`,
          name: 'Paket Premium',
          price: 4500000,
          billingCycle: 'yearly',
          features: ['Domain .id / .com', 'Cloud Hosting NVMe 15GB', 'Email Bisnis', 'Support Prioritas'],
          popular: false,
        },
      ],
    });
  };

  const handlePackageChange = (index: number, field: string, value: any) => {
    const updated = [...form.packages];
    updated[index] = { ...updated[index], [field]: value };
    setForm({ ...form, packages: updated });
  };

  const handlePackageFeaturesChange = (index: number, text: string) => {
    const features = text
      .split('\n')
      .map((f) => f.trim())
      .filter((f) => f.length > 0);
    const updated = [...form.packages];
    updated[index] = { ...updated[index], features };
    setForm({ ...form, packages: updated });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      updateProduct(editingProduct.id, form);
    } else {
      addProduct(form);
    }
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Manajemen Produk & Paket Layanan
          </h2>
          <p className="text-xs text-slate-500">
            Daftar layanan website, toko online, dan pemeliharaan bulanan yang dapat dipesan langsung oleh klien.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Layanan Baru</span>
        </button>
      </div>

      {/* Products Grid */}
      <div className="space-y-6">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 uppercase">
                    {product.category}
                  </span>
                  <h3 className="font-bold text-base text-slate-900">{product.name}</h3>
                </div>
                <p className="text-xs text-slate-500 mt-1">{product.description}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (confirm(`Hapus layanan ${product.name}?`)) {
                      deleteProduct(product.id);
                    }
                  }}
                  className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                  title="Hapus Produk"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Packages */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {product.packages.map((pkg) => (
                <div
                  key={pkg.id}
                  className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 transition-all ${
                    pkg.popular
                      ? 'border-indigo-300 bg-indigo-50/20 shadow-xs'
                      : 'border-slate-200 bg-slate-50/50'
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-start gap-1">
                      <h4 className="font-bold text-xs text-slate-900">{pkg.name}</h4>
                      {pkg.popular && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 bg-indigo-600 text-white rounded-full">
                          Populer
                        </span>
                      )}
                    </div>

                    <div className="mt-2">
                      <span className="font-mono text-lg font-black text-slate-900">
                        {formatRupiah(pkg.price)}
                      </span>
                      <span className="text-[11px] text-slate-500 ml-1">
                        /{pkg.billingCycle === 'monthly' ? 'bulan' : pkg.billingCycle === 'yearly' ? 'tahun' : 'proyek'}
                      </span>
                    </div>

                    <ul className="mt-3 space-y-1.5 text-xs text-slate-600">
                      {pkg.features.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <span className="text-[10px] text-slate-400 block pt-2 border-t border-slate-200/50">
                    Siklus:{' '}
                    {pkg.billingCycle === 'monthly'
                      ? 'Bulanan (Recurring)'
                      : pkg.billingCycle === 'yearly'
                      ? 'Tahunan (Perpanjangan Domain & Hosting)'
                      : 'Sekali Bayar (One-off)'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-base text-slate-900">Tambah Layanan Baru</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Nama Layanan *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Pembuatan Website Portal Berita"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Kategori</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-indigo-500"
                  >
                    <option value="website">Website</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="hosting">Hosting & Domain</option>
                    <option value="redesign">Redesign</option>
                    <option value="custom">Custom Web App</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Deskripsi Singkat</label>
                <textarea
                  rows={2}
                  placeholder="Jelaskan spesifikasi umum layanan ini..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-indigo-500"
                />
              </div>

              {/* Packages in Form */}
              <div className="border-t border-slate-200 pt-3 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-800">Paket & Harga ({form.packages.length})</span>
                  <button
                    type="button"
                    onClick={handleAddPackageRow}
                    className="text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 text-[11px]"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Tambah Paket</span>
                  </button>
                </div>

                {form.packages.map((pkg, idx) => (
                  <div key={pkg.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[10px] text-slate-500">Nama Paket</label>
                        <input
                          type="text"
                          required
                          value={pkg.name}
                          onChange={(e) => handlePackageChange(idx, 'name', e.target.value)}
                          className="w-full px-2 py-1 rounded border border-slate-300 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-500">Harga (Rp)</label>
                        <input
                          type="number"
                          required
                          value={pkg.price}
                          onChange={(e) => handlePackageChange(idx, 'price', Number(e.target.value))}
                          className="w-full px-2 py-1 rounded border border-slate-300 bg-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-500">Siklus</label>
                        <select
                          value={pkg.billingCycle}
                          onChange={(e) => handlePackageChange(idx, 'billingCycle', e.target.value)}
                          className="w-full px-2 py-1 rounded border border-slate-300 bg-white"
                        >
                          <option value="yearly">Tahunan</option>
                          <option value="monthly">Bulanan</option>
                          <option value="one-time">One-Time</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-500">
                        Fitur-fitur (Pisahkan dengan baris baru / Enter)
                      </label>
                      <textarea
                        rows={3}
                        value={pkg.features.join('\n')}
                        onChange={(e) => handlePackageFeaturesChange(idx, e.target.value)}
                        className="w-full px-2 py-1 rounded border border-slate-300 bg-white"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm"
                >
                  Simpan Layanan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
