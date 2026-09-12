import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { NotificationDropdown } from './NotificationDropdown';
import {
  Globe,
  UserCheck,
  ShieldAlert,
  RotateCcw,
  ChevronDown,
  UserPlus,
  Building,
  User,
  CreditCard,
  Briefcase,
  LogOut,
  Menu,
  X,
  Shield,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    role,
    setRole,
    clients,
    activeClientId,
    setActiveClientId,
    activeClient,
    settings,
    resetAllData,
    addClient,
    logout,
  } = useApp();

  const [showClientMenu, setShowClientMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showNewClientModal, setShowNewClientModal] = useState(false);
  const [newClientForm, setNewClientForm] = useState({
    name: '',
    company: '',
    email: '',
    phone: '628',
    address: '',
    notes: '',
  });

  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientForm.name || !newClientForm.email) return;

    const created = addClient({
      name: newClientForm.name,
      company: newClientForm.company || newClientForm.name,
      email: newClientForm.email,
      phone: newClientForm.phone,
      address: newClientForm.address || 'Indonesia',
      status: 'active',
      notes: newClientForm.notes,
    });

    setActiveClientId(created.id);
    setShowNewClientModal(false);
    setNewClientForm({
      name: '',
      company: '',
      email: '',
      phone: '628',
      address: '',
      notes: '',
    });
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand / Logo */}
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-sm shadow-indigo-200 shrink-0">
                <Globe className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="font-bold text-slate-900 text-sm sm:text-lg tracking-tight truncate max-w-[130px] sm:max-w-none">
                    {settings.brandName}
                  </span>
                  <span
                    className={`text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 ${
                      role === 'admin'
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    }`}
                  >
                    {role === 'admin' ? 'Admin' : 'Klien'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 hidden sm:block truncate">
                  {role === 'admin'
                    ? 'Manajemen Klien, Layanan Website & Billing'
                    : `Masuk sebagai: ${activeClient?.name || 'Pelanggan'} (${activeClient?.company || ''})`}
                </p>
              </div>
            </div>

            {/* Right Controls (Desktop & Mobile) */}
            <div className="flex items-center gap-1.5 sm:gap-2.5">
              {/* Reset Data Button (Desktop only) */}
              <button
                onClick={() => {
                  if (confirm('Reset ulang data simulasi ke awal?')) {
                    resetAllData();
                  }
                }}
                className="hidden lg:flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 text-xs transition-colors"
                title="Reset data demo ke awal"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Demo</span>
              </button>

              {/* Client Selector (when in Client Mode) */}
              {role === 'client' && (
                <div className="relative">
                  <button
                    id="btn-select-active-client"
                    onClick={() => setShowClientMenu(!showClientMenu)}
                    className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg border border-emerald-300 bg-emerald-50/70 text-emerald-900 text-xs font-medium hover:bg-emerald-100/70 transition-colors"
                  >
                    <User className="w-3.5 h-3.5 text-emerald-700" />
                    <span className="max-w-[90px] sm:max-w-[150px] truncate">
                      {activeClient?.name}
                    </span>
                    <ChevronDown className="w-3 h-3 text-emerald-700" />
                  </button>

                  {showClientMenu && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50">
                      <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                        Ganti Akun Pelanggan (Demo)
                      </div>
                      <div className="max-h-60 overflow-y-auto">
                        {clients.map((c) => (
                          <button
                            key={c.id}
                            onClick={() => {
                              setActiveClientId(c.id);
                              setShowClientMenu(false);
                            }}
                            className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition-colors ${
                              c.id === activeClientId
                                ? 'bg-emerald-50 font-semibold text-emerald-900'
                                : 'text-slate-700'
                            }`}
                          >
                            <div className="truncate">
                              <p className="truncate font-medium">{c.name}</p>
                              <p className="text-[10px] text-slate-400 truncate">{c.company}</p>
                            </div>
                            {c.id === activeClientId && (
                              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                            )}
                          </button>
                        ))}
                      </div>
                      <div className="pt-1 mt-1 border-t border-slate-100 px-2">
                        <button
                          onClick={() => {
                            setShowClientMenu(false);
                            setShowNewClientModal(true);
                          }}
                          className="w-full flex items-center gap-1.5 px-2 py-1.5 text-xs text-indigo-600 hover:bg-indigo-50 rounded-lg font-medium transition-colors"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>Daftar Klien Baru</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Notification Bell */}
              <NotificationDropdown />

              {/* Role Toggle Switcher (Hidden on small screens, accessible in mobile menu) */}
              <div className="hidden md:flex bg-slate-100 p-1 rounded-xl items-center border border-slate-200/80">
                <button
                  id="btn-switch-admin"
                  onClick={() => setRole('admin')}
                  className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    role === 'admin'
                      ? 'bg-white text-slate-900 shadow-xs border border-slate-200/60'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Briefcase className="w-3.5 h-3.5 text-amber-600" />
                  <span>Admin</span>
                </button>
                <button
                  id="btn-switch-client"
                  onClick={() => setRole('client')}
                  className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    role === 'client'
                      ? 'bg-white text-slate-900 shadow-xs border border-slate-200/60'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Klien</span>
                </button>
              </div>

              {/* Logout Button */}
              <button
                id="btn-header-logout"
                onClick={() => logout(role)}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border border-slate-200 hover:border-rose-200 bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-600 text-xs font-semibold transition-all shadow-2xs cursor-pointer"
                title="Keluar dari portal"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Keluar</span>
              </button>

              {/* Mobile Quick Switcher Toggle */}
              <button
                id="btn-toggle-mobile-header-menu"
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="md:hidden p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100"
                aria-label="Menu Opsi"
              >
                {showMobileMenu ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu for Switcher & Actions */}
        {showMobileMenu && (
          <div className="md:hidden border-t border-slate-200 bg-slate-50 px-4 py-3 space-y-3">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Beralih Tampilan Portal:
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setRole('admin');
                  setShowMobileMenu(false);
                }}
                className={`flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold border transition-all ${
                  role === 'admin'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200'
                }`}
              >
                <Briefcase className="w-4 h-4" />
                <span>Portal Admin</span>
              </button>
              <button
                onClick={() => {
                  setRole('client');
                  setShowMobileMenu(false);
                }}
                className={`flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold border transition-all ${
                  role === 'client'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200'
                }`}
              >
                <UserCheck className="w-4 h-4" />
                <span>Portal Klien</span>
              </button>
            </div>

            <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
              <button
                onClick={() => {
                  if (confirm('Reset ulang data simulasi ke awal?')) {
                    resetAllData();
                    setShowMobileMenu(false);
                  }
                }}
                className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 py-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Demo</span>
              </button>

              <button
                onClick={() => {
                  setShowMobileMenu(false);
                  logout(role);
                }}
                className="flex items-center gap-1.5 text-rose-600 font-semibold py-1"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Keluar (Logout)</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Modal Daftar Klien Baru */}
      {showNewClientModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">Daftar Akun Pelanggan Baru</h3>
            <p className="text-xs text-slate-500 mb-4">
              Buat akun klien baru untuk menguji portal pemesanan dan pembayaran mandiri.
            </p>

            <form onSubmit={handleCreateClient} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Nama Lengkap *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Rian Pratama"
                  value={newClientForm.name}
                  onChange={(e) => setNewClientForm({ ...newClientForm, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Nama Usaha / Perusahaan
                </label>
                <input
                  type="text"
                  placeholder="Contoh: CV Pratama Digital"
                  value={newClientForm.company}
                  onChange={(e) => setNewClientForm({ ...newClientForm, company: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="rian@pratama.id"
                    value={newClientForm.email}
                    onChange={(e) => setNewClientForm({ ...newClientForm, email: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    WhatsApp *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="62812345678"
                    value={newClientForm.phone}
                    onChange={(e) => setNewClientForm({ ...newClientForm, phone: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Alamat / Kota</label>
                <input
                  type="text"
                  placeholder="Jakarta / Bandung / Surabaya"
                  value={newClientForm.address}
                  onChange={(e) => setNewClientForm({ ...newClientForm, address: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewClientModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm"
                >
                  Simpan & Masuk Klien
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
