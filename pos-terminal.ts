import { Component, inject, signal, computed, ElementRef, ViewChild, HostListener, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import type { Html5Qrcode } from 'html5-qrcode';
import { StoreService } from '../services/store.service';
import { InventoryItem, ItemCategory, PaymentMethod, Transaction, CATEGORY_LIST } from '../models/store.models';
import { ReceiptModalComponent } from './receipt-modal';

@Component({
  selector: 'app-pos-terminal',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, ReceiptModalComponent],
  template: `
    <div class="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4">
      
      <!-- Top Keyboard Shortcut Bar & Search Header -->
      <div class="mb-3 bg-white dark:bg-slate-900 rounded-2xl p-3 sm:p-4 shadow-sm border border-slate-200/80 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3">
        
        <div class="flex items-center gap-2 w-full">
          <!-- Search Input with Barcode Icon -->
          <div class="relative flex-1">
            <mat-icon class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">search</mat-icon>
            <input 
              #searchInput
              type="text" 
              [ngModel]="searchQuery()"
              (ngModelChange)="onSearchChange($event)"
              placeholder="Search by name, Urdu (آٹا، گھی، دودھ) or barcode..." 
              class="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white dark:focus:bg-slate-800 transition-all font-medium"
            />
            @if (searchQuery()) {
              <button 
                (click)="clearSearch()" 
                class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <mat-icon class="text-sm">close</mat-icon>
              </button>
            }
          </div>

          <!-- Camera Barcode Scanner Toggle Button -->
          <button 
            type="button" 
            (click)="toggleScanner()"
            class="px-3.5 py-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md text-nowrap active:scale-95"
            [ngClass]="isScannerActive() ? 'bg-orange-600 hover:bg-orange-700 text-white shadow-orange-950/20' : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-950/20'">
            <mat-icon class="text-base">{{ isScannerActive() ? 'videocam_off' : 'qr_code_scanner' }}</mat-icon>
            <span class="hidden sm:inline">{{ isScannerActive() ? 'Stop Scanner' : 'Scan Barcode' }}</span>
            <span class="sm:hidden">Scan</span>
          </button>

          <!-- Low Stock Alert Widget Toggle Button -->
          <button 
            type="button" 
            (click)="toggleLowStockWidget()"
            class="px-3.5 py-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md text-nowrap active:scale-95 border"
            [ngClass]="lowStockItems().length > 0 ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-400/50' : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'">
            <mat-icon class="text-base" [ngClass]="lowStockItems().length > 0 ? 'text-amber-500 animate-bounce' : ''">warning_amber</mat-icon>
            <span class="hidden md:inline">Low Stock (کم اسٹاک)</span>
            @if (lowStockItems().length > 0) {
              <span class="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] shadow-xs">
                {{ lowStockItems().length }}
              </span>
            }
          </button>
        </div>

      </div>

      <!-- DUKAN PRODUCT CATEGORIES SHOWCASE / FILTER CAROUSEL -->
      <div class="mb-4 bg-white dark:bg-slate-900 rounded-2xl p-3 sm:p-4 shadow-sm border border-slate-200/80 dark:border-slate-800 space-y-2.5">
        
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-xs">
              <mat-icon class="text-sm">grid_view</mat-icon>
            </div>
            <span class="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200">
              DUKAN CATEGORIES (کیٹیگریز چنیں):
            </span>
          </div>

          @if (selectedCategory() !== 'ALL') {
            <button 
              type="button" 
              (click)="selectedCategory.set('ALL')"
              class="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer">
              <mat-icon class="text-sm">restart_alt</mat-icon> Show All Items (سب سامان دیکھیں)
            </button>
          }
        </div>

        <!-- Scrollable Category Filter Pills -->
        <div class="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 no-scrollbar scroll-smooth">
          
          <!-- ALL ITEMS BUTTON -->
          <button 
            type="button"
            (click)="selectedCategory.set('ALL')"
            class="px-3.5 py-2 rounded-xl text-xs font-bold transition-all text-nowrap flex items-center gap-2 border cursor-pointer active:scale-95 shrink-0"
            [ngClass]="selectedCategory() === 'ALL' ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-emerald-500' : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'">
            <span class="text-sm">🏷️</span>
            <div class="text-left">
              <div class="font-extrabold leading-tight">All Items (تمام)</div>
              <div class="text-[10px] opacity-75">{{ totalInventoryCount() }} items</div>
            </div>
          </button>

          <!-- DEDICATED CATEGORY BUTTONS (Dairy, Ghee & Oil, Atta, etc.) -->
          @for (cat of categoryList; track cat.key) {
            <button 
              type="button"
              (click)="selectedCategory.set(cat.key)"
              class="px-3.5 py-2 rounded-xl text-xs font-bold transition-all text-nowrap flex items-center gap-2 border cursor-pointer active:scale-95 shrink-0"
              [ngClass]="selectedCategory() === cat.key ? 'bg-emerald-600 text-white border-emerald-600 shadow-md ring-2 ring-emerald-400 scale-[1.02]' : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-emerald-50 dark:hover:bg-slate-700 hover:border-emerald-300'">
              <span class="text-base">{{ cat.emoji }}</span>
              <div class="text-left">
                <div class="font-extrabold leading-tight flex items-center gap-1.5">
                  <span>{{ cat.nameEn }}</span>
                  <span class="text-[10px] font-black px-1.5 py-0.2 rounded-full"
                    [ngClass]="selectedCategory() === cat.key ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'">
                    {{ categoryCountMap()[cat.key] || 0 }}
                  </span>
                </div>
                <div class="text-[10px] opacity-85 font-sans dir-rtl">{{ cat.nameUr }}</div>
              </div>
            </button>
          }

        </div>

      </div>

      <!-- CAMERA BARCODE SCANNER LIVE VIEWPORT & OVERLAY -->
      @if (isScannerActive()) {
        <div class="mb-4 bg-slate-900 text-white rounded-2xl p-4 border border-emerald-500/40 shadow-xl space-y-3">
          <div class="flex items-center justify-between border-b border-slate-800 pb-3">
            <div class="flex items-center gap-2">
              <span class="relative flex h-3 w-3">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <span class="font-extrabold text-sm text-emerald-400 tracking-wide">CAMERA BARCODE SCANNER</span>
              <span class="text-xs text-slate-400 hidden sm:inline">(Point camera at product barcode)</span>
            </div>
            <button 
              type="button" 
              (click)="toggleScanner()" 
              class="text-xs font-bold px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1 cursor-pointer">
              <mat-icon class="text-sm">close</mat-icon> Close Camera
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            <!-- Camera Video Feed Container -->
            <div class="md:col-span-7 lg:col-span-6 relative bg-black rounded-xl overflow-hidden min-h-[220px] max-h-[280px] border border-slate-800 flex items-center justify-center">
              <div id="pos-barcode-scanner-viewport" class="w-full h-full object-cover"></div>
              
              <!-- Scanning reticle / aiming frame overlay -->
              <div class="absolute inset-0 pointer-events-none flex items-center justify-center p-4">
                <div class="w-full max-w-[260px] h-32 border-2 border-dashed border-emerald-400/90 rounded-xl relative overflow-hidden flex items-center justify-center bg-emerald-500/5">
                  <div class="w-full h-0.5 bg-emerald-400 shadow-[0_0_12px_#10b981] animate-pulse"></div>
                  <span class="absolute bottom-1 text-[10px] text-emerald-300 font-bold bg-slate-950/90 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                    Align Barcode Here
                  </span>
                </div>
              </div>
            </div>

            <!-- Scanner Status & Scanned Feedback Side Panel -->
            <div class="md:col-span-5 lg:col-span-6 space-y-3 bg-slate-800/80 rounded-xl p-4 border border-slate-700/80">
              <div>
                <span class="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Scanner Status</span>
                <p class="text-xs font-semibold text-slate-200 mt-0.5 flex items-center gap-1.5">
                  <mat-icon class="text-emerald-400 text-sm">center_focus_strong</mat-icon>
                  <span>{{ scannerStatusText() }}</span>
                </p>
              </div>

              @if (lastScannedMessage(); as msg) {
                <div class="p-3 rounded-xl bg-emerald-950/90 border border-emerald-500/60 text-emerald-200 text-xs font-bold flex items-center gap-2.5 shadow-lg">
                  <mat-icon class="text-emerald-400 text-xl">shopping_cart_checkout</mat-icon>
                  <div>
                    <div class="font-black text-white text-sm">{{ msg.name }}</div>
                    <div class="text-[11px] text-emerald-300">Added to Cart • Rs. {{ msg.price }}</div>
                  </div>
                </div>
              }

              @if (scannerError()) {
                <div class="p-3 rounded-xl bg-red-950/90 border border-red-500/60 text-red-200 text-xs font-medium flex items-center gap-2">
                  <mat-icon class="text-red-400 text-lg">error_outline</mat-icon>
                  <span>{{ scannerError() }}</span>
                </div>
              }

              <!-- Manual Barcode Fallback Box -->
              <div class="pt-2 border-t border-slate-700/60 space-y-1">
                <span class="text-[10px] text-slate-400 font-semibold">Test Manual Barcode Entry:</span>
                <div class="flex items-center gap-2">
                  <input 
                    #manualInput
                    type="text" 
                    placeholder="e.g. 8901234001"
                    (keyup.enter)="processManualBarcode(manualInput.value); manualInput.value=''"
                    class="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <button 
                    type="button"
                    (click)="processManualBarcode(manualInput.value); manualInput.value=''"
                    class="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs text-nowrap cursor-pointer">
                    Scan
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      }

      <!-- LOW STOCK DASHBOARD WIDGET CARD (COLLAPSIBLE / EXPANDABLE) -->
      @if (showLowStockWidget()) {
        <div class="mb-5 bg-gradient-to-br from-slate-900 via-amber-950/50 to-slate-900 text-white rounded-3xl p-4 md:p-5 border-2 border-amber-500/40 shadow-2xl space-y-4 animate-fade-in">
          
          <!-- Header Row with Title & Threshold Control -->
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-amber-500/30 pb-3">
            
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-black text-xl shrink-0 border border-amber-500/40 shadow-inner">
                <mat-icon class="text-amber-400">warning</mat-icon>
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <h3 class="font-black text-base tracking-wide text-amber-300 uppercase">
                    LOW STOCK DASHBOARD & REORDER WIDGET
                  </h3>
                  <span class="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-black uppercase">
                    Live Stock Monitor
                  </span>
                </div>
                <p class="text-xs text-slate-300 font-medium">
                  Items falling below user-defined threshold. Customize threshold or trigger 1-click reorders.
                </p>
              </div>
            </div>

            <!-- User-Defined Threshold Control Box -->
            <div class="flex items-center gap-2 bg-slate-950/80 p-2 rounded-2xl border border-amber-500/30">
              <span class="text-xs font-bold text-amber-200/90 whitespace-nowrap pl-1">
                Threshold (حد):
              </span>

              <!-- Quick Threshold Presets -->
              <button 
                type="button"
                (click)="setThresholdOverride(null)"
                class="px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer"
                [ngClass]="lowStockThresholdOverride() === null ? 'bg-amber-500 text-slate-950 shadow-xs' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'">
                Item Alert
              </button>

              <button 
                type="button"
                (click)="setThresholdOverride(5)"
                class="px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer"
                [ngClass]="lowStockThresholdOverride() === 5 ? 'bg-amber-500 text-slate-950 shadow-xs' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'">
                ≤ 5
              </button>

              <button 
                type="button"
                (click)="setThresholdOverride(15)"
                class="px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer"
                [ngClass]="lowStockThresholdOverride() === 15 ? 'bg-amber-500 text-slate-950 shadow-xs' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'">
                ≤ 15
              </button>

              <!-- Custom Threshold Input -->
              <div class="flex items-center gap-1 pl-1 border-l border-slate-800">
                <input 
                  #threshInput
                  type="number" 
                  min="0"
                  max="500"
                  [value]="lowStockThresholdOverride() ?? ''"
                  placeholder="Custom"
                  (change)="setThresholdOverride(threshInput.value ? +threshInput.value : null)"
                  class="w-16 px-2 py-1 bg-slate-900 border border-amber-500/40 rounded-xl text-xs font-bold text-center text-amber-300 focus:outline-none focus:ring-1 focus:ring-amber-400"
                />
                <span class="text-[10px] text-slate-400 font-bold">units</span>
              </div>
            </div>

          </div>

          <!-- Summary Stats Bar -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            
            <div class="bg-slate-950/70 p-3 rounded-2xl border border-red-500/40 flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center font-bold">
                <mat-icon class="text-base">remove_shopping_cart</mat-icon>
              </div>
              <div>
                <span class="text-[10px] uppercase font-bold text-slate-400 block">Out of Stock</span>
                <span class="font-black text-sm text-red-400">{{ outOfStockCount() }} Items</span>
              </div>
            </div>

            <div class="bg-slate-950/70 p-3 rounded-2xl border border-amber-500/40 flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                <mat-icon class="text-base">warning</mat-icon>
              </div>
              <div>
                <span class="text-[10px] uppercase font-bold text-slate-400 block">Low Stock Warning</span>
                <span class="font-black text-sm text-amber-300">{{ criticalStockCount() }} Items</span>
              </div>
            </div>

            <div class="bg-slate-950/70 p-3 rounded-2xl border border-indigo-500/40 flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
                <mat-icon class="text-base">inventory_2</mat-icon>
              </div>
              <div>
                <span class="text-[10px] uppercase font-bold text-slate-400 block">Total Low Stock</span>
                <span class="font-black text-sm text-indigo-300">{{ lowStockItems().length }} Total Items</span>
              </div>
            </div>

            <div class="bg-slate-950/70 p-3 rounded-2xl border border-emerald-500/40 flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                <mat-icon class="text-base">payments</mat-icon>
              </div>
              <div>
                <span class="text-[10px] uppercase font-bold text-slate-400 block">Est. Reorder Budget</span>
                <span class="font-black text-sm text-emerald-400">Rs. {{ totalReorderEstCost() | number:'1.0-0' }}</span>
              </div>
            </div>

          </div>

          <!-- Low Stock Items Interactive Grid -->
          @if (lowStockItems().length === 0) {
            <div class="p-6 rounded-2xl bg-slate-950/60 border border-slate-800 text-center space-y-2">
              <mat-icon class="text-emerald-400 text-3xl">verified</mat-icon>
              <h4 class="font-black text-sm text-emerald-300">Stock Levels Are Healthy!</h4>
              <p class="text-xs text-slate-400">All inventory items are above the current alert threshold limit.</p>
            </div>
          } @else {
            <div class="space-y-2 max-h-80 overflow-y-auto pr-1">
              @for (r of reorderListItems(); track r.item.id) {
                <div class="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-amber-500/50 transition-all flex flex-col md:flex-row md:items-center justify-between gap-3">
                  
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0"
                         [ngClass]="r.item.stock === 0 ? 'bg-red-500/20 text-red-400 border border-red-500/40' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'">
                      {{ r.item.stock }}
                    </div>
                    <div>
                      <div class="flex items-center gap-2">
                        <span class="font-extrabold text-xs text-white">{{ r.item.nameEn }}</span>
                        <span class="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-semibold">{{ r.item.category }}</span>
                      </div>
                      <p class="text-[11px] text-amber-300/90 font-medium dir-rtl mt-0.5">
                        {{ r.item.nameUr }} • Current Stock: <span class="font-black" [class.text-red-400]="r.item.stock === 0">{{ r.item.stock }} {{ r.item.unit }}</span> (Limit: ≤ {{ lowStockThresholdOverride() ?? r.item.minStockAlert }} {{ r.item.unit }})
                      </p>
                    </div>
                  </div>

                  <!-- Reorder Controls & Quick Restock -->
                  <div class="flex flex-wrap items-center gap-3">
                    
                    <!-- Reorder Qty Input -->
                    <div class="flex items-center gap-1.5 bg-slate-900 px-2.5 py-1 rounded-xl border border-slate-800">
                      <span class="text-[10px] text-slate-400 font-bold uppercase">Reorder Qty:</span>
                      <input 
                        #rqInput
                        type="number" 
                        min="1"
                        [value]="r.reorderQty"
                        (input)="updateItemReorderQty(r.item.id, +rqInput.value)"
                        class="w-14 px-1.5 py-0.5 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono font-bold text-center text-emerald-400 focus:outline-none"
                      />
                      <span class="text-[10px] text-slate-400 font-semibold">{{ r.item.unit }}</span>
                    </div>

                    <!-- Est Cost for Item -->
                    <span class="text-xs font-mono font-bold text-emerald-300 min-w-24 text-right">
                      Rs. {{ (r.reorderQty * r.item.purchasePrice) | number:'1.0-0' }}
                    </span>

                    <!-- 1-Click Quick Restock Item Button -->
                    <button 
                      type="button"
                      (click)="quickRestockSingleItem(r.item, r.reorderQty)"
                      title="Instantly add recommended reorder quantity to current stock"
                      class="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center gap-1 shadow-xs cursor-pointer active:scale-95 whitespace-nowrap">
                      <mat-icon class="text-xs">add_shopping_cart</mat-icon> Restock +{{ r.reorderQty }}
                    </button>

                  </div>

                </div>
              }
            </div>
          }

          <!-- Action Buttons Bar for Reorder PO & Bulk Restock -->
          @if (lowStockItems().length > 0) {
            <div class="pt-3 border-t border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-3">
              
              <p class="text-xs text-slate-300">
                Found <strong class="text-amber-300">{{ lowStockItems().length }} items</strong> requiring reorder. Total budget: <strong class="text-emerald-400">Rs. {{ totalReorderEstCost() | number:'1.0-0' }}</strong>
              </p>

              <div class="flex items-center gap-2.5 w-full sm:w-auto">
                <button 
                  type="button"
                  (click)="openReorderListModal()"
                  class="flex-1 sm:flex-initial px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-1.5">
                  <mat-icon class="text-base">receipt_long</mat-icon>
                  1-Click Reorder List (سپلائر لسٹ)
                </button>

                <button 
                  type="button"
                  (click)="bulkRestockAllLowStockItems()"
                  class="flex-1 sm:flex-initial px-4 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-md transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-1.5">
                  <mat-icon class="text-base">inventory</mat-icon>
                  Restock All (اسٹاک بڑھائیں)
                </button>
              </div>

            </div>
          }

        </div>
      }

      <!-- Main POS Grid: Product List (Left/Center) + Active Cart (Right) -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        <!-- PRODUCT LIST COLUMN (7 or 8 Cols) -->
        <div class="lg:col-span-7 xl:col-span-8 space-y-3">
          
          <!-- Active Filter & Category Banner -->
          <div class="flex items-center justify-between bg-slate-100 dark:bg-slate-800/90 px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700/80">
            <div class="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
              @if (currentCategoryMeta(); as activeCat) {
                <span class="text-base">{{ activeCat.emoji }}</span>
                <span>Category: <strong class="text-emerald-600 dark:text-emerald-400 font-black">{{ activeCat.nameEn }}</strong> ({{ activeCat.nameUr }})</span>
              } @else {
                <span class="text-base">🏷️</span>
                <span>Showing: <strong class="text-slate-900 dark:text-white font-black">All Dukan Products (تمام سامان)</strong></span>
              }
              <span class="text-slate-400 font-semibold">• {{ filteredItems().length }} items</span>
            </div>

            @if (selectedCategory() !== 'ALL' || searchQuery()) {
              <button 
                type="button"
                (click)="selectedCategory.set('ALL'); searchQuery.set('')"
                class="text-xs font-bold text-red-600 dark:text-red-400 hover:underline flex items-center gap-1 cursor-pointer">
                <mat-icon class="text-sm">close</mat-icon> Clear Filter (فلٹر ختم کریں)
              </button>
            }
          </div>

          <!-- Product Cards Grid -->
          <div class="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
            @for (item of filteredItems(); track item.id) {
              <button 
                type="button"
                (click)="openWeightOrAddToCart(item)"
                class="bg-white dark:bg-slate-900 rounded-2xl p-3 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-emerald-400 transition-all cursor-pointer group flex flex-col justify-between relative overflow-hidden active:scale-95 text-left w-full">
                
                <!-- Stock Status Indicator Badge & Category Tag -->
                <div class="flex items-center justify-between gap-1 mb-2">
                  <span class="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 dark:text-slate-300 text-slate-600 truncate">
                    {{ item.category }}
                  </span>
                  <span 
                    class="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    [ngClass]="{
                      'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300': item.stock > item.minStockAlert,
                      'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 animate-pulse': item.stock <= item.minStockAlert && item.stock > 0,
                      'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300': item.stock === 0
                    }">
                    {{ item.stock > 0 ? item.stock + ' ' + item.unit : 'Out of Stock' }}
                  </span>
                </div>

                <!-- Product Title & Urdu Name -->
                <div class="mb-3">
                  <h3 class="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm line-clamp-2 leading-tight group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                    {{ item.nameEn }}
                  </h3>
                  <p class="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5 font-sans dir-rtl">
                    {{ item.nameUr }}
                  </p>
                </div>

                <!-- Price & Unit Action Bar -->
                <div class="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <span class="text-xs text-slate-400">Price:</span>
                    <div class="text-sm sm:text-base font-extrabold text-slate-900 dark:text-slate-100">
                      Rs. {{ item.sellingPrice | number:'1.0-0' }}
                      <span class="text-[10px] font-normal text-slate-500 dark:text-slate-400">/{{ item.unit }}</span>
                    </div>
                  </div>

                  <span 
                    class="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white flex items-center justify-center transition-all shadow-xs">
                    <mat-icon class="text-base">add_shopping_cart</mat-icon>
                  </span>
                </div>

              </button>
            } @empty {
              <div class="col-span-full bg-white dark:bg-slate-900 rounded-2xl p-10 text-center border border-slate-200 dark:border-slate-800">
                <mat-icon class="text-4xl text-slate-300 dark:text-slate-600 mb-2">search_off</mat-icon>
                <h4 class="font-bold text-slate-700 dark:text-slate-200 text-base">Koi saman nahi mila (No Products Found)</h4>
                <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  @if (selectedCategory() !== 'ALL') {
                    Is category mein koi item nahi mila. Dusri category chunein ya tamam saman dekhein.
                  } @else {
                    Try searching for another term or barcode.
                  }
                </p>
                <button 
                  type="button"
                  (click)="selectedCategory.set('ALL'); searchQuery.set('')"
                  class="mt-4 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-sm">
                  <mat-icon class="text-sm">restart_alt</mat-icon> Show All Items (تمام سامان دیکھیں)
                </button>
              </div>
            }
          </div>

        </div>

        <!-- ACTIVE CART COLUMN (5 or 4 Cols) -->
        <div class="lg:col-span-5 xl:col-span-4 space-y-4">
          
          <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-md p-4 sticky top-20 flex flex-col justify-between max-h-[calc(100vh-6rem)] overflow-y-auto">
            
            <!-- Cart Header & Clear Button -->
            <div>
              <div class="flex items-center justify-between pb-3 border-b border-slate-200">
                <div class="flex items-center gap-2">
                  <div class="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                    <mat-icon class="text-base">shopping_bag</mat-icon>
                  </div>
                  <div>
                    <h2 class="font-bold text-slate-900 text-sm">Active Cart (بل)</h2>
                    <p class="text-[11px] text-slate-500">{{ storeService.cart().length }} items added</p>
                  </div>
                </div>

                @if (storeService.cart().length > 0) {
                  <button 
                    (click)="storeService.clearCart()"
                    class="text-xs text-red-600 hover:text-red-700 font-semibold flex items-center gap-1 hover:bg-red-50 px-2 py-1 rounded-lg transition-colors">
                    <mat-icon class="text-sm">delete_outline</mat-icon>
                    Clear Cart
                  </button>
                }
              </div>

              <!-- Customer Link for Udhar or Digital Receipt -->
              <div class="py-3 border-b border-slate-200">
                <span class="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Customer (گاہک لنک کریں)</span>
                  <button 
                    (click)="showAddCustomerModal.set(true)"
                    class="text-[11px] text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-0.5">
                    <mat-icon class="text-xs">add</mat-icon> New Customer
                  </button>
                </span>
                
                <select 
                  [ngModel]="storeService.selectedCustomerForCart()?.id"
                  (ngModelChange)="onSelectCustomer($event)"
                  class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none">
                  <option [value]="null">-- Walk-in Customer (نقد گاہک) --</option>
                  @for (c of storeService.customers(); track c.id) {
                    <option [value]="c.id">
                      {{ c.name }} ({{ storeService.formatDisplayPhone(c.phone) }}) - Udhar: Rs. {{ c.totalUdhar }}
                    </option>
                  }
                </select>

                @if (storeService.selectedCustomerForCart(); as selCustomer) {
                  @let limit = selCustomer.creditLimit || 10000;
                  @let isExceeded = selCustomer.totalUdhar > limit;
                  <div class="mt-2 p-2.5 rounded-xl border text-xs flex items-center justify-between font-medium"
                       [ngClass]="isExceeded ? 'bg-amber-50 border-amber-300 text-amber-950' : 'bg-emerald-50 border-emerald-200 text-emerald-900'">
                    <div>
                      <div class="flex items-center gap-1">
                        <span class="font-black">{{ selCustomer.name }}</span>
                        @if (isExceeded) {
                          <span class="px-1.5 py-0.2 rounded text-[9px] font-black bg-amber-500 text-white">⚠️ Over Limit</span>
                        }
                      </div>
                      <span class="text-[11px] text-slate-500 block font-mono">📱 {{ storeService.formatDisplayPhone(selCustomer.phone) }}</span>
                    </div>
                    <div class="text-right">
                      <span class="text-[10px] text-slate-500 block">Udhar / Limit:</span>
                      <span class="font-extrabold text-xs block" [ngClass]="isExceeded ? 'text-amber-600 font-black' : 'text-red-600'">
                        Rs. {{ selCustomer.totalUdhar | number:'1.0-0' }} / {{ limit | number:'1.0-0' }}
                      </span>
                    </div>
                  </div>
                }
              </div>

              <!-- Cart Items List -->
              <div class="py-2 space-y-2 max-h-56 overflow-y-auto pr-1 my-1">
                @for (ci of storeService.cart(); track ci.item.id) {
                  <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col gap-2 text-xs">
                    
                    <div class="flex items-start justify-between gap-2">
                      <div class="flex-1">
                        <span class="font-bold text-slate-900 block leading-tight">{{ ci.item.nameEn }}</span>
                        <span class="text-[11px] text-slate-500 font-sans block dir-rtl">{{ ci.item.nameUr }}</span>
                      </div>
                      <button 
                        (click)="storeService.removeFromCart(ci.item.id)"
                        class="text-slate-400 hover:text-red-600 transition-colors">
                        <mat-icon class="text-sm">close</mat-icon>
                      </button>
                    </div>

                    <!-- Quantity & Unit Price Controls -->
                    <div class="flex items-center justify-between gap-2 pt-1 border-t border-slate-200/60">
                      
                      <!-- Qty Counter Buttons -->
                      <div class="flex items-center border border-slate-300 rounded-lg bg-white overflow-hidden">
                        <button 
                          (click)="storeService.updateCartQty(ci.item.id, ci.qty - (ci.item.unit === 'Kg' ? 0.25 : 1))"
                          class="w-6 h-6 flex items-center justify-center text-slate-600 hover:bg-slate-100 font-bold">
                          -
                        </button>
                        <input 
                          type="number" 
                          [ngModel]="ci.qty"
                          (ngModelChange)="storeService.updateCartQty(ci.item.id, +$event)"
                          step="0.05"
                          min="0.05"
                          class="w-12 text-center text-xs font-bold focus:outline-none py-0.5"
                        />
                        <button 
                          (click)="storeService.updateCartQty(ci.item.id, ci.qty + (ci.item.unit === 'Kg' ? 0.25 : 1))"
                          class="w-6 h-6 flex items-center justify-center text-slate-600 hover:bg-slate-100 font-bold">
                          +
                        </button>
                        <button 
                          type="button"
                          (click)="openWeightOrAddToCart(ci.item)"
                          title="Open Weight Calculator Modal (وزن تبدیل کریں)"
                          class="text-[10px] bg-slate-100 hover:bg-emerald-100 dark:bg-slate-800 dark:hover:bg-emerald-950 text-slate-700 dark:text-slate-300 font-bold px-1.5 py-0.5 rounded cursor-pointer transition-colors flex items-center gap-0.5">
                          <span>{{ ci.item.unit }}</span>
                          <span class="text-[9px]">⚖️</span>
                        </button>
                      </div>

                      <!-- Subtotal Price -->
                      <div class="text-right">
                        <span class="text-[10px] text-slate-400 block">@ {{ ci.unitPrice }}/{{ ci.item.unit }}</span>
                        <span class="font-extrabold text-slate-900 text-sm">
                          Rs. {{ ci.subtotal | number:'1.0-0' }}
                        </span>
                      </div>

                    </div>

                  </div>
                } @empty {
                  <div class="py-8 text-center text-slate-400">
                    <mat-icon class="text-3xl text-slate-300">shopping_cart</mat-icon>
                    <p class="text-xs font-medium mt-1">Cart is empty</p>
                    <p class="text-[11px] text-slate-400">Click any product to add to bill</p>
                  </div>
                }
              </div>

            </div>

            <!-- Cart Summary & Payment Controls -->
            <div class="pt-3 border-t border-slate-200 space-y-3 bg-slate-50/50 p-2 rounded-xl">
              
              <!-- Subtotal & Discount Row -->
              <div class="space-y-1.5 text-xs">
                <div class="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span class="font-bold text-slate-900">Rs. {{ storeService.cartSubtotal() | number:'1.0-0' }}</span>
                </div>

                <div class="flex items-center justify-between gap-2">
                  <span class="text-slate-600 font-medium">Discount (رعایت):</span>
                  <div class="flex items-center gap-1 w-32">
                    <input 
                      type="number" 
                      [ngModel]="storeService.cartDiscount()"
                      (ngModelChange)="storeService.cartDiscount.set(+$event)"
                      placeholder="0"
                      class="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-right font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                    <select 
                      [ngModel]="storeService.cartDiscountType()"
                      (ngModelChange)="storeService.cartDiscountType.set($event)"
                      class="bg-white border border-slate-200 rounded-lg text-[10px] font-bold py-1 px-1 focus:outline-none">
                      <option value="fixed">PKR</option>
                      <option value="percent">%</option>
                    </select>
                  </div>
                </div>

                <div class="flex justify-between items-center text-base font-extrabold text-slate-900 pt-1 border-t border-slate-200">
                  <span>TOTAL BILL:</span>
                  <span class="text-emerald-700 text-lg">Rs. {{ storeService.cartTotal() | number:'1.0-0' }}</span>
                </div>
              </div>

              <!-- Payment Method Selection Pills -->
              <div>
                <span class="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Payment Method (طریقہ ادائیگی):
                </span>
                <div class="grid grid-cols-3 gap-1.5 text-[11px]">
                  
                  <button 
                    type="button"
                    (click)="selectedPaymentMethod.set('cash')"
                    class="py-2 px-1 rounded-xl font-bold border transition-all text-center cursor-pointer"
                    [ngClass]="selectedPaymentMethod() === 'cash' ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' : 'bg-white dark:bg-slate-800 dark:border-slate-700 border-slate-200 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'">
                    💵 Cash
                  </button>

                  <button 
                    type="button"
                    (click)="selectedPaymentMethod.set('easypaisa')"
                    class="py-2 px-1 rounded-xl font-bold border transition-all text-center cursor-pointer"
                    [ngClass]="selectedPaymentMethod() === 'easypaisa' ? 'bg-green-600 text-white border-green-600 shadow-sm' : 'bg-white dark:bg-slate-800 dark:border-slate-700 border-slate-200 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'">
                    📲 EasyPaisa
                  </button>

                  <button 
                    type="button"
                    (click)="selectedPaymentMethod.set('jazzcash')"
                    class="py-2 px-1 rounded-xl font-bold border transition-all text-center cursor-pointer"
                    [ngClass]="selectedPaymentMethod() === 'jazzcash' ? 'bg-red-600 text-white border-red-600 shadow-sm' : 'bg-white dark:bg-slate-800 dark:border-slate-700 border-slate-200 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'">
                    🔴 JazzCash
                  </button>

                  <button 
                    type="button"
                    (click)="selectedPaymentMethod.set('card')"
                    class="py-2 px-1 rounded-xl font-bold border transition-all text-center cursor-pointer"
                    [ngClass]="selectedPaymentMethod() === 'card' ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-white dark:bg-slate-800 dark:border-slate-700 border-slate-200 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'">
                    💳 Card
                  </button>

                  <button 
                    type="button"
                    (click)="selectedPaymentMethod.set('udhar')"
                    class="py-2 px-1 rounded-xl font-bold border transition-all text-center cursor-pointer"
                    [ngClass]="selectedPaymentMethod() === 'udhar' ? 'bg-amber-600 text-white border-amber-600 shadow-sm' : 'bg-white dark:bg-slate-800 dark:border-slate-700 border-slate-200 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'">
                    📖 Full Udhar
                  </button>

                  <button 
                    type="button"
                    (click)="selectedPaymentMethod.set('partial_udhar')"
                    class="py-2 px-1 rounded-xl font-bold border transition-all text-center cursor-pointer"
                    [ngClass]="selectedPaymentMethod() === 'partial_udhar' ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' : 'bg-white dark:bg-slate-800 dark:border-slate-700 border-slate-200 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'">
                    🤝 Partial Udhar
                  </button>

                </div>
              </div>

              <!-- Cash Received Calculator (Shown if Payment = Cash) -->
              @if (selectedPaymentMethod() === 'cash') {
                <div class="p-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                  <div class="flex items-center justify-between text-xs">
                    <span class="font-semibold text-slate-700 dark:text-slate-300">Cash Received (وصول):</span>
                    <input 
                      type="number" 
                      [ngModel]="cashReceivedInput()"
                      (ngModelChange)="cashReceivedInput.set(+$event)"
                      placeholder="0"
                      class="w-28 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-right font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <!-- Quick Currency Bill Note Buttons -->
                  <div class="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar text-[10px]">
                    <button 
                      type="button"
                      (click)="cashReceivedInput.set(storeService.cartTotal())" 
                      class="px-2 py-1 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-md font-bold text-nowrap cursor-pointer">
                      Exact
                    </button>
                    <button 
                      type="button"
                      (click)="cashReceivedInput.set(100)" 
                      class="px-2 py-1 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-md font-bold text-nowrap cursor-pointer">
                      Rs 100
                    </button>
                    <button 
                      type="button"
                      (click)="cashReceivedInput.set(500)" 
                      class="px-2 py-1 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-md font-bold text-nowrap cursor-pointer">
                      Rs 500
                    </button>
                    <button 
                      type="button"
                      (click)="cashReceivedInput.set(1000)" 
                      class="px-2 py-1 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-md font-bold text-nowrap cursor-pointer">
                      Rs 1000
                    </button>
                    <button 
                      type="button"
                      (click)="cashReceivedInput.set(5000)" 
                      class="px-2 py-1 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-md font-bold text-nowrap cursor-pointer">
                      Rs 5000
                    </button>
                  </div>

                  <!-- Cash Change Calculation -->
                  <div class="flex justify-between items-center text-xs font-bold pt-1 border-t border-slate-100 dark:border-slate-700">
                    <span class="text-slate-600 dark:text-slate-400">Change to Return (واپسی):</span>
                    <span 
                      [ngClass]="cashChange() >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'">
                      Rs. {{ cashChange() | number:'1.0-0' }}
                    </span>
                  </div>
                </div>
              }

              <!-- Partial Udhar Calculator (Shown if Payment = Partial Udhar) -->
              @if (selectedPaymentMethod() === 'partial_udhar') {
                <div class="p-2.5 bg-indigo-50/80 dark:bg-indigo-950/40 rounded-xl border border-indigo-200 dark:border-indigo-800/60 space-y-2 text-xs">
                  <div class="flex items-center justify-between">
                    <span class="font-bold text-indigo-950 dark:text-indigo-200">Cash Received Now (نقد وصولی):</span>
                    <input 
                      type="number" 
                      [ngModel]="cashReceivedInput()"
                      (ngModelChange)="cashReceivedInput.set(+$event)"
                      placeholder="0"
                      class="w-28 bg-white dark:bg-slate-900 border border-indigo-300 dark:border-indigo-700 rounded-lg px-2 py-1 text-right font-black text-indigo-950 dark:text-indigo-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div class="flex justify-between items-center font-bold pt-1 border-t border-indigo-200/80 dark:border-indigo-800/50">
                    <span class="text-indigo-900 dark:text-indigo-300">Remaining Added to Udhar Khata:</span>
                    <span class="text-amber-700 dark:text-amber-400 font-extrabold text-sm">
                      Rs. {{ (storeService.cartTotal() - cashReceivedInput()) > 0 ? (storeService.cartTotal() - cashReceivedInput()) : 0 | number:'1.0-0' }}
                    </span>
                  </div>
                </div>
              }

              <!-- CREDIT LIMIT EXCEEDED WARNING ALERT IN POS -->
              @if (storeService.selectedCustomerForCart(); as linkedCust) {
                @if (selectedPaymentMethod() === 'udhar' || selectedPaymentMethod() === 'partial_udhar') {
                  @let newUdharAmt = selectedPaymentMethod() === 'udhar' ? storeService.cartTotal() : Math.max(0, storeService.cartTotal() - cashReceivedInput());
                  @let projUdhar = linkedCust.totalUdhar + newUdharAmt;
                  @let custLimit = linkedCust.creditLimit || 10000;
                  @if (projUdhar > custLimit) {
                    <div class="p-3 bg-amber-50 dark:bg-amber-950/60 border-2 border-amber-400 dark:border-amber-700 rounded-2xl text-xs space-y-1 text-amber-950 dark:text-amber-200">
                      <div class="flex items-center gap-1.5 font-black text-amber-900 dark:text-amber-300">
                        <mat-icon class="text-base text-amber-600">warning</mat-icon>
                        <span>⚠️ Credit Limit Warning!</span>
                      </div>
                      <p class="text-[11px] font-semibold text-slate-700 dark:text-slate-300 leading-tight">
                        Customer limit is <strong>Rs. {{ custLimit | number:'1.0-0' }}</strong>. 
                        Udhar will reach <strong class="text-red-600 dark:text-red-400 font-black">Rs. {{ projUdhar | number:'1.0-0' }}</strong> 
                        (Exceeds limit by <strong class="text-amber-700 dark:text-amber-400">Rs. {{ (projUdhar - custLimit) | number:'1.0-0' }}</strong>).
                      </p>
                    </div>
                  }
                }
              }

              <!-- COMPLETE BILL & PRINT BUTTON -->
              <button 
                type="button"
                (click)="completeCheckout()"
                [disabled]="storeService.cart().length === 0 || ((selectedPaymentMethod() === 'udhar' || selectedPaymentMethod() === 'partial_udhar') && !storeService.selectedCustomerForCart())"
                class="w-full py-3.5 px-4 rounded-2xl font-black text-base text-white shadow-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                [ngClass]="(selectedPaymentMethod() === 'udhar' || selectedPaymentMethod() === 'partial_udhar') ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-900/20' : 'bg-orange-500 hover:bg-orange-600 shadow-orange-950/20'">
                <mat-icon class="text-xl">print</mat-icon>
                <span>
                  {{ (selectedPaymentMethod() === 'udhar' || selectedPaymentMethod() === 'partial_udhar') ? 'Save Udhar Bill (کھاتہ محفوظ)' : 'Complete Sale & Print Bill (روانگی)' }}
                </span>
              </button>

              @if ((selectedPaymentMethod() === 'udhar' || selectedPaymentMethod() === 'partial_udhar') && !storeService.selectedCustomerForCart()) {
                <p class="text-[11px] text-red-600 font-semibold text-center">
                  ⚠️ Please select or create a customer to link this Udhar bill.
                </p>
              }

            </div>

          </div>

        </div>

      </div>

    </div>

    <!-- CENTER SCREEN QUICK WEIGHT / QUANTITY CALCULATOR MODAL -->
    @if (itemForWeightModal(); as weightItem) {
      <div class="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in no-print">
        <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 text-slate-900 dark:text-slate-100">
          
          <!-- Modal Header -->
          <div class="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-lg shadow-xs">
                ⚖️
              </div>
              <div>
                <h3 class="font-black text-slate-900 dark:text-slate-100 text-base leading-tight">{{ weightItem.nameEn }}</h3>
                <p class="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5 font-sans dir-rtl">
                  {{ weightItem.nameUr }} • Rate: <span class="text-emerald-600 dark:text-emerald-400 font-extrabold">Rs. {{ weightItem.sellingPrice }}/{{ weightItem.unit }}</span>
                </p>
              </div>
            </div>
            <button 
              type="button"
              (click)="itemForWeightModal.set(null)" 
              class="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:text-slate-300 transition-colors cursor-pointer">
              <mat-icon class="text-base">close</mat-icon>
            </button>
          </div>

          <!-- Quick Weight Selector Buttons -->
          @if (weightItem.unit === 'Kg' || weightItem.unit === 'Grams' || weightItem.unit === 'Ltr') {
            <div>
              <span class="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5">
                Quick Weight Selector (وزن چنیں):
              </span>
              <div class="grid grid-cols-3 gap-2 text-xs font-extrabold">
                <button 
                  type="button"
                  (click)="setQuickWeight(0.25)" 
                  class="py-2.5 px-2 rounded-xl border transition-all cursor-pointer text-center"
                  [ngClass]="customWeightQty() === 0.25 ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'">
                  250g (پا)
                </button>
                <button 
                  type="button"
                  (click)="setQuickWeight(0.5)" 
                  class="py-2.5 px-2 rounded-xl border transition-all cursor-pointer text-center"
                  [ngClass]="customWeightQty() === 0.5 ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'">
                  500g (آدھا کلو)
                </button>
                <button 
                  type="button"
                  (click)="setQuickWeight(0.75)" 
                  class="py-2.5 px-2 rounded-xl border transition-all cursor-pointer text-center"
                  [ngClass]="customWeightQty() === 0.75 ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'">
                  750g (پونا کلو)
                </button>
                <button 
                  type="button"
                  (click)="setQuickWeight(1)" 
                  class="py-2.5 px-2 rounded-xl border transition-all cursor-pointer text-center"
                  [ngClass]="customWeightQty() === 1 ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'">
                  1 Kg (ایک کلو)
                </button>
                <button 
                  type="button"
                  (click)="setQuickWeight(1.5)" 
                  class="py-2.5 px-2 rounded-xl border transition-all cursor-pointer text-center"
                  [ngClass]="customWeightQty() === 1.5 ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'">
                  1.5 Kg (ڈیڑھ کلو)
                </button>
                <button 
                  type="button"
                  (click)="setQuickWeight(2)" 
                  class="py-2.5 px-2 rounded-xl border transition-all cursor-pointer text-center"
                  [ngClass]="customWeightQty() === 2 ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'">
                  2 Kg (دو کلو)
                </button>
                <button 
                  type="button"
                  (click)="setQuickWeight(2.5)" 
                  class="py-2.5 px-2 rounded-xl border transition-all cursor-pointer text-center"
                  [ngClass]="customWeightQty() === 2.5 ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'">
                  2.5 Kg (ڈھائی کلو)
                </button>
                <button 
                  type="button"
                  (click)="setQuickWeight(5)" 
                  class="py-2.5 px-2 rounded-xl border transition-all cursor-pointer text-center"
                  [ngClass]="customWeightQty() === 5 ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'">
                  5 Kg (پانچ کلو)
                </button>
                <button 
                  type="button"
                  (click)="setQuickWeight(10)" 
                  class="py-2.5 px-2 rounded-xl border transition-all cursor-pointer text-center"
                  [ngClass]="customWeightQty() === 10 ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'">
                  10 Kg (دس کلو)
                </button>
              </div>
            </div>
          }

          <!-- Dual Mode Inputs: Custom Weight OR Price Amount in PKR -->
          <div class="grid grid-cols-2 gap-3 pt-1">
            <!-- Weight Input -->
            <div>
              <span class="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                Weight ({{ weightItem.unit }}):
              </span>
              <div class="relative">
                <input 
                  type="number" 
                  [ngModel]="customWeightQty()"
                  (ngModelChange)="onWeightQtyInput(+$event)"
                  step="0.05"
                  min="0.01"
                  class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-2.5 text-base font-black text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <span class="absolute right-2 top-2.5 text-xs font-bold text-slate-400 pointer-events-none">
                  {{ weightItem.unit }}
                </span>
              </div>
            </div>

            <!-- Equivalent Amount in PKR -->
            <div>
              <span class="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                Amount (روپے):
              </span>
              <div class="relative">
                <input 
                  type="number" 
                  [ngModel]="customPkrAmount()"
                  (ngModelChange)="onPkrAmountInput(+$event)"
                  step="10"
                  min="1"
                  placeholder="e.g. 100"
                  class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-2.5 text-base font-black text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <span class="absolute right-2 top-2.5 text-xs font-bold text-slate-400 pointer-events-none">
                  Rs.
                </span>
              </div>
            </div>
          </div>

          <!-- Total Subtotal Display Banner -->
          <div class="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 text-xs flex justify-between items-center font-bold text-emerald-950 dark:text-emerald-100">
            <div>
              <span class="block text-[10px] text-emerald-700 dark:text-emerald-400 uppercase tracking-wider font-extrabold">Item Subtotal (کل رقم)</span>
              <span class="text-xs text-slate-600 dark:text-slate-300 font-medium">
                {{ customWeightQty() }} {{ weightItem.unit }} × Rs. {{ weightItem.sellingPrice }}
              </span>
            </div>
            <span class="text-xl font-black text-emerald-700 dark:text-emerald-300">
              Rs. {{ (customWeightQty() * weightItem.sellingPrice) | number:'1.0-0' }}
            </span>
          </div>

          <!-- Confirm Add Button -->
          <button 
            type="button"
            (click)="confirmWeightModalAdd()"
            [disabled]="customWeightQty() <= 0"
            class="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-2xl shadow-lg shadow-emerald-950/20 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50">
            <mat-icon class="text-lg">add_shopping_cart</mat-icon>
            <span>Confirm & Add to Bill (بل میں شامل کریں)</span>
          </button>

        </div>
      </div>
    }

    <!-- NEW CUSTOMER QUICK ADD MODAL -->
    @if (showAddCustomerModal()) {
      <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
        <div class="bg-white rounded-2xl p-5 max-w-sm w-full shadow-2xl space-y-4">
          <div class="flex items-center justify-between border-b border-slate-200 pb-3">
            <h3 class="font-bold text-slate-900 text-sm">Add New Customer (نیا گاہک)</h3>
            <button (click)="showAddCustomerModal.set(false)" class="text-slate-400 hover:text-slate-600">
              <mat-icon class="text-sm">close</mat-icon>
            </button>
          </div>

          <div class="space-y-3 text-xs">
            <div>
              <span class="block font-bold text-slate-700 mb-1">Customer Name *</span>
              <input 
                type="text" 
                [(ngModel)]="newCustName"
                placeholder="e.g. Chaudhry Rashid Sahib"
                class="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <span class="block font-bold text-slate-700 mb-1">Mobile / WhatsApp Number *</span>
              <input 
                type="text" 
                [(ngModel)]="newCustPhone"
                placeholder="e.g. 03001234567"
                class="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <span class="block font-bold text-slate-700 mb-1">Address / Street Area</span>
              <input 
                type="text" 
                [(ngModel)]="newCustAddress"
                placeholder="e.g. Gali No 4, House 12"
                class="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <button 
            (click)="saveNewCustomer()"
            [disabled]="!newCustName || !newCustPhone"
            class="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition-colors">
            Save Customer & Link to Bill
          </button>
        </div>
      </div>
    }

    <!-- 1-CLICK REORDER LIST MODAL -->
    @if (showReorderListModal()) {
      <div class="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
        <div class="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-scale-up">
          
          <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div class="flex items-center gap-2.5">
              <div class="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                <mat-icon class="text-xl">receipt_long</mat-icon>
              </div>
              <div>
                <h3 class="font-extrabold text-base text-slate-900 dark:text-slate-100">SUPPLIER REORDER PURCHASE LIST</h3>
                <p class="text-xs text-slate-500 dark:text-slate-400 font-semibold">سپلائر کو بھیجنے والی سامان خرید لسٹ</p>
              </div>
            </div>
            <button 
              (click)="closeReorderListModal()" 
              class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">
              <mat-icon>close</mat-icon>
            </button>
          </div>

          <!-- Live Text Preview Card -->
          <div class="p-4 rounded-2xl bg-slate-950 text-emerald-300 font-mono text-xs leading-relaxed max-h-72 overflow-y-auto border border-slate-800 shadow-inner selection:bg-emerald-800">
            <pre class="whitespace-pre-wrap font-mono text-xs">{{ reorderTextContent() }}</pre>
          </div>

          <!-- Action Toolbar (WhatsApp Share, Copy, Print, Bulk Restock) -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
            
            <button 
              type="button"
              (click)="shareReorderListWhatsApp()"
              class="py-3 px-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-950/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 whitespace-nowrap">
              <mat-icon class="text-base">send</mat-icon>
              WhatsApp Share
            </button>

            <button 
              type="button"
              (click)="copyReorderListToClipboard()"
              class="py-3 px-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md shadow-indigo-950/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 whitespace-nowrap">
              <mat-icon class="text-base">{{ copiedSuccessBadge() ? 'check' : 'content_copy' }}</mat-icon>
              <span>{{ copiedSuccessBadge() ? 'Copied!' : 'Copy Text' }}</span>
            </button>

            <button 
              type="button"
              (click)="printReorderList()"
              class="py-3 px-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-xs shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 whitespace-nowrap">
              <mat-icon class="text-base">print</mat-icon>
              Print PO
            </button>

            <button 
              type="button"
              (click)="bulkRestockAllLowStockItems(); closeReorderListModal()"
              class="py-3 px-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 whitespace-nowrap">
              <mat-icon class="text-base">inventory</mat-icon>
              Restock All
            </button>

          </div>

        </div>
      </div>
    }

    <!-- COMPLETED RECEIPT MODAL -->
    <app-receipt-modal 
      [transaction]="lastCompletedTransaction()"
      (closeModal)="lastCompletedTransaction.set(null)">
    </app-receipt-modal>
  `
})
export class PosTerminalComponent implements OnDestroy {
  storeService = inject(StoreService);
  Math = Math;

