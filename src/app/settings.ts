import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { StoreService } from '../services/store.service';
import { StoreConfig } from '../models/store.models';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  template: `
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      <!-- Settings Header -->
      <div class="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-slate-900 text-emerald-400 flex items-center justify-center font-bold">
            <mat-icon class="text-xl">settings</mat-icon>
          </div>
          <div>
            <h1 class="font-extrabold text-slate-900 text-base">Store & WhatsApp Settings</h1>
            <p class="text-xs text-slate-500">Configure Kirana store details, receipt headers & custom WhatsApp messages</p>
          </div>
        </div>

        @if (savedNotice()) {
          <span class="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 animate-fade-in">
            ✓ Settings Saved Successfully!
          </span>
        }
      </div>

      <!-- Store Configuration Form -->
      <div class="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-5">
        <h2 class="font-bold text-slate-900 text-sm border-b border-slate-200 pb-3 flex items-center gap-2">
          <mat-icon class="text-emerald-600 text-base">store</mat-icon>
          Store Profile & Thermal Invoice Header
        </h2>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <span class="block font-bold text-slate-700 mb-1">Store Name (اسٹور کا نام) *</span>
            <input 
              type="text" 
              [(ngModel)]="cfg.storeName"
              placeholder="e.g. H S Kirana & Rashan Store"
              class="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <span class="block font-bold text-slate-700 mb-1">Owner Name (مالک کا نام)</span>
            <input 
              type="text" 
              [(ngModel)]="cfg.ownerName"
              placeholder="e.g. Haji Muhammad Suleman"
              class="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <span class="block font-bold text-slate-700 mb-1">Store Tagline / Slogan</span>
            <input 
              type="text" 
              [(ngModel)]="cfg.tagline"
              placeholder="e.g. Aap Ka Aam Aur Aala Kirana Store"
              class="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <span class="block font-bold text-slate-700 mb-1">Contact Phone (فون نمبر) *</span>
            <input 
              type="text" 
              [(ngModel)]="cfg.phone"
              placeholder="e.g. 03001234567"
              class="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono font-bold focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <span class="block font-bold text-slate-700 mb-1">Store Address (پتہ) *</span>
            <input 
              type="text" 
              [(ngModel)]="cfg.address"
              placeholder="e.g. Main Bazaar, Near Jamia Masjid, Lahore"
              class="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <span class="block font-bold text-slate-700 mb-1">NTN / Registration Number</span>
            <input 
              type="text" 
              [(ngModel)]="cfg.ntn"
              placeholder="e.g. 4829104-7"
              class="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <span class="block font-bold text-slate-700 mb-1">EasyPaisa Account Mobile No.</span>
            <input 
              type="text" 
              [(ngModel)]="cfg.easypaisaNo"
              placeholder="e.g. 03001234567"
              class="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <span class="block font-bold text-slate-700 mb-1">JazzCash Account Mobile No.</span>
            <input 
              type="text" 
              [(ngModel)]="cfg.jazzcashNo"
              placeholder="e.g. 03001234567"
              class="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <!-- WhatsApp Reminder Template Config -->
        <div class="pt-3 border-t border-slate-200 space-y-2">
          <span class="block font-bold text-slate-800 text-xs">
            Default WhatsApp Udhar Reminder Template (پیغام ٹیمپلیٹ):
          </span>
          <textarea 
            rows="3"
            [(ngModel)]="cfg.whatsappReminderMsg"
            class="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium focus:ring-2 focus:ring-emerald-500"
          ></textarea>
          <p class="text-[10px] text-slate-400">
            Available tags: <code class="bg-slate-100 px-1 py-0.5 rounded text-slate-700">&#123;customer&#125;</code>, <code class="bg-slate-100 px-1 py-0.5 rounded text-slate-700">&#123;store&#125;</code>, <code class="bg-slate-100 px-1 py-0.5 rounded text-slate-700">&#123;balance&#125;</code>, <code class="bg-slate-100 px-1 py-0.5 rounded text-slate-700">&#123;phone&#125;</code>
          </p>
        </div>

        <button 
          (click)="saveConfig()"
          class="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer">
          <mat-icon class="text-base">save</mat-icon>
          Save Store Settings (محفوظ کریں)
        </button>
      </div>

      <!-- DUKAN MASTER PASSWORD & APP LOCK SETTINGS CARD -->
      <div class="bg-white dark:bg-slate-900 rounded-2xl border-2 border-emerald-500 shadow-md p-6 space-y-5">
        <div class="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <mat-icon class="text-xl">lock</mat-icon>
            </div>
            <div>
              <h2 class="font-extrabold text-slate-900 dark:text-slate-100 text-sm">
                DUKAN PASSWORD & STARTUP LOCK (دکان سکیورٹی پاس ورڈ)
              </h2>
              <p class="text-xs text-slate-500 dark:text-slate-400">
                ویب سائٹ اوپن ہونے پر مانگا جانے والا پاس ورڈ سیٹ اور تبدیل کریں
              </p>
            </div>
          </div>

          <button 
            type="button"
            (click)="lockAppNow()"
            class="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-black shadow-sm flex items-center gap-1.5 transition-all cursor-pointer active:scale-95">
            <mat-icon class="text-sm">lock</mat-icon>
            <span>Lock Screen Now (لاک کریں)</span>
          </button>
        </div>

        <!-- Explanation box in Urdu & English -->
        <div class="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 space-y-1.5">
          <div class="flex items-center gap-2 font-bold text-emerald-900 dark:text-emerald-200 text-xs">
            <mat-icon class="text-emerald-600 text-base">verified_user</mat-icon>
            <span>Startup Security (سٹارٹ اپ سکیورٹی پروٹیکشن):</span>
          </div>
          <p class="text-slate-700 dark:text-slate-300 text-xs leading-relaxed">
            یہ پاس ورڈ ویب سائٹ اوپن ہوتے ہی مانگا جائے گا تاکہ کوئی دوسرا بندہ آپ کا کھاتہ، کسٹمرز یا سیلز نہ دیکھ سکے۔
            ڈیفالٹ پاس ورڈ: <strong class="font-mono text-emerald-700 dark:text-emerald-400">3418021801</strong> ہے۔
            آپ جب چاہیں نیچے دیے گئے خانے سے نیا پاس ورڈ تبدیل کر سکتے ہیں۔
          </p>
        </div>

        <!-- Master Password Input (Masked by default) -->
        <div class="space-y-3 pt-1">
          <div>
            <label for="storePasswordInputId" class="block font-bold text-slate-800 dark:text-slate-200 text-xs mb-1.5">
              Store Master Password (دکان کا مین پاس ورڈ) *
            </label>

            <div class="relative flex items-center max-w-md">
              <input 
                id="storePasswordInputId"
                [type]="showStorePassword() ? 'text' : 'password'"
                [(ngModel)]="storePasswordInput"
                placeholder="Enter store password (e.g. 3418021801)"
                class="w-full bg-slate-50 dark:bg-slate-800 border-2 border-emerald-500/60 rounded-xl py-3 pl-4 pr-12 font-mono font-bold text-base text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />

              <!-- Password Masking Eye Toggle -->
              <button 
                type="button"
                (click)="showStorePassword.set(!showStorePassword())"
                title="Toggle Visibility"
                class="absolute right-3 p-1.5 text-slate-400 hover:text-emerald-500 transition-colors cursor-pointer">
                <mat-icon class="text-lg">{{ showStorePassword() ? 'visibility' : 'visibility_off' }}</mat-icon>
              </button>
            </div>
            <p class="text-[11px] text-slate-400 mt-1">
              پاس ورڈ لکھتے وقت چھپا رہے گا (Masked)۔ آنکھ والے بٹن سے دیکھا بھی جا سکتا ہے۔
            </p>
          </div>

          <div class="flex flex-wrap items-center gap-3 pt-2">
            <button 
              type="button"
              (click)="saveStorePassword()"
              class="py-3 px-6 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95">
              <mat-icon class="text-base">save</mat-icon>
              <span>Save New Password (نیا پاس ورڈ محفوظ کریں)</span>
            </button>
          </div>
        </div>
      </div>

      <!-- LOCAL SECURITY & ROLES (PIN LOCK) SETTINGS CARD -->
      <div class="bg-white dark:bg-slate-900 rounded-2xl border-2 border-amber-500/40 shadow-md p-6 space-y-5">
        <div class="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <mat-icon class="text-xl">badge</mat-icon>
            </div>
            <div>
              <h2 class="font-extrabold text-slate-900 dark:text-slate-100 text-sm">
                STAFF & HELPER PIN CODES (سٹاف پن کوڈز)
              </h2>
              <p class="text-xs text-slate-500 dark:text-slate-400">
                ملازم یا ہیلپر کے لیے محدود اختیارات والا الگ پن کوڈ
              </p>
            </div>
          </div>

          <span class="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
            Current: {{ storeService.isAdmin() ? '👑 Dukan Malik (Admin)' : '🧑‍🌾 Staff (Helper)' }}
          </span>
        </div>

        <!-- Role Permissions Info Box -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div class="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 space-y-1">
            <div class="flex items-center gap-1.5 font-bold text-emerald-800 dark:text-emerald-300">
              <mat-icon class="text-sm">admin_panel_settings</mat-icon>
              <span>Admin (Dukan Malik / مالک):</span>
            </div>
            <p class="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
              Full access to Rates, Settings, Reports, Data Backup, and Deletions. Password: <strong class="font-mono text-emerald-600 dark:text-emerald-400">{{ storeService.storePassword() }}</strong>
            </p>
          </div>

          <div class="p-3.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 space-y-1">
            <div class="flex items-center gap-1.5 font-bold text-indigo-800 dark:text-indigo-300">
              <mat-icon class="text-sm">badge</mat-icon>
              <span>Staff PIN (Helper / ہیلپر):</span>
            </div>
            <p class="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
              Can only perform <strong>"Nayi Sale"</strong> and <strong>"Add Customer"</strong>. Cannot change rates, view financial reports, or delete data. Default: <strong class="font-mono text-indigo-600 dark:text-indigo-400">0000</strong>
            </p>
          </div>
        </div>

        <!-- Security PIN Change Inputs -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
          <div>
            <span class="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Staff PIN (ہیلپر پن کوڈ) *
            </span>
            <input 
              type="text" 
              maxLength="12"
              [(ngModel)]="staffPinInput"
              placeholder="e.g. 0000"
              class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-mono font-bold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        <button 
          (click)="saveSecurityPins()"
          class="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95">
          <mat-icon class="text-base">security</mat-icon>
          Update Staff PIN Code (ہیلپر پن تبدیل کریں)
        </button>
      </div>

      <!-- Data Management / Backup & Restore Options -->
      <div class="bg-white dark:bg-slate-900 rounded-2xl border-2 border-emerald-500/40 shadow-md p-6 space-y-5">
        <div class="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <mat-icon class="text-xl">backup</mat-icon>
            </div>
            <div>
              <h2 class="font-extrabold text-slate-900 dark:text-slate-100 text-sm">
                DATA SAFETY, JSON BACKUP & RESTORE
              </h2>
              <p class="text-xs text-slate-500 dark:text-slate-400">
                ایک کلک میں بیک اپ ڈاؤنلوڈ کریں یا پرانی فائل سے ریسٹور کریں
              </p>
            </div>
          </div>

          <span class="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
            Offline IndexedDB Active
          </span>
        </div>

        <p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          All products, customer ledgers (Udhar), sales transactions, and store config are stored 100% locally in IndexedDB. Keep your business data safe with regular <strong>One-Click JSON Backups</strong>.
        </p>

        <!-- Hidden File Input for Restore -->
        <input 
          #fileInput 
          type="file" 
          accept=".json" 
          (change)="onFileSelected($event)" 
          class="hidden" 
        />

        <!-- Action Buttons Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <!-- One-Click Export Backup -->
          <button 
            type="button"
            (click)="exportDataBackup()"
            class="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95">
            <mat-icon class="text-base">download</mat-icon>
            <span>Export JSON Backup (بیک اپ)</span>
          </button>

          <!-- One-Click Import Restore -->
          <button 
            type="button"
            (click)="triggerRestorePrompt(fileInput)"
            class="py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-extrabold text-xs shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95">
            <mat-icon class="text-base">upload_file</mat-icon>
            <span>Restore JSON Backup (ریسٹور)</span>
          </button>

          <!-- Reset to Sample Data -->
          <button 
            type="button"
            (click)="resetSampleData()"
            class="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-extrabold text-xs border border-slate-700 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95">
            <mat-icon class="text-base">refresh</mat-icon>
            <span>Reload Sample Data</span>
          </button>
        </div>

        @if (restoreStatusMessage()) {
          <div 
            class="p-3 rounded-xl text-xs font-bold flex items-center gap-2"
            [ngClass]="restoreIsSuccess() ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/60' : 'bg-red-950/80 text-red-300 border border-red-500/60'">
            <mat-icon class="text-base">{{ restoreIsSuccess() ? 'check_circle' : 'error' }}</mat-icon>
            <span>{{ restoreStatusMessage() }}</span>
          </div>
        }
      </div>

      <!-- OFFLINE PWA SERVICE WORKER STATUS CARD -->
      <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs p-6 space-y-4">
        <div class="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold">
              <mat-icon class="text-xl">signal_wifi_off</mat-icon>
            </div>
            <div>
              <h2 class="font-extrabold text-slate-900 dark:text-slate-100 text-sm">
                OFFLINE PWA SERVICE WORKER
              </h2>
              <p class="text-xs text-slate-500 dark:text-slate-400">
                بغیر انٹرنیٹ کے فوری ایپ ڈسپلے اور کیشنگ
              </p>
            </div>
          </div>

          <span class="px-2.5 py-1 rounded-full text-xs font-bold bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 border border-sky-300 dark:border-sky-700">
            PWA Ready
          </span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
            <span class="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold block">App Manifest</span>
            <span class="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1">
              <mat-icon class="text-emerald-500 text-sm">check_circle</mat-icon> Installed / Standalone
            </span>
          </div>

          <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
            <span class="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold block">Service Worker</span>
            <span class="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1">
              <mat-icon class="text-emerald-500 text-sm">verified</mat-icon> sw.js Active
            </span>
          </div>

          <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
            <span class="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold block">Offline Database</span>
            <span class="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1">
              <mat-icon class="text-emerald-500 text-sm">storage</mat-icon> Dexie IndexedDB
            </span>
          </div>
        </div>

        <p class="text-[11px] text-slate-500 dark:text-slate-400 italic">
          Tip: You can add "HS Kirana POS" to your phone home screen or desktop app for 100% offline access during load-shedding or internet disconnects.
        </p>
      </div>

    </div>
  `
})
export class SettingsComponent {
  storeService = inject(StoreService);

