import { Injectable, signal, computed } from '@angular/core';
import { dexieDb } from './db.service';
import { 
  InventoryItem, 
  CartItem, 
  Transaction, 
  Customer, 
  UdharEntry, 
  CustomerLedgerItem,
  StoreConfig, 
  WhatsAppTemplate,
  PaymentMethod,
  UserRole
} from './store.models';
const STORAGE_KEYS = {
  INVENTORY: 'hs_kirana_inventory_v1',
  CUSTOMERS: 'hs_kirana_customers_v1',
  TRANSACTIONS: 'hs_kirana_transactions_v1',
  UDHAR: 'hs_kirana_udhar_v1',
  CONFIG: 'hs_kirana_config_v1',
  TEMPLATES: 'hs_kirana_templates_v1',
  LANGUAGE: 'hs_kirana_lang_v1',
  DARK_MODE: 'hs_kirana_dark_v1',
  ACTIVE_ROLE: 'hs_kirana_active_role_v1',
  APP_LOCKED: 'hs_kirana_app_locked_v1'
};

const DEFAULT_CONFIG: StoreConfig = {
  storeName: 'H S Kirana & Rashan Store',
  tagline: 'Aap Ka Aam Aur Aala Kirana Store',
  ownerName: 'Haji Muhammad Suleman',
  phone: '03001234567',
  address: 'Main Bazaar, Near Jamia Masjid, Lahore',
  ntn: '4829104-7',
  easypaisaNo: '03001234567',
  jazzcashNo: '03001234567',
  whatsappReminderMsg: 'Assalam-o-Alaikum {customer}! Aap ka {store} par total Udhar Rs. {balance} hai. Naye Rashan ki khareedari aur baqaya payment ke liye Tashreef laayein. Shukriya! Phone: {phone}',
  storePassword: '3418021801',
  adminPin: '3418021801',
  staffPin: '0000',
  pinLockEnabled: true
};

