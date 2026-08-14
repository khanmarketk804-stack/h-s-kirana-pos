export type ItemCategory = 
  | 'Atta & Daalen'
  | 'Chawal'
  | 'Ghee & Oil'
  | 'Cheeni & Chai'
  | 'Masalay'
  | 'Dairy'
  | 'Snacks & Beverages'
  | 'Cleaning'
  | 'Misc';

export interface CategoryMeta {
  key: ItemCategory;
  nameEn: string;
  nameUr: string;
  emoji: string;
  icon: string;
}

export const CATEGORY_LIST: CategoryMeta[] = [
  { key: 'Dairy', nameEn: 'Dairy', nameUr: 'دودھ و مکھن', emoji: '🥛', icon: 'local_drink' },
  { key: 'Ghee & Oil', nameEn: 'Ghee & Oil', nameUr: 'گھی اور آئل', emoji: '🛢️', icon: 'opacity' },
  { key: 'Atta & Daalen', nameEn: 'Atta & Daalen', nameUr: 'آٹا اور دالیں', emoji: '🌾', icon: 'bakery_dining' },
  { key: 'Chawal', nameEn: 'Chawal (Rice)', nameUr: 'چاول', emoji: '🍚', icon: 'grain' },
  { key: 'Cheeni & Chai', nameEn: 'Cheeni & Chai', nameUr: 'چینی اور پتی', emoji: '☕', icon: 'emoji_food_beverage' },
  { key: 'Masalay', nameEn: 'Masalay', nameUr: 'مصالحہ جات', emoji: '🌶️', icon: 'local_fire_department' },
  { key: 'Snacks & Beverages', nameEn: 'Snacks & Drinks', nameUr: 'سنیکس و مشروبات', emoji: '🥤', icon: 'local_bar' },
  { key: 'Cleaning', nameEn: 'Cleaning & Soaps', nameUr: 'صابن اور صفائی', emoji: '🧼', icon: 'cleaning_services' },
  { key: 'Misc', nameEn: 'Misc Items', nameUr: 'متفرق سامان', emoji: '📦', icon: 'category' }
];

export type ItemUnit = 'Kg' | 'Ltr' | 'Pkt' | 'Pcs' | 'Dozen' | 'Grams' | 'Box';

export interface InventoryItem {
  id: string;
  nameEn: string;
  nameUr: string;
  barcode: string;
  category: ItemCategory;
  unit: ItemUnit;
  purchasePrice: number; // PKR
  sellingPrice: number;  // PKR
  stock: number;         // Stock quantity in base units
  minStockAlert: number; // Threshold for low stock warning
  imageIcon?: string;    // Emoji or material icon name
}

export interface CartItem {
  item: InventoryItem;
  qty: number;             // Count or fractional weight (e.g. 0.5 for 500g)
  unitPrice: number;       // Price per unit
  subtotal: number;        // qty * unitPrice
  notes?: string;
}

export type PaymentMethod = 'cash' | 'easypaisa' | 'jazzcash' | 'card' | 'udhar' | 'partial_udhar';

export interface Transaction {
  id: string;
  invoiceNo: string;
  timestamp: number;       // Date timestamp
  items: CartItem[];
  subtotal: number;
  discount: number;        // In PKR
  discountType: 'fixed' | 'percent';
  total: number;
  paymentMethod: PaymentMethod;
  cashReceived?: number;
  cashChange?: number;
  udharAmount?: number;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  notes?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  totalUdhar: number;      // Balance (positive = customer owes store / Udhar)
  creditLimit?: number;    // Maximum credit limit in PKR (default 10,000)
  createdAt: number;
  notes?: string;
}

export type UdharEntryType = 'diya' | 'liya'; // diya = udhar given (adds to balance), liya = payment received (subtracts)

export interface UdharEntry {
  id: string;
  customerId: string;
  type: UdharEntryType;
  amount: number;
  date: number;
  invoiceId?: string;
  notes?: string;
}

export interface CustomerLedgerItem {
  id: string;
  date: number;
  type: 'diya' | 'liya' | 'paid_bill';
  kind: 'INVOICE' | 'UDHAR_MANUAL' | 'PAYMENT_RECEIVED';
  invoiceNo?: string;
  transaction?: Transaction;
  udharEntry?: UdharEntry;
  description: string;
  amount: number;
  paymentMethod?: string;
  itemsCount?: number;
}

export type UserRole = 'admin' | 'staff';

export interface StoreConfig {
  storeName: string;
  tagline: string;
  ownerName: string;
  phone: string;
  address: string;
  ntn?: string;
  easypaisaNo?: string;
  jazzcashNo?: string;
  whatsappReminderMsg: string;
  storePassword?: string;   // Main store password (default '3418021801')
  adminPin?: string;       // Default '3418021801' (Dukan Malik)
  staffPin?: string;       // Default '0000' (Helper)
  pinLockEnabled?: boolean; // Default true
}

export interface ProductEntity {
  id?: number;
  name: string;
  category: string;
  unit: string;
  price: number;
  stock: number;
  minStock: number;
}

export interface SaleEntity {
  id?: number;
  customerId?: string;
  billNo: string;
  totalAmount: number;
  discount: number;
  grandTotal: number;
  paidAmount: number;
  paymentMode: string;
  createdAt: number;
}

export interface WhatsAppTemplate {
  id: string;
  title: string;
  category: 'reminder' | 'receipt' | 'promo' | 'general';
  content: string;
}

export interface SaleItemEntity {
  id?: number;
  saleId: number;
  productId: number;
  productName: string;
  qty: number;
  unitPrice: number;
  totalPrice: number;
}

export interface PaymentEntity {
  id?: number;
  customerId: string;
  amount: number;
  mode: string;
  note?: string;
  createdAt: number;
}

export interface SettingEntity {
  key: string;
  value: string | number | boolean | Record<string, unknown>;
}