  cfg: StoreConfig = { ...this.storeService.config() };
  savedNotice = signal<boolean>(false);
  restoreStatusMessage = signal<string>('');
  restoreIsSuccess = signal<boolean>(true);

  storePasswordInput = this.storeService.storePassword();
  showStorePassword = signal<boolean>(false);
  adminPinInput = this.storeService.adminPin();
  staffPinInput = this.storeService.staffPin();

  saveConfig() {
    this.storeService.saveConfig(this.cfg);
    this.savedNotice.set(true);
    setTimeout(() => this.savedNotice.set(false), 3000);
  }

  saveStorePassword() {
    const clean = this.storePasswordInput ? this.storePasswordInput.trim() : '';
    if (!clean || clean.length < 4) {
      alert('پاس ورڈ کم از کم 4 حروف یا ہندسوں کا ہونا ضروری ہے! (Password must be at least 4 characters)');
      return;
    }

    this.storeService.updateStorePassword(clean);
    this.cfg = { ...this.storeService.config() };
    this.savedNotice.set(true);
    alert(`نیا پاس ورڈ کامیابی سے محفوظ ہو گیا!\nNew Password: ${clean}\nاب اگلی بار دکان کھولنے پر یہی پاس ورڈ درکار ہوگا۔`);
    setTimeout(() => this.savedNotice.set(false), 3000);
  }

