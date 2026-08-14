import { Component, inject, output, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { StoreService } from '../services/store.service';

export type ActiveTab = 'pos' | 'inventory' | 'digikhata' | 'whatsapp' | 'reports' | 'settings';

@Component({
  selector: 'app-header-nav',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="bg-emerald-900 text-white border-b border-emerald-800/80 sticky top-0 z-30 shadow-md">
      <!-- Top Bar: Store branding & Quick stats -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div class="flex flex-col sm:flex-row items-center justify-between gap-3">
          
          <!-- Store Brand Title -->
          <div class="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-white text-emerald-900 font-black flex items-center justify-center shadow-sm text-xl tracking-tight">
                HS
              </div>
              <div>
                <h1 class="text-lg font-black tracking-tight text-white flex items-center gap-2 leading-none">
                  {{ storeService.config().storeName }}
                  <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-800 text-emerald-200 border border-emerald-700">
                    Bento POS & Khata
                  </span>
                </h1>
                <p class="text-xs text-emerald-200/80 mt-1 font-medium">
                  {{ storeService.config().tagline }} • 📞 {{ storeService.config().phone }}
                </p>
              </div>
            </div>

            <!-- Language Switcher for Mobile -->
            <button 
              (click)="storeService.toggleLanguage()"
              class="sm:hidden text-xs px-2.5 py-1 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-emerald-100 font-bold border border-emerald-700 flex items-center gap-1">
              <mat-icon class="text-sm">translate</mat-icon>
              {{ storeService.isUrdu() ? 'English' : 'اردو' }}
            </button>
          </div>

          <!-- Quick Stats Pills & Controls -->
          <div class="flex items-center gap-2 sm:gap-3 text-xs w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            
            <!-- Today's Counter Cash Pill -->
            <div class="hidden lg:flex flex-col items-end px-3 py-1 bg-emerald-800/80 rounded-xl border border-emerald-700/60 text-right">
              <span class="text-[10px] uppercase font-bold text-emerald-300 opacity-80">Naqad Cash</span>
              <span class="font-mono font-bold text-sm text-emerald-300">Rs. {{ storeService.todaySalesTotal() | number:'1.0-0' }}</span>
            </div>

            <!-- Low Stock Alert Badge -->
            <button 
              (click)="tabChange.emit('inventory')"
              class="flex items-center gap-1.5 px-3 py-2 rounded-xl border text-nowrap transition-all"
              [ngClass]="storeService.lowStockItemsCount() > 0 ? 'bg-amber-500/20 border-amber-400/40 text-amber-200 hover:bg-amber-500/30' : 'bg-emerald-800/60 border-emerald-700/60 text-emerald-200'">
              <mat-icon class="text-base" [ngClass]="storeService.lowStockItemsCount() > 0 ? 'text-amber-300 animate-pulse' : 'text-emerald-300'">
                warning
              </mat-icon>
              <span>Kamm Stock: <strong class="font-bold">{{ storeService.lowStockItemsCount() }}</strong></span>
            </button>

            <!-- Total Market Udhar Badge -->
            <button 
              (click)="tabChange.emit('digikhata')"
              class="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-500/20 border border-red-400/30 text-red-200 hover:bg-red-500/30 text-nowrap transition-all">
              <mat-icon class="text-base text-red-300">account_balance_wallet</mat-icon>
              <span>Kul Udhar: <strong class="font-bold">Rs. {{ storeService.totalMarketUdhar() | number:'1.0-0' }}</strong></span>
            </button>

            <!-- Active Role Security Pill -->
            <button 
              type="button"
              (click)="storeService.openPinModal('Role tabdeel karne ke liye Admin ya Staff PIN enter karein', 'any')"
              class="flex items-center gap-1.5 px-3 py-2 rounded-xl text-nowrap transition-all border font-bold text-xs cursor-pointer active:scale-95 shadow-xs"
              [ngClass]="storeService.isAdmin() ? 'bg-emerald-500/20 text-emerald-200 border-emerald-400/40 hover:bg-emerald-500/30' : 'bg-indigo-500/20 text-indigo-200 border-indigo-400/40 hover:bg-indigo-500/30'">
              <mat-icon class="text-base" [ngClass]="storeService.isAdmin() ? 'text-amber-300' : 'text-indigo-300'">
                {{ storeService.isAdmin() ? 'admin_panel_settings' : 'badge' }}
              </mat-icon>
              <span>{{ storeService.isAdmin() ? '👑 Dukan Malik (Admin)' : '🧑‍🌾 Staff (Helper)' }}</span>
            </button>

            <!-- Lock System Button -->
            <button 
              type="button"
              (click)="storeService.lockApp()"
              title="Lock System (سیستم لاک)"
              class="flex items-center justify-center p-2 rounded-xl bg-red-800/80 hover:bg-red-700 text-white font-bold border border-red-700/80 transition-colors cursor-pointer active:scale-95 shadow-xs">
              <mat-icon class="text-base">lock</mat-icon>
            </button>

            <!-- Language Switcher Desktop -->
            <button 
              (click)="storeService.toggleLanguage()"
              class="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-emerald-100 font-bold border border-emerald-700 text-nowrap transition-colors">
              <mat-icon class="text-base text-emerald-300">translate</mat-icon>
              {{ storeService.isUrdu() ? 'English' : 'Roman Urdu' }}
            </button>

            <!-- Dark Mode Toggle -->
            <button 
              (click)="storeService.toggleDarkMode()"
              title="Toggle Dark Mode"
              class="flex items-center justify-center p-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-amber-300 font-bold border border-emerald-700 transition-colors">
              <mat-icon class="text-base">{{ storeService.isDarkMode() ? 'light_mode' : 'dark_mode' }}</mat-icon>
            </button>

          </div>
        </div>
      </div>

      <!-- Navigation Tabs Bar -->
      <div class="bg-emerald-950/90 border-t border-emerald-800/80 px-4 sm:px-6 lg:px-8">
        <div class="max-w-7xl mx-auto flex items-center justify-between overflow-x-auto no-scrollbar">
          <nav class="flex space-x-1 sm:space-x-2 py-2">
            
            <button 
              (click)="selectTab('pos')"
              class="flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer"
              [ngClass]="activeTab() === 'pos' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/50 border border-emerald-500' : 'text-emerald-200/80 hover:text-white hover:bg-emerald-900/60'">
              <mat-icon class="text-lg">point_of_sale</mat-icon>
              <span>🛒 Nayi Sale (POS)</span>
            </button>

            <button 
              (click)="selectTab('inventory')"
              class="flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all relative cursor-pointer"
              [ngClass]="activeTab() === 'inventory' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/50 border border-emerald-500' : 'text-emerald-200/80 hover:text-white hover:bg-emerald-900/60'">
              <mat-icon class="text-lg">inventory_2</mat-icon>
              <span>📦 Saman & Rates</span>
              @if (storeService.lowStockItemsCount() > 0) {
                <span class="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
              }
            </button>

            <button 
              (click)="selectTab('digikhata')"
              class="flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer"
              [ngClass]="activeTab() === 'digikhata' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/50 border border-emerald-500' : 'text-emerald-200/80 hover:text-white hover:bg-emerald-900/60'">
              <mat-icon class="text-lg">menu_book</mat-icon>
              <span>📖 Musteri Khata (Udhar)</span>
            </button>

            <button 
              (click)="selectTab('whatsapp')"
              class="flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer"
              [ngClass]="activeTab() === 'whatsapp' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/50 border border-emerald-500' : 'text-emerald-200/80 hover:text-white hover:bg-emerald-900/60'">
              <mat-icon class="text-lg">chat</mat-icon>
              <span>💬 WhatsApp & QR</span>
            </button>

            <button 
              (click)="selectTab('reports')"
              class="flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer"
              [ngClass]="activeTab() === 'reports' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/50 border border-emerald-500' : 'text-emerald-200/80 hover:text-white hover:bg-emerald-900/60'">
              <mat-icon class="text-lg">bar_chart</mat-icon>
              <span>📊 Bikri Reports</span>
              @if (storeService.isStaff()) {
                <mat-icon class="text-xs text-amber-300 ml-0.5">lock</mat-icon>
              }
            </button>

            <button 
              (click)="selectTab('settings')"
              class="flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer"
              [ngClass]="activeTab() === 'settings' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/50 border border-emerald-500' : 'text-emerald-200/80 hover:text-white hover:bg-emerald-900/60'">
              <mat-icon class="text-lg">settings</mat-icon>
              <span>⚙️ Dukan Settings</span>
              @if (storeService.isStaff()) {
                <mat-icon class="text-xs text-amber-300 ml-0.5">lock</mat-icon>
              }
            </button>

          </nav>
        </div>
      </div>
    </header>
  `
})
export class HeaderNavComponent {
  storeService = inject(StoreService);
  activeTab = input.required<ActiveTab>();
  tabChange = output<ActiveTab>();

  selectTab(tab: ActiveTab) {
    if (tab === 'reports' && !this.storeService.isAdmin()) {
      this.storeService.openPinModal(
        'Bikri Financial Reports dekhne ke liye Admin (Dukan Malik) PIN enter karein', 
        'admin', 
        () => this.tabChange.emit('reports')
      );
      return;
    }
    if (tab === 'settings' && !this.storeService.isAdmin()) {
      this.storeService.openPinModal(
        'Dukan Settings, Security PINs aur Backup access ke liye Admin PIN enter karein', 
        'admin', 
        () => this.tabChange.emit('settings')
      );
      return;
    }
    this.tabChange.emit(tab);
  }
}
