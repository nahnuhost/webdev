import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Globe,
  Mail,
  Lock,
  ArrowRight,
  ArrowLeft,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  ShieldCheck,
} from 'lucide-react';

export const ClientForgotPassword: React.FC = () => {
  const { forgotPasswordClient, setAuthView, showToast, settings } = useApp();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [identifier, setIdentifier] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [simulatedCode, setSimulatedCode] = useState('748291');
  const [errorMsg, setErrorMsg] = useState('');

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!identifier.trim()) {
      setErrorMsg('Harap masukkan email atau nomor WhatsApp terdaftar Anda.');
      return;
    }
    // Simulate sending OTP
    const generated = Math.floor(100000 + Math.random() * 900000).toString();
    setSimulatedCode(generated);
    setStep(2);
    showToast(
      `Kode verifikasi simulasi (${generated}) telah dikirimkan ke WhatsApp & Email Anda.`,
      'info',
      'Kode OTP Terkirim'
    );
  };

  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (otpCode.trim() !== simulatedCode && otpCode.trim() !== '123456') {
      setErrorMsg('Kode verifikasi tidak sesuai. Silakan coba lagi atau gunakan tombol kode simulasi.');
      showToast('Kode OTP salah!', 'error');
      return;
    }
    setStep(3);
    showToast('Identitas terverifikasi. Silakan masukkan kata sandi baru.', 'success');
  };

  const handleStep3Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (newPassword.length < 6) {
      setErrorMsg('Kata sandi baru minimal harus 6 karakter.');
      showToast('Kata sandi minimal 6 karakter.', 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Konfirmasi kata sandi tidak cocok.');
      showToast('Konfirmasi kata sandi tidak cocok.', 'error');
      return;
    }

    await forgotPasswordClient(identifier, newPassword);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-10 sm:px-6 lg:px-8 font-sans text-slate-800">
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/20 mb-2.5">
            <KeyRound className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Lupa Kata Sandi Klien
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Pulihkan akses akun Anda ke portal layanan dan tagihan {settings.brandName}.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white py-7 px-5 sm:px-8 shadow-xl shadow-slate-200/50 border border-slate-200/80 rounded-2xl">
          {/* Step Indicators */}
          <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <span
                className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${
                  step === 1
                    ? 'bg-emerald-600 text-white'
                    : step > 1
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                1
              </span>
              <span className={`text-xs font-medium ${step === 1 ? 'text-slate-900 font-bold' : 'text-slate-500'}`}>
                Email / WA
              </span>
            </div>
            <div className="w-6 h-0.5 bg-slate-200"></div>
            <div className="flex items-center gap-2">
              <span
                className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${
                  step === 2
                    ? 'bg-emerald-600 text-white'
                    : step > 2
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                2
              </span>
              <span className={`text-xs font-medium ${step === 2 ? 'text-slate-900 font-bold' : 'text-slate-500'}`}>
                Verifikasi OTP
              </span>
            </div>
            <div className="w-6 h-0.5 bg-slate-200"></div>
            <div className="flex items-center gap-2">
              <span
                className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${
                  step === 3
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                3
              </span>
              <span className={`text-xs font-medium ${step === 3 ? 'text-slate-900 font-bold' : 'text-slate-500'}`}>
                Sandi Baru
              </span>
            </div>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* STEP 1: Masukkan Email atau WA */}
          {step === 1 && (
            <form onSubmit={handleStep1Submit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Masukkan Email atau No. WhatsApp Terdaftar
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="forgot-identifier"
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Contoh: budi@tokoberkah.id atau 62812345678"
                    className="block w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                <p className="mt-1.5 text-[11px] text-slate-500 leading-normal">
                  Sistem akan mengirimkan kode 6 digit untuk verifikasi kepemilikan akun.
                </p>
              </div>

              <button
                id="btn-submit-forgot-step1"
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
              >
                <span>Kirim Kode Verifikasi</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* STEP 2: Masukkan Kode OTP */}
          {step === 2 && (
            <form onSubmit={handleStep2Submit} className="space-y-4">
              {/* Simulated OTP Helper Banner */}
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900">
                <div className="flex items-center justify-between">
                  <span className="font-semibold flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                    Kode Simulasi:
                  </span>
                  <button
                    type="button"
                    onClick={() => setOtpCode(simulatedCode)}
                    className="font-bold text-emerald-700 bg-white px-2 py-0.5 rounded-md border border-emerald-300 text-[11px] hover:bg-emerald-100"
                  >
                    Gunakan {simulatedCode}
                  </button>
                </div>
                <p className="text-[11px] text-emerald-800 mt-1">
                  Dikirimkan ke WhatsApp/Email terdaftar: <strong>{identifier}</strong>
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Masukkan 6-Digit Kode Verifikasi
                </label>
                <input
                  id="forgot-otp-input"
                  type="text"
                  required
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="6 digit angka"
                  className="block w-full text-center tracking-widest text-lg font-bold py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-slate-500 hover:text-slate-800"
                >
                  Ubah Email/WA
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const generated = Math.floor(100000 + Math.random() * 900000).toString();
                    setSimulatedCode(generated);
                    showToast(`Kode baru (${generated}) berhasil dikirimkan kembali.`, 'info');
                  }}
                  className="text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  Kirim Ulang Kode
                </button>
              </div>

              <button
                id="btn-submit-forgot-step2"
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
              >
                <span>Verifikasi Kode</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* STEP 3: Buat Sandi Baru */}
          {step === 3 && (
            <form onSubmit={handleStep3Submit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Kata Sandi Baru
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="forgot-new-password"
                    type="password"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    className="block w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Ulangi Kata Sandi Baru
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="forgot-confirm-password"
                    type="password"
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ketik ulang kata sandi baru"
                    className="block w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>

              <button
                id="btn-submit-forgot-step3"
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
              >
                <span>Simpan Kata Sandi & Masuk</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Back to Login Link */}
          <div className="mt-5 pt-4 border-t border-slate-100 text-center">
            <button
              id="btn-back-to-client-login-from-forgot"
              type="button"
              onClick={() => setAuthView('client_login')}
              className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali ke Halaman Masuk Klien</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