  lockAppNow() {
    this.storeService.lockApp();
  }

  saveSecurityPins() {
    if (!this.staffPinInput || this.staffPinInput.trim().length < 4) {
      alert('Staff PIN kam az kam 4 digits ka hona chahiye!');
      return;
    }

    this.storeService.updateSecurityPins(this.storeService.storePassword(), this.staffPinInput, true);
    this.savedNotice.set(true);
    alert(`Staff PIN Updated Successfully!\n• Staff PIN: ${this.staffPinInput}`);
    setTimeout(() => this.savedNotice.set(false), 3000);
  }

  exportDataBackup() {
    if (!this.storeService.isAdmin()) {
      this.storeService.openPinModal('Data Backup download karne ke liye Admin (Dukan Malik) PIN enter karein', 'admin', () => this.performExport());
      return;
    }
    this.performExport();
  }

  private performExport() {
    const jsonStr = this.storeService.exportDatabaseToJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Kirana_POS_Full_Backup_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    this.restoreIsSuccess.set(true);
    this.restoreStatusMessage.set('✅ Backup exported successfully as .json file!');
  }

  triggerRestorePrompt(inputEl: HTMLInputElement) {
    if (!this.storeService.isAdmin()) {
      this.storeService.openPinModal('Database Restore karne ke liye Admin (Dukan Malik) PIN enter karein', 'admin', () => inputEl.click());
      return;
    }
    inputEl.click();
  }

