import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { InvoiceModal } from './components/common/InvoiceModal';
import { PaymentGatewayModal } from './components/common/PaymentGatewayModal';
import { WhatsAppReminderModal } from './components/common/WhatsAppReminderModal';
import { ToastContainer } from './components/common/ToastContainer';

// Auth Pages
import { AdminLogin } from './components/auth/AdminLogin';
import { ClientLogin } from './components/auth/ClientLogin';
import { ClientRegister } from './components/auth/ClientRegister';
import { ClientForgotPassword } from './components/auth/ClientForgotPassword';

// Admin Components
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminClients } from './components/admin/AdminClients';
import { AdminServices } from './components/admin/AdminServices';
import { AdminInvoices } from './components/admin/AdminInvoices';
import { AdminProducts } from './components/admin/AdminProducts';
import { AdminOrders } from './components/admin/AdminOrders';
import { AdminPayments } from './components/admin/AdminPayments';
import { AdminSettings } from './components/admin/AdminSettings';
import { AdminLogs } from './components/admin/AdminLogs';

// Client Components
import { ClientDashboard } from './components/client/ClientDashboard';
import { ClientShop } from './components/client/ClientShop';
import { ClientServices } from './components/client/ClientServices';
import { ClientInvoices } from './components/client/ClientInvoices';
import { ClientOrders } from './components/client/ClientOrders';
import { ClientLogs } from './components/client/ClientLogs';

import { Invoice } from './types';
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingBag,
  FileText,
  CreditCard,
  Globe,
  Settings,
  Activity,
  Key,
  Clock,
  Sparkles,
  HelpCircle,
  MessageCircle,
} from 'lucide-react';

