import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Shield, KeyRound, Mail, ArrowRight, UserCheck, CheckCircle2, Lock, AlertCircle } from 'lucide-react';

export const AdminLogin: React.FC = () => {
  const { loginAdmin, setAuthView, settings } = useApp();
  const [email, setEmail] = useState('admin@webdev.id');
  const [password, setPassword] = useState('');
  const [pin, setPin] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await loginAdmin(password, pin);
  };

  const handleAutofillDemo = () => {
    setEmail('admin@webdev.id');
    setPassword('admin123');
    setPin('123456');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-10 sm:px-6 lg:px-8 relative overflow-hidden font-sans text-slate-100">
      {/* Subtle Background Glow Elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-600/15 rounded-full blur-3xl pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        {/* Brand Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-500/25 mb-4">
            <Shield className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Portal Masuk Administrator
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Akses khusus freelancer & pengelola {settings.brandName}
          </p>
        </div>

        {/* Login Card */}
        <div className="mt-8 bg-slate-800/90 border border-slate-700/80 backdrop-blur-xl py-8 px-5 sm:px-8 shadow-2xl rounded-2xl">
          {/* Demo Info Box */}
          <div className="mb-6 p-3 rounded-xl bg-indigo-950/70 border border-indigo-500/30 text-xs text-indigo-200 flex items-start gap-2.5">
            <Shield className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <span className="font-bold text-white block">Mode Simulasi Admin:</span>
              <span className="text-[11px] text-slate-300">
                Email: <code className="text-indigo-300">admin@webdev.id</code> | Sandi: <code className="text-indigo-300">admin123</code>
              </span>
            </div>
            <button
              type="button"
              id="btn-autofill-admin-demo"
              onClick={handleAutofillDemo}
              className="text-[11px] font-semibold bg-indigo-600 hover:bg-indigo-500 text-white px-2 py-1 rounded-lg transition-colors shrink-0"
            >
              Autofill
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Email Administrator
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="admin-login-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@webdev.id"
                  className="block w-full pl-9 pr-3 py-2 text-xs bg-slate-900/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Kata Sandi
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="admin-login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi (admin123)"
                  className="block w-full pl-9 pr-10 py-2 text-xs bg-slate-900/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? 'Sembunyi' : 'Lihat'}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                PIN Keamanan Tambahan (2FA)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  id="admin-login-pin"
                  type="text"
                  maxLength={6}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="6 Digit PIN (123456)"
                  className="block w-full pl-9 pr-3 py-2 text-xs bg-slate-900/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-400">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"
                />
                <span>Ingat sesi browser ini</span>
              </label>
              <span className="text-[11px] text-slate-400">Tier: Superadmin</span>
            </div>

            <button
              id="btn-submit-admin-login"
              type="submit"
              className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
            >
              <span>Masuk Sebagai Administrator</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Portal Switch Link */}
          <div className="mt-6 pt-5 border-t border-slate-700/60 text-center">
            <p className="text-xs text-slate-400 mb-2">Anda adalah klien / pelanggan website?</p>
            <button
              id="btn-switch-to-client-login"
              type="button"
              onClick={() => setAuthView('client_login')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/40 border border-emerald-500/30 transition-all cursor-pointer"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Buka Portal Masuk Klien &rarr;</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