const SAMPLE_INVENTORY: InventoryItem[] = [
  {
    id: 'p1',
    nameEn: 'Chakki Atta 10Kg Pack (چکی آٹا 10 کلو)',
    nameUr: 'چکی اٹا 10 کلو تھیلا',
    barcode: '8901234001',
    category: 'Atta & Daalen',
    unit: 'Pkt',
    purchasePrice: 1250,
    sellingPrice: 1400,
    stock: 45,
    minStockAlert: 5,
    imageIcon: 'bakery_dining'
  },
  {
    id: 'p2',
    nameEn: 'Super Kernel Basmati Rice (سپر کرنیل چاول)',
    nameUr: 'سپر کرنیل باسمتی چاول',
    barcode: '8901234002',
    category: 'Chawal',
    unit: 'Kg',
    purchasePrice: 280,
    sellingPrice: 340,
    stock: 120,
    minStockAlert: 15,
    imageIcon: 'grain'
  },
  {
    id: 'p3',
    nameEn: 'Dal Chana Cleaned (دال چنا)',
    nameUr: 'دال چنا صاف ستھری',
    barcode: '8901234003',
    category: 'Atta & Daalen',
    unit: 'Kg',
    purchasePrice: 230,
    sellingPrice: 270,
    stock: 65,
    minStockAlert: 10,
    imageIcon: 'rice_bowl'
  },
  {
    id: 'p4',
    nameEn: 'Dal Moong Washed (دال مونگ)',
    nameUr: 'دال مونگ دھلی ہوئی',
    barcode: '8901234004',
    category: 'Atta & Daalen',
    unit: 'Kg',
    purchasePrice: 260,
    sellingPrice: 310,
    stock: 40,
    minStockAlert: 8,
    imageIcon: 'rice_bowl'
  },
  {
    id: 'p5',
    nameEn: 'Dal Masoor Red (دال مسور)',
    nameUr: 'دال مسور باریک',
    barcode: '8901234005',
    category: 'Atta & Daalen',
    unit: 'Kg',
    purchasePrice: 240,
    sellingPrice: 290,
    stock: 50,
    minStockAlert: 10,
    imageIcon: 'rice_bowl'
  },
  {
    id: 'p6',
    nameEn: 'Dal Mash Washed (دال ماش)',
    nameUr: 'دال ماش ثابت و دھلی',
    barcode: '8901234006',
    category: 'Atta & Daalen',
    unit: 'Kg',
    purchasePrice: 380,
    sellingPrice: 440,
    stock: 30,
    minStockAlert: 5,
    imageIcon: 'rice_bowl'
  },
  {
    id: 'p7',
    nameEn: 'Sufi Sunflower Cooking Oil 5L (صوفی آئل)',
    nameUr: 'صوفی کینولا کوکنگ آئل 5 لیٹر',
    barcode: '8901234007',
    category: 'Ghee & Oil',
    unit: 'Ltr',
    purchasePrice: 2400,
    sellingPrice: 2650,
    stock: 18,
    minStockAlert: 5,
    imageIcon: 'opacity'
  },
  {
    id: 'p8',
    nameEn: 'Habib Banaspati Ghee 1Kg Pkt (حبیب گھی)',
    nameUr: 'حبیب بناسپتی گھی 1 کلو',
    barcode: '8901234008',
    category: 'Ghee & Oil',
    unit: 'Pkt',
    purchasePrice: 480,
    sellingPrice: 530,
    stock: 45,
    minStockAlert: 10,
    imageIcon: 'blender'
  },
  {
    id: 'p9',
    nameEn: 'Refined White Sugar / Cheeni (چینی)',
    nameUr: 'چینی صاف سفید',
    barcode: '8901234009',
    category: 'Cheeni & Chai',
    unit: 'Kg',
    purchasePrice: 135,
    sellingPrice: 150,
    stock: 200,
    minStockAlert: 25,
    imageIcon: 'takeout_dining'
  },
  {
    id: 'p10',
    nameEn: 'Tapal Danedar Tea 900g Pkt (تپال دانے دار چائے)',
    nameUr: 'تپال دانے دار چائے 900 گرام',
    barcode: '8901234010',
    category: 'Cheeni & Chai',
    unit: 'Pkt',
    purchasePrice: 1380,
    sellingPrice: 1550,
    stock: 14,
    minStockAlert: 5,
    imageIcon: 'emoji_food_beverage'
  },
  {
    id: 'p11',
    nameEn: 'Lipton Yellow Label Tea 400g (لیپٹن چائے)',
    nameUr: 'لیپٹن یلو لیبل چائے 400 گرام',
    barcode: '8901234011',
    category: 'Cheeni & Chai',
    unit: 'Pkt',
    purchasePrice: 680,
    sellingPrice: 760,
    stock: 22,
    minStockAlert: 5,
    imageIcon: 'emoji_food_beverage'
  },
  {
    id: 'p12',
    nameEn: 'Shan Special Bombay Biryani Masala 50g (شان مسالہ)',
    nameUr: 'شان بمبئی بریانی مسالہ',
    barcode: '8901234012',
    category: 'Masalay',
    unit: 'Pkt',
    purchasePrice: 90,
    sellingPrice: 110,
    stock: 80,
    minStockAlert: 15,
    imageIcon: 'ramen_dining'
  },
  {
    id: 'p13',
    nameEn: 'National Red Chilli Powder 200g (سرخ مرچ پاؤڈر)',
    nameUr: 'نیشنل سرخ مرچ پاؤڈر 200 گرام',
    barcode: '8901234013',
    category: 'Masalay',
    unit: 'Pkt',
    purchasePrice: 180,
    sellingPrice: 220,
    stock: 50,
    minStockAlert: 10,
    imageIcon: 'local_fire_department'
  },
  {
    id: 'p14',
    nameEn: 'National Iodized Pink Salt 800g (نیشنل نمک)',
    nameUr: 'نیشنل بائیوڈائزڈ نمک',
    barcode: '8901234014',
    category: 'Masalay',
    unit: 'Pkt',
    purchasePrice: 45,
    sellingPrice: 60,
    stock: 95,
    minStockAlert: 15,
    imageIcon: 'kitchen'
  },
  {
    id: 'p15',
    nameEn: 'Olpers Milk 1 Ltr Pack (اولپرز دودھ)',
    nameUr: 'اولپرز دودھ 1 لیٹر',
    barcode: '8901234015',
    category: 'Dairy',
    unit: 'Ltr',
    purchasePrice: 265,
    sellingPrice: 290,
    stock: 60,
    minStockAlert: 12,
    imageIcon: 'local_drink'
  },
  {
    id: 'p16',
    nameEn: 'Nestle Milkpak Milk 1 Ltr (نسلے ملک پیک)',
    nameUr: 'نسلے ملک پیک 1 لیٹر',
    barcode: '8901234016',
    category: 'Dairy',
    unit: 'Ltr',
    purchasePrice: 265,
    sellingPrice: 290,
    stock: 50,
    minStockAlert: 10,
    imageIcon: 'local_drink'
  },
  {
    id: 'p17',
    nameEn: 'Rooh Afza Syrup 800ml Bottle (روح افزا)',
    nameUr: 'روح افزا بوتل 800 ملی لیٹر',
    barcode: '8901234017',
    category: 'Snacks & Beverages',
    unit: 'Pcs',
    purchasePrice: 320,
    sellingPrice: 370,
    stock: 22,
    minStockAlert: 5,
    imageIcon: 'liquor'
  },
  {
    id: 'p18',
    nameEn: 'Coca-Cola 1.5 Ltr Bottle (کوکا کولا 1.5 لیٹر)',
    nameUr: 'کوکا کولا 1.5 لیٹر',
    barcode: '8901234018',
    category: 'Snacks & Beverages',
    unit: 'Pcs',
    purchasePrice: 130,
    sellingPrice: 150,
    stock: 40,
    minStockAlert: 10,
    imageIcon: 'local_bar'
  },
  {
    id: 'p19',
    nameEn: 'Surf Excel Washing Powder 1Kg (سرف ایکسل)',
    nameUr: 'سرف ایکسل واشنگ پاؤڈر 1 کلو',
    barcode: '8901234019',
    category: 'Cleaning',
    unit: 'Pkt',
    purchasePrice: 540,
    sellingPrice: 620,
    stock: 12,
    minStockAlert: 5,
    imageIcon: 'clean_hands'
  },
  {
    id: 'p20',
    nameEn: 'Lux Beauty Bath Soap Bar 150g (لکس صابن)',
    nameUr: 'لکس بیوٹی صابن 150 گرام',
    barcode: '8901234020',
    category: 'Cleaning',
    unit: 'Pcs',
    purchasePrice: 110,
    sellingPrice: 135,
    stock: 55,
    minStockAlert: 12,
    imageIcon: 'soap'
  },
  {
    id: 'p21',
    nameEn: 'Matchbox Packet / Machis (ماچس ڈبی پیک)',
    nameUr: 'ماچس پیکٹ 10 ڈبی',
    barcode: '8901234021',
    category: 'Misc',
    unit: 'Pkt',
    purchasePrice: 70,
    sellingPrice: 90,
    stock: 100,
    minStockAlert: 15,
    imageIcon: 'whatshot'
  },
  {
    id: 'p22',
    nameEn: 'Fresh Farm Eggs Dozen (انڈے درجن)',
    nameUr: 'تازہ فارمی انڈے فی درجن',
    barcode: '8901234022',
    category: 'Dairy',
    unit: 'Dozen',
    purchasePrice: 280,
    sellingPrice: 320,
    stock: 15,
    minStockAlert: 5,
    imageIcon: 'egg'
  },
  {
    id: 'p23',
    nameEn: 'Dalda Fortified Cooking Oil 1L (ڈالڈا کوکنگ آئل)',
    nameUr: 'ڈالڈا فارٹیفائیڈ کوکنگ آئل 1 لیٹر',
    barcode: '8901234023',
    category: 'Ghee & Oil',
    unit: 'Ltr',
    purchasePrice: 490,
    sellingPrice: 540,
    stock: 35,
    minStockAlert: 8,
    imageIcon: 'opacity'
  },
  {
    id: 'p24',
    nameEn: 'Dalda Banaspati Ghee 1Kg Pkt (ڈالڈا گھی)',
    nameUr: 'ڈالڈا بناسپتی گھی 1 کلو',
    barcode: '8901234024',
    category: 'Ghee & Oil',
    unit: 'Pkt',
    purchasePrice: 500,
    sellingPrice: 550,
    stock: 28,
    minStockAlert: 6,
    imageIcon: 'blender'
  },
  {
    id: 'p25',
    nameEn: 'Nurpur Salted Butter 200g (نورپور مکھن)',
    nameUr: 'نورپور ڈلیشس مکھن 200 گرام',
    barcode: '8901234025',
    category: 'Dairy',
    unit: 'Pcs',
    purchasePrice: 320,
    sellingPrice: 360,
    stock: 20,
    minStockAlert: 5,
    imageIcon: 'bakery_dining'
  },
  {
    id: 'p26',
    nameEn: 'Nestle Everyday Milk Powder 400g (ایوری ڈے)',
    nameUr: 'نسلے ایوری ڈے ملک پاؤڈر 400 گرام',
    barcode: '8901234026',
    category: 'Cheeni & Chai',
    unit: 'Pkt',
    purchasePrice: 620,
    sellingPrice: 690,
    stock: 25,
    minStockAlert: 5,
    imageIcon: 'emoji_food_beverage'
  },
  {
    id: 'p27',
    nameEn: 'Knorr Chatpatta Noodles Pack (کنور نوڈلز)',
    nameUr: 'کنور چٹ پٹا نوڈلز سنگل پیک',
    barcode: '8901234027',
    category: 'Snacks & Beverages',
    unit: 'Pkt',
    purchasePrice: 50,
    sellingPrice: 60,
    stock: 100,
    minStockAlert: 20,
    imageIcon: 'ramen_dining'
  },
  {
    id: 'p28',
    nameEn: 'Harpic Power Plus Cleaner 500ml (ہارپک کلینر)',
    nameUr: 'ہارپک پاور پلس ٹوائلٹ کلینر 500ml',
    barcode: '8901234028',
    category: 'Cleaning',
    unit: 'Pcs',
    purchasePrice: 280,
    sellingPrice: 330,
    stock: 18,
    minStockAlert: 5,
    imageIcon: 'cleaning_services'
  }
];