function MainAppContent() {
  const {
    role,
    invoices,
    services,
    orders,
    activeClient,
    settings,
    isAuthenticated,
    authView,
  } = useApp();

  // Navigation Tabs State
  const [adminTab, setAdminTab] = useState('dashboard');
  const [clientTab, setClientTab] = useState('dashboard');

  // Modal State
  const [selectedInvoiceForModal, setSelectedInvoiceForModal] = useState<Invoice | null>(null);
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState<Invoice | null>(null);
  const [selectedInvoiceForReminder, setSelectedInvoiceForReminder] = useState<Invoice | null>(null);
  const [showDirectNewInvoiceModal, setShowDirectNewInvoiceModal] = useState(false);

  // Counters
  const unpaidInvoicesCount = invoices.filter((i) => i.status === 'unpaid' || i.status === 'overdue').length;
  const pendingOrdersCount = orders.filter((o) => o.status === 'pending').length;
  const expiringServicesCount = services.filter((s) => {
    const diffDays = Math.ceil((new Date(s.expiryDate).getTime() - Date.now()) / (1000 * 3600 * 24));
    return diffDays <= 30;
  }).length;

  const clientUnpaidCount = invoices.filter(
    (i) => i.clientId === activeClient?.id && (i.status === 'unpaid' || i.status === 'overdue')
  ).length;

  // Handlers
  const handleOpenInvoiceModal = (inv: Invoice) => {
    setSelectedInvoiceForModal(inv);
  };

  const handleOpenPaymentModal = (inv: Invoice) => {
    setSelectedInvoiceForPayment(inv);
  };

  const handleOpenReminderModal = (inv: Invoice) => {
    setSelectedInvoiceForReminder(inv);
  };

  const handleOpenNewInvoiceFromDashboard = () => {
    setAdminTab('invoices');
    setShowDirectNewInvoiceModal(true);
  };

  // If user is not authenticated or currently on an auth flow screen:
  if (!isAuthenticated || authView) {
    return (
      <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
        <ToastContainer />
        {authView === 'admin_login' && <AdminLogin />}
        {authView === 'client_login' && <ClientLogin />}
        {authView === 'client_register' && <ClientRegister />}
        {authView === 'client_forgot_password' && <ClientForgotPassword />}
        {!authView && (role === 'admin' ? <AdminLogin /> : <ClientLogin />)}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      {/* Global Notifications */}
      <ToastContainer />

      {/* Top Application Header */}
      <Header />

      {/* Main App Container */}
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 flex-1 flex flex-col space-y-5">
        {/* Navigation Bar for Admin */}
        {role === 'admin' ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-1.5 overflow-x-auto">
            <nav className="flex items-center gap-1 min-w-max">
              <button
                id="tab-admin-dashboard"
                onClick={() => setAdminTab('dashboard')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  adminTab === 'dashboard'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard & Laporan</span>
              </button>

              <button
                id="tab-admin-clients"
                onClick={() => setAdminTab('clients')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  adminTab === 'clients'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Manajemen Pelanggan</span>
              </button>

              <button
                id="tab-admin-services"
                onClick={() => setAdminTab('services')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  adminTab === 'services'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Globe className="w-4 h-4" />
                <span>Layanan & Kredensial</span>
                {expiringServicesCount > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      adminTab === 'services' ? 'bg-white/30 text-white' : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {expiringServicesCount}
                  </span>
                )}
              </button>

              <button
                id="tab-admin-invoices"
                onClick={() => setAdminTab('invoices')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  adminTab === 'invoices'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Manajemen Tagihan</span>
                {unpaidInvoicesCount > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      adminTab === 'invoices' ? 'bg-white/30 text-white' : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {unpaidInvoicesCount}
                  </span>
                )}
              </button>

              <button
                id="tab-admin-products"
                onClick={() => setAdminTab('products')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  adminTab === 'products'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Package className="w-4 h-4" />
                <span>Manajemen Produk</span>
              </button>

              <button
                id="tab-admin-orders"
                onClick={() => setAdminTab('orders')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  adminTab === 'orders'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Manajemen Pembelian</span>
                {pendingOrdersCount > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      adminTab === 'orders' ? 'bg-white/30 text-white' : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {pendingOrdersCount}
                  </span>
                )}
              </button>

              <button
                id="tab-admin-payments"
                onClick={() => setAdminTab('payments')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  adminTab === 'payments'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>Manajemen Pembayaran</span>
              </button>

              <button
                id="tab-admin-settings"
                onClick={() => setAdminTab('settings')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  adminTab === 'settings'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>Pengaturan & Kupon</span>
              </button>

              <button
                id="tab-admin-logs"
                onClick={() => setAdminTab('logs')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  adminTab === 'logs'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Activity className="w-4 h-4" />
                <span>Log Aktifitas</span>
              </button>
            </nav>
          </div>
        ) : (
          /* Navigation Bar for Client */
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-1.5 overflow-x-auto">
            <nav className="flex items-center gap-1 min-w-max">
              <button
                id="tab-client-dashboard"
                onClick={() => setClientTab('dashboard')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  clientTab === 'dashboard'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </button>

              <button
                id="tab-client-shop"
                onClick={() => setClientTab('shop')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  clientTab === 'shop'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Beli Layanan & Paket</span>
              </button>

              <button
                id="tab-client-services"
                onClick={() => setClientTab('services')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  clientTab === 'services'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Globe className="w-4 h-4" />
                <span>Layanan & Akses Kredensial</span>
              </button>

              <button
                id="tab-client-invoices"
                onClick={() => setClientTab('invoices')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  clientTab === 'invoices'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Tagihan & Pembayaran</span>
                {clientUnpaidCount > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      clientTab === 'invoices' ? 'bg-white/30 text-white' : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {clientUnpaidCount}
                  </span>
                )}
              </button>

              <button
                id="tab-client-orders"
                onClick={() => setClientTab('orders')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  clientTab === 'orders'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>Riwayat Pembelian</span>
              </button>

              <button
                id="tab-client-logs"
                onClick={() => setClientTab('logs')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  clientTab === 'logs'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Activity className="w-4 h-4" />
                <span>Log Aktifitas</span>
              </button>
            </nav>
          </div>
        )}

        {/* View Switcher Container */}
        <main className="flex-1">
          {role === 'admin' ? (
            <>
              {adminTab === 'dashboard' && (
                <AdminDashboard
                  onNavigateTab={(tab) => setAdminTab(tab)}
                  onOpenInvoiceModal={handleOpenInvoiceModal}
                  onOpenReminderModal={handleOpenReminderModal}
                  onOpenNewInvoiceModal={handleOpenNewInvoiceFromDashboard}
                />
              )}
              {adminTab === 'clients' && <AdminClients />}
              {adminTab === 'services' && <AdminServices />}
              {adminTab === 'invoices' && (
                <AdminInvoices
                  onOpenInvoiceModal={handleOpenInvoiceModal}
                  onOpenReminderModal={handleOpenReminderModal}
                  showCreateModalDirectly={showDirectNewInvoiceModal}
                  onCloseDirectModal={() => setShowDirectNewInvoiceModal(false)}
                />
              )}
              {adminTab === 'products' && <AdminProducts />}
              {adminTab === 'orders' && (
                <AdminOrders onOpenInvoiceModal={handleOpenInvoiceModal} />
              )}
              {adminTab === 'payments' && <AdminPayments />}
              {adminTab === 'settings' && <AdminSettings />}
              {adminTab === 'logs' && <AdminLogs />}
            </>
          ) : (
            <>
              {clientTab === 'dashboard' && (
                <ClientDashboard
                  onNavigateTab={(tab) => setClientTab(tab)}
                  onOpenInvoiceModal={handleOpenInvoiceModal}
                  onOpenPaymentModal={handleOpenPaymentModal}
                />
              )}
              {clientTab === 'shop' && (
                <ClientShop onOpenPaymentModal={handleOpenPaymentModal} />
              )}
              {clientTab === 'services' && (
                <ClientServices onOpenPaymentModal={handleOpenPaymentModal} />
              )}
              {clientTab === 'invoices' && (
                <ClientInvoices
                  onOpenInvoiceModal={handleOpenInvoiceModal}
                  onOpenPaymentModal={handleOpenPaymentModal}
                />
              )}
              {clientTab === 'orders' && (
                <ClientOrders onOpenInvoiceModal={handleOpenInvoiceModal} />
              )}
              {clientTab === 'logs' && <ClientLogs />}
            </>
          )}
        </main>
      </div>

      {/* Global Modals */}
      {selectedInvoiceForModal && (
        <InvoiceModal
          invoice={selectedInvoiceForModal}
          onClose={() => setSelectedInvoiceForModal(null)}
          onPayNow={(inv) => {
            setSelectedInvoiceForModal(null);
            setSelectedInvoiceForPayment(inv);
          }}
        />
      )}

      {selectedInvoiceForPayment && (
        <PaymentGatewayModal
          invoice={selectedInvoiceForPayment}
          onClose={() => setSelectedInvoiceForPayment(null)}
          onSuccess={() => {
            // Refreshed automatically via AppContext
          }}
        />
      )}

      {selectedInvoiceForReminder && (
        <WhatsAppReminderModal
          invoice={selectedInvoiceForReminder}
          onClose={() => setSelectedInvoiceForReminder(null)}
        />
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200/80 py-4 mt-8 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p>
            &copy; {new Date().getFullYear()} <strong>{settings.brandName}</strong> — Platform Manajemen Klien & Tagihan Website
          </p>
          <p className="text-[11px] text-slate-400">
            Freelancer: <strong className="text-slate-600">{settings.freelancerName}</strong> | WhatsApp: +{settings.phone}
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
