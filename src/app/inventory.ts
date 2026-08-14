import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { StoreService } from '../services/store.service';
import { InventoryItem, ItemCategory, ItemUnit, CATEGORY_LIST } from '../models/store.models';
import JsBarcode from 'jsbarcode';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      <!-- Top View Switcher Tabs -->
      <div class="bg-white dark:bg-slate-900 rounded-2xl p-2 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between gap-2">
        <div class="flex items-center gap-2">
          <button 
            type="button"
            (click)="activeViewMode.set('catalog')"
            class="px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer"
            [ngClass]="activeViewMode() === 'catalog' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800'">
            <mat-icon class="text-base">inventory_2</mat-icon>
            Stock Catalog (اسٹاک فہرست)
          </button>

          <button 
            type="button"
            (click)="switchToBulkEditor()"
            class="px-4 py-2.5 rounded-xl font-black text-xs flex items-center gap-2 transition-all cursor-pointer relative"
            [ngClass]="activeViewMode() === 'bulk' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/20' : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 border border-emerald-200/80'">
            <mat-icon class="text-base">price_change</mat-icon>

            <span>DAILY BULK RATE EDITOR (روزانہ ریٹ ایڈیٹر)</span>
            <span class="px-1.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wide bg-amber-400 text-slate-950">
              FAST ⚡
            </span>
          </button>
        </div>

        @if (activeViewMode() === 'catalog') {
          <button 
            (click)="openAddModal()"
            class="px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black text-xs shadow-md shadow-orange-950/20 flex items-center gap-1.5 transition-all cursor-pointer active:scale-95">
            <mat-icon class="text-base">add_box</mat-icon>
            <span>Naya Saman Shamil Karein (نیا آئٹم)</span>
          </button>
        }
      </div>

      <!-- VIEW MODE 1: STOCK CATALOG & OVERVIEW -->
      @if (activeViewMode() === 'catalog') {
        
        <!-- Top Metrics Overview Bar -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          
          <div class="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 flex items-center justify-center font-bold">
              <mat-icon class="text-xl">inventory_2</mat-icon>
            </div>
            <div>
              <span class="text-xs text-slate-500 font-medium">Total Products</span>
              <div class="text-lg font-extrabold text-slate-900 dark:text-slate-100">{{ storeService.inventory().length }} items</div>
            </div>
          </div>

          <button 
            type="button"
            (click)="showLowStockOnly.set(!showLowStockOnly())"
            class="bg-white dark:bg-slate-900 rounded-2xl p-4 border shadow-xs flex items-center gap-3 cursor-pointer transition-all text-left w-full"
            [ngClass]="showLowStockOnly() ? 'border-red-500 ring-2 ring-red-500/20 bg-red-50/30' : 'border-slate-200/80 dark:border-slate-800'">
            <div class="w-10 h-10 rounded-xl bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 flex items-center justify-center font-bold">
              <mat-icon class="text-xl animate-pulse">warning</mat-icon>
            </div>
            <div>
              <span class="text-xs text-slate-500 font-medium">Low Stock Alerts</span>
              <div class="text-lg font-extrabold text-red-700 dark:text-red-400">
                {{ storeService.lowStockItemsCount() }} items
              </div>
            </div>
          </button>

          <div class="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 flex items-center justify-center font-bold">
              <mat-icon class="text-xl">account_balance</mat-icon>
            </div>
            <div>
              <span class="text-xs text-slate-500 font-medium">Stock Value (Cost)</span>
              <div class="text-lg font-extrabold text-slate-900 dark:text-slate-100">
                Rs. {{ totalStockValuation() | number:'1.0-0' }}
              </div>
            </div>
          </div>

          <div class="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300 flex items-center justify-center font-bold">
              <mat-icon class="text-xl">trending_up</mat-icon>
            </div>
            <div>
              <span class="text-xs text-slate-500 font-medium">Potential Sales Value</span>
              <div class="text-lg font-extrabold text-emerald-700 dark:text-emerald-400">
                Rs. {{ totalPotentialSalesValue() | number:'1.0-0' }}
              </div>
            </div>
          </div>

        </div>

        <!-- Controls & Filter Header -->
        <div class="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
          
          <!-- Search & Filter Controls -->
          <div class="flex flex-col sm:flex-row items-center gap-3 w-full">
            
            <div class="relative flex-1 w-full">
              <mat-icon class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">search</mat-icon>
              <input 
                type="text" 
                [ngModel]="searchQuery()"
                (ngModelChange)="searchQuery.set($event)"
                placeholder="Search stock by name, Urdu (آٹا، گھی، دال) or barcode..." 
                class="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <!-- Low Stock Toggle Button -->
            <button 
              type="button"
              (click)="showLowStockOnly.set(!showLowStockOnly())"
              class="w-full sm:w-auto px-3.5 py-2.5 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 cursor-pointer text-nowrap"
              [ngClass]="showLowStockOnly() ? 'bg-red-600 text-white border-red-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200'">
              <mat-icon class="text-sm">filter_alt</mat-icon>
              Low Stock Only (کم اسٹاک)
            </button>

            <!-- Generate & Print Barcodes Batch Button -->
            <button 
              type="button"
              (click)="openBarcodeModalForBatch()"
              class="w-full sm:w-auto px-3.5 py-2.5 rounded-xl text-xs font-black bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer text-nowrap">
              <mat-icon class="text-base">qr_code_2</mat-icon>
              <span>Print Barcode Labels (بارکوڈ لیبلز)</span>
            </button>

          </div>

          <!-- Dukan Category Tabs -->
          <div class="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth">
            <button 
              type="button"
              (click)="selectedCategory.set('ALL')"
              class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all text-nowrap flex items-center gap-1.5 border cursor-pointer shrink-0"
              [ngClass]="selectedCategory() === 'ALL' ? 'bg-slate-900 text-white border-slate-900 shadow-xs' : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'">
              <span>🏷️ All Items (تمام)</span>
              <span class="text-[10px] opacity-75 font-mono">({{ storeService.inventory().length }})</span>
            </button>
            @for (cat of categoryList; track cat.key) {
              <button 
                type="button"
                (click)="selectedCategory.set(cat.key)"
                class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all text-nowrap flex items-center gap-1.5 border cursor-pointer shrink-0"
                [ngClass]="selectedCategory() === cat.key ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs scale-[1.02]' : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'">
                <span>{{ cat.emoji }}</span>
                <span>{{ cat.nameEn }}</span>
                <span class="text-[10px] font-sans opacity-85">({{ cat.nameUr }})</span>
                <span class="text-[10px] font-black px-1.5 py-0.2 rounded-full"
                  [ngClass]="selectedCategory() === cat.key ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'">
                  {{ categoryCountMap()[cat.key] || 0 }}
                </span>
              </button>
            }
          </div>

        </div>

        <!-- Inventory Data Table -->
        <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead class="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold uppercase text-[10px]">
                <tr>
                  <th class="py-3 px-4">Item Name (نام)</th>
                  <th class="py-3 px-4">Category</th>
                  <th class="py-3 px-4">Cost Price</th>
                  <th class="py-3 px-4">Selling Price</th>
                  <th class="py-3 px-4">Profit / Unit</th>
                  <th class="py-3 px-4">Available Stock</th>
                  <th class="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-800 dark:text-slate-200">
                @for (item of filteredInventory(); track item.id) {
                  <tr class="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    
                    <td class="py-3 px-4">
                      <div class="font-bold text-slate-900 dark:text-slate-100 text-sm">{{ item.nameEn }}</div>
                      <div class="text-slate-500 dark:text-slate-400 font-sans text-xs dir-rtl">{{ item.nameUr }}</div>
                      <div class="text-[10px] text-slate-400 font-mono mt-0.5">Barcode: {{ item.barcode }}</div>
                    </td>

                    <td class="py-3 px-4">
                      <span class="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-[10px]">
                        {{ item.category }}
                      </span>
                    </td>

                    <td class="py-3 px-4 font-bold text-slate-700 dark:text-slate-300">
                      Rs. {{ item.purchasePrice | number:'1.0-0' }}
                    </td>

                    <td class="py-3 px-4 font-extrabold text-slate-900 dark:text-slate-100">
                      Rs. {{ item.sellingPrice | number:'1.0-0' }}
                      <span class="text-[10px] text-slate-400 font-normal">/{{ item.unit }}</span>
                    </td>

                    <td class="py-3 px-4 font-bold text-emerald-700 dark:text-emerald-400">
                      Rs. {{ (item.sellingPrice - item.purchasePrice) | number:'1.0-0' }}
                      <span class="text-[10px] font-normal text-emerald-600 dark:text-emerald-500 block">
                        ({{ (((item.sellingPrice - item.purchasePrice) / item.purchasePrice) * 100) | number:'1.0-0' }}%)
                      </span>
                    </td>

                    <td class="py-3 px-4">
                      <div class="flex items-center gap-2">
                        <span 
                          class="px-2.5 py-1 rounded-full font-bold text-xs"
                          [ngClass]="{
                            'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300': item.stock > item.minStockAlert,
                            'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 animate-pulse': item.stock <= item.minStockAlert && item.stock > 0,
                            'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300': item.stock === 0
                          }">
                          {{ item.stock }} {{ item.unit }}
                        </span>

                        <!-- Quick Adjust Stock Button -->
                        <button 
                          (click)="openStockAdjustModal(item)"
                          class="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-nowrap text-[10px] font-bold flex items-center gap-0.5">
                          <mat-icon class="text-xs">tune</mat-icon> Adjust
                        </button>
                      </div>
                    </td>

                    <td class="py-3 px-4 text-right">
                      <div class="flex items-center justify-end gap-1">
                        <button 
                          type="button"
                          (click)="openBarcodeModalForSingle(item)"
                          title="Generate & Print Barcode Label (لیبل پرنٹ)"
                          class="p-1.5 rounded-lg text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors cursor-pointer">
                          <mat-icon class="text-base">qr_code_2</mat-icon>
                        </button>
                        <button 
                          type="button"
                          (click)="openEditModal(item)"
                          class="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors cursor-pointer">
                          <mat-icon class="text-base">edit</mat-icon>
                        </button>
                        <button 
                          type="button"
                          (click)="deleteItem(item.id)"
                          class="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer">
                          <mat-icon class="text-base">delete</mat-icon>
                        </button>
                      </div>
                    </td>

                  </tr>
                } @empty {
                  <tr>
                    <td colspan="7" class="py-10 text-center text-slate-400">
                      <mat-icon class="text-3xl mb-1">find_in_page</mat-icon>
                      <p class="font-bold text-sm text-slate-600 dark:text-slate-400">No stock items match filter</p>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>

      }

      <!-- VIEW MODE 2: DAILY BULK RATE EDITOR -->
      @if (activeViewMode() === 'bulk') {
        <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-6 shadow-sm space-y-6">
          
          <!-- Bulk Editor Header Info & Controls -->
          <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <div class="flex items-center gap-2">
                <div class="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <mat-icon class="text-lg">flash_on</mat-icon>
                </div>
                <h2 class="font-black text-slate-900 dark:text-slate-100 text-lg">
                  Daily Bulk Rate Editor (روزانہ ریٹ ایڈیٹر)
                </h2>
              </div>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Edit prices for all Rashan items line-by-line in seconds. Click save to instantly update POS & store prices.
              </p>
            </div>

            <!-- Quick Save Action -->
            <button 
              (click)="saveBulkRates()"
              class="w-full md:w-auto px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black text-sm shadow-md shadow-orange-950/20 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95">
              <mat-icon class="text-lg">done_all</mat-icon>
              <span>1-Click Rates Update (تمام ریٹ محفوظ کریں)</span>
            </button>
          </div>

          <!-- Quick Bulk Actions & Search Filter Bar -->
          <div class="flex flex-col md:flex-row items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl">
            
            <div class="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
              <div class="relative w-full sm:w-64">
                <mat-icon class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</mat-icon>
                <input 
                  type="text" 
                  [ngModel]="bulkSearchQuery()"
                  (ngModelChange)="bulkSearchQuery.set($event)"
                  placeholder="Filter items to edit rates..." 
                  class="w-full pl-9 pr-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <select 
                [ngModel]="bulkCategoryFilter()"
                (ngModelChange)="bulkCategoryFilter.set($event)"
                class="w-full sm:w-auto bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs font-semibold">
                <option value="ALL">All Categories</option>
                @for (cat of categories; track cat) {
                  <option [value]="cat">{{ cat }}</option>
                }
              </select>
            </div>

            <!-- Quick Adjust Bumpers -->
            <div class="flex items-center gap-2 w-full md:w-auto overflow-x-auto text-xs font-bold text-slate-600 dark:text-slate-300">
              <span class="text-[10px] uppercase text-slate-400">Quick Bumper:</span>
              <button 
                (click)="applyMassAdjustment(5)"
                class="px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-200 transition-colors">
                +Rs 5
              </button>
              <button 
                (click)="applyMassAdjustment(10)"
                class="px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-200 transition-colors">
                +Rs 10
              </button>
              <button 
                (click)="applyMassAdjustment(-5)"
                class="px-2.5 py-1 rounded-lg bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300 hover:bg-red-200 transition-colors">
                -Rs 5
              </button>
              <button 
                (click)="resetBulkEdits()"
                class="px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 transition-colors">
                Reset
              </button>
            </div>

          </div>

          <!-- Bulk Rates Input Table -->
          <div class="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
            <table class="w-full text-left text-xs">
              <thead class="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-extrabold uppercase text-[10px]">
                <tr>
                  <th class="py-3 px-4">Item Name (نام)</th>
                  <th class="py-3 px-4">Unit</th>
                  <th class="py-3 px-4">Cost Price (خرید PKR)</th>
                  <th class="py-3 px-4">Selling Price (فروخت PKR)</th>
                  <th class="py-3 px-4">Profit Margin</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                @for (item of filteredBulkItems(); track item.id) {
                  @let editState = bulkEditsMap.get(item.id);
                  @if (editState) {
                    <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      
                      <td class="py-2.5 px-4">
                        <div class="font-bold text-slate-900 dark:text-slate-100 text-sm">{{ item.nameEn }}</div>
                        <div class="text-xs text-slate-500 dark:text-slate-400 font-sans dir-rtl">{{ item.nameUr }}</div>
                      </td>

                      <td class="py-2.5 px-4 font-semibold text-slate-600 dark:text-slate-400">
                        {{ item.unit }}
                      </td>

                      <!-- Cost Price Input -->
                      <td class="py-2.5 px-4">
                        <div class="flex items-center gap-1">
                          <span class="text-slate-400 font-medium">Rs.</span>
                          <input 
                            type="number" 
                            [(ngModel)]="editState.purchasePrice"
                            min="0"
                            class="w-24 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 font-bold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                          />
                        </div>
                      </td>

                      <!-- Selling Price Input -->
                      <td class="py-2.5 px-4">
                        <div class="flex items-center gap-1">
                          <span class="text-emerald-600 font-extrabold">Rs.</span>
                          <input 
                            type="number" 
                            [(ngModel)]="editState.sellingPrice"
                            min="0"
                            class="w-28 bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 rounded-lg p-2 font-black text-emerald-900 dark:text-emerald-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                          />
                        </div>
                      </td>

                      <!-- Dynamic Profit & Margin -->
                      <td class="py-2.5 px-4 font-bold text-slate-700 dark:text-slate-300">
                        @let profit = editState.sellingPrice - editState.purchasePrice;
                        @let margin = editState.purchasePrice > 0 ? ((profit / editState.purchasePrice) * 100) : 0;
                        <span [ngClass]="profit >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-600'">
                          Rs. {{ profit | number:'1.0-0' }}
                          <span class="text-[10px] font-normal block">({{ margin | number:'1.0-0' }}%)</span>
                        </span>
                      </td>

                    </tr>
                  }
                }
              </tbody>
            </table>
          </div>

          <!-- Bottom Save Action Bar -->
          <div class="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
            <button 
              (click)="saveBulkRates()"
              class="px-8 py-3.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black text-sm shadow-lg shadow-orange-950/20 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95">
              <mat-icon class="text-xl">done_all</mat-icon>
              <span>1-Click Rates Update (تمام ریٹ محفوظ کریں)</span>
            </button>
          </div>

        </div>
      }

    </div>

    <!-- ADD / EDIT PRODUCT MODAL -->
    @if (showProductModal()) {
      <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
        <div class="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-800">
          
          <div class="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <h3 class="font-bold text-slate-900 dark:text-slate-100 text-base">
              {{ editingItemId ? 'Edit Kirana Item (تبدیلی)' : 'Add New Product (نیا آئٹم)' }}
            </h3>
            <button (click)="showProductModal.set(false)" class="text-slate-400 hover:text-slate-600">
              <mat-icon class="text-base">close</mat-icon>
            </button>
          </div>

          <div class="space-y-3 text-xs">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span class="block font-bold text-slate-700 dark:text-slate-300 mb-1">English Name *</span>
                <input 
                  type="text" 
                  [(ngModel)]="formNameEn"
                  placeholder="e.g. Super Kernel Basmati Rice"
                  class="w-full bg-slate-50 dark:bg-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <span class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Urdu Name (نام اردو میں) *</span>
                <input 
                  type="text" 
                  [(ngModel)]="formNameUr"
                  placeholder="e.g. سپر کرنیل چاول"
                  class="w-full bg-slate-50 dark:bg-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-medium dir-rtl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Category *</span>
                <select 
                  [(ngModel)]="formCategory"
                  class="w-full bg-slate-50 dark:bg-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none">
                  @for (cat of categories; track cat) {
                    <option [value]="cat">{{ cat }}</option>
                  }
                </select>
              </div>

              <div>
                <span class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Unit of Measure *</span>
                <select 
                  [(ngModel)]="formUnit"
                  class="w-full bg-slate-50 dark:bg-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none">
                  <option value="Kg">Kg (کلو)</option>
                  <option value="Ltr">Ltr (لیٹر)</option>
                  <option value="Pkt">Pkt (پیکٹ)</option>
                  <option value="Pcs">Pcs (عدد)</option>
                  <option value="Dozen">Dozen (درجن)</option>
                  <option value="Grams">Grams (گرام)</option>
                  <option value="Box">Box (ڈبہ)</option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Purchase Cost (خرید قیمت PKR) *</span>
                <input 
                  type="number" 
                  [(ngModel)]="formPurchasePrice"
                  placeholder="280"
                  class="w-full bg-slate-50 dark:bg-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <span class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Selling Price (فروخت قیمت PKR) *</span>
                <input 
                  type="number" 
                  [(ngModel)]="formSellingPrice"
                  placeholder="340"
                  class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none text-emerald-800 dark:text-emerald-400"
                />
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <span class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Current Stock *</span>
                <input 
                  type="number" 
                  [(ngModel)]="formStock"
                  placeholder="100"
                  class="w-full bg-slate-50 dark:bg-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <span class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Low Stock Limit</span>
                <input 
                  type="number" 
                  [(ngModel)]="formMinStock"
                  placeholder="5"
                  class="w-full bg-slate-50 dark:bg-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <span class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Barcode Code</span>
                <div class="flex items-center gap-1.5">
                  <input 
                    type="text" 
                    [(ngModel)]="formBarcode"
                    placeholder="8901234..."
                    class="w-full bg-slate-50 dark:bg-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                  <button 
                    type="button"
                    (click)="autoGenerateBarcodeInForm()"
                    title="Auto Generate New Barcode"
                    class="p-2.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-xl font-bold flex items-center justify-center hover:bg-indigo-100 cursor-pointer">
                    <mat-icon class="text-base">auto_fix_high</mat-icon>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="pt-3 border-t border-slate-200 dark:border-slate-800 flex gap-2">
            <button 
              (click)="showProductModal.set(false)"
              class="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-slate-700 dark:text-slate-300 text-xs rounded-xl">
              Cancel
            </button>
            <button 
              (click)="saveProduct()"
              [disabled]="!formNameEn || !formNameUr || formSellingPrice <= 0"
              class="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md">
              Save Product (محفوظ کریں)
            </button>
          </div>

        </div>
      </div>
    }

    <!-- STOCK ADJUSTMENT MODAL -->
    @if (adjustingItem(); as adjItem) {
      <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
        <div class="bg-white dark:bg-slate-900 rounded-2xl p-5 max-w-sm w-full shadow-2xl space-y-4 border border-slate-200 dark:border-slate-800">
          <div class="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div>
              <h3 class="font-bold text-slate-900 dark:text-slate-100 text-sm">Adjust Stock: {{ adjItem.nameEn }}</h3>
              <p class="text-xs text-slate-500 dark:text-slate-400">Current Stock: {{ adjItem.stock }} {{ adjItem.unit }}</p>
            </div>
            <button (click)="adjustingItem.set(null)" class="text-slate-400 hover:text-slate-600">
              <mat-icon class="text-sm">close</mat-icon>
            </button>
          </div>

          <div class="space-y-3 text-xs">
            <div>
              <span class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Adjustment Type</span>
              <div class="grid grid-cols-2 gap-2 font-bold">
                <button 
                  (click)="adjustType = 'add'"
                  class="py-2 rounded-xl border text-center transition-all"
                  [ngClass]="adjustType === 'add' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'">
                  + Restock (مال آیا)
                </button>
                <button 
                  (click)="adjustType = 'sub'"
                  class="py-2 rounded-xl border text-center transition-all"
                  [ngClass]="adjustType === 'sub' ? 'bg-red-600 text-white border-red-600' : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'">
                  - Waste/Remove (ضائع)
                </button>
              </div>
            </div>

            <div>
              <span class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Quantity ({{ adjItem.unit }})</span>
              <input 
                type="number" 
                [(ngModel)]="adjustQty"
                min="1"
                class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-bold text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <button 
            (click)="saveStockAdjustment()"
            class="w-full py-3 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md transition-colors">
            Confirm Stock Update
          </button>
        </div>
      </div>
    }

    <!-- PRINT BARCODE LABELS MODAL -->
    @if (showBarcodeModal()) {
      <div class="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in no-print">
        <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden flex flex-col max-h-[92vh] border border-slate-200 dark:border-slate-800">
          
          <!-- Modal Header -->
          <div class="bg-slate-900 text-white p-4 flex items-center justify-between">
            <div class="flex items-center gap-2.5">
              <div class="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                <mat-icon class="text-xl">qr_code_2</mat-icon>
              </div>
              <div>
                <h3 class="font-extrabold text-base leading-tight">Generate Printable Barcode Labels (بارکوڈ لیبلز)</h3>
                <p class="text-xs text-slate-400">Generate barcodes & printable sticker labels for loose or packaged goods</p>
              </div>
            </div>
            <button 
              type="button"
              (click)="showBarcodeModal.set(false)"
              class="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 cursor-pointer">
              <mat-icon class="text-base">close</mat-icon>
            </button>
          </div>

          <!-- Content Body (2 Columns) -->
          <div class="p-5 overflow-y-auto flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 text-xs">
            
            <!-- Left Column: Controls & Items Queue (7 Cols) -->
            <div class="lg:col-span-7 space-y-4">
              
              <!-- Layout & Sticker Size Selection -->
              <div class="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <span class="block font-extrabold text-slate-900 dark:text-slate-100 text-xs">
                  1. Label Format / Sheet Preset (لیبل کی پیمائش):
                </span>
                <div class="grid grid-cols-3 gap-2">
                  <button 
                    type="button"
                    (click)="barcodeLayout.set('grid'); renderBarcodes()"
                    class="p-2.5 rounded-xl border text-center transition-all cursor-pointer font-bold"
                    [ngClass]="barcodeLayout() === 'grid' ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'">
                    <div class="text-[11px]">Grid Sheet</div>
                    <div class="text-[9px] opacity-80">A4 (24 Stickers)</div>
                  </button>

                  <button 
                    type="button"
                    (click)="barcodeLayout.set('roll50'); renderBarcodes()"
                    class="p-2.5 rounded-xl border text-center transition-all cursor-pointer font-bold"
                    [ngClass]="barcodeLayout() === 'roll50' ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'">
                    <div class="text-[11px]">50x30mm Roll</div>
                    <div class="text-[9px] opacity-80">Standard Thermal</div>
                  </button>

                  <button 
                    type="button"
                    (click)="barcodeLayout.set('roll40'); renderBarcodes()"
                    class="p-2.5 rounded-xl border text-center transition-all cursor-pointer font-bold"
                    [ngClass]="barcodeLayout() === 'roll40' ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'">
                    <div class="text-[11px]">40x25mm Roll</div>
                    <div class="text-[9px] opacity-80">Compact Tag</div>
                  </button>
                </div>
              </div>

              <!-- Display Customization Toggles -->
              <div class="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <span class="block font-extrabold text-slate-900 dark:text-slate-100 text-xs">
                  2. Customize Label Display Fields:
                </span>
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <label class="flex items-center gap-1.5 cursor-pointer font-semibold text-slate-700 dark:text-slate-300">
                    <input type="checkbox" [ngModel]="showShopName()" (ngModelChange)="showShopName.set($event); renderBarcodes()" class="rounded text-indigo-600">
                    <span>Shop Name</span>
                  </label>
                  <label class="flex items-center gap-1.5 cursor-pointer font-semibold text-slate-700 dark:text-slate-300">
                    <input type="checkbox" [ngModel]="showUrduName()" (ngModelChange)="showUrduName.set($event); renderBarcodes()" class="rounded text-indigo-600">
                    <span>Urdu Name</span>
                  </label>
                  <label class="flex items-center gap-1.5 cursor-pointer font-semibold text-slate-700 dark:text-slate-300">
                    <input type="checkbox" [ngModel]="showPrice()" (ngModelChange)="showPrice.set($event); renderBarcodes()" class="rounded text-indigo-600">
                    <span>Sale Price</span>
                  </label>
                  <label class="flex items-center gap-1.5 cursor-pointer font-semibold text-slate-700 dark:text-slate-300">
                    <input type="checkbox" [ngModel]="showBarcodeText()" (ngModelChange)="showBarcodeText.set($event); renderBarcodes()" class="rounded text-indigo-600">
                    <span>Barcode Text</span>
                  </label>
                </div>
              </div>

              <!-- Add Product to Print Queue -->
              <div class="flex items-center gap-2">
                <select 
                  [ngModel]="selectedProductToAdd()"
                  (ngModelChange)="selectedProductToAdd.set($event)"
                  class="flex-1 bg-white dark:bg-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-medium focus:ring-2 focus:ring-indigo-500">
                  <option value="">-- Add Product to Print Batch (نیا آئٹم ملائیں) --</option>
                  @for (invItem of storeService.inventory(); track invItem.id) {
                    <option [value]="invItem.id">{{ invItem.nameEn }} ({{ invItem.nameUr }}) - Rs.{{ invItem.sellingPrice }}</option>
                  }
                </select>
                <button 
                  type="button"
                  (click)="addSelectedProductToQueue()"
                  [disabled]="!selectedProductToAdd()"
                  class="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold cursor-pointer text-nowrap">
                  + Add Item
                </button>
              </div>

              <!-- Items Queue List with Copies Counter -->
              <div class="space-y-2 border border-slate-200 dark:border-slate-700 rounded-xl p-3 max-h-56 overflow-y-auto">
                <div class="flex justify-between items-center text-[11px] font-bold text-slate-500 pb-1 border-b border-slate-200 dark:border-slate-700">
                  <span>Selected Item (سامان)</span>
                  <span>Sticker Copies</span>
                </div>

                @for (entry of barcodeQueue(); track $index) {
                  <div class="flex items-center justify-between gap-2 p-2 bg-slate-50 dark:bg-slate-800/80 rounded-lg">
                    <div class="flex-1 min-w-0">
                      <div class="font-bold text-slate-900 dark:text-slate-100 truncate">{{ entry.item.nameEn }}</div>
                      <div class="text-[10px] text-slate-500 truncate font-mono">
                        @if (entry.item.barcode) {
                          Barcode: {{ entry.item.barcode }}
                        } @else {
                          <span class="text-amber-600 font-semibold">⚠️ No Barcode Yet</span>
                        }
                      </div>
                    </div>

                    @if (!entry.item.barcode) {
                      <button 
                        type="button"
                        (click)="autoGenerateBarcodeForQueueItem(entry.item)"
                        class="px-2 py-1 rounded bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-[10px] text-nowrap cursor-pointer">
                        ⚡ Auto Barcode
                      </button>
                    }

                    <!-- Copies Selector -->
                    <div class="flex items-center gap-1">
                      <input 
                        type="number" 
                        [ngModel]="entry.copies"
                        (ngModelChange)="updateQueueCopies($index, +$event)"
                        min="1"
                        max="100"
                        class="w-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-1 text-center font-bold text-slate-900 dark:text-slate-100"
                      />
                      <button 
                        type="button"
                        (click)="removeQueueEntry($index)"
                        class="p-1 text-slate-400 hover:text-red-600 cursor-pointer">
                        <mat-icon class="text-base">delete</mat-icon>
                      </button>
                    </div>
                  </div>
                } @empty {
                  <div class="text-center py-6 text-slate-400">
                    Select products above to add to barcode print batch.
                  </div>
                }
              </div>

            </div>

            <!-- Right Column: Live Sticker Preview (5 Cols) -->
            <div class="lg:col-span-5 bg-slate-100 dark:bg-slate-950/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-between">
              
              <div class="w-full text-center mb-2">
                <span class="font-extrabold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider">
                  Live Label Sticker Preview
                </span>
                <p class="text-[10px] text-slate-500">Total Labels to Print: <strong class="text-indigo-600 dark:text-indigo-400">{{ printableLabelsList().length }} stickers</strong></p>
              </div>

              <!-- Live Preview Box -->
              <div class="flex-1 flex items-center justify-center p-3 w-full">
                @if (printableLabelsList().length > 0) {
                  @let previewItem = printableLabelsList()[0];
                  <div 
                    class="bg-white text-black border-2 border-slate-900 rounded-xl p-3 shadow-md flex flex-col items-center justify-between text-center mx-auto transition-all"
                    [ngClass]="{
                      'w-[220px] h-[130px]': barcodeLayout() === 'grid',
                      'w-[200px] h-[120px]': barcodeLayout() === 'roll50',
                      'w-[180px] h-[110px]': barcodeLayout() === 'roll40'
                    }">
                    
                    @if (showShopName()) {
                      <div class="text-[10px] font-black tracking-widest uppercase border-b border-black w-full pb-0.5">
                        {{ storeService.config().storeName }}
                      </div>
                    }

                    <div class="w-full">
                      <div class="text-[11px] font-extrabold text-black leading-snug truncate">{{ previewItem.nameEn }}</div>
                      @if (showUrduName()) {
                        <div class="text-[10px] font-bold text-slate-800 font-sans dir-rtl leading-tight truncate">{{ previewItem.nameUr }}</div>
                      }
                    </div>

                    <!-- Barcode SVG Render -->
                    <div class="my-1 flex justify-center w-full">
                      <svg class="barcode-svg-element" [attr.data-barcode]="previewItem.barcode"></svg>
                    </div>

                    @if (showBarcodeText()) {
                      <div class="text-[10px] font-mono font-bold tracking-widest leading-none">
                        {{ previewItem.barcode || '890123456789' }}
                      </div>
                    }

                    @if (showPrice()) {
                      <div class="text-[12px] font-black text-black border-t border-black w-full pt-0.5 mt-0.5">
                        Rs. {{ previewItem.sellingPrice | number:'1.0-0' }} / {{ previewItem.unit }}
                      </div>
                    }
                  </div>
                } @else {
                  <div class="text-center text-slate-400 py-10">
                    <mat-icon class="text-4xl text-slate-300">qr_code_2</mat-icon>
                    <p>No labels added yet</p>
                  </div>
                }
              </div>

              <div class="text-[10px] text-slate-500 text-center italic mt-2">
                ⚡ Printable barcode tags scan instantly with any standard laser/2D scanner or phone camera!
              </div>

            </div>

          </div>

          <!-- Modal Action Bar -->
          <div class="p-4 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center gap-3">
            <button 
              type="button"
              (click)="showBarcodeModal.set(false)"
              class="px-5 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold text-xs cursor-pointer">
              Close Modal
            </button>

            <button 
              type="button"
              (click)="printBarcodes()"
              [disabled]="printableLabelsList().length === 0"
              class="px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-black text-sm shadow-md shadow-indigo-950/20 flex items-center gap-2 cursor-pointer transition-all active:scale-95">
              <mat-icon class="text-lg">print</mat-icon>
              <span>Print Barcode Sheet (پرنٹ کریں - {{ printableLabelsList().length }} Labels)</span>
            </button>
          </div>

        </div>
      </div>
    }

    <!-- PRINTABLE BARCODE CONTAINER FOR BROWSER PRINT -->
    <div id="printable-barcodes" class="hidden print:block">
      <div 
        [ngClass]="{
          'grid grid-cols-3 gap-2': barcodeLayout() === 'grid',
          'flex flex-col gap-3 items-center': barcodeLayout() === 'roll50' || barcodeLayout() === 'roll40'
        }">
        @for (item of printableLabelsList(); track $index) {
          <div 
            class="border border-black rounded p-2 text-center bg-white text-black flex flex-col items-center justify-between overflow-hidden"
            [ngClass]="{
              'w-[60mm] h-[35mm]': barcodeLayout() === 'grid',
              'w-[50mm] h-[30mm]': barcodeLayout() === 'roll50',
              'w-[40mm] h-[25mm]': barcodeLayout() === 'roll40'
            }">
            
            @if (showShopName()) {
              <div class="text-[9px] font-black tracking-wider uppercase border-b border-black w-full pb-0.5 mb-0.5">
                {{ storeService.config().storeName }}
              </div>
            }

            <div class="w-full text-center leading-tight">
              <div class="text-[10px] font-bold truncate">{{ item.nameEn }}</div>
              @if (showUrduName()) {
                <div class="text-[9px] font-sans truncate dir-rtl">{{ item.nameUr }}</div>
              }
            </div>

            <!-- SVG BARCODE -->
            <div class="my-0.5 flex justify-center w-full">
              <svg class="barcode-svg-element" [attr.data-barcode]="item.barcode"></svg>
            </div>

            @if (showBarcodeText()) {
              <div class="text-[9px] font-mono font-bold tracking-widest leading-none">
                {{ item.barcode }}
              </div>
            }

            @if (showPrice()) {
              <div class="text-[11px] font-black text-black border-t border-black w-full pt-0.5 mt-0.5">
                Rs. {{ item.sellingPrice | number:'1.0-0' }} / {{ item.unit }}
              </div>
            }

          </div>
        }
      </div>
    </div>
  `
})
export class InventoryComponent {
  storeService = inject(StoreService);

  activeViewMode = signal<'catalog' | 'bulk'>('catalog');

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
  showLowStockOnly = signal<boolean>(false);

  // Category counts map
  categoryCountMap = computed(() => {
    const map: Record<string, number> = {};
    for (const item of this.storeService.inventory()) {
      map[item.category] = (map[item.category] || 0) + 1;
    }
    return map;
  });

  // Form modal state
  showProductModal = signal<boolean>(false);
  editingItemId: string | null = null;
  formNameEn = '';
  formNameUr = '';
  formCategory: ItemCategory = 'Atta & Daalen';
  formUnit: ItemUnit = 'Kg';
  formPurchasePrice = 0;
  formSellingPrice = 0;
  formStock = 0;
  formMinStock = 5;
  formBarcode = '';

  // Stock Adjustment state
  adjustingItem = signal<InventoryItem | null>(null);
  adjustType: 'add' | 'sub' = 'add';
  adjustQty = 1;

  // DAILY BULK RATE EDITOR state
  bulkSearchQuery = signal<string>('');
  bulkCategoryFilter = signal<string>('ALL');
  bulkEditsMap = new Map<string, { sellingPrice: number; purchasePrice: number }>();

  // BARCODE PRINTING STATE
  showBarcodeModal = signal<boolean>(false);
  barcodeQueue = signal<{ item: InventoryItem; copies: number }[]>([]);
  barcodeLayout = signal<'grid' | 'roll50' | 'roll40'>('grid');
  showShopName = signal<boolean>(true);
  showUrduName = signal<boolean>(true);
  showPrice = signal<boolean>(true);
  showBarcodeText = signal<boolean>(true);
  selectedProductToAdd = signal<string>('');

  printableLabelsList = computed(() => {
    const queue = this.barcodeQueue();
    const list: InventoryItem[] = [];
    for (const entry of queue) {
      for (let i = 0; i < entry.copies; i++) {
        list.push(entry.item);
      }
    }
    return list;
  });

  filteredInventory = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const cat = this.selectedCategory();
    const lowOnly = this.showLowStockOnly();

    return this.storeService.inventory().filter(item => {
      const matchCat = cat === 'ALL' || item.category === cat;
      const matchLow = !lowOnly || item.stock <= item.minStockAlert;
      const matchQuery = !q || 
        item.nameEn.toLowerCase().includes(q) ||
        item.nameUr.includes(q) ||
        item.barcode.includes(q);

      return matchCat && matchLow && matchQuery;
    });
  });

  filteredBulkItems = computed(() => {
    const q = this.bulkSearchQuery().toLowerCase().trim();
    const cat = this.bulkCategoryFilter();

    return this.storeService.inventory().filter(item => {
      const matchCat = cat === 'ALL' || item.category === cat;
      const matchQuery = !q || 
        item.nameEn.toLowerCase().includes(q) ||
        item.nameUr.includes(q);

      return matchCat && matchQuery;
    });
  });

  totalStockValuation = computed(() => {
    return this.storeService.inventory().reduce((acc, item) => acc + (item.stock * item.purchasePrice), 0);
  });

  totalPotentialSalesValue = computed(() => {
    return this.storeService.inventory().reduce((acc, item) => acc + (item.stock * item.sellingPrice), 0);
  });

  switchToBulkEditor() {
    if (this.storeService.isStaff()) {
      this.storeService.openPinModal(
        'Daily Bulk Rate Editor (قیمتیں تبدیل کرنے) ke liye Admin (Dukan Malik) PIN enter karein',
        'admin',
        () => {
          this.resetBulkEdits();
          this.activeViewMode.set('bulk');
        }
      );
      return;
    }
    this.resetBulkEdits();
    this.activeViewMode.set('bulk');
  }

  resetBulkEdits() {
    this.bulkEditsMap.clear();
    this.storeService.inventory().forEach(item => {
      this.bulkEditsMap.set(item.id, {
        sellingPrice: item.sellingPrice,
        purchasePrice: item.purchasePrice
      });
    });
  }

  applyMassAdjustment(amount: number) {
    this.bulkEditsMap.forEach((val) => {
      val.sellingPrice = Math.max(0, val.sellingPrice + amount);
    });
  }

  saveBulkRates() {
    if (this.storeService.isStaff()) {
      this.storeService.openPinModal(
        'Bulk Rates Save karne ke liye Admin (Dukan Malik) PIN enter karein',
        'admin',
        () => {
          this.storeService.updateBulkRates(this.bulkEditsMap);
          alert('✅ Rates updated successfully across all items!');
          this.activeViewMode.set('catalog');
        }
      );
      return;
    }
    this.storeService.updateBulkRates(this.bulkEditsMap);
    alert('✅ Rates updated successfully across all items!');
    this.activeViewMode.set('catalog');
  }

  openAddModal() {
    if (this.storeService.isStaff()) {
      this.storeService.openPinModal(
        'Naya Saman Shamil karne ke liye Admin (Dukan Malik) PIN enter karein',
        'admin',
        () => this.doOpenAddModal()
      );
      return;
    }
    this.doOpenAddModal();
  }

  private doOpenAddModal() {
    this.editingItemId = null;
    this.formNameEn = '';
    this.formNameUr = '';
    this.formCategory = 'Atta & Daalen';
    this.formUnit = 'Kg';
    this.formPurchasePrice = 0;
    this.formSellingPrice = 0;
    this.formStock = 0;
    this.formMinStock = 5;
    this.formBarcode = `890${Math.floor(100000 + Math.random() * 900000)}`;
    this.showProductModal.set(true);
  }

  openEditModal(item: InventoryItem) {
    if (this.storeService.isStaff()) {
      this.storeService.openPinModal(
        'Saman ki Keemat (Rates) aur Details tabdeel karne ke liye Admin PIN enter karein',
        'admin',
        () => this.doOpenEditModal(item)
      );
      return;
    }
    this.doOpenEditModal(item);
  }

  private doOpenEditModal(item: InventoryItem) {
    this.editingItemId = item.id;
    this.formNameEn = item.nameEn;
    this.formNameUr = item.nameUr;
    this.formCategory = item.category;
    this.formUnit = item.unit;
    this.formPurchasePrice = item.purchasePrice;
    this.formSellingPrice = item.sellingPrice;
    this.formStock = item.stock;
    this.formMinStock = item.minStockAlert;
    this.formBarcode = item.barcode;
    this.showProductModal.set(true);
  }

  saveProduct() {
    if (!this.formNameEn || !this.formNameUr || this.formSellingPrice <= 0) return;

    if (this.editingItemId) {
      this.storeService.updateInventoryItem({
        id: this.editingItemId,
        nameEn: this.formNameEn,
        nameUr: this.formNameUr,
        category: this.formCategory,
        unit: this.formUnit,
        purchasePrice: this.formPurchasePrice,
        sellingPrice: this.formSellingPrice,
        stock: this.formStock,
        minStockAlert: this.formMinStock,
        barcode: this.formBarcode
      });
    } else {
      this.storeService.addInventoryItem({
        nameEn: this.formNameEn,
        nameUr: this.formNameUr,
        category: this.formCategory,
        unit: this.formUnit,
        purchasePrice: this.formPurchasePrice,
        sellingPrice: this.formSellingPrice,
        stock: this.formStock,
        minStockAlert: this.formMinStock,
        barcode: this.formBarcode
      });
    }

    this.showProductModal.set(false);
  }

  deleteItem(id: string) {
    if (this.storeService.isStaff()) {
      this.storeService.openPinModal(
        'Product Delete karne ke liye Admin (Dukan Malik) PIN enter karein',
        'admin',
        () => this.doDeleteItem(id)
      );
      return;
    }
    this.doDeleteItem(id);
  }

  private doDeleteItem(id: string) {
    if (confirm('Are you sure you want to delete this inventory product?')) {
      this.storeService.deleteInventoryItem(id);
    }
  }

  openStockAdjustModal(item: InventoryItem) {
    this.adjustingItem.set(item);
    this.adjustType = 'add';
    this.adjustQty = 1;
  }

  saveStockAdjustment() {
    const item = this.adjustingItem();
    if (!item || this.adjustQty <= 0) return;

    const delta = this.adjustType === 'add' ? this.adjustQty : -this.adjustQty;
    this.storeService.adjustStock(item.id, delta);
    this.adjustingItem.set(null);
  }

  // BARCODE GENERATION & PRINT METHODS
  autoGenerateBarcodeInForm() {
    this.formBarcode = `890${Math.floor(100000000 + Math.random() * 900000000)}`;
  }

  openBarcodeModalForSingle(item: InventoryItem) {
    let targetItem = item;
    if (!item.barcode || item.barcode.trim() === '') {
      const newBarcode = `890${Math.floor(100000000 + Math.random() * 900000000)}`;
      targetItem = { ...item, barcode: newBarcode };
      this.storeService.updateInventoryItem(targetItem);
    }
    this.barcodeQueue.set([{ item: targetItem, copies: 12 }]);
    this.showBarcodeModal.set(true);
    this.renderBarcodes();
  }

  openBarcodeModalForBatch() {
    const queue = this.storeService.inventory().slice(0, 5).map(item => {
      if (!item.barcode || item.barcode.trim() === '') {
        const newBarcode = `890${Math.floor(100000000 + Math.random() * 900000000)}`;
        const updated = { ...item, barcode: newBarcode };
        this.storeService.updateInventoryItem(updated);
        return { item: updated, copies: 4 };
      }
      return { item, copies: 4 };
    });
    this.barcodeQueue.set(queue);
    this.showBarcodeModal.set(true);
    this.renderBarcodes();
  }

  addSelectedProductToQueue() {
    const id = this.selectedProductToAdd();
    if (!id) return;

    const found = this.storeService.inventory().find(i => i.id === id);
    if (found) {
      let itemWithBarcode = found;
      if (!found.barcode || found.barcode.trim() === '') {
        itemWithBarcode = { ...found, barcode: `890${Math.floor(100000000 + Math.random() * 900000000)}` };
        this.storeService.updateInventoryItem(itemWithBarcode);
      }
      const current = this.barcodeQueue();
      this.barcodeQueue.set([...current, { item: itemWithBarcode, copies: 6 }]);
      this.selectedProductToAdd.set('');
      this.renderBarcodes();
    }
  }

  autoGenerateBarcodeForQueueItem(item: InventoryItem) {
    const newBarcode = `890${Math.floor(100000000 + Math.random() * 900000000)}`;
    const updated = { ...item, barcode: newBarcode };
    this.storeService.updateInventoryItem(updated);

    const queue = this.barcodeQueue().map(q => q.item.id === item.id ? { ...q, item: updated } : q);
    this.barcodeQueue.set(queue);
    this.renderBarcodes();
  }

  updateQueueCopies(index: number, copies: number) {
    const validCopies = Math.max(1, Math.min(100, copies || 1));
    const queue = [...this.barcodeQueue()];
    if (queue[index]) {
      queue[index].copies = validCopies;
      this.barcodeQueue.set(queue);
      this.renderBarcodes();
    }
  }

  removeQueueEntry(index: number) {
    const queue = [...this.barcodeQueue()];
    queue.splice(index, 1);
    this.barcodeQueue.set(queue);
    this.renderBarcodes();
  }

  renderBarcodes() {
    setTimeout(() => {
      const svgs = document.querySelectorAll<SVGSVGElement>('.barcode-svg-element');
      svgs.forEach((svg) => {
        const code = svg.getAttribute('data-barcode');
        if (code) {
          try {
            JsBarcode(svg, code, {
              format: 'CODE128',
              width: 1.4,
              height: 32,
              displayValue: false,
              margin: 0
            });
          } catch (e) {
            console.warn('Barcode render error:', e);
          }
        }
      });
    }, 60);
  }

  printBarcodes() {
    window.print();
  }
}