  @ViewChild('searchInput') searchInputRef!: ElementRef<HTMLInputElement>;

  categoryList = CATEGORY_LIST;
  categories: ItemCategory[] = [
    'Atta & Daalen',
    'Chawal',
    'Ghee & Oil',
    'Cheeni & Chai',
    'Masalay',
    'Dairy',
    'Snacks & Beverages',
    'Cleaning',
    'Misc'
  ];

  searchQuery = signal<string>('');
  selectedCategory = signal<string>('ALL');
  selectedPaymentMethod = signal<PaymentMethod>('cash');
  cashReceivedInput = signal<number>(0);

  // Total inventory count
  totalInventoryCount = computed(() => this.storeService.inventory().length);

  // Category items count map
  categoryCountMap = computed(() => {
    const map: Record<string, number> = {};
    for (const item of this.storeService.inventory()) {
      map[item.category] = (map[item.category] || 0) + 1;
    }
    return map;
  });

  // Current active category metadata
  currentCategoryMeta = computed(() => {
    const sel = this.selectedCategory();
    if (sel === 'ALL') return null;
    return CATEGORY_LIST.find(c => c.key === sel) || null;
  });

  // Barcode Camera Scanner state
  isScannerActive = signal<boolean>(false);
  scannerStatusText = signal<string>('Ready to scan. Point camera at product barcode.');
  lastScannedMessage = signal<{ name: string; price: number } | null>(null);
  scannerError = signal<string>('');

