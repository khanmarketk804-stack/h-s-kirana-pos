import Dexie, { Table } from 'dexie';
import { 
  InventoryItem, 
  Customer, 
  Transaction, 
  UdharEntry, 
  StoreConfig, 
  WhatsAppTemplate,
  ProductEntity,
  SaleEntity,
  SaleItemEntity,
  PaymentEntity,
  SettingEntity
} from '../models/store.models';

export interface ConfigEntity extends StoreConfig {
  id: string;
}

export class KiranaDexieDatabase extends Dexie {
  inventory!: Table<InventoryItem, string>;
  products!: Table<ProductEntity, number>;
  customers!: Table<Customer, string>;
  transactions!: Table<Transaction, string>;
  sales!: Table<SaleEntity, number>;
  saleItems!: Table<SaleItemEntity, number>;
  payments!: Table<PaymentEntity, number>;
  settings!: Table<SettingEntity, string>;
  udharEntries!: Table<UdharEntry, string>;
  config!: Table<ConfigEntity, string>;
  templates!: Table<WhatsAppTemplate, string>;

  constructor() {
    super('HSKiranaBentoStoreDB');
    this.version(3).stores({
      inventory: 'id, barcode, category, nameEn',
      products: '++id, name, category, unit, price, stock, minStock',
      customers: '++id, id, name, phone, address, totalCredit, creditLimit',
      transactions: 'id, invoiceNo, timestamp, customerId, paymentMethod',
      sales: '++id, customerId, billNo, totalAmount, discount, grandTotal, paidAmount, paymentMode, createdAt',
      saleItems: '++id, saleId, productId, productName, qty, unitPrice, totalPrice',
      payments: '++id, customerId, amount, mode, note, createdAt',
      settings: 'key, value',
      udharEntries: 'id, customerId, type, date',
      config: 'id',
      templates: 'id, category'
    });
  }
}

export const dexieDb = new KiranaDexieDatabase();

