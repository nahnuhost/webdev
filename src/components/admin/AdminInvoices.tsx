import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Invoice, InvoiceItem } from '../../types';
import { formatRupiah, formatDateIndo } from '../../utils/formatters';
import {
  FileText,
  Plus,
  Search,
  CheckCircle,
  Clock,
  AlertTriangle,
  Send,
  Trash2,
  X,
  PlusCircle,
  Printer,
  CreditCard,
  Building,
} from 'lucide-react';

interface AdminInvoicesProps {
  onOpenInvoiceModal: (invoice: Invoice) => void;
  onOpenReminderModal: (invoice: Invoice) => void;
  showCreateModalDirectly?: boolean;
  onCloseDirectModal?: () => void;
}

export const AdminInvoices: React.FC<AdminInvoicesProps> = ({
  onOpenInvoiceModal,
  onOpenReminderModal,
  showCreateModalDirectly = false,
  onCloseDirectModal,
}) => {
  const { clients, services, invoices, createInvoice, updateInvoiceStatus, deleteInvoice, runWithLoading, showToast } = useApp();

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(showCreateModalDirectly);

  // Form State
  const [selectedClientId, setSelectedClientId] = useState(clients[0]?.id || '');
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().substring(0, 10));
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString().substring(0, 10)
  );
  const [items, setItems] = useState<Omit<InvoiceItem, 'id'>[]>([
    {
      description: 'Perpanjangan Hosting Cloud NVMe & Nama Domain (1 Tahun)',
      quantity: 1,
      unitPrice: 1500000,
      total: 1500000,
    },
  ]);
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState('');

  const filteredInvoices = invoices.filter((inv) => {
    const matchSearch =
      inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      inv.clientName.toLowerCase().includes(search.toLowerCase()) ||
      (inv.websiteName && inv.websiteName.toLowerCase().includes(search.toLowerCase()));

    if (!matchSearch) return false;
    if (filterStatus === 'all') return true;
    return inv.status === filterStatus;
  });

  const totalAll = invoices.reduce((sum, i) => sum + i.total, 0);
  const totalPaid = invoices.filter((i) => i.status === 'paid').reduce((sum, i) => sum + i.total, 0);
  const totalUnpaid = invoices.filter((i) => i.status === 'unpaid' || i.status === 'overdue').reduce((sum, i) => sum + i.total, 0);

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        description: 'Jasa Tambahan / Maintenance Website',
        quantity: 1,
        unitPrice: 500000,
        total: 500000,
      },
    ]);
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const updated = [...items];
    const cur = { ...updated[index], [field]: value };
    if (field === 'quantity' || field === 'unitPrice') {
      cur.total = Number(cur.quantity) * Number(cur.unitPrice);
    }
    updated[index] = cur;
    setItems(updated);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, idx) => idx !== index));
  };

  const subtotal = items.reduce((sum, it) => sum + it.total, 0);
  const grandTotal = Math.max(0, subtotal - discount);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const client = clients.find((c) => c.id === selectedClientId);
    const service = services.find((s) => s.id === selectedServiceId);

    await runWithLoading(
      async () => {
        await new Promise((r) => setTimeout(r, 600));
        const created = createInvoice({
          clientId: selectedClientId,
          clientName: client?.name || 'Pelanggan',
          serviceId: selectedServiceId || undefined,
          websiteName: service?.websiteName,
          items: items.map((it, idx) => ({ ...it, id: `item-${Date.now()}-${idx}` })),
          subtotal,
          discount,
          total: grandTotal,
          issueDate,
          dueDate,
          status: 'unpaid',
          notes: notes || 'Pembayaran dapat dilakukan mandiri via QRIS instan atau Transfer Virtual Account.',
        });

        setShowCreateModal(false);
        if (onCloseDirectModal) onCloseDirectModal();
        showToast(
          `Tagihan ${created.invoiceNumber} untuk ${created.clientName} berhasil diterbitkan!`,
          'success',
          'Invoice Diterbitkan'
        );
      },
      'Menerbitkan dan mengalkulasi tagihan invoice baru...'
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Manajemen Tagihan & Invoice</h2>
          <p className="text-xs text-slate-500">
            Terbitkan tagihan baru, pantau status pembayaran, dan kirim pengingat WhatsApp dengan satu klik.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Tagihan Baru</span>
        </button>
      </div>

      {/* Summary KPI Pills */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Total Terbit</span>
            <p className="font-mono font-bold text-slate-900 text-lg">{formatRupiah(totalAll)}</p>
          </div>
          <span className="text-xs font-semibold px-2 py-1 bg-slate-100 rounded-lg text-slate-700">
            {invoices.length} Faktur
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-emerald-600 uppercase">Total Terbayar</span>
            <p className="font-mono font-bold text-emerald-700 text-lg">{formatRupiah(totalPaid)}</p>
          </div>
          <span className="text-xs font-semibold px-2 py-1 bg-emerald-50 text-emerald-700 rounded-lg">
            {invoices.filter((i) => i.status === 'paid').length} Lunas
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-amber-600 uppercase">Tertunggak / Pending</span>
            <p className="font-mono font-bold text-amber-600 text-lg">{formatRupiah(totalUnpaid)}</p>
          </div>
          <span className="text-xs font-semibold px-2 py-1 bg-amber-50 text-amber-700 rounded-lg">
            {invoices.filter((i) => i.status !== 'paid').length} Menunggu
          </span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nomor invoice, nama pelanggan, atau nama website..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-indigo-500 shadow-xs"
          />
        </div>

        <div className="flex gap-1.5 p-1 bg-white rounded-xl border border-slate-200 text-xs overflow-x-auto">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              filterStatus === 'all' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600'
            }`}
          >
            Semua
          </button>
          <button
            onClick={() => setFilterStatus('unpaid')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              filterStatus === 'unpaid' ? 'bg-amber-50 text-amber-700 font-bold' : 'text-slate-600'
            }`}
          >
            Belum Lunas
          </button>
          <button
            onClick={() => setFilterStatus('overdue')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              filterStatus === 'overdue' ? 'bg-rose-50 text-rose-700 font-bold' : 'text-slate-600'
            }`}
          >
            Overdue
          </button>
          <button
            onClick={() => setFilterStatus('paid')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              filterStatus === 'paid' ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-slate-600'
            }`}
          >
            Lunas
          </button>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">No. Invoice</th>
                <th className="py-3 px-4">Pelanggan</th>
                <th className="py-3 px-4">Website Terkait</th>
                <th className="py-3 px-4">Tanggal Terbit</th>
                <th className="py-3 px-4">Jatuh Tempo</th>
                <th className="py-3 px-4 text-right">Total Tagihan</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-indigo-600">
                    {inv.invoiceNumber}
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-900">{inv.clientName}</td>
                  <td className="py-3 px-4 text-slate-600">{inv.websiteName || '-'}</td>
                  <td className="py-3 px-4 text-slate-500">{formatDateIndo(inv.issueDate)}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`font-semibold ${
                        inv.status === 'overdue'
                          ? 'text-rose-600'
                          : inv.status === 'unpaid'
                          ? 'text-amber-600'
                          : 'text-slate-600'
                      }`}
                    >
                      {formatDateIndo(inv.dueDate)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                    {formatRupiah(inv.total)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        inv.status === 'paid'
                          ? 'bg-emerald-100 text-emerald-800'
                          : inv.status === 'overdue'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {inv.status === 'paid'
                        ? 'Lunas'
                        : inv.status === 'overdue'
                        ? 'Overdue'
                        : 'Belum Lunas'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onOpenInvoiceModal(inv)}
                        className="p-1.5 hover:bg-slate-100 text-slate-600 hover:text-indigo-600 rounded-lg transition-colors"
                        title="Lihat Faktur / Cetak"
                      >
                        <FileText className="w-3.5 h-3.5" />
                      </button>

                      {inv.status !== 'paid' ? (
                        <>
                          <button
                            onClick={() => onOpenReminderModal(inv)}
                            className="p-1.5 hover:bg-emerald-50 text-emerald-600 rounded-lg transition-colors"
                            title="Kirim Pengingat WhatsApp"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={async () => {
                              if (confirm(`Tandai invoice ${inv.invoiceNumber} LUNAS secara manual?`)) {
                                await runWithLoading(
                                  async () => {
                                    await new Promise((r) => setTimeout(r, 500));
                                    updateInvoiceStatus(inv.id, 'paid', 'Verifikasi Manual Admin');
                                    showToast(
                                      `Invoice ${inv.invoiceNumber} berhasil ditandai LUNAS.`,
                                      'success',
                                      'Status Diperbarui'
                                    );
                                  },
                                  'Memperbarui status pembayaran invoice...'
                                );
                              }
                            }}
                            className="p-1.5 hover:bg-emerald-50 text-slate-400 hover:text-emerald-700 rounded-lg transition-colors cursor-pointer"
                            title="Tandai Lunas"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                          </button>
                        </>
                      ) : null}

                      <button
                        onClick={async () => {
                          if (confirm(`Hapus invoice ${inv.invoiceNumber}?`)) {
                            await runWithLoading(
                              async () => {
                                await new Promise((r) => setTimeout(r, 400));
                                deleteInvoice(inv.id);
                                showToast(`Invoice ${inv.invoiceNumber} telah dihapus.`, 'info');
                              },
                              'Menghapus tagihan dari database...'
                            );
                          }
                        }}
                        className="p-1.5 hover:bg-rose-50 text-slate-300 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                        title="Hapus Invoice"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create New Invoice Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-base text-slate-900">Buat Tagihan / Invoice Baru</h3>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  if (onCloseDirectModal) onCloseDirectModal();
                }}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Pilih Klien *</label>
                  <select
                    value={selectedClientId}
                    onChange={(e) => {
                      setSelectedClientId(e.target.value);
                      setSelectedServiceId('');
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-indigo-500"
                  >
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} - {c.company}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Hubungkan Layanan Website (Opsional)
                  </label>
                  <select
                    value={selectedServiceId}
                    onChange={(e) => setSelectedServiceId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-indigo-500"
                  >
                    <option value="">-- Tanpa Tautan Website Khusus --</option>
                    {services
                      .filter((s) => s.clientId === selectedClientId)
                      .map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.websiteName} ({s.domain})
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Tanggal Terbit *</label>
                  <input
                    type="date"
                    required
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Jatuh Tempo Pembayaran *</label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-indigo-500"
                  />
                </div>
              </div>

              {/* Items Table */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-slate-800">Rincian Layanan / Biaya</span>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 text-[11px]"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Tambah Baris Item</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {items.map((it, idx) => (
                    <div key={idx} className="flex gap-2 items-center bg-slate-50 p-2 rounded-xl border border-slate-200">
                      <input
                        type="text"
                        required
                        placeholder="Deskripsi layanan..."
                        value={it.description}
                        onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                        className="flex-3 px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                      />
                      <input
                        type="number"
                        min="1"
                        placeholder="Qty"
                        value={it.quantity}
                        onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                        className="w-14 px-2 py-1.5 rounded-lg border border-slate-300 bg-white text-center"
                      />
                      <input
                        type="number"
                        placeholder="Harga (Rp)"
                        value={it.unitPrice}
                        onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)}
                        className="w-28 px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-right font-mono"
                      />
                      <span className="w-28 text-right font-mono font-bold text-slate-800">
                        {formatRupiah(it.total)}
                      </span>
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="p-1 text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Calculation */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Subtotal:</span>
                  <span className="font-mono font-bold text-slate-800">{formatRupiah(subtotal)}</span>
                </div>

                <div className="flex justify-between items-center gap-4">
                  <span className="text-slate-600">Potongan Diskon (Rp):</span>
                  <input
                    type="number"
                    min="0"
                    value={discount}
                    onChange={(e) => setDiscount(Number(e.target.value))}
                    className="w-32 px-2.5 py-1 text-right rounded-lg border border-slate-300 font-mono bg-white"
                  />
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-slate-200 text-sm font-bold text-slate-900">
                  <span>Total Tagihan Bersih:</span>
                  <span className="font-mono text-base text-indigo-700">{formatRupiah(grandTotal)}</span>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Catatan Tambahan untuk Klien</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Informasi rekening atau instruksi pembayaran..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    if (onCloseDirectModal) onCloseDirectModal();
                  }}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm"
                >
                  Terbitkan Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