const SAMPLE_CUSTOMERS: Customer[] = [
  {
    id: 'c1',
    name: 'Chaudhry Rashid Sahib',
    phone: '03009876543',
    address: 'Gali No 4, House #12, Block B',
    totalUdhar: 4850,
    creditLimit: 10000,
    createdAt: Date.now() - 30 * 24 * 3600 * 1000,
    notes: 'Regular monthly rashan customer'
  },
  {
    id: 'c2',
    name: 'Malik Usman Farooq',
    phone: '03215551234',
    address: 'Shop #8, Main Commercial Market',
    totalUdhar: 12400,
    creditLimit: 10000,
    createdAt: Date.now() - 60 * 24 * 3600 * 1000,
    notes: 'Clears bill every 15 days'
  },
  {
    id: 'c3',
    name: 'Baji Saima Parveen',
    phone: '03334448899',
    address: 'Street #2, Near Water Tank',
    totalUdhar: 2150,
    creditLimit: 5000,
    createdAt: Date.now() - 15 * 24 * 3600 * 1000,
    notes: 'Home delivery order'
  },
  {
    id: 'c4',
    name: 'Tariq Mehmood (Tailor Master)',
    phone: '03027778811',
    address: 'Opposite Government School',
    totalUdhar: 0,
    creditLimit: 10000,
    createdAt: Date.now() - 10 * 24 * 3600 * 1000,
    notes: 'Cleared all debts recently'
  }
];

const SAMPLE_TEMPLATES: WhatsAppTemplate[] = [
  {
    id: 'wt1',
    title: 'Udhar Payment Reminder (ادھار یاد دہانی)',
    category: 'reminder',
    content: 'Assalam-o-Alaikum {customer}! Hope you are doing well. This is a gentle reminder from {store}. Your total outstanding balance is Rs. {balance}. Kindly clear the dues at your earliest convenience. Thank you!'
  },
  {
    id: 'wt2',
    title: 'New Rashan Stock Arrival (نیا راشن اسٹاک)',
    category: 'promo',
    content: 'Assalam-o-Alaikum {customer}! Fresh stocks of Super Kernel Basmati Rice, Pure Chakki Atta, Kisan Oil & Ghee have arrived at {store}! Visit today or WhatsApp your grocery list for home delivery. Call/WA: {phone}'
  },
  {
    id: 'wt3',
    title: 'Digital Invoice / Receipt (ڈیجیٹل رسید)',
    category: 'receipt',
    content: 'Thank you for shopping at {store}! Your Invoice #{invoice} total is Rs. {total}. Payment Method: {method}. Visit again!'
  },
  {
    id: 'wt4',
    title: 'Home Delivery Confirmation (ہوم ڈیلیوری)',
    category: 'general',
    content: 'Assalam-o-Alaikum! Your Kirana order from {store} is packed and on the way to your address. Total Bill: Rs. {total}. Driver contact: {phone}.'
  }
];

@Injectable({
  providedIn: 'root'
})
export class StoreService {
  // Signals for state
  inventory = signal<InventoryItem[]>([]);
  customers = signal<Customer[]>([]);
  transactions = signal<Transaction[]>([]);
  udharEntries = signal<UdharEntry[]>([]);
  config = signal<StoreConfig>(DEFAULT_CONFIG);
  templates = signal<WhatsAppTemplate[]>(SAMPLE_TEMPLATES);
  isUrdu = signal<boolean>(false);
  isDarkMode = signal<boolean>(false);

  // Security & User Role state
  currentUserRole = signal<UserRole>('admin');
  isAppLocked = signal<boolean>(true); // Locked by default on open until password is entered
  isPinModalOpen = signal<boolean>(false);
  pinModalReason = signal<string>('HS KIRANA STORE Password Enter Karein');
  pinModalTargetRole = signal<UserRole | 'any'>('any');
  pendingAction = signal<(() => void) | null>(null);

  // Computed security signals
  isAdmin = computed(() => this.currentUserRole() === 'admin');
  isStaff = computed(() => this.currentUserRole() === 'staff');
  storePassword = computed(() => this.config().storePassword || '3418021801');
  adminPin = computed(() => this.config().adminPin || this.config().storePassword || '3418021801');
  staffPin = computed(() => this.config().staffPin || '0000');
  isPinLockEnabled = computed(() => this.config().pinLockEnabled !== false);

  // Active POS Cart Signal
  cart = signal<CartItem[]>([]);
  cartDiscount = signal<number>(0);
  cartDiscountType = signal<'fixed' | 'percent'>('fixed');
  selectedCustomerForCart = signal<Customer | null>(null);

  // Computed signals
  cartSubtotal = computed(() => {
    return this.cart().reduce((acc, item) => acc + item.subtotal, 0);
  });

  cartTotal = computed(() => {
    const sub = this.cartSubtotal();
    const disc = this.cartDiscount();
    if (this.cartDiscountType() === 'percent') {
      const discountAmount = (sub * disc) / 100;
      return Math.max(0, sub - discountAmount);
    }
    return Math.max(0, sub - disc);
  });

  lowStockItemsCount = computed(() => {
    return this.inventory().filter(i => i.stock <= i.minStockAlert).length;
  });

  totalMarketUdhar = computed(() => {
    return this.customers().reduce((acc, c) => acc + Math.max(0, c.totalUdhar), 0);
  });

  todaySalesTotal = computed(() => {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const minTimestamp = startOfToday.getTime();
    return this.transactions()
      .filter(tx => tx.timestamp >= minTimestamp)
      .reduce((acc, tx) => acc + tx.total, 0);
  });

  todayTransactionsCount = computed(() => {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const minTimestamp = startOfToday.getTime();
    return this.transactions().filter(tx => tx.timestamp >= minTimestamp).length;
  });

  constructor() {
    this.loadStateFromStorage();
  }

  // --- STORAGE LOAD & SAVE (IndexedDB + LocalStorage) ---
  private async loadStateFromStorage() {
    if (typeof window === 'undefined') return;

    try {
      // 1. Initial immediate synchronous load from LocalStorage for zero layout shift
      const storedInv = localStorage.getItem(STORAGE_KEYS.INVENTORY);
      this.inventory.set(storedInv ? JSON.parse(storedInv) : SAMPLE_INVENTORY);

      const storedCust = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
      this.customers.set(storedCust ? JSON.parse(storedCust) : SAMPLE_CUSTOMERS);

      const storedTx = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      this.transactions.set(storedTx ? JSON.parse(storedTx) : this.generateSampleTransactions());

      const storedUdhar = localStorage.getItem(STORAGE_KEYS.UDHAR);
      this.udharEntries.set(storedUdhar ? JSON.parse(storedUdhar) : this.generateSampleUdharEntries());

      const storedConfig = localStorage.getItem(STORAGE_KEYS.CONFIG);
      this.config.set(storedConfig ? JSON.parse(storedConfig) : DEFAULT_CONFIG);

      const storedTpl = localStorage.getItem(STORAGE_KEYS.TEMPLATES);
      this.templates.set(storedTpl ? JSON.parse(storedTpl) : SAMPLE_TEMPLATES);

      const storedLang = localStorage.getItem(STORAGE_KEYS.LANGUAGE);
      if (storedLang) {
        this.isUrdu.set(storedLang === 'ur');
      }

      const storedDark = localStorage.getItem(STORAGE_KEYS.DARK_MODE);
      if (storedDark === 'true') {
        this.isDarkMode.set(true);
      }

      const storedRole = localStorage.getItem(STORAGE_KEYS.ACTIVE_ROLE);
      if (storedRole === 'admin' || storedRole === 'staff') {
        this.currentUserRole.set(storedRole);
      }

      const storedLock = localStorage.getItem(STORAGE_KEYS.APP_LOCKED);
      if (storedLock === 'true') {
        this.isAppLocked.set(true);
      }

      // 2. Asynchronous IndexedDB (Dexie) Hydration & Synchronization
      await this.syncWithIndexedDB();

    } catch (err) {
      console.error('Error loading local state:', err);
      this.inventory.set(SAMPLE_INVENTORY);
      this.customers.set(SAMPLE_CUSTOMERS);
      this.config.set(DEFAULT_CONFIG);
    }
  }