  private html5QrcodeScanner: Html5Qrcode | null = null;
  private scanCooldown = false;

  // Modals state
  itemForWeightModal = signal<InventoryItem | null>(null);
  customWeightQty = signal<number>(1);
  customPkrAmount = signal<number>(0);

  showAddCustomerModal = signal<boolean>(false);
  newCustName = '';
  newCustPhone = '';
  newCustAddress = '';

  lastCompletedTransaction = signal<Transaction | null>(null);

  // Low Stock Dashboard Widget & Reorder List state
  showLowStockWidget = signal<boolean>(false);
  lowStockThresholdOverride = signal<number | null>(null);
  showReorderListModal = signal<boolean>(false);
  customReorderQtys = signal<Record<string, number>>({});
  copiedSuccessBadge = signal<boolean>(false);

  lowStockItems = computed(() => {
    const customThresh = this.lowStockThresholdOverride();
    return this.storeService.inventory().filter(item => {
      const threshold = customThresh !== null ? customThresh : item.minStockAlert;
      return item.stock <= threshold;
    });
  });

  outOfStockCount = computed(() => {
    return this.lowStockItems().filter(i => i.stock === 0).length;
  });

  criticalStockCount = computed(() => {
    return this.lowStockItems().filter(i => i.stock > 0).length;
  });

