import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Globe,
  User,
  Building,
  Mail,
  Phone,
  Lock,
  MapPin,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  Briefcase,
} from 'lucide-react';

export const ClientRegister: React.FC = () => {
  const { registerClientAccount, setAuthView, showToast, settings } = useApp();

  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '628',
    segment: 'umkm' as 'umkm' | 'enterprise' | 'personal',
    address: '',
    password: '',
    confirmPassword: '',
    agreeTerms: true,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim()) {
      setErrorMsg('Harap lengkapi seluruh kolom berbintang (*).');
      showToast('Harap lengkapi kolom yang wajib diisi.', 'warning');
      return;
    }

    if (formData.password.length < 6) {
      setErrorMsg('Kata sandi minimal harus terdiri dari 6 karakter.');
      showToast('Kata sandi minimal 6 karakter.', 'error');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMsg('Konfirmasi kata sandi tidak cocok dengan kata sandi yang dimasukkan.');
      showToast('Konfirmasi kata sandi tidak cocok.', 'error');
      return;
    }

    if (!formData.agreeTerms) {
      setErrorMsg('Anda harus menyetujui syarat & ketentuan layanan.');
      showToast('Harap setujui syarat & ketentuan.', 'warning');
      return;
    }

    try {
      await registerClientAccount({
        name: formData.name,
        company: formData.company || formData.name,
        email: formData.email,
        phone: formData.phone,
        segment: formData.segment,
        address: formData.address,
        password: formData.password,
      });
    } catch (err: any) {
      setErrorMsg(err?.message || 'Gagal mendaftar akun.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-8 sm:px-6 lg:px-8 font-sans text-slate-800">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl px-4">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/20 mb-2.5">
            <Globe className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Daftar Akun Klien Baru
          </h2>
          <p className="mt-1 text-xs text-slate-500 max-w-md mx-auto">
            Dapatkan akses langsung ke pemesanan website, manajemen kredensial domain & hosting, serta pembayaran invoice digital {settings.brandName}.
          </p>
        </div>

        {/* Register Card */}
        <div className="bg-white py-7 px-5 sm:px-8 shadow-xl shadow-slate-200/50 border border-slate-200/80 rounded-2xl">
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Nama Lengkap */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Lengkap *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    id="register-name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Contoh: Rian Pratama"
                    className="block w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Nama Perusahaan / Bisnis */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Bisnis / Toko / Perusahaan
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Building className="w-4 h-4" />
                  </div>
                  <input
                    id="register-company"
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="Contoh: CV Pratama Digital"
                    className="block w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Alamat Email Aktif *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="register-email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="rian@pratamadigital.id"
                    className="block w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* WhatsApp */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nomor WhatsApp *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    id="register-phone"
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="628123456789"
                    className="block w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Segmen Usaha */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Kategori / Segmen Usaha
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: 'umkm', label: 'UMKM / Toko', desc: 'Usaha Menengah Kecil' },
                  { key: 'enterprise', label: 'Perusahaan', desc: 'PT / CV / Lembaga' },
                  { key: 'personal', label: 'Personal', desc: 'Portofolio / Kreator' },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setFormData({ ...formData, segment: item.key as any })}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      formData.segment === item.key
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-1 ring-emerald-600'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <p className="text-xs font-bold">{item.label}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5 truncate">{item.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Alamat / Kota */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kota / Domisili
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <MapPin className="w-4 h-4" />
                </div>
                <input
                  id="register-address"
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Contoh: Jakarta Selatan, DKI Jakarta"
                  className="block w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Password Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kata Sandi Baru *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="register-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Minimal 6 karakter"
                    className="block w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ulangi Kata Sandi *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="register-confirm-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="Ulangi kata sandi"
                    className="block w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Show Password & Terms */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-500 hover:text-slate-700 text-[11px] underline"
                >
                  {showPassword ? 'Sembunyikan karakter sandi' : 'Tampilkan karakter sandi'}
                </button>
              </div>

              <label className="flex items-start gap-2 cursor-pointer text-xs text-slate-600">
                <input
                  type="checkbox"
                  required
                  checked={formData.agreeTerms}
                  onChange={(e) => setFormData({ ...formData, agreeTerms: e.target.checked })}
                  className="mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 h-3.5 w-3.5"
                />
                <span className="leading-tight">
                  Saya menyetujui Syarat & Ketentuan Layanan Pembuatan Website dan Kebijakan Privasi data.
                </span>
              </label>
            </div>

            <button
              id="btn-submit-client-register"
              type="submit"
              className="w-full mt-3 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/25 transition-all cursor-pointer"
            >
              <span>Buat Akun & Masuk Sekarang</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Back to Login Link */}
          <div className="mt-5 pt-4 border-t border-slate-100 text-center">
            <button
              id="btn-back-to-client-login"
              type="button"
              onClick={() => setAuthView('client_login')}
              className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Sudah punya akun klien? Masuk di sini</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