  private async syncWithIndexedDB() {
    try {
      const dbInvCount = await dexieDb.inventory.count();
      if (dbInvCount > 0) {
        const dbItems = await dexieDb.inventory.toArray();
        this.inventory.set(dbItems);
      } else {
        await dexieDb.inventory.bulkPut(this.inventory());
      }

      const dbCustCount = await dexieDb.customers.count();
      if (dbCustCount > 0) {
        const dbCusts = await dexieDb.customers.toArray();
        this.customers.set(dbCusts);
      } else {
        await dexieDb.customers.bulkPut(this.customers());
      }

      const dbTxCount = await dexieDb.transactions.count();
      if (dbTxCount > 0) {
        const dbTxs = await dexieDb.transactions.toArray();
        dbTxs.sort((a, b) => b.timestamp - a.timestamp);
        this.transactions.set(dbTxs);
      } else {
        await dexieDb.transactions.bulkPut(this.transactions());
      }

      const dbUdharCount = await dexieDb.udharEntries.count();
      if (dbUdharCount > 0) {
        const dbUdhars = await dexieDb.udharEntries.toArray();
        dbUdhars.sort((a, b) => b.date - a.date);
        this.udharEntries.set(dbUdhars);
      } else {
        await dexieDb.udharEntries.bulkPut(this.udharEntries());
      }

      const dbConfig = await dexieDb.config.get('store_settings');
      if (dbConfig) {
        const configCopy: StoreConfig = {
          storeName: dbConfig.storeName,
          tagline: dbConfig.tagline,
          ownerName: dbConfig.ownerName,
          phone: dbConfig.phone,
          address: dbConfig.address,
          ntn: dbConfig.ntn,
          easypaisaNo: dbConfig.easypaisaNo,
          jazzcashNo: dbConfig.jazzcashNo,
          whatsappReminderMsg: dbConfig.whatsappReminderMsg
        };
        this.config.set(configCopy);
      } else {
        await dexieDb.config.put({ id: 'store_settings', ...this.config() });
      }

      const dbTplCount = await dexieDb.templates.count();
      if (dbTplCount > 0) {
        const dbTpls = await dexieDb.templates.toArray();
        this.templates.set(dbTpls);
      } else {
        await dexieDb.templates.bulkPut(this.templates());
      }
    } catch (err) {
      console.warn('IndexedDB sync fallback:', err);
    }
  }