  reorderListItems = computed(() => {
    const customQtys = this.customReorderQtys();
    const customThresh = this.lowStockThresholdOverride();
    return this.lowStockItems().map(item => {
      const thresh = customThresh !== null ? customThresh : item.minStockAlert;
      const defaultReorder = Math.max(10, Math.ceil((thresh * 2) - item.stock));
      const reorderQty = customQtys[item.id] !== undefined ? customQtys[item.id] : defaultReorder;
      return {
        item,
        reorderQty
      };
    });
  });

  totalReorderEstCost = computed(() => {
    return this.reorderListItems().reduce((sum, r) => sum + (r.reorderQty * r.item.purchasePrice), 0);
  });

  reorderTextContent = computed(() => {
    return this.storeService.getFormattedReorderListText(this.reorderListItems());
  });

  // Filtered inventory computed
  filteredItems = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const cat = this.selectedCategory();
    
    return this.storeService.inventory().filter(item => {
      const matchCat = cat === 'ALL' || item.category === cat;
      const matchQuery = !query || 
        item.nameEn.toLowerCase().includes(query) ||
        item.nameUr.includes(query) ||
        item.barcode.includes(query);

      return matchCat && matchQuery;
    });
  });

  cashChange = computed(() => {
    const recv = this.cashReceivedInput();
    const tot = this.storeService.cartTotal();
    return recv - tot;
  });

  @HostListener('window:keydown', ['$event'])
  handleKeyboardShortcuts(event: KeyboardEvent) {
    if (event.key === 'F2') {
      event.preventDefault();
      this.searchInputRef?.nativeElement?.focus();
    } else if (event.key === 'Escape') {
      this.clearSearch();
    }
  }

  onSearchChange(val: string) {
    this.searchQuery.set(val);
    
    // Auto-scan barcode check
    if (val.length >= 8) {
      const exactMatch = this.storeService.inventory().find(i => i.barcode === val.trim());
      if (exactMatch) {
        this.openWeightOrAddToCart(exactMatch);
        this.searchQuery.set('');
      }
    }
  }

  clearSearch() {
    this.searchQuery.set('');
  }

  openWeightOrAddToCart(item: InventoryItem) {
    const isWeightItem = item.unit === 'Kg' || item.unit === 'Grams' || item.unit === 'Ltr' || item.unit === 'Dozen';
    if (isWeightItem) {
      const existingInCart = this.storeService.cart().find(c => c.item.id === item.id);
      const initialQty = existingInCart ? existingInCart.qty : 1;
      this.itemForWeightModal.set(item);
      this.customWeightQty.set(initialQty);
      this.customPkrAmount.set(Math.round(initialQty * item.sellingPrice));
    } else {
      this.storeService.addToCart(item, 1);
    }
  }

  setQuickWeight(qty: number) {
    const item = this.itemForWeightModal();
    this.customWeightQty.set(qty);
    if (item) {
      this.customPkrAmount.set(Math.round(qty * item.sellingPrice));
    }
  }

  onWeightQtyInput(val: number) {
    const qty = val > 0 ? val : 0;
    this.customWeightQty.set(qty);
    const item = this.itemForWeightModal();
    if (item) {
      this.customPkrAmount.set(Math.round(qty * item.sellingPrice));
    }
  }

  onPkrAmountInput(val: number) {
    const pkr = val > 0 ? val : 0;
    this.customPkrAmount.set(pkr);
    const item = this.itemForWeightModal();
    if (item && item.sellingPrice > 0) {
      const qty = parseFloat((pkr / item.sellingPrice).toFixed(3));
      this.customWeightQty.set(qty);
    }
  }

  confirmWeightModalAdd() {
    const item = this.itemForWeightModal();
    if (item && this.customWeightQty() > 0) {
      const existing = this.storeService.cart().find(c => c.item.id === item.id);
      if (existing) {
        this.storeService.updateCartQty(item.id, this.customWeightQty());
      } else {
        this.storeService.addToCart(item, this.customWeightQty());
      }
      this.itemForWeightModal.set(null);
    }
  }

  onSelectCustomer(custId: string) {
    if (!custId || custId === 'null') {
      this.storeService.selectedCustomerForCart.set(null);
    } else {
      const c = this.storeService.customers().find(cust => cust.id === custId);
      if (c) {
        this.storeService.selectedCustomerForCart.set(c);
      }
    }
  }

  saveNewCustomer() {
    if (!this.newCustName || !this.newCustPhone) return;
    
    const created = this.storeService.addCustomer({
      name: this.newCustName,
      phone: this.newCustPhone,
      address: this.newCustAddress
    });

    this.storeService.selectedCustomerForCart.set(created);
    this.showAddCustomerModal.set(false);
    this.newCustName = '';
    this.newCustPhone = '';
    this.newCustAddress = '';
  }

  completeCheckout() {
    try {
      const tx = this.storeService.checkout(
        this.selectedPaymentMethod(),
        this.cashReceivedInput(),
        'POS Checkout'
      );
      this.lastCompletedTransaction.set(tx);
      this.cashReceivedInput.set(0);

      // 1-Click WhatsApp Bill Share: Immediately after checkout, open wa.me deep-link if phone exists
      if (tx.customerPhone) {
        const msg = this.storeService.getFormattedInvoiceReceiptText(tx);
        const waUrl = this.storeService.generateWhatsAppUrl(tx.customerPhone, msg);
        window.open(waUrl, '_blank');
      }
    } catch (err: unknown) {
      alert((err as Error).message || 'Failed to complete transaction');
    }
  }

  // Camera Barcode Scanner Controls
  async toggleScanner() {
    if (this.isScannerActive()) {
      await this.stopScanner();
    } else {
      this.isScannerActive.set(true);
      this.scannerError.set('');
      this.scannerStatusText.set('Initializing camera feed...');
      setTimeout(() => {
        this.startScanner();
      }, 350);
    }
  }

  async startScanner() {
    try {
      const { Html5Qrcode } = await import('html5-qrcode');

      if (!this.html5QrcodeScanner) {
        this.html5QrcodeScanner = new Html5Qrcode("pos-barcode-scanner-viewport");
      }

      const config = { 
        fps: 15, 
        qrbox: { width: 260, height: 140 },
        aspectRatio: 1.777778
      };

      await this.html5QrcodeScanner.start(
        { facingMode: "environment" },
        config,
        (decodedText: string) => {
          this.handleBarcodeScanned(decodedText);
        },
        () => {
          // Continuous frame scan attempt - ignore no barcode detected
        }
      );

      this.scannerStatusText.set('Camera scanner active. Place barcode inside scanning frame.');
    } catch (err: unknown) {
      console.error("Camera barcode scanner error:", err);
      this.scannerError.set("Could not open camera. Please ensure camera permissions are granted in your browser.");
      this.scannerStatusText.set("Camera access failed.");
    }
  }

  async stopScanner() {
    if (this.html5QrcodeScanner) {
      try {
        await this.html5QrcodeScanner.stop();
        this.html5QrcodeScanner.clear();
      } catch (e) {
        console.warn("Scanner stop exception:", e);
      }
      this.html5QrcodeScanner = null;
    }
    this.isScannerActive.set(false);
  }

  handleBarcodeScanned(barcodeText: string) {
    if (this.scanCooldown) return;

    const code = barcodeText.trim();
    if (!code) return;

    // Search inventory by barcode
    const matchedItem = this.storeService.inventory().find(i => i.barcode === code);

    if (matchedItem) {
      this.scanCooldown = true;
      this.playBeepSound();

      this.openWeightOrAddToCart(matchedItem);

      this.lastScannedMessage.set({
        name: matchedItem.nameEn,
        price: matchedItem.sellingPrice
      });
      this.scannerStatusText.set(`✅ Scanned: ${matchedItem.nameEn} (Rs. ${matchedItem.sellingPrice})`);

      setTimeout(() => {
        this.lastScannedMessage.set(null);
      }, 3000);

      // Cooldown buffer to prevent duplicate rapid scans
      setTimeout(() => {
        this.scanCooldown = false;
      }, 1200);

    } else {
      this.scanCooldown = true;
      this.scannerError.set(`Barcode "${code}" not found in inventory catalog.`);
      
      setTimeout(() => {
        this.scannerError.set('');
        this.scanCooldown = false;
      }, 2500);
    }
  }

  processManualBarcode(code: string) {
    if (code) {
      this.handleBarcodeScanned(code);
    }
  }

  playBeepSound() {
    try {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioCtx = new AudioCtxClass();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1800, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
    } catch {
      // Web Audio API context fallback
    }
  }

  // Low Stock Widget & Reorder Actions
  toggleLowStockWidget() {
    this.showLowStockWidget.update(v => !v);
  }

  openReorderListModal() {
    this.showReorderListModal.set(true);
  }

  closeReorderListModal() {
    this.showReorderListModal.set(false);
  }

  setThresholdOverride(val: number | null) {
    this.lowStockThresholdOverride.set(val);
  }

  updateItemReorderQty(itemId: string, qty: number) {
    const current = { ...this.customReorderQtys() };
    if (qty > 0) {
      current[itemId] = qty;
    } else {
      delete current[itemId];
    }
    this.customReorderQtys.set(current);
  }

  quickRestockSingleItem(item: InventoryItem, qty: number) {
    this.storeService.adjustStock(item.id, qty);
  }

  bulkRestockAllLowStockItems() {
    const itemsToRestock = this.reorderListItems().map(r => ({
      itemId: r.item.id,
      addQty: r.reorderQty
    }));

    if (itemsToRestock.length === 0) return;

    this.storeService.bulkRestockItems(itemsToRestock);
    alert(`Successfully restocked ${itemsToRestock.length} low stock items! Inventory updated.`);
  }

  shareReorderListWhatsApp() {
    const text = this.reorderTextContent();
    const waUrl = this.storeService.generateWhatsAppUrl('', text);
    window.open(waUrl, '_blank');
  }

  copyReorderListToClipboard() {
    const text = this.reorderTextContent();
    navigator.clipboard.writeText(text).then(() => {
      this.copiedSuccessBadge.set(true);
      setTimeout(() => this.copiedSuccessBadge.set(false), 2500);
    }).catch(() => {
      alert('Copied to clipboard');
    });
  }

  printReorderList() {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const cfg = this.storeService.config();
    const dateStr = new Date().toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' });

    let html = `
      <html>
        <head>
          <title>Supplier Reorder PO - ${cfg.storeName}</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; padding: 24px; color: #0f172a; line-height: 1.5; }
            h2 { margin: 0 0 4px 0; font-size: 20px; text-transform: uppercase; color: #0284c7; }
            .meta { font-size: 13px; color: #475569; margin-bottom: 20px; border-bottom: 2px solid #e2e8f0; pb: 12px; }
            table { width: 100%; border-collapse: collapse; margin-top: 12px; }
            th, td { border: 1px solid #cbd5e1; padding: 10px 12px; text-align: left; font-size: 13px; }
            th { background: #f8fafc; font-weight: bold; color: #334155; }
            .total { font-weight: 800; font-size: 15px; margin-top: 20px; text-align: right; color: #0f172a; padding: 12px; background: #f1f5f9; border-radius: 8px; }
          </style>
        </head>
        <body>
          <h2>${cfg.storeName} - SUPPLIER REORDER PURCHASE ORDER</h2>
          <div class="meta">Date: ${dateStr} | Owner: ${cfg.ownerName} | Phone: ${cfg.phone}</div>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Item Name</th>
                <th>Urdu Name</th>
                <th>Current Stock</th>
                <th>Reorder Qty</th>
                <th>Est. Unit Price</th>
                <th>Est. Total</th>
              </tr>
            </thead>
            <tbody>
    `;

    this.reorderListItems().forEach((r, idx) => {
      html += `
        <tr>
          <td>${idx + 1}</td>
          <td><strong>${r.item.nameEn}</strong></td>
          <td>${r.item.nameUr}</td>
          <td>${r.item.stock} ${r.item.unit}</td>
          <td><strong>${r.reorderQty} ${r.item.unit}</strong></td>
          <td>Rs. ${r.item.purchasePrice.toLocaleString('en-PK')}</td>
          <td>Rs. ${(r.reorderQty * r.item.purchasePrice).toLocaleString('en-PK')}</td>
        </tr>
      `;
    });

    html += `
            </tbody>
          </table>
          <div class="total">TOTAL ESTIMATED PURCHASE VALUE: Rs. ${this.totalReorderEstCost().toLocaleString('en-PK')}</div>
          <script>window.onload = function() { window.print(); window.close(); }</script>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  }

  ngOnDestroy() {
    this.stopScanner();
  }
}
