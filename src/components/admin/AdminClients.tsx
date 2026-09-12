import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Client } from '../../types';
import { formatRupiah, formatDateIndo } from '../../utils/formatters';
import {
  Users,
  Search,
  Plus,
  Phone,
  Mail,
  Building,
  Edit2,
  Trash2,
  ExternalLink,
  MessageCircle,
  Globe,
  CheckCircle,
  Clock,
  X,
} from 'lucide-react';

export const AdminClients: React.FC = () => {
  const { clients, services, invoices, addClient, updateClient, deleteClient, runWithLoading, showToast } = useApp();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const [form, setForm] = useState({
    name: '',
    company: '',
    email: '',
    phone: '628',
    address: '',
    status: 'active' as Client['status'],
    notes: '',
  });

  const filteredClients = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.company.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
  );

  const handleOpenAdd = () => {
    setEditingClient(null);
    setForm({
      name: '',
      company: '',
      email: '',
      phone: '628',
      address: '',
      status: 'active',
      notes: '',
    });
    setShowModal(true);
  };

  const handleOpenEdit = (c: Client) => {
    setEditingClient(c);
    setForm({
      name: c.name,
      company: c.company,
      email: c.email,
      phone: c.phone,
      address: c.address,
      status: c.status,
      notes: c.notes || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await runWithLoading(
      async () => {
        await new Promise((r) => setTimeout(r, 450));
        if (editingClient) {
          updateClient(editingClient.id, form);
          showToast(`Data klien ${form.name} berhasil diperbarui.`, 'success');
        } else {
          addClient(form);
          showToast(`Pelanggan baru ${form.name} berhasil ditambahkan!`, 'success');
        }
        setShowModal(false);
      },
      'Menyimpan data pelanggan ke database...'
    );
  };

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Manajemen Pelanggan</h2>
          <p className="text-xs text-slate-500">
            Kelola data kontak klien, profil perusahaan, dan riwayat website yang dibuat.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Pelanggan Baru</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Cari nama klien, nama usaha, email, atau nomor WhatsApp..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-indigo-500 shadow-xs"
        />
      </div>

      {/* Clients Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClients.map((client) => {
          const clientServices = services.filter((s) => s.clientId === client.id);
          const clientInvoices = invoices.filter((i) => i.clientId === client.id);
          const totalSpent = clientInvoices
            .filter((i) => i.status === 'paid')
            .reduce((sum, i) => sum + i.total, 0);
          const hasUnpaid = clientInvoices.some((i) => i.status === 'unpaid' || i.status === 'overdue');

          return (
            <div
              key={client.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">{client.name}</h3>
                    <p className="text-xs text-indigo-600 font-medium">{client.company}</p>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      client.status === 'active'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {client.status === 'active' ? 'Aktif' : 'Non-Aktif'}
                  </span>
                </div>

                <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{client.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-mono">+{client.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate text-slate-500">{client.address || '-'}</span>
                  </div>
                </div>

                {/* Services Tags */}
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Website Terkelola ({clientServices.length}):
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {clientServices.length === 0 ? (
                      <span className="text-[11px] text-slate-400 italic">Belum ada website</span>
                    ) : (
                      clientServices.map((srv) => (
                        <span
                          key={srv.id}
                          className="text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-2 py-0.5 rounded-md flex items-center gap-1"
                        >
                          <Globe className="w-3 h-3 text-indigo-500" />
                          <span>{srv.domain}</span>
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom Meta & Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">Total Transaksi:</span>
                  <span className="font-mono font-bold text-slate-900">
                    {formatRupiah(totalSpent)}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <a
                    href={`https://wa.me/${client.phone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg transition-colors"
                    title="Chat WhatsApp"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => handleOpenEdit(client)}
                    className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-lg transition-colors"
                    title="Edit Profil Klien"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={async () => {
                      if (confirm(`Hapus data pelanggan ${client.name}?`)) {
                        await runWithLoading(
                          async () => {
                            await new Promise((r) => setTimeout(r, 400));
                            deleteClient(client.id);
                            showToast(`Data pelanggan ${client.name} telah dihapus.`, 'info');
                          },
                          'Menghapus data pelanggan...'
                        );
                      }
                    }}
                    className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                    title="Hapus Klien"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Client Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-base text-slate-900">
                {editingClient ? 'Edit Data Pelanggan' : 'Tambah Pelanggan Baru'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Nama Klien / Penanggung Jawab *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Contoh: Budi Santoso"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-indigo-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Nama Usaha / Perusahaan</label>
                <input
                  type="text"
                  value={form.company}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                  placeholder="Contoh: Toko Berkah Mandiri"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="email@bisnis.com"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">WhatsApp (628..) *</label>
                  <input
                    type="text"
                    required
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="62812345678"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Alamat Kantor / Kota</label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="Jakarta Barat"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-indigo-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Catatan Khusus Klien</label>
                <textarea
                  rows={2}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Catatan preferensi, tanggal anniversary web, dll."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm"
                >
                  Simpan Pelanggan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