  private saveInventory() {
    const inv = this.inventory();
    localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(inv));
    dexieDb.inventory.clear().then(() => dexieDb.inventory.bulkPut(inv)).catch(err => console.warn('Dexie inv save err:', err));
  }

  private saveCustomers() {
    const custs = this.customers();
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(custs));
    dexieDb.customers.clear().then(() => dexieDb.customers.bulkPut(custs)).catch(err => console.warn('Dexie cust save err:', err));
  }

  private saveTransactions() {
    const txs = this.transactions();
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(txs));
    dexieDb.transactions.clear().then(() => dexieDb.transactions.bulkPut(txs)).catch(err => console.warn('Dexie tx save err:', err));
  }

  private saveUdhar() {
    const udhar = this.udharEntries();
    localStorage.setItem(STORAGE_KEYS.UDHAR, JSON.stringify(udhar));
    dexieDb.udharEntries.clear().then(() => dexieDb.udharEntries.bulkPut(udhar)).catch(err => console.warn('Dexie udhar save err:', err));
  }

  saveConfig(newConfig: StoreConfig) {
    this.config.set(newConfig);
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(newConfig));
    dexieDb.config.put({ id: 'store_settings', ...newConfig }).catch(err => console.warn('Dexie config save err:', err));
  }

  toggleLanguage() {
    const next = !this.isUrdu();
    this.isUrdu.set(next);
    localStorage.setItem(STORAGE_KEYS.LANGUAGE, next ? 'ur' : 'en');
  }

  toggleDarkMode() {
    const next = !this.isDarkMode();
    this.isDarkMode.set(next);
    localStorage.setItem(STORAGE_KEYS.DARK_MODE, String(next));
  }

  async resetAllData() {
    this.inventory.set(SAMPLE_INVENTORY);
    this.customers.set(SAMPLE_CUSTOMERS);
    this.transactions.set(this.generateSampleTransactions());
    this.udharEntries.set(this.generateSampleUdharEntries());
    this.config.set(DEFAULT_CONFIG);
    this.templates.set(SAMPLE_TEMPLATES);
    this.cart.set([]);

    this.saveInventory();
    this.saveCustomers();
    this.saveTransactions();
    this.saveUdhar();
    this.saveConfig(DEFAULT_CONFIG);

    try {
      await dexieDb.inventory.clear();
      await dexieDb.inventory.bulkPut(SAMPLE_INVENTORY);
      await dexieDb.customers.clear();
      await dexieDb.customers.bulkPut(SAMPLE_CUSTOMERS);
      await dexieDb.transactions.clear();
      await dexieDb.transactions.bulkPut(this.transactions());
      await dexieDb.udharEntries.clear();
      await dexieDb.udharEntries.bulkPut(this.udharEntries());
      await dexieDb.config.clear();
      await dexieDb.config.put({ id: 'store_settings', ...DEFAULT_CONFIG });
      await dexieDb.templates.clear();
      await dexieDb.templates.bulkPut(SAMPLE_TEMPLATES);
    } catch (e) {
      console.warn('Failed clearing dexie DB:', e);
    }
  }

  // Sample data generators for realistic experience
  private generateSampleTransactions(): Transaction[] {
    const now = Date.now();
    return [
      {
        id: 'tx_1001',
        invoiceNo: 'HS-1001',
        timestamp: now - 3600 * 1000 * 2,
        items: [
          {
            item: SAMPLE_INVENTORY[0],
            qty: 5,
            unitPrice: 340,
            subtotal: 1700
          },
          {
            item: SAMPLE_INVENTORY[7],
            qty: 1,
            unitPrice: 1550,
            subtotal: 1550
          }
        ],
        subtotal: 3250,
        discount: 50,
        discountType: 'fixed',
        total: 3200,
        paymentMethod: 'cash',
        cashReceived: 3500,
        cashChange: 300
      },
      {
        id: 'tx_1002',
        invoiceNo: 'HS-1002',
        timestamp: now - 3600 * 1000 * 14,
        items: [
          {
            item: SAMPLE_INVENTORY[1],
            qty: 1,
            unitPrice: 2450,
            subtotal: 2450
          },
          {
            item: SAMPLE_INVENTORY[2],
            qty: 1,
            unitPrice: 2650,
            subtotal: 2650
          }
        ],
        subtotal: 5100,
        discount: 0,
        discountType: 'fixed',
        total: 5100,
        paymentMethod: 'udhar',
        customerId: 'c1',
        customerName: 'Chaudhry Rashid Sahib',
        customerPhone: '03009876543',
        notes: 'Monthly Rashan added to Udhar'
      }
    ];
  }

  private generateSampleUdharEntries(): UdharEntry[] {
    const now = Date.now();
    return [
      {
        id: 'u1',
        customerId: 'c1',
        type: 'diya',
        amount: 5100,
        date: now - 3600 * 1000 * 14,
        invoiceId: 'HS-1002',
        notes: 'Monthly Rashan Bill'
      },
      {
        id: 'u2',
        customerId: 'c1',
        type: 'liya',
        amount: 250,
        date: now - 3600 * 1000 * 5,
        notes: 'Partial Cash Payment Received'
      },
      {
        id: 'u3',
        customerId: 'c2',
        type: 'diya',
        amount: 12400,
        date: now - 3600 * 1000 * 48,
        notes: 'Bulk Oil & Atta order'
      }
    ];
  }

  // --- POS CART OPERATIONS ---
  addToCart(item: InventoryItem, customQty = 1) {
    const current = this.cart();
    const existingIndex = current.findIndex(ci => ci.item.id === item.id);

    if (existingIndex > -1) {
      const updated = [...current];
      const newQty = updated[existingIndex].qty + customQty;
      updated[existingIndex] = {
        ...updated[existingIndex],
        qty: newQty,
        subtotal: newQty * updated[existingIndex].unitPrice
      };
      this.cart.set(updated);
    } else {
      this.cart.set([
        ...current,
        {
          item,
          qty: customQty,
          unitPrice: item.sellingPrice,
          subtotal: customQty * item.sellingPrice
        }
      ]);
    }
  }

  updateCartQty(itemId: string, newQty: number) {
    if (newQty <= 0) {
      this.removeFromCart(itemId);
      return;
    }
    const current = this.cart();
    const updated = current.map(ci => {
      if (ci.item.id === itemId) {
        return {
          ...ci,
          qty: newQty,
          subtotal: newQty * ci.unitPrice
        };
      }
      return ci;
    });
    this.cart.set(updated);
  }

  updateCartUnitPrice(itemId: string, newPrice: number) {
    if (newPrice < 0) return;
    const current = this.cart();
    const updated = current.map(ci => {
      if (ci.item.id === itemId) {
        return {
          ...ci,
          unitPrice: newPrice,
          subtotal: ci.qty * newPrice
        };
      }
      return ci;
    });
    this.cart.set(updated);
  }

  removeFromCart(itemId: string) {
    this.cart.set(this.cart().filter(ci => ci.item.id !== itemId));
  }

  clearCart() {
    this.cart.set([]);
    this.cartDiscount.set(0);
    this.selectedCustomerForCart.set(null);
  }

  // Complete checkout & create transaction
  checkout(
    paymentMethod: PaymentMethod,
    cashReceived = 0,
    notes = ''
  ): Transaction {
    const cartItems = this.cart();
    if (cartItems.length === 0) {
      throw new Error('Cart is empty!');
    }

    const sub = this.cartSubtotal();
    const disc = this.cartDiscount();
    const total = this.cartTotal();
    const now = Date.now();
    const invoiceNo = `HS-${1000 + this.transactions().length + 1}`;

    const customer = this.selectedCustomerForCart();

    let change = 0;
    let udharAmount = 0;
    let actualCashReceived = cashReceived;

    if (paymentMethod === 'cash') {
      change = cashReceived > total ? cashReceived - total : 0;
      actualCashReceived = cashReceived;
    } else if (paymentMethod === 'udhar') {
      udharAmount = total;
      actualCashReceived = 0;
    } else if (paymentMethod === 'partial_udhar') {
      actualCashReceived = Math.min(cashReceived, total);
      udharAmount = Math.max(0, total - actualCashReceived);
      if (cashReceived > total) {
        change = cashReceived - total;
      }
    } else {
      actualCashReceived = total;
    }

    const tx: Transaction = {
      id: `tx_${now}`,
      invoiceNo,
      timestamp: now,
      items: [...cartItems],
      subtotal: sub,
      discount: disc,
      discountType: this.cartDiscountType(),
      total,
      paymentMethod,
      cashReceived: actualCashReceived,
      cashChange: change,
      udharAmount: udharAmount > 0 ? udharAmount : undefined,
      customerId: customer?.id,
      customerName: customer?.name,
      customerPhone: customer?.phone,
      notes
    };

    // Deduct inventory stock
    const inv = [...this.inventory()];
    cartItems.forEach(ci => {
      const idx = inv.findIndex(i => i.id === ci.item.id);
      if (idx > -1) {
        const currentStock = inv[idx].stock;
        const remainingStock = Math.max(0, parseFloat((currentStock - ci.qty).toFixed(3)));
        inv[idx] = {
          ...inv[idx],
          stock: remainingStock
        };
      }
    });
    this.inventory.set(inv);
    this.saveInventory();

    // Handle Udhar if Udhar or Partial Udhar payment method
    if ((paymentMethod === 'udhar' || paymentMethod === 'partial_udhar') && customer && udharAmount > 0) {
      this.addUdharRecord(customer.id, 'diya', udharAmount, `Invoice #${invoiceNo} (${paymentMethod === 'partial_udhar' ? 'Partial Udhar' : 'Full Udhar'})`, invoiceNo);
    }

    // Save transaction
    this.transactions.set([tx, ...this.transactions()]);
    this.saveTransactions();

    // Clear active cart
    this.clearCart();

    return tx;
  }

  // --- INVENTORY MANAGEMENT ---
  addInventoryItem(newItem: Omit<InventoryItem, 'id'>): InventoryItem {
    const item: InventoryItem = {
      ...newItem,
      id: `p_${Date.now()}`
    };
    this.inventory.set([item, ...this.inventory()]);
    this.saveInventory();
    return item;
  }

  updateInventoryItem(updated: InventoryItem) {
    const current = this.inventory();
    const idx = current.findIndex(i => i.id === updated.id);
    if (idx > -1) {
      const copy = [...current];
      copy[idx] = updated;
      this.inventory.set(copy);
      this.saveInventory();
    }
  }

  deleteInventoryItem(id: string) {
    this.inventory.set(this.inventory().filter(i => i.id !== id));
    this.saveInventory();
  }

  updateBulkRates(ratesMap: Map<string, { sellingPrice: number; purchasePrice: number }>) {
    const current = [...this.inventory()];
    ratesMap.forEach((rates, id) => {
      const idx = current.findIndex(i => i.id === id);
      if (idx > -1) {
        current[idx] = {
          ...current[idx],
          sellingPrice: Number(rates.sellingPrice) || 0,
          purchasePrice: Number(rates.purchasePrice) || 0
        };
      }
    });
    this.inventory.set(current);
    this.saveInventory();
  }

  adjustStock(id: string, deltaQty: number) {
    const current = this.inventory();
    const idx = current.findIndex(i => i.id === id);
    if (idx > -1) {
      const copy = [...current];
      const newStock = Math.max(0, copy[idx].stock + deltaQty);
      copy[idx] = { ...copy[idx], stock: newStock };
      this.inventory.set(copy);
      this.saveInventory();
    }
  }

  bulkRestockItems(restockList: { itemId: string; addQty: number }[]) {
    const current = [...this.inventory()];
    restockList.forEach(r => {
      const idx = current.findIndex(i => i.id === r.itemId);
      if (idx > -1 && r.addQty > 0) {
        const newStock = Math.max(0, parseFloat((current[idx].stock + r.addQty).toFixed(3)));
        current[idx] = { ...current[idx], stock: newStock };
      }
    });
    this.inventory.set(current);
    this.saveInventory();
  }

  getFormattedReorderListText(reorderItems: { item: InventoryItem; reorderQty: number }[]): string {
    const cfg = this.config();
    const dateStr = new Date().toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' });

    let text = `📦 *${cfg.storeName.toUpperCase()} - SUPPLIER REORDER LIST*\n`;
    text += `*سامان کی ری آرڈر خریدی لسٹ*\n`;
    text += `--------------------------------\n`;
    text += `Date: *${dateStr}*\n`;
    text += `Store Owner: *${cfg.ownerName}*\n`;
    if (cfg.phone) text += `Contact: *${cfg.phone}*\n`;
    text += `--------------------------------\n`;
    text += `*ITEMS TO REORDER (${reorderItems.length} ITEMS):*\n\n`;

    let totalEstCost = 0;
    reorderItems.forEach((r, index) => {
      const itemCost = r.reorderQty * r.item.purchasePrice;
      totalEstCost += itemCost;
      text += `${index + 1}. *${r.item.nameEn}*\n`;
      text += `   _${r.item.nameUr}_\n`;
      text += `   Current Stock: ${r.item.stock} ${r.item.unit} | *Reorder Qty: ${r.reorderQty} ${r.item.unit}*\n`;
      text += `   Est. Unit Price: Rs. ${r.item.purchasePrice.toLocaleString('en-PK')} | Est. Cost: Rs. ${itemCost.toLocaleString('en-PK')}\n\n`;
    });

    text += `--------------------------------\n`;
    text += `*TOTAL ESTIMATED PURCHASE VALUE: Rs. ${totalEstCost.toLocaleString('en-PK')}*\n`;
    text += `--------------------------------\n`;
    text += `Please process this order at your earliest. Shukriya! 🙏 (*${cfg.storeName}*)`;
    return text;
  }

  // --- DIGIKHATA / CUSTOMER UDHAR ---
  addCustomer(newCust: Omit<Customer, 'id' | 'createdAt' | 'totalUdhar'>): Customer {
    const cleanPhone = this.cleanPhoneDigits(newCust.phone);
    const customer: Customer = {
      ...newCust,
      phone: cleanPhone,
      creditLimit: newCust.creditLimit && newCust.creditLimit > 0 ? newCust.creditLimit : 10000,
      id: `c_${Date.now()}`,
      totalUdhar: 0,
      createdAt: Date.now()
    };
    this.customers.set([customer, ...this.customers()]);
    this.saveCustomers();
    return customer;
  }

  updateCustomer(updated: Customer) {
    const current = this.customers();
    const idx = current.findIndex(c => c.id === updated.id);
    if (idx > -1) {
      const copy = [...current];
      copy[idx] = {
        ...updated,
        phone: this.cleanPhoneDigits(updated.phone),
        creditLimit: updated.creditLimit && updated.creditLimit > 0 ? updated.creditLimit : 10000
      };
      this.customers.set(copy);
      this.saveCustomers();
    }
  }

  deleteCustomer(id: string) {
    this.customers.set(this.customers().filter(c => c.id !== id));
    this.saveCustomers();
  }

  addUdharRecord(
    customerId: string, 
    type: 'diya' | 'liya', 
    amount: number, 
    notes = '', 
    invoiceId?: string
  ): UdharEntry {
    const now = Date.now();
    const entry: UdharEntry = {
      id: `u_${now}`,
      customerId,
      type,
      amount,
      date: now,
      invoiceId,
      notes
    };

    // Update customer totalUdhar balance
    const custs = [...this.customers()];
    const cIdx = custs.findIndex(c => c.id === customerId);
    if (cIdx > -1) {
      const delta = type === 'diya' ? amount : -amount;
      custs[cIdx] = {
        ...custs[cIdx],
        totalUdhar: Math.max(0, custs[cIdx].totalUdhar + delta)
      };
      this.customers.set(custs);
      this.saveCustomers();
    }

    this.udharEntries.set([entry, ...this.udharEntries()]);
    this.saveUdhar();
    return entry;
  }

  getCustomerUdharHistory(customerId: string): UdharEntry[] {
    return this.udharEntries().filter(u => u.customerId === customerId);
  }

  getCustomerTransactions(customerId: string): Transaction[] {
    return this.transactions().filter(t => t.customerId === customerId);
  }

  getCustomerUnifiedLedger(customerId: string): CustomerLedgerItem[] {
    const udharList = this.getCustomerUdharHistory(customerId);
    const txList = this.getCustomerTransactions(customerId);
    const items: CustomerLedgerItem[] = [];

    const processedInvoiceNos = new Set<string>();

    for (const tx of txList) {
      if (tx.invoiceNo) {
        processedInvoiceNos.add(tx.invoiceNo);
      }

      const itemSummaryText = tx.items
        ? tx.items.map(i => `${i.qty}x ${i.item.nameUr || i.item.nameEn}`).join(', ')
        : '';

      const isUdharSale = tx.paymentMethod === 'udhar' || tx.paymentMethod === 'partial_udhar';
      const amount = isUdharSale ? (tx.udharAmount || tx.total) : tx.total;

      items.push({
        id: `ledger_tx_${tx.id}`,
        date: tx.timestamp,
        type: isUdharSale ? 'diya' : 'paid_bill',
        kind: 'INVOICE',
        invoiceNo: tx.invoiceNo,
        transaction: tx,
        description: `Invoice #${tx.invoiceNo} (${tx.items?.length || 0} items${itemSummaryText ? ': ' + itemSummaryText.substring(0, 45) : ''})`,
        amount: amount,
        paymentMethod: tx.paymentMethod,
        itemsCount: tx.items?.length || 0
      });
    }

    for (const u of udharList) {
      if (u.invoiceId && processedInvoiceNos.has(u.invoiceId)) {
        const existingTxIndex = items.findIndex(item => item.invoiceNo === u.invoiceId);
        if (existingTxIndex > -1) {
          items[existingTxIndex].udharEntry = u;
        }
        continue;
      }

      if (u.type === 'diya') {
        items.push({
          id: `ledger_u_${u.id}`,
          date: u.date,
          type: 'diya',
          kind: 'UDHAR_MANUAL',
          invoiceNo: u.invoiceId,
          udharEntry: u,
          description: u.notes || 'Manual Udhar Diya (مال/رقم دی)',
          amount: u.amount
        });
      } else {
        items.push({
          id: `ledger_u_${u.id}`,
          date: u.date,
          type: 'liya',
          kind: 'PAYMENT_RECEIVED',
          invoiceNo: u.invoiceId,
          udharEntry: u,
          description: u.notes || 'Payment Received (وصولی رقم)',
          amount: u.amount
        });
      }
    }

    return items.sort((a, b) => b.date - a.date);
  }

  // --- WHATSAPP & PHONE UTILITIES ---
  cleanPhoneDigits(phone: string): string {
    if (!phone) return '';
    const digits = phone.replace(/\D/g, '');
    if (digits.startsWith('03') && digits.length === 11) {
      return '92' + digits.substring(1);
    }
    if (digits.startsWith('3') && digits.length === 10) {
      return '92' + digits;
    }
    if (digits.startsWith('923') && digits.length === 12) {
      return digits;
    }
    return digits;
  }

  formatDisplayPhone(phone: string): string {
    const digits = this.cleanPhoneDigits(phone);
    if (digits.startsWith('923') && digits.length === 12) {
      return `+92 ${digits.substring(2, 5)} ${digits.substring(5)}`;
    }
    return phone;
  }

  formatLocalPhone(phone: string): string {
    const digits = this.cleanPhoneDigits(phone);
    if (digits.startsWith('923') && digits.length === 12) {
      return `0${digits.substring(2, 5)}-${digits.substring(5)}`;
    }
    return phone;
  }

  generateWhatsAppUrl(phone: string, message: string): string {
    const cleanNumber = this.cleanPhoneDigits(phone);
    const encodedMsg = encodeURIComponent(message);
    if (cleanNumber) {
      return `https://wa.me/${cleanNumber}?text=${encodedMsg}`;
    }
    return `https://wa.me/?text=${encodedMsg}`;
  }

  getFormattedPaymentReceiptText(customer: Customer, amountReceived: number, method: string, notes = ''): string {
    const cfg = this.config();
    const dateStr = new Date().toLocaleString('en-PK', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });

    let text = `🧾 *${cfg.storeName.toUpperCase()}*\n`;
    text += `*UDHAR PAYMENT RECEIPT (وصولی رسید)*\n`;
    text += `--------------------------------\n`;
    text += `Date: ${dateStr}\n`;
    text += `Customer: *${customer.name}*\n`;
    text += `Phone: *${this.formatDisplayPhone(customer.phone)}*\n`;
    text += `--------------------------------\n`;
    text += `Amount Received (وصول کی گئی رقم): *Rs. ${amountReceived.toLocaleString('en-PK')}*\n`;
    text += `Payment Method: *${method.toUpperCase()}*\n`;
    if (notes) text += `Notes: ${notes}\n`;
    text += `--------------------------------\n`;
    text += `Remaining Udhar Balance: *Rs. ${customer.totalUdhar.toLocaleString('en-PK')}*\n`;
    text += `Credit Limit: Rs. ${(customer.creditLimit || 10000).toLocaleString('en-PK')}\n`;
    text += `--------------------------------\n`;
    text += `Shukriya! Aap ki paasdari ka bohot shukriya! 🙏`;
    return text;
  }

  getFormattedUdharReminderText(customer: Customer): string {
    const cfg = this.config();
    const template = cfg.whatsappReminderMsg || DEFAULT_CONFIG.whatsappReminderMsg;
    return template
      .replace(/{customer}/g, customer.name)
      .replace(/{store}/g, cfg.storeName)
      .replace(/{balance}/g, customer.totalUdhar.toLocaleString('en-PK'))
      .replace(/{phone}/g, cfg.phone);
  }

  getFormattedOverLimitNoticeText(customer: Customer): string {
    const cfg = this.config();
    const limit = customer.creditLimit || 10000;
    const excess = Math.max(0, customer.totalUdhar - limit);

    let text = `⚠️ *${cfg.storeName.toUpperCase()} - CREDIT LIMIT EXCEEDED NOTICE*\n`;
    text += `*ادھار کی حد سے تجاوز کی فوری اطلاع*\n`;
    text += `--------------------------------\n`;
    text += `Dear *${customer.name}*,\n\n`;
    text += `Aap ke khatey mein kul udhar balance *Rs. ${customer.totalUdhar.toLocaleString('en-PK')}* ho chuka hai.\n`;
    text += `Aap ki manzoor shuda credit limit *Rs. ${limit.toLocaleString('en-PK')}* hai.\n`;
    text += `Aap ka udhar limit se *Rs. ${excess.toLocaleString('en-PK')}* zaiyad (exceed) ho chuka hai.\n\n`;
    text += `Barae meherbani barwaqt adaigii (Payment) kar ke apna udhar balance limit ke andar laaen taake mazeed khata saholat jari rakhi jaa sakey.\n`;
    text += `--------------------------------\n`;
    if (cfg.phone) text += `For Payments & Inquiries: ${cfg.phone}\n`;
    text += `Shukriya! 🙏 (*${cfg.storeName}*)`;
    return text;
  }

  getFormattedUdharStatementText(customer: Customer): string {
    const cfg = this.config();
    const dateStr = new Date().toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' });
    const ledger = this.getCustomerUnifiedLedger(customer.id);

    let text = `📋 *${cfg.storeName.toUpperCase()} - FULL KHATA STATEMENT*\n`;
    text += `*مکمل تفصیلی کھاتہ سٹیٹمنٹ*\n`;
    text += `--------------------------------\n`;
    text += `Customer Name: *${customer.name}*\n`;
    text += `Phone: *${this.formatDisplayPhone(customer.phone)}*\n`;
    text += `Statement Date: *${dateStr}*\n`;
    text += `Current Udhar Balance: *Rs. ${customer.totalUdhar.toLocaleString('en-PK')}*\n`;
    text += `Credit Limit: Rs. ${(customer.creditLimit || 10000).toLocaleString('en-PK')}\n`;
    text += `--------------------------------\n`;
    text += `*LEDGER BREAKDOWN (کچھ حالیہ لین دین):*\n\n`;

    if (ledger.length === 0) {
      text += `(No khata transactions recorded yet)\n`;
    } else {
      const recent = ledger.slice(0, 10);
      recent.forEach(item => {
        const dt = new Date(item.date).toLocaleDateString('en-PK', { day: '2-digit', month: 'short' });
        const symbol = item.type === 'diya' ? '🔴 (+Udhar)' : item.type === 'liya' ? '🟢 (-Payment)' : '🔵 (Bill Paid)';
        text += `• *${dt}* | ${symbol} *Rs. ${item.amount.toLocaleString('en-PK')}*\n`;
        text += `  _${item.description.replace(/\n/g, ' ')}_\n`;
      });
      if (ledger.length > 10) {
        text += `\n_...plus ${ledger.length - 10} earlier transactions recorded in ledger._\n`;
      }
    }

    text += `--------------------------------\n`;
    text += `*NET OUTSTANDING BALANCE: Rs. ${customer.totalUdhar.toLocaleString('en-PK')}*\n`;
    text += `--------------------------------\n`;
    if (cfg.phone) text += `For Payments (Cash / EasyPaisa / JazzCash): ${cfg.phone}\n`;
    text += `Shukriya! 🙏 (*${cfg.storeName}*)`;
    return text;
  }

  getExactMonthlyUrduReminderText(customer: Customer): string {
    const cfg = this.config();
    const now = new Date();
    const monthName = now.toLocaleString('en-PK', { month: 'long' });
    const amountStr = customer.totalUdhar.toLocaleString('en-PK');
    const storeNameStr = cfg.storeName || 'Ehsan istor';

    return `Assalam-o-Alaikum ${customer.name} bhai, ${monthName} ka udhar Rs.${amountStr} baqi hai. Baraye karam 10 ${monthName} tak clear kar dein. - ${storeNameStr}`;
  }

  getFormattedMonthlyReminderText(customer: Customer): string {
    return this.getExactMonthlyUrduReminderText(customer);
  }

  isMonthlyReminderPeriod(): boolean {
    const day = new Date().getDate();
    return day >= 1 && day <= 10;
  }

  getFormattedInvoiceReceiptText(tx: Transaction): string {
    const cfg = this.config();
    const dateStr = new Date(tx.timestamp).toLocaleString('en-PK', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });

    let text = `🧾 *${cfg.storeName.toUpperCase()}*\n`;
    text += `📍 ${cfg.address}\n`;
    text += `📞 ${cfg.phone} | NTN: ${cfg.ntn || 'N/A'}\n`;
    text += `--------------------------------\n`;
    text += `Invoice #: *${tx.invoiceNo}*\n`;
    text += `Date: ${dateStr}\n`;
    if (tx.customerName) text += `Customer: *${tx.customerName}*\n`;
    text += `--------------------------------\n`;
    
    tx.items.forEach(ci => {
      text += `• ${ci.item.nameEn} x ${ci.qty} ${ci.item.unit} = Rs. ${ci.subtotal.toLocaleString('en-PK')}\n`;
    });

    text += `--------------------------------\n`;
    text += `Subtotal: Rs. ${tx.subtotal.toLocaleString('en-PK')}\n`;
    if (tx.discount > 0) text += `Discount: Rs. ${tx.discount.toLocaleString('en-PK')}\n`;
    text += `*TOTAL BILL: Rs. ${tx.total.toLocaleString('en-PK')}*\n`;
    text += `Payment: *${tx.paymentMethod.toUpperCase()}*\n`;

    if (tx.customerId) {
      const cust = this.customers().find(c => c.id === tx.customerId);
      if (cust) {
        text += `Updated Udhar Balance: *Rs. ${cust.totalUdhar.toLocaleString('en-PK')}*\n`;
      }
    }

    text += `\n_JazakAllah Khair for your business!_ 🙏`;
    return text;
  }

  // --- SECURITY & PIN LOCK MANAGEMENT ---
  validatePin(pin: string): { success: boolean; role?: UserRole; message?: string } {
    const cleanPin = pin ? pin.trim() : '';
    const mainPass = this.storePassword();
    const adminPass = this.adminPin();
    const staffPass = this.staffPin();

    if (cleanPin === mainPass || cleanPin === adminPass) {
      return { success: true, role: 'admin', message: 'Sahi Password! Dukan Access Unlocked.' };
    }
    if (cleanPin === staffPass) {
      return { success: true, role: 'staff', message: 'Sahi PIN! Staff (Helper) Access Unlocked.' };
    }
    return { success: false, message: 'Ghalt Password! Sahi password darj karein.' };
  }

  updateStorePassword(newPass: string) {
    const clean = newPass ? newPass.trim() : '3418021801';
    const current = { ...this.config() };
    current.storePassword = clean;
    current.adminPin = clean;
    this.saveConfig(current);
  }

  // --- DATA BACKUP & RESTORE (ONE-CLICK JSON BACKUP/RESTORE) ---
  exportDatabaseToJson(): string {
    const backup = {
      appName: 'H S Kirana Store POS & DigiKhata',
      version: '2.0',
      exportDate: new Date().toISOString(),
      config: this.config(),
      inventory: this.inventory(),
      customers: this.customers(),
      transactions: this.transactions(),
      udharEntries: this.udharEntries(),
      templates: this.templates()
    };
    return JSON.stringify(backup, null, 2);
  }

  async restoreDatabaseFromJson(jsonContent: string): Promise<{ success: boolean; message: string; counts?: Record<string, number> }> {
    try {
      const data = JSON.parse(jsonContent);
      if (!data || typeof data !== 'object') {
        return { success: false, message: 'Ghalt JSON File! Sahi backup file select karein.' };
      }

      const inventory: InventoryItem[] = Array.isArray(data.inventory) ? data.inventory : [];
      const customers: Customer[] = Array.isArray(data.customers) ? data.customers : [];
      const transactions: Transaction[] = Array.isArray(data.transactions) ? data.transactions : [];
      const udharEntries: UdharEntry[] = Array.isArray(data.udharEntries) ? data.udharEntries : [];
      const templates: WhatsAppTemplate[] = Array.isArray(data.templates) ? data.templates : [];
      const config: StoreConfig = data.config && typeof data.config === 'object' ? data.config : this.config();

      // 1. Transactional Dexie IndexedDB wipe & restoration
      await dexieDb.transaction('rw', [dexieDb.inventory, dexieDb.customers, dexieDb.transactions, dexieDb.udharEntries, dexieDb.config, dexieDb.templates], async () => {
        await dexieDb.inventory.clear();
        if (inventory.length) await dexieDb.inventory.bulkPut(inventory);

        await dexieDb.customers.clear();
        if (customers.length) await dexieDb.customers.bulkPut(customers);

        await dexieDb.transactions.clear();
        if (transactions.length) await dexieDb.transactions.bulkPut(transactions);

        await dexieDb.udharEntries.clear();
        if (udharEntries.length) await dexieDb.udharEntries.bulkPut(udharEntries);

        await dexieDb.templates.clear();
        if (templates.length) await dexieDb.templates.bulkPut(templates);

        await dexieDb.config.clear();
        await dexieDb.config.put({ id: 'main', ...config });
      });

      // 2. Synchronize LocalStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(inventory));
        localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
        localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
        localStorage.setItem(STORAGE_KEYS.UDHAR, JSON.stringify(udharEntries));
        localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
        localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(templates));
      }

      // 3. Update Signals
      this.inventory.set(inventory);
      this.customers.set(customers);
      this.transactions.set(transactions);
      this.udharEntries.set(udharEntries);
      this.config.set(config);
      this.templates.set(templates);

      return {
        success: true,
        message: `Database Multana Restore Ho Gaya! (${inventory.length} Products, ${customers.length} Customers, ${transactions.length} Sales, ${udharEntries.length} Udhar Entries)`,
        counts: {
          inventory: inventory.length,
          customers: customers.length,
          transactions: transactions.length,
          udharEntries: udharEntries.length
        }
      };
    } catch (err) {
      console.error('Failed to restore database from JSON:', err);
      const errMsg = err instanceof Error ? err.message : 'Invalid JSON format';
      return {
        success: false,
        message: `Restore na-kaam raha! File Syntax error: ${errMsg}`
      };
    }
  }

  setRole(role: UserRole) {
    this.currentUserRole.set(role);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_ROLE, role);
    }
  }

  updateSecurityPins(newAdminPin: string, newStaffPin: string, pinLockEnabled = true) {
    const current = { ...this.config() };
    current.adminPin = newAdminPin.trim() || '1234';
    current.staffPin = newStaffPin.trim() || '0000';
    current.pinLockEnabled = pinLockEnabled;
    this.saveConfig(current);
  }

  openPinModal(reason: string, targetRole: UserRole | 'any' = 'any', onApproved?: () => void) {
    this.pinModalReason.set(reason);
    this.pinModalTargetRole.set(targetRole);
    this.pendingAction.set(onApproved ? onApproved : null);
    this.isPinModalOpen.set(true);
  }

  closePinModal() {
    this.isPinModalOpen.set(false);
    this.pendingAction.set(null);
  }

  submitPinFromModal(pin: string): { success: boolean; message: string } {
    const res = this.validatePin(pin);
    if (!res.success || !res.role) {
      return { success: false, message: res.message || 'Ghalt PIN! Dobara Koshish Karein.' };
    }

    const required = this.pinModalTargetRole();
    if (required !== 'any' && res.role !== required) {
      return { 
        success: false, 
        message: `Khas Access zaroori hai! (${required === 'admin' ? 'Dukan Malik Admin PIN (Default: 1234)' : 'Staff PIN (Default: 0000)'} darja karein)` 
      };
    }

    this.setRole(res.role);
    this.isPinModalOpen.set(false);
    this.isAppLocked.set(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.APP_LOCKED);
    }

    const action = this.pendingAction();
    if (action) {
      action();
      this.pendingAction.set(null);
    }

    return { success: true, message: res.message || 'Access Unlocked' };
  }

  lockApp() {
    this.isAppLocked.set(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.APP_LOCKED, 'true');
    }
  }

  unlockAppWithPin(pin: string): { success: boolean; message: string } {
    const res = this.validatePin(pin);
    if (res.success && res.role) {
      this.setRole(res.role);
      this.isAppLocked.set(false);
      if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEYS.APP_LOCKED);
      }
      return { success: true, message: `System Unlocked as ${res.role === 'admin' ? 'Dukan Malik (Admin)' : 'Staff (Helper)'}` };
    }
    return { success: false, message: 'Ghalt PIN! (Incorrect PIN)' };
  }
}
