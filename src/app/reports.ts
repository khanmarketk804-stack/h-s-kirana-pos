import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { StoreService } from './store.service';
import { Transaction } from './store.models';
import { ReceiptModalComponent } from './receipt-modal';

export type ReportTimeframe = 'today' | '7days' | '30days' | 'all';
export type ReportTab = 'sales' | 'udhar' | 'items';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, ReceiptModalComponent],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      <!-- TOP LIVE WIDGETS BAR (REQUESTED KPI METRICS) -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 no-print">
        
        <!-- Today's Total Sales -->
        <div class="bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-2xl p-4 shadow-md border border-emerald-500/50 space-y-1 relative overflow-hidden">
          <div class="flex items-center justify-between text-emerald-100">
            <span class="text-xs font-bold uppercase tracking-wider">Today's Sales (آج کی فروخت)</span>
            <mat-icon class="text-lg opacity-80">payments</mat-icon>
          </div>
          <div class="text-xl sm:text-2xl font-black tracking-tight">
            Rs. {{ storeService.todaySalesTotal() | number:'1.0-0' }}
          </div>
          <span class="text-[10px] text-emerald-200 font-medium block">
            Real-time daily POS sales
          </span>
        </div>

        <!-- Total Outstanding Udhar -->
        <div class="bg-gradient-to-br from-rose-600 to-red-700 text-white rounded-2xl p-4 shadow-md border border-red-500/50 space-y-1 relative overflow-hidden">
          <div class="flex items-center justify-between text-red-100">
            <span class="text-xs font-bold uppercase tracking-wider">Total Udhar (بقایا ادھار)</span>
            <mat-icon class="text-lg opacity-80">account_balance_wallet</mat-icon>
          </div>
          <div class="text-xl sm:text-2xl font-black tracking-tight">
            Rs. {{ storeService.totalMarketUdhar() | number:'1.0-0' }}
          </div>
          <span class="text-[10px] text-red-200 font-medium block">
            Market outstanding ledger
          </span>
        </div>

        <!-- Low Stock Items Count -->
        <div class="bg-gradient-to-br from-amber-500 to-orange-600 text-slate-950 rounded-2xl p-4 shadow-md border border-amber-400/50 space-y-1 relative overflow-hidden">
          <div class="flex items-center justify-between text-slate-900">
            <span class="text-xs font-black uppercase tracking-wider">Low Stock (کم سٹاک)</span>
            <mat-icon class="text-lg text-slate-900">warning</mat-icon>
          </div>
          <div class="text-xl sm:text-2xl font-black tracking-tight text-slate-950">
            {{ storeService.lowStockItemsCount() }} Items
          </div>
          <span class="text-[10px] text-slate-900/80 font-bold block">
            Need urgent re-stocking
          </span>
        </div>

        <!-- Total Transactions Today -->
        <div class="bg-gradient-to-br from-indigo-600 to-blue-700 text-white rounded-2xl p-4 shadow-md border border-indigo-500/50 space-y-1 relative overflow-hidden">
          <div class="flex items-center justify-between text-indigo-100">
            <span class="text-xs font-bold uppercase tracking-wider">Today's Invoices (رسیدیں)</span>
            <mat-icon class="text-lg opacity-80">receipt</mat-icon>
          </div>
          <div class="text-xl sm:text-2xl font-black tracking-tight">
            {{ storeService.todayTransactionsCount() }} Bills
          </div>
          <span class="text-[10px] text-indigo-200 font-medium block">
            Total sales transactions
          </span>
        </div>

      </div>

      <!-- MAIN REPORT HEADER & SUB-TABS NAVIGATION -->
      <div class="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4 no-print">
        
        <!-- Left Title -->
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <mat-icon class="text-xl">bar_chart</mat-icon>
          </div>
          <div>
            <h1 class="font-extrabold text-slate-900 text-base">STORE REPORTS & ANALYTICS</h1>
            <p class="text-xs text-slate-500 font-medium">فروخت رپورٹس، ادھار وصولی کھاتہ اور آئٹم وائز موازنہ</p>
          </div>
        </div>

        <!-- Sub-Tabs Switcher -->
        <div class="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl text-xs font-bold w-full md:w-auto">
          <button 
            (click)="activeTab.set('sales')"
            class="flex-1 md:flex-initial px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
            [ngClass]="activeTab() === 'sales' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'">
            <mat-icon class="text-base">point_of_sale</mat-icon>
            <span>Sales Report</span>
          </button>

          <button 
            (click)="activeTab.set('udhar')"
            class="flex-1 md:flex-initial px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
            [ngClass]="activeTab() === 'udhar' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'">
            <mat-icon class="text-base">menu_book</mat-icon>
            <span>Udhar Recovery Ledger</span>
          </button>

          <button 
            (click)="activeTab.set('items')"
            class="flex-1 md:flex-initial px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
            [ngClass]="activeTab() === 'items' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'">
            <mat-icon class="text-base">inventory_2</mat-icon>
            <span>Item-wise Sales</span>
          </button>
        </div>

        <!-- Timeframe Selector Pills -->
        <div class="flex items-center gap-1 text-xs font-bold bg-slate-100 p-1 rounded-xl">
          <button 
            (click)="timeframe.set('today')"
            class="px-3 py-1.5 rounded-lg transition-all cursor-pointer"
            [ngClass]="timeframe() === 'today' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'">
            Today
          </button>

          <button 
            (click)="timeframe.set('7days')"
            class="px-3 py-1.5 rounded-lg transition-all cursor-pointer"
            [ngClass]="timeframe() === '7days' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'">
            7 Days
          </button>

          <button 
            (click)="timeframe.set('30days')"
            class="px-3 py-1.5 rounded-lg transition-all cursor-pointer"
            [ngClass]="timeframe() === '30days' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'">
            This Month
          </button>

          <button 
            (click)="timeframe.set('all')"
            class="px-3 py-1.5 rounded-lg transition-all cursor-pointer"
            [ngClass]="timeframe() === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'">
            All Time
          </button>
        </div>

      </div>

      <!-- ==================== TAB 1: SALES REPORT (DAILY / MONTHLY) ==================== -->
      @if (activeTab() === 'sales') {
        <div class="space-y-6 animate-fade-in no-print">
          
          <!-- Key Metrics Grid -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            
            <div class="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-1">
              <span class="text-xs text-slate-500 font-medium">Gross Sales (کل فروخت)</span>
              <div class="text-xl font-extrabold text-slate-900">
                Rs. {{ totalSales() | number:'1.0-0' }}
              </div>
              <span class="text-[10px] text-slate-400 font-semibold block">
                {{ filteredTxCount() }} total invoices
              </span>
            </div>

            <div class="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-1">
              <span class="text-xs text-slate-500 font-medium">Estimated Profit (منافع)</span>
              <div class="text-xl font-extrabold text-emerald-700">
                Rs. {{ estimatedProfit() | number:'1.0-0' }}
              </div>
              <span class="text-[10px] text-emerald-600 font-semibold block">
                Profit Margin: {{ profitMarginPercent() }}%
              </span>
            </div>

            <div class="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-1">
              <span class="text-xs text-slate-500 font-medium">Cash Collected (نقد)</span>
              <div class="text-xl font-extrabold text-blue-700">
                Rs. {{ cashSales() | number:'1.0-0' }}
              </div>
              <span class="text-[10px] text-slate-400 font-semibold block">
                Digital/Online: Rs. {{ onlineSales() | number:'1.0-0' }}
              </span>
            </div>

            <div class="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-1">
              <span class="text-xs text-slate-500 font-medium">Udhar Given (کھاتہ ادھار)</span>
              <div class="text-xl font-extrabold text-rose-600">
                Rs. {{ udharSales() | number:'1.0-0' }}
              </div>
              <span class="text-[10px] text-slate-400 font-semibold block">
                Total Market Udhar: Rs. {{ storeService.totalMarketUdhar() | number:'1.0-0' }}
              </span>
            </div>

          </div>

          <!-- Breakdown Graphs & Top Sold Items -->
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            <!-- Top Selling Items Bar Progress (7 cols) -->
            <div class="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
              <h2 class="font-bold text-slate-900 text-sm flex items-center gap-2">
                <mat-icon class="text-emerald-600 text-base">leaderboard</mat-icon>
                Top Selling Products Breakdown (زیادہ بکنے والے آئٹمز)
              </h2>

              <div class="space-y-3">
                @for (item of topSellingItems(); track item.name) {
                  <div class="space-y-1 text-xs">
                    <div class="flex justify-between items-center">
                      <span class="font-bold text-slate-900">{{ item.name }}</span>
                      <div class="text-right">
                        <span class="font-extrabold text-slate-900">Rs. {{ item.totalRevenue | number:'1.0-0' }}</span>
                        <span class="text-[10px] text-slate-500 font-semibold block">({{ item.totalQty }} {{ item.unit }} sold)</span>
                      </div>
                    </div>

                    <div class="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div 
                        class="bg-gradient-to-r from-emerald-500 to-teal-600 h-full rounded-full transition-all duration-500"
                        [style.width.%]="item.barPercent">
                      </div>
                    </div>
                  </div>
                } @empty {
                  <p class="text-xs text-slate-400 py-6 text-center">No sales data recorded for selected timeframe.</p>
                }
              </div>
            </div>

            <!-- Payment Distribution (5 cols) -->
            <div class="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
              <h2 class="font-bold text-slate-900 text-sm flex items-center gap-2">
                <mat-icon class="text-emerald-600 text-base">pie_chart</mat-icon>
                Payment Method Distribution
              </h2>

              <div class="space-y-3 text-xs">
                <div class="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <span class="w-3 h-3 rounded-full bg-emerald-600"></span>
                    <span class="font-bold text-slate-800">Cash Payment (نقد)</span>
                  </div>
                  <span class="font-extrabold text-slate-900">Rs. {{ cashSales() | number:'1.0-0' }}</span>
                </div>

                <div class="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <span class="w-3 h-3 rounded-full bg-green-500"></span>
                    <span class="font-bold text-slate-800">EasyPaisa & JazzCash</span>
                  </div>
                  <span class="font-extrabold text-slate-900">Rs. {{ onlineSales() | number:'1.0-0' }}</span>
                </div>

                <div class="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <span class="w-3 h-3 rounded-full bg-rose-500"></span>
                    <span class="font-bold text-slate-800">Udhar Ledger (ادھار)</span>
                  </div>
                  <span class="font-extrabold text-rose-600">Rs. {{ udharSales() | number:'1.0-0' }}</span>
                </div>
              </div>
            </div>

          </div>

          <!-- Transaction Invoices Table -->
          <div class="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden p-5 space-y-4">
            <div class="flex flex-col sm:flex-row items-center justify-between gap-3">
              <h2 class="font-bold text-slate-900 text-sm flex items-center gap-2">
                <mat-icon class="text-emerald-600 text-base">receipt_long</mat-icon>
                Sales Transaction Invoices (تمام رسیدیں)
              </h2>

              <div class="flex items-center gap-2 w-full sm:w-auto">
                <input 
                  type="text"
                  [(ngModel)]="searchTxQuery"
                  placeholder="Search invoice or customer..."
                  class="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500 flex-1"
                />

                <button 
                  (click)="exportSalesCsv()"
                  class="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer text-nowrap">
                  <mat-icon class="text-sm">download</mat-icon> Export CSV
                </button>

                <button 
                  (click)="triggerPrintReport('sales')"
                  class="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer text-nowrap">
                  <mat-icon class="text-sm">print</mat-icon> Print Report
                </button>
              </div>
            </div>

            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs">
                <thead class="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200">
                  <tr>
                    <th class="py-2.5 px-3">Invoice #</th>
                    <th class="py-2.5 px-3">Date & Time</th>
                    <th class="py-2.5 px-3">Customer</th>
                    <th class="py-2.5 px-3">Payment</th>
                    <th class="py-2.5 px-3">Items</th>
                    <th class="py-2.5 px-3">Total Amount</th>
                    <th class="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 font-medium text-slate-800">
                  @for (tx of searchedSalesTransactions(); track tx.id) {
                    <tr class="hover:bg-slate-50">
                      <td class="py-2.5 px-3 font-bold font-mono text-slate-900">{{ tx.invoiceNo }}</td>
                      <td class="py-2.5 px-3 text-slate-500 text-[11px]">{{ tx.timestamp | date:'dd-MMM-yyyy hh:mm a' }}</td>
                      <td class="py-2.5 px-3 font-semibold">{{ tx.customerName || 'Walk-in' }}</td>
                      <td class="py-2.5 px-3">
                        <span 
                          class="px-2 py-0.5 rounded-full font-bold text-[10px] uppercase"
                          [ngClass]="{
                            'bg-emerald-100 text-emerald-800': tx.paymentMethod === 'cash',
                            'bg-green-100 text-green-800': tx.paymentMethod === 'easypaisa' || tx.paymentMethod === 'jazzcash',
                            'bg-rose-100 text-rose-800': tx.paymentMethod === 'udhar'
                          }">
                          {{ tx.paymentMethod }}
                        </span>
                      </td>
                      <td class="py-2.5 px-3 font-semibold">{{ tx.items.length }} items</td>
                      <td class="py-2.5 px-3 font-extrabold text-sm text-slate-900">
                        Rs. {{ tx.total | number:'1.0-0' }}
                      </td>
                      <td class="py-2.5 px-3 text-right">
                        <button 
                          (click)="selectedTxForReceipt.set(tx)"
                          class="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[11px] flex items-center gap-1 ml-auto cursor-pointer">
                          <mat-icon class="text-xs">visibility</mat-icon> View Bill
                        </button>
                      </td>
                    </tr>
                  } @empty {
                    <tr>
                      <td colspan="7" class="py-8 text-center text-slate-400">No sales invoices match search / timeframe criteria.</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>

        </div>
      }

      <!-- ==================== TAB 2: UDHAR RECOVERY LEDGER ==================== -->
      @if (activeTab() === 'udhar') {
        <div class="space-y-6 animate-fade-in no-print">
          
          <!-- Udhar Ledger Summary KPIs -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            <div class="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-1">
              <span class="text-xs text-slate-500 font-medium">Udhar Given in Period (ادھار دیا)</span>
              <div class="text-xl font-extrabold text-rose-600">
                Rs. {{ periodUdharGiven() | number:'1.0-0' }}
              </div>
              <span class="text-[10px] text-slate-400 font-semibold block">
                Total credit sales extended
              </span>
            </div>

            <div class="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-1">
              <span class="text-xs text-slate-500 font-medium">Udhar Vasool / Payment Received (وصولی)</span>
              <div class="text-xl font-extrabold text-emerald-600">
                Rs. {{ periodUdharVasool() | number:'1.0-0' }}
              </div>
              <span class="text-[10px] text-slate-400 font-semibold block">
                Total cash collected from customers
              </span>
            </div>

            <div class="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-1">
              <span class="text-xs text-slate-500 font-medium">Net Market Balance Outstanding</span>
              <div class="text-xl font-extrabold text-slate-900">
                Rs. {{ storeService.totalMarketUdhar() | number:'1.0-0' }}
              </div>
              <span class="text-[10px] text-slate-400 font-semibold block">
                Active customer ledger total
              </span>
            </div>

          </div>

          <!-- Udhar Ledger Table -->
          <div class="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden p-5 space-y-4">
            <div class="flex flex-col sm:flex-row items-center justify-between gap-3">
              <h2 class="font-bold text-slate-900 text-sm flex items-center gap-2">
                <mat-icon class="text-emerald-600 text-base">receipt</mat-icon>
                Udhar Credit & Recovery Entries (ادھار وصولی کھاتہ)
              </h2>

              <div class="flex items-center gap-2 w-full sm:w-auto">
                <input 
                  type="text"
                  [(ngModel)]="searchUdharQuery"
                  placeholder="Search customer name..."
                  class="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500 flex-1"
                />

                <button 
                  (click)="exportUdharCsv()"
                  class="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer text-nowrap">
                  <mat-icon class="text-sm">download</mat-icon> Export CSV
                </button>

                <button 
                  (click)="triggerPrintReport('udhar')"
                  class="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer text-nowrap">
                  <mat-icon class="text-sm">print</mat-icon> Print Ledger
                </button>
              </div>
            </div>

            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs">
                <thead class="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200">
                  <tr>
                    <th class="py-2.5 px-3">Date & Time</th>
                    <th class="py-2.5 px-3">Customer Name</th>
                    <th class="py-2.5 px-3">Type</th>
                    <th class="py-2.5 px-3">Amount</th>
                    <th class="py-2.5 px-3">Notes</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 font-medium text-slate-800">
                  @for (entry of filteredUdharEntries(); track entry.id) {
                    <tr class="hover:bg-slate-50">
                      <td class="py-2.5 px-3 text-slate-500 text-[11px] font-mono">
                        {{ entry.date | date:'dd-MMM-yyyy hh:mm a' }}
                      </td>
                      <td class="py-2.5 px-3 font-bold text-slate-900">
                        {{ getCustomerNameById(entry.customerId) }}
                      </td>
                      <td class="py-2.5 px-3">
                        <span 
                          class="px-2.5 py-1 rounded-full font-extrabold text-[10px] uppercase flex items-center gap-1 w-max"
                          [ngClass]="entry.type === 'diya' ? 'bg-rose-100 text-rose-800 border border-rose-300' : 'bg-emerald-100 text-emerald-800 border border-emerald-300'">
                          <mat-icon class="text-xs">{{ entry.type === 'diya' ? 'north_east' : 'south_west' }}</mat-icon>
                          <span>{{ entry.type === 'diya' ? 'Udhar Diya (Give)' : 'Payment Vasool (Got)' }}</span>
                        </span>
                      </td>
                      <td class="py-2.5 px-3 font-extrabold text-sm" [ngClass]="entry.type === 'diya' ? 'text-rose-600' : 'text-emerald-600'">
                        {{ entry.type === 'diya' ? '+' : '-' }} Rs. {{ entry.amount | number:'1.0-0' }}
                      </td>
                      <td class="py-2.5 px-3 text-slate-500 text-[11px]">
                        {{ entry.notes || '-' }}
                      </td>
                    </tr>
                  } @empty {
                    <tr>
                      <td colspan="6" class="py-8 text-center text-slate-400">No Udhar recovery entries recorded for this timeframe.</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>

        </div>
      }

      <!-- ==================== TAB 3: ITEM-WISE SALES REPORT ==================== -->
      @if (activeTab() === 'items') {
        <div class="space-y-6 animate-fade-in no-print">
          
          <div class="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden p-5 space-y-4">
            <div class="flex flex-col sm:flex-row items-center justify-between gap-3">
              <h2 class="font-bold text-slate-900 text-sm flex items-center gap-2">
                <mat-icon class="text-emerald-600 text-base">inventory_2</mat-icon>
                Item-wise Sales Breakdown (آئٹم وائز سیلز)
              </h2>

              <div class="flex items-center gap-2 w-full sm:w-auto">
                <input 
                  type="text"
                  [(ngModel)]="searchItemQuery"
                  placeholder="Search item name or category..."
                  class="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500 flex-1"
                />

                <button 
                  (click)="exportItemSalesCsv()"
                  class="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer text-nowrap">
                  <mat-icon class="text-sm">download</mat-icon> Export CSV
                </button>

                <button 
                  (click)="triggerPrintReport('items')"
                  class="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer text-nowrap">
                  <mat-icon class="text-sm">print</mat-icon> Print Statement
                </button>
              </div>
            </div>

            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs">
                <thead class="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200">
                  <tr>
                    <th class="py-2.5 px-3">Product Name</th>
                    <th class="py-2.5 px-3">Category</th>
                    <th class="py-2.5 px-3 text-right">Qty Sold</th>
                    <th class="py-2.5 px-3 text-right">Revenue (فروخت)</th>
                    <th class="py-2.5 px-3 text-right">Cost Price</th>
                    <th class="py-2.5 px-3 text-right">Est. Net Profit</th>
                    <th class="py-2.5 px-3 text-right">Margin %</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 font-medium text-slate-800">
                  @for (item of searchedItemSales(); track item.id) {
                    <tr class="hover:bg-slate-50">
                      <td class="py-2.5 px-3">
                        <span class="font-bold text-slate-900 block">{{ item.nameEn }}</span>
                        <span class="text-[10px] text-slate-500 block">{{ item.nameUr }}</span>
                      </td>
                      <td class="py-2.5 px-3 text-slate-500 font-semibold">{{ item.category }}</td>
                      <td class="py-2.5 px-3 text-right font-extrabold text-slate-900">
                        {{ item.qtySold }} {{ item.unit }}
                      </td>
                      <td class="py-2.5 px-3 text-right font-extrabold text-slate-900">
                        Rs. {{ item.totalRevenue | number:'1.0-0' }}
                      </td>
                      <td class="py-2.5 px-3 text-right text-slate-500 font-mono">
                        Rs. {{ item.totalCost | number:'1.0-0' }}
                      </td>
                      <td class="py-2.5 px-3 text-right font-extrabold text-emerald-700">
                        Rs. {{ item.profit | number:'1.0-0' }}
                      </td>
                      <td class="py-2.5 px-3 text-right font-bold text-emerald-800">
                        {{ item.marginPercent }}%
                      </td>
                    </tr>
                  } @empty {
                    <tr>
                      <td colspan="7" class="py-8 text-center text-slate-400">No item-wise sales recorded for this timeframe.</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>

        </div>
      }

    </div>

    <!-- VIEW RECEIPT MODAL -->
    <app-receipt-modal 
      [transaction]="selectedTxForReceipt()"
      (closeModal)="selectedTxForReceipt.set(null)">
    </app-receipt-modal>

    <!-- PRINTABLE REPORT DOCUMENT (PRINT STYLING TARGET #printable-report) -->
    <div id="printable-report" class="hidden print:block space-y-4">
      <div class="border-b border-black pb-3 text-center space-y-1">
        <h1 class="text-xl font-bold uppercase">{{ storeService.config().storeName }}</h1>
        <p class="text-xs">{{ storeService.config().address }} | Tel: {{ storeService.config().phone }}</p>
        <p class="text-xs font-bold uppercase tracking-wider pt-1">
          OFFICIAL REPORT STATEMENT ({{ activeTab() === 'sales' ? 'SALES REPORT' : activeTab() === 'udhar' ? 'UDHAR RECOVERY LEDGER' : 'ITEM-WISE SALES' }})
        </p>
        <p class="text-[10px]">Timeframe: {{ timeframe() }} | Date Generated: {{ printDate }}</p>
      </div>

      @if (activeTab() === 'sales') {
        <table class="w-full text-xs border-collapse border border-black">
          <thead>
            <tr class="bg-gray-200 border-b border-black text-left">
              <th class="p-1 border border-black">Invoice #</th>
              <th class="p-1 border border-black">Date</th>
              <th class="p-1 border border-black">Customer</th>
              <th class="p-1 border border-black">Payment</th>
              <th class="p-1 border border-black text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            @for (tx of filteredTransactions(); track tx.id) {
              <tr>
                <td class="p-1 border border-black font-mono">{{ tx.invoiceNo }}</td>
                <td class="p-1 border border-black">{{ tx.timestamp | date:'dd-MMM-yyyy' }}</td>
                <td class="p-1 border border-black">{{ tx.customerName || 'Walk-in' }}</td>
                <td class="p-1 border border-black uppercase">{{ tx.paymentMethod }}</td>
                <td class="p-1 border border-black text-right font-bold">Rs. {{ tx.total }}</td>
              </tr>
            }
          </tbody>
        </table>
      }

      @if (activeTab() === 'udhar') {
        <table class="w-full text-xs border-collapse border border-black">
          <thead>
            <tr class="bg-gray-200 border-b border-black text-left">
              <th class="p-1 border border-black">Date</th>
              <th class="p-1 border border-black">Customer</th>
              <th class="p-1 border border-black">Type</th>
              <th class="p-1 border border-black text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            @for (entry of filteredUdharEntries(); track entry.id) {
              <tr>
                <td class="p-1 border border-black">{{ entry.date | date:'dd-MMM-yyyy' }}</td>
                <td class="p-1 border border-black">{{ getCustomerNameById(entry.customerId) }}</td>
                <td class="p-1 border border-black">{{ entry.type === 'diya' ? 'Udhar Diya' : 'Payment Vasool' }}</td>
                <td class="p-1 border border-black text-right font-bold">Rs. {{ entry.amount }}</td>
              </tr>
            }
          </tbody>
        </table>
      }

      @if (activeTab() === 'items') {
        <table class="w-full text-xs border-collapse border border-black">
          <thead>
            <tr class="bg-gray-200 border-b border-black text-left">
              <th class="p-1 border border-black">Product Name</th>
              <th class="p-1 border border-black">Category</th>
              <th class="p-1 border border-black text-right">Qty Sold</th>
              <th class="p-1 border border-black text-right">Revenue</th>
              <th class="p-1 border border-black text-right">Est. Profit</th>
            </tr>
          </thead>
          <tbody>
            @for (item of itemSalesData(); track item.id) {
              <tr>
                <td class="p-1 border border-black">{{ item.nameEn }}</td>
                <td class="p-1 border border-black">{{ item.category }}</td>
                <td class="p-1 border border-black text-right">{{ item.qtySold }} {{ item.unit }}</td>
                <td class="p-1 border border-black text-right font-bold">Rs. {{ item.totalRevenue }}</td>
                <td class="p-1 border border-black text-right font-bold">Rs. {{ item.profit }}</td>
              </tr>
            }
          </tbody>
        </table>
      }

      <div class="text-right text-xs pt-4">
        Printed by {{ storeService.config().storeName }} POS System | JazakAllah Khair
      </div>
    </div>
  `
})
export class ReportsComponent {
  storeService = inject(StoreService);

  activeTab = signal<ReportTab>('sales');
  timeframe = signal<ReportTimeframe>('today');
  selectedTxForReceipt = signal<Transaction | null>(null);

  searchTxQuery = '';
  searchUdharQuery = '';
  searchItemQuery = '';

  printDate = new Date().toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' });

  // Filtered transactions based on timeframe
  filteredTransactions = computed(() => {
    const tf = this.timeframe();
    const txs = this.storeService.transactions();
    const now = Date.now();

    if (tf === 'today') {
      const startOfDay = new Date().setHours(0,0,0,0);
      return txs.filter(t => t.timestamp >= startOfDay);
    }
    if (tf === '7days') {
      const cut = now - 7 * 24 * 3600 * 1000;
      return txs.filter(t => t.timestamp >= cut);
    }
    if (tf === '30days') {
      const cut = now - 30 * 24 * 3600 * 1000;
      return txs.filter(t => t.timestamp >= cut);
    }
    return txs;
  });

  searchedSalesTransactions = computed(() => {
    const q = this.searchTxQuery.trim().toLowerCase();
    const txs = this.filteredTransactions();
    if (!q) return txs;
    return txs.filter(t => 
      t.invoiceNo.toLowerCase().includes(q) ||
      (t.customerName && t.customerName.toLowerCase().includes(q))
    );
  });

  filteredTxCount = computed(() => this.filteredTransactions().length);

  totalSales = computed(() => {
    return this.filteredTransactions().reduce((acc, t) => acc + t.total, 0);
  });

  cashSales = computed(() => {
    return this.filteredTransactions()
      .filter(t => t.paymentMethod === 'cash')
      .reduce((acc, t) => acc + t.total, 0);
  });

  onlineSales = computed(() => {
    return this.filteredTransactions()
      .filter(t => t.paymentMethod === 'easypaisa' || t.paymentMethod === 'jazzcash' || t.paymentMethod === 'card')
      .reduce((acc, t) => acc + t.total, 0);
  });

  udharSales = computed(() => {
    return this.filteredTransactions()
      .filter(t => t.paymentMethod === 'udhar')
      .reduce((acc, t) => acc + t.total, 0);
  });

  estimatedProfit = computed(() => {
    return this.filteredTransactions().reduce((acc, t) => {
      const cost = t.items.reduce((iAcc, ci) => iAcc + (ci.qty * ci.item.purchasePrice), 0);
      return acc + (t.total - cost);
    }, 0);
  });

  profitMarginPercent = computed(() => {
    const sales = this.totalSales();
    if (sales === 0) return '0';
    const profit = this.estimatedProfit();
    return ((profit / sales) * 100).toFixed(1);
  });

  topSellingItems = computed(() => {
    const map = new Map<string, { name: string; totalQty: number; totalRevenue: number; unit: string }>();

    this.filteredTransactions().forEach(t => {
      t.items.forEach(ci => {
        const key = ci.item.id;
        const existing = map.get(key) || { name: ci.item.nameEn, totalQty: 0, totalRevenue: 0, unit: ci.item.unit };
        map.set(key, {
          name: ci.item.nameEn,
          totalQty: existing.totalQty + ci.qty,
          totalRevenue: existing.totalRevenue + ci.subtotal,
          unit: ci.item.unit
        });
      });
    });

    const list = Array.from(map.values()).sort((a, b) => b.totalRevenue - a.totalRevenue).slice(0, 5);
    const maxRev = list[0]?.totalRevenue || 1;

    return list.map(item => ({
      ...item,
      barPercent: Math.min(100, Math.max(10, (item.totalRevenue / maxRev) * 100))
    }));
  });

  // Udhar Entries computed for selected timeframe
  filteredUdharEntries = computed(() => {
    const tf = this.timeframe();
    const entries = this.storeService.udharEntries();
    const now = Date.now();

    let list = entries;
    if (tf === 'today') {
      const startOfDay = new Date().setHours(0,0,0,0);
      list = entries.filter(e => e.date >= startOfDay);
    } else if (tf === '7days') {
      const cut = now - 7 * 24 * 3600 * 1000;
      list = entries.filter(e => e.date >= cut);
    } else if (tf === '30days') {
      const cut = now - 30 * 24 * 3600 * 1000;
      list = entries.filter(e => e.date >= cut);
    }

    const q = this.searchUdharQuery.trim().toLowerCase();
    if (!q) return list;

    return list.filter(e => {
      const cName = this.getCustomerNameById(e.customerId).toLowerCase();
      return cName.includes(q) || (e.notes && e.notes.toLowerCase().includes(q));
    });
  });

  periodUdharGiven = computed(() => {
    return this.filteredUdharEntries()
      .filter(e => e.type === 'diya')
      .reduce((acc, e) => acc + e.amount, 0);
  });

  periodUdharVasool = computed(() => {
    return this.filteredUdharEntries()
      .filter(e => e.type === 'liya')
      .reduce((acc, e) => acc + e.amount, 0);
  });

  // Item Sales Computed Data
  itemSalesData = computed(() => {
    const map = new Map<string, { id: string; nameEn: string; nameUr: string; category: string; unit: string; qtySold: number; totalRevenue: number; totalCost: number }>();

    this.filteredTransactions().forEach(t => {
      t.items.forEach(ci => {
        const key = ci.item.id;
        const existing = map.get(key) || {
          id: ci.item.id,
          nameEn: ci.item.nameEn,
          nameUr: ci.item.nameUr,
          category: ci.item.category,
          unit: ci.item.unit,
          qtySold: 0,
          totalRevenue: 0,
          totalCost: 0
        };

        map.set(key, {
          ...existing,
          qtySold: existing.qtySold + ci.qty,
          totalRevenue: existing.totalRevenue + ci.subtotal,
          totalCost: existing.totalCost + (ci.qty * ci.item.purchasePrice)
        });
      });
    });

    return Array.from(map.values()).map(item => {
      const profit = item.totalRevenue - item.totalCost;
      const marginPercent = item.totalRevenue > 0 ? ((profit / item.totalRevenue) * 100).toFixed(1) : '0';
      return {
        ...item,
        profit,
        marginPercent
      };
    }).sort((a, b) => b.totalRevenue - a.totalRevenue);
  });

  searchedItemSales = computed(() => {
    const q = this.searchItemQuery.trim().toLowerCase();
    const list = this.itemSalesData();
    if (!q) return list;
    return list.filter(i => 
      i.nameEn.toLowerCase().includes(q) ||
      i.nameUr.toLowerCase().includes(q) ||
      i.category.toLowerCase().includes(q)
    );
  });

  getCustomerNameById(custKey: string): string {
    const cust = this.storeService.customers().find(c => c.id === custKey || c.phone === custKey);
    return cust ? cust.name : custKey;
  }

  // --- CSV EXPORTS ---
  exportSalesCsv() {
    const txs = this.searchedSalesTransactions();
    if (txs.length === 0) return;

    let csv = 'InvoiceNo,Date,Customer,PaymentMethod,Total,Discount\n';
    txs.forEach(t => {
      const d = new Date(t.timestamp).toISOString();
      const cust = (t.customerName || 'Walk-in').replace(/,/g, '');
      csv += `${t.invoiceNo},${d},${cust},${t.paymentMethod},${t.total},${t.discount}\n`;
    });

    this.downloadCsvFile(csv, `kirana-sales-report-${Date.now()}.csv`);
  }

  exportUdharCsv() {
    const entries = this.filteredUdharEntries();
    if (entries.length === 0) return;

    let csv = 'Date,Customer,Type,Amount,Notes\n';
    entries.forEach(e => {
      const d = new Date(e.date).toISOString();
      const cust = this.getCustomerNameById(e.customerId).replace(/,/g, '');
      const notes = (e.notes || '').replace(/,/g, ' ');
      const typeStr = e.type === 'diya' ? 'Udhar Diya' : 'Payment Vasool';
      csv += `${d},${cust},${typeStr},${e.amount},${notes}\n`;
    });

    this.downloadCsvFile(csv, `kirana-udhar-recovery-ledger-${Date.now()}.csv`);
  }

  exportItemSalesCsv() {
    const items = this.searchedItemSales();
    if (items.length === 0) return;

    let csv = 'ProductName,Category,QtySold,Unit,TotalRevenue,TotalCost,NetProfit,MarginPercent\n';
    items.forEach(i => {
      const name = i.nameEn.replace(/,/g, '');
      csv += `${name},${i.category},${i.qtySold},${i.unit},${i.totalRevenue},${i.totalCost},${i.profit},${i.marginPercent}%\n`;
    });

    this.downloadCsvFile(csv, `kirana-item-wise-sales-${Date.now()}.csv`);
  }

  private downloadCsvFile(content: string, filename: string) {
    const blob = new Blob([content], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  triggerPrintReport(tab: ReportTab) {
    this.activeTab.set(tab);
    setTimeout(() => {
      window.print();
    }, 200);
  }
}