  async onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    const reader = new FileReader();

    reader.onload = async (e) => {
      const content = e.target?.result as string;
      if (content) {
        const res = await this.storeService.restoreDatabaseFromJson(content);
        this.restoreIsSuccess.set(res.success);
        this.restoreStatusMessage.set(res.message);
        if (res.success) {
          this.cfg = { ...this.storeService.config() };
          this.adminPinInput = this.storeService.adminPin();
          this.staffPinInput = this.storeService.staffPin();
        }
      }
      input.value = ''; // Reset input
    };

    reader.readAsText(file);
  }

  resetSampleData() {
    if (!this.storeService.isAdmin()) {
      this.storeService.openPinModal('Store Data Reset karne ke liye Admin (Dukan Malik) PIN enter karein', 'admin', () => this.performReset());
      return;
    }
    this.performReset();
  }

  private performReset() {
    if (confirm('This will reload default Kirana products, sample Khata customers, and test sales. Continue?')) {
      this.storeService.resetAllData();
      this.cfg = { ...this.storeService.config() };
      this.adminPinInput = this.storeService.adminPin();
      this.staffPinInput = this.storeService.staffPin();
      this.restoreIsSuccess.set(true);
      this.restoreStatusMessage.set('Sample Kirana products and DigiKhata customers reloaded!');
    }
  }
}
