import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Globe,
  Mail,
  Lock,
  ArrowRight,
  Shield,
  UserPlus,
  HelpCircle,
  CheckCircle2,
  Phone,
  User,
  ExternalLink,
} from 'lucide-react';

export const ClientLogin: React.FC = () => {
  const { loginClient, setAuthView, clients, settings } = useApp();
  const [identifier, setIdentifier] = useState('budi@tokoberkah.id');
  const [password, setPassword] = useState('klien123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await loginClient(identifier, password);
  };

  const handleSelectDemoClient = (clientEmail: string) => {
    setIdentifier(clientEmail);
    setPassword('klien123');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-10 sm:px-6 lg:px-8 font-sans text-slate-800">
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        {/* Brand Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/20 mb-3">
            <Globe className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Portal Klien & Pelanggan
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Masuk untuk mengecek layanan website, bayar tagihan online, dan riwayat pesanan.
          </p>
        </div>

        {/* Card */}
        <div className="mt-7 bg-white py-8 px-5 sm:px-8 shadow-xl shadow-slate-200/50 border border-slate-200/80 rounded-2xl">
          {/* Demo Client Quick-Picker */}
          <div className="mb-5 p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/80 text-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-emerald-950 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-emerald-700" />
                Pilih Cepat Akun Demo Klien:
              </span>
              <span className="text-[10px] text-emerald-700 font-medium">1-Klik</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {clients.slice(0, 4).map((c) => (
                <button
                  key={c.id}
                  type="button"
                  id={`btn-pick-demo-client-${c.id}`}
                  onClick={() => handleSelectDemoClient(c.email)}
                  className={`text-left p-1.5 rounded-lg border text-[11px] transition-all cursor-pointer ${
                    identifier === c.email
                      ? 'bg-emerald-600 text-white border-emerald-600 font-semibold shadow-2xs'
                      : 'bg-white hover:bg-emerald-100/50 text-slate-700 border-slate-200'
                  }`}
                >
                  <p className="truncate font-medium">{c.name}</p>
                  <p className={`truncate text-[9px] ${identifier === c.email ? 'text-emerald-100' : 'text-slate-400'}`}>
                    {c.company}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Email atau No. WhatsApp Terdaftar
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="client-login-identifier"
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="budi@tokoberkah.id atau 62812345678"
                  className="block w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-slate-700">
                  Kata Sandi
                </label>
                <button
                  type="button"
                  id="link-forgot-password"
                  onClick={() => setAuthView('client_forgot_password')}
                  className="text-xs font-medium text-emerald-600 hover:text-emerald-700 hover:underline"
                >
                  Lupa kata sandi?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="client-login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi Anda"
                  className="block w-full pl-9 pr-10 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? 'Sembunyi' : 'Lihat'}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 h-3.5 w-3.5"
                />
                <span>Ingat saya di perangkat ini</span>
              </label>
            </div>

            <button
              id="btn-submit-client-login"
              type="submit"
              className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
            >
              <span>Masuk ke Portal Klien</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Registration Prompt */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col items-center gap-3">
            <div className="text-xs text-slate-500 text-center">
              Belum memiliki akun klien?{' '}
              <button
                id="link-to-client-register"
                type="button"
                onClick={() => setAuthView('client_register')}
                className="font-semibold text-emerald-600 hover:text-emerald-700 hover:underline inline-flex items-center gap-0.5"
              >
                <span>Daftar Akun Baru di sini</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* Admin Switch */}
            <div className="pt-2 w-full text-center">
              <button
                id="btn-switch-to-admin-login"
                type="button"
                onClick={() => setAuthView('admin_login')}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all"
              >
                <Shield className="w-3.5 h-3.5 text-indigo-600" />
                <span>Masuk sebagai Administrator (Freelancer)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
