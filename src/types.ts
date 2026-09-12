export type Role = 'admin' | 'client';

export type AuthView = 'admin_login' | 'client_login' | 'client_register' | 'client_forgot_password';

export interface ToastMessage {
  id: string;
  title?: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

export interface UserSession {
  role: Role;
  userId: string;
  name: string;
  email: string;
}

export type BillingCycle = 'one-time' | 'monthly' | 'yearly';

export interface Client {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string; // WhatsApp formatted
  address: string;
  joinedDate: string;
  avatar?: string;
  status: 'active' | 'inactive';
  notes?: string;
  segment?: 'enterprise' | 'umkm' | 'personal';
}

export interface ProductPackage {
  id: string;
  name: string;
  price: number;
  billingCycle: BillingCycle;
  features: string[];
  popular?: boolean;
}

export interface Product {
  id: string;
  name: string;
  category: 'website' | 'maintenance' | 'hosting' | 'redesign' | 'custom';
  description: string;
  iconName: string;
  packages: ProductPackage[];
  active: boolean;
}

export interface ServiceCredentials {
  cpanelUrl?: string;
  cpanelUser?: string;
  cpanelPassword?: string;
  cmsAdminUrl?: string;
  cmsUser?: string;
  cmsPassword?: string;
  emailProvider?: string;
  emailAddress?: string;
  emailPassword?: string;
  serverIp?: string;
  nameservers?: string[];
  notes?: string;
}

export interface ClientService {
  id: string;
  clientId: string;
  clientName: string;
  productId: string;
  packageId: string;
  productName: string;
  packageName: string;
  websiteName: string;
  domain: string;
  url: string;
  billingCycle: BillingCycle;
  price: number;
  startDate: string;
  expiryDate: string;
  status: 'active' | 'expiring_soon' | 'expired' | 'suspended';
  credentials: ServiceCredentials;
  autoRenewReminder: boolean;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  clientName: string;
  serviceId?: string;
  websiteName?: string;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  couponCode?: string;
  total: number;
  issueDate: string;
  dueDate: string;
  paidDate?: string;
  status: 'unpaid' | 'paid' | 'overdue' | 'cancelled';
  paymentMethod?: string;
  paymentReference?: string;
  notes?: string;
}

export interface PaymentTransaction {
  id: string;
  transactionNumber: string;
  invoiceId: string;
  invoiceNumber: string;
  clientId: string;
  clientName: string;
  amount: number;
  paymentMethod: 'qris' | 'bca_va' | 'mandiri_va' | 'bri_va' | 'bank_transfer' | 'ewallet';
  channelName: string;
  status: 'pending' | 'success' | 'failed' | 'expired';
  gatewayRef: string;
  createdAt: string;
  paidAt?: string;
  proofUrl?: string;
}

export interface OrderItem {
  id: string;
  orderNumber: string;
  clientId: string;
  clientName: string;
  productId: string;
  productName: string;
  packageId: string;
  packageName: string;
  price: number;
  websiteName: string;
  requestedDomain: string;
  billingCycle: BillingCycle;
  status: 'pending_payment' | 'processing' | 'active' | 'cancelled';
  createdAt: string;
  invoiceId: string;
  notes?: string;
}

export type DiscountType = 'percentage' | 'fixed';
export type CouponApplicableTo = 'all' | 'purchase' | 'renewal';

export interface Coupon {
  id: string;
  code: string;
  discountType: DiscountType; // 'percentage' or 'fixed'
  discountValue: number; // % (e.g. 15 for 15%) or fixed amount (e.g. 250000 for Rp 250.000)
  discountPercent?: number; // fallback compatibility
  maxDiscount: number; // max cap for percentage (e.g. 500000); 0 or amount for fixed
  validUntil: string;
  minSpend: number;
  applicableTo: CouponApplicableTo; // 'all' | 'purchase' | 'renewal'
  usageLimit?: number; // max total redemptions allowed, 0 or undefined for unlimited
  usedCount: number; // current usage count
  isActive: boolean;
  description?: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  actor: 'admin' | 'client' | 'system';
  actorName: string;
  action: string;
  details: string;
  category: 'billing' | 'service' | 'order' | 'payment' | 'auth' | 'credential';
}

export interface NotificationItem {
  id: string;
  target: 'admin' | 'client' | 'all';
  clientId?: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'info' | 'warning' | 'success' | 'urgent';
  linkTab?: string;
}

export interface AppSettings {
  freelancerName: string;
  brandName: string;
  tagline: string;
  email: string;
  phone: string;
  address: string;
  bankAccounts: Array<{
    bank: string;
    accountNumber: string;
    accountHolder: string;
  }>;
  paymentGateway: {
    enabled: boolean;
    provider: 'midtrans' | 'xendit' | 'tripay';
    merchantId: string;
    clientKey: string;
    serverKey: string;
    isSandbox: boolean;
    autoWebhook: boolean;
  };
  whatsappTemplate: string;
}
