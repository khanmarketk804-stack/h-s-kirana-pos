import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { StoreService } from '../services/store.service';
import { Customer, Transaction } from '../models/store.models';

@Component({
  selector: 'app-digikhata',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      <!-- Top Stats Bar for DigiKhata Ledger -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        <!-- Total Market Udhar Card -->
        <div class="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950 dark:text-red-300 text-red-700 flex items-center justify-center font-bold shadow-xs">
              <mat-icon class="text-xl">account_balance_wallet</mat-icon>
            </div>
            <div>
              <span class="text-xs text-slate-500 dark:text-slate-400 font-medium">Kul Market Udhar (کُل ادھار)</span>
              <div class="text-xl font-extrabold text-red-600 dark:text-red-400">
                Rs. {{ storeService.totalMarketUdhar() | number:'1.0-0' }}
              </div>
            </div>
          </div>
          <span class="text-xs font-bold px-2.5 py-1 rounded-full bg-red-50 dark:bg-red-950/80 dark:text-red-300 text-red-700 border border-red-200 dark:border-red-800">
            {{ totalDebtorsCount() }} Musteri
          </span>
        </div>

        <!-- Over Limit Warning Count -->
        <div class="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 flex items-center justify-center font-bold shadow-xs">
              <mat-icon class="text-xl">warning</mat-icon>
            </div>
            <div>
              <span class="text-xs text-slate-500 dark:text-slate-400 font-medium">Limit Exceeded (لمٹ سے زائد)</span>
              <div class="text-xl font-extrabold text-amber-600 dark:text-amber-400">
                {{ overLimitCount() }} Musteri
              </div>
            </div>
          </div>
          <span class="text-[11px] font-bold text-amber-700 dark:text-amber-400">
            Credit Alert
          </span>
        </div>

        <!-- Total Customers Count -->
        <div class="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold shadow-xs">
            <mat-icon class="text-xl">people</mat-icon>
          </div>
          <div>
            <span class="text-xs text-slate-500 dark:text-slate-400 font-medium">Kul Customer List</span>
            <div class="text-xl font-extrabold text-slate-900 dark:text-slate-100">
              {{ storeService.customers().length }} Customers
            </div>
          </div>
        </div>

        <!-- New Customer Quick Trigger -->
        <div class="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold shadow-xs">
              <mat-icon class="text-xl">mark_email_read</mat-icon>
            </div>
            <div>
              <span class="text-xs text-slate-500 dark:text-slate-400 font-medium">WhatsApp Receipts</span>
              <div class="text-sm font-extrabold text-teal-800 dark:text-teal-300">
                Auto +92 Format
              </div>
            </div>
          </div>
          <button 
            type="button"
            (click)="openAddCustomerModal()"
            class="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-950/20 flex items-center gap-1 transition-all cursor-pointer active:scale-95">
            <mat-icon class="text-sm">person_add</mat-icon> Naya Musteri
          </button>
        </div>

      </div>

      <!-- MONTHLY AUTO REMINDER BANNER (1st to 10th of every month) -->
      <div class="p-4 rounded-3xl border shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
           [ngClass]="isMonthlyPeriod() ? 'bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 text-white border-emerald-500/50 ring-1 ring-emerald-500/30' : 'bg-slate-900 text-slate-100 border-slate-800'">
        
        <div class="flex items-start gap-3">
          <div class="w-11 h-11 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-xl shrink-0 border border-emerald-500/30 shadow-inner">
            🗓️
          </div>
          <div class="space-y-1">
            <div class="flex flex-wrap items-center gap-2">
              <h3 class="font-black text-sm tracking-tight text-white flex items-center gap-2">
                <span>MONTHLY AUTO REMINDER PERIOD (1st to 10th of Month)</span>
              </h3>
              @if (isMonthlyPeriod()) {
                <span class="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-black uppercase tracking-wider animate-pulse flex items-center gap-1">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  Active Period Today
                </span>
              } @else {
                <span class="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px] font-bold">
                  Standard Days (1st–10th Active)
                </span>
              }
            </div>
            <p class="text-xs text-slate-300 font-medium">
              Automated monthly statement collection window. Send pre-formatted monthly ledger statements and payment reminders to all outstanding debtors on WhatsApp.
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2 shrink-0">
          <button 
            type="button"
            (click)="triggerMonthlyBatchReminders()"
            class="px-4 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-md transition-all cursor-pointer active:scale-95 flex items-center gap-1.5 whitespace-nowrap">
            <mat-icon class="text-base">send</mat-icon>
            Send Monthly Statements ({{ totalDebtorsCount() }} Debtors)
          </button>
        </div>
      </div>

      <!-- Main Section: Left Customer Directory + Right Customer Ledger Details -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        <!-- CUSTOMER DIRECTORY LIST (5 Cols) -->
        <div class="lg:col-span-5 space-y-4">
          
          <div class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs p-4 space-y-3">
            
            <div class="flex items-center justify-between">
              <h2 class="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
                <mat-icon class="text-emerald-600 dark:text-emerald-400 text-base">menu_book</mat-icon>
                Khata Directory (گاہکوں کی فہرست)
              </h2>

              <button 
                type="button"
                (click)="openAddCustomerModal()"
                class="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-bold flex items-center gap-0.5 cursor-pointer">
                <mat-icon class="text-sm">add</mat-icon> New
              </button>
            </div>

            <!-- Customer Search Input -->
            <div class="relative">
              <mat-icon class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-base">search</mat-icon>
              <input 
                type="text" 
                [ngModel]="customerSearch()"
                (ngModelChange)="customerSearch.set($event)"
                placeholder="Search name, +92 phone, address..." 
                class="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100"
              />
            </div>

            <!-- Filter Tabs: All vs Owes Money vs Over Limit -->
            <div class="grid grid-cols-3 gap-1.5 text-[11px] font-bold pt-1">
              <button 
                type="button"
                (click)="customerFilter.set('ALL')"
                class="py-1.5 rounded-xl border text-center transition-all cursor-pointer"
                [ngClass]="customerFilter() === 'ALL' ? 'bg-slate-900 text-white border-slate-900 shadow-xs' : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'">
                All (تمام)
              </button>

              <button 
                type="button"
                (click)="customerFilter.set('UDHAR_ONLY')"
                class="py-1.5 rounded-xl border text-center transition-all cursor-pointer"
                [ngClass]="customerFilter() === 'UDHAR_ONLY' ? 'bg-red-600 text-white border-red-600 shadow-xs' : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'">
                Owes Udhar
              </button>

              <button 
                type="button"
                (click)="customerFilter.set('OVER_LIMIT')"
                class="py-1.5 rounded-xl border text-center transition-all cursor-pointer"
                [ngClass]="customerFilter() === 'OVER_LIMIT' ? 'bg-amber-600 text-white border-amber-600 shadow-xs' : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'">
                Over Limit
              </button>
            </div>

            <!-- Customer List Cards -->
            <div class="space-y-2 max-h-[520px] overflow-y-auto pr-1 pt-1">
              @for (c of filteredCustomers(); track c.id) {
                @let limit = c.creditLimit || 10000;
                @let isExceeded = c.totalUdhar > limit;

                <button 
                  type="button"
                  (click)="selectedCustomer.set(c)"
                  class="p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-2 text-left w-full relative"
                  [ngClass]="selectedCustomer()?.id === c.id ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 shadow-sm ring-1 ring-emerald-500/30' : 'bg-white dark:bg-slate-800 border-slate-200/80 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'">
                  
                  <div class="flex items-center gap-3">
                    <div 
                      class="w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm shadow-xs"
                      [ngClass]="isExceeded ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300' : (c.totalUdhar > 0 ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300')">
                      {{ c.name.charAt(0).toUpperCase() }}
                    </div>

                    <div>
                      <div class="flex items-center gap-1.5">
                        <h4 class="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm leading-tight">{{ c.name }}</h4>
                        @if (isExceeded) {
                          <span class="px-1.5 py-0.2 rounded text-[9px] font-black bg-amber-500 text-white uppercase tracking-wider" title="Credit limit exceeded">
                            ⚠️ Over Limit
                          </span>
                        }
                      </div>
                      <p class="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                        📱 {{ storeService.formatDisplayPhone(c.phone) }}
                      </p>
                      @if (c.address) {
                        <p class="text-[10px] text-slate-400 dark:text-slate-500 truncate max-w-[140px]">📍 {{ c.address }}</p>
                      }
                    </div>
                  </div>

                  <div class="text-right flex flex-col items-end">
                    <span class="text-[10px] text-slate-400 block font-medium">Udhar Balance:</span>
                    <span 
                      class="font-extrabold text-sm block"
                      [ngClass]="isExceeded ? 'text-amber-600 dark:text-amber-400 font-black' : (c.totalUdhar > 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-700 dark:text-emerald-400')">
                      Rs. {{ c.totalUdhar | number:'1.0-0' }}
                    </span>
                    <div class="flex items-center gap-1 mt-0.5">
                      <span class="text-[9px] text-slate-400 block font-medium">
                        Limit: Rs. {{ limit | number:'1.0-0' }}
                      </span>
                      @if (isMonthlyPeriod() && c.totalUdhar > 0) {
                        <button 
                          type="button"
                          (click)="$event.stopPropagation(); sendDirectWhatsAppMonthlyReminder(c)"
                          title="1st–10th Monthly WhatsApp Reminder"
                          class="p-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-950 dark:hover:bg-emerald-900 text-emerald-800 dark:text-emerald-200 transition-colors cursor-pointer flex items-center justify-center">
                          <mat-icon class="text-xs">notifications_active</mat-icon>
                        </button>
                      }
                      @if (isExceeded) {
                        <button 
                          type="button"
                          (click)="$event.stopPropagation(); openWhatsAppOverLimitModal(c)"
                          title="Trigger Over-Limit WhatsApp Payment Demand"
                          class="p-1 rounded-lg bg-amber-100 hover:bg-amber-200 dark:bg-amber-950 dark:hover:bg-amber-900 text-amber-800 dark:text-amber-200 transition-colors cursor-pointer flex items-center justify-center">
                          <mat-icon class="text-xs">chat</mat-icon>
                        </button>
                      }
                    </div>
                  </div>

                </button>
              } @empty {
                <div class="py-8 text-center text-slate-400">
                  <mat-icon class="text-3xl text-slate-300">person_off</mat-icon>
                  <p class="text-xs font-bold mt-1">No customers found</p>
                </div>
              }
            </div>

          </div>

        </div>

        <!-- CUSTOMER LEDGER STATEMENT DETAIL & CRM PROFILE (7 Cols) -->
        <div class="lg:col-span-7 space-y-4">
          
          @if (selectedCustomer(); as activeCust) {
            @let activeLimit = activeCust.creditLimit || 10000;
            @let isCustExceeded = activeCust.totalUdhar > activeLimit;
            @let limitPercent = Math.min(100, Math.round((activeCust.totalUdhar / activeLimit) * 100));

            <div class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs p-5 space-y-4 text-slate-900 dark:text-slate-100">
              
              <!-- Customer Profile Header Card -->
              <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
                
                <div class="space-y-1">
                  <div class="flex items-center gap-2 flex-wrap">
                    <h2 class="font-black text-slate-900 dark:text-slate-100 text-lg sm:text-xl">{{ activeCust.name }}</h2>
                    <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold"
                          [ngClass]="isCustExceeded ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 border border-amber-300' : (activeCust.totalUdhar > 0 ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300')">
                      {{ isCustExceeded ? '⚠️ Limit Exceeded' : (activeCust.totalUdhar > 0 ? 'Udhar Active' : 'Clear / Advance') }}
                    </span>
                    <button 
                      type="button"
                      (click)="openEditCustomerModal(activeCust)"
                      class="text-[11px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center gap-1 cursor-pointer transition-all">
                      <mat-icon class="text-xs">edit</mat-icon> Edit Profile
                    </button>
                  </div>

                  <p class="text-xs text-slate-600 dark:text-slate-300 font-medium">
                    📱 WhatsApp: <strong class="text-emerald-700 dark:text-emerald-400 font-mono">{{ storeService.formatDisplayPhone(activeCust.phone) }}</strong>
                    @if (activeCust.address) {
                      • 📍 {{ activeCust.address }}
                    }
                  </p>
                  @if (activeCust.notes) {
                    <p class="text-[11px] text-slate-400 dark:text-slate-400 italic">📝 Note: {{ activeCust.notes }}</p>
                  }
                </div>

                <!-- Total Balance & Credit Limit Card -->
                <div class="p-3 bg-slate-900 dark:bg-slate-950 text-white rounded-2xl text-right shadow-md border border-slate-800 space-y-1 min-w-[170px]">
                  <span class="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Total Udhar Balance</span>
                  <span 
                    class="text-xl font-black block"
                    [ngClass]="isCustExceeded ? 'text-amber-400' : 'text-red-400'">
                    Rs. {{ activeCust.totalUdhar | number:'1.0-0' }}
                  </span>
                  <div class="pt-1 border-t border-slate-800 flex justify-between items-center text-[10px] text-slate-400">
                    <span>Credit Limit:</span>
                    <span class="font-bold text-slate-200">Rs. {{ activeLimit | number:'1.0-0' }}</span>
                  </div>
                </div>

              </div>

              <!-- CREDIT LIMIT WARNING BANNER & PROGRESS BAR -->
              <div class="p-3.5 rounded-2xl border transition-all space-y-2"
                   [ngClass]="isCustExceeded ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-300 dark:border-amber-800 text-amber-950 dark:text-amber-200' : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'">
                
                <div class="flex items-center justify-between text-xs font-bold">
                  <span class="flex items-center gap-1.5">
                    <mat-icon class="text-sm" [ngClass]="isCustExceeded ? 'text-amber-600' : 'text-emerald-600'">
                      {{ isCustExceeded ? 'warning' : 'verified_user' }}
                    </mat-icon>
                    <span>Credit Limit Usage (ادھار لمٹ کی فیصد):</span>
                  </span>
                  <span>{{ limitPercent }}% Used</span>
                </div>

                <!-- Progress Bar -->
                <div class="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                  <div 
                    class="h-full transition-all duration-500 rounded-full"
                    [style.width.%]="limitPercent"
                    [ngClass]="isCustExceeded ? 'bg-amber-500' : (limitPercent > 75 ? 'bg-orange-500' : 'bg-emerald-500')">
                  </div>
                </div>

                @if (isCustExceeded) {
                  <div class="text-xs font-bold text-amber-900 dark:text-amber-300 flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-amber-200 dark:border-amber-800/60 mt-1">
                    <span class="flex items-center gap-1">
                      <span>⚠️ Udhar limit (Rs. {{ activeLimit | number:'1.0-0' }}) exceeded by</span>
                      <strong class="text-amber-700 dark:text-amber-400 font-extrabold">Rs. {{ (activeCust.totalUdhar - activeLimit) | number:'1.0-0' }}</strong>
                    </span>
                    <button 
                      type="button"
                      (click)="openWhatsAppOverLimitModal(activeCust)"
                      class="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 whitespace-nowrap">
                      <mat-icon class="text-sm">send</mat-icon>
                      Send Over-Limit WhatsApp Notice (واٹس ایپ نوٹس)
                    </button>
                  </div>
                }
              </div>

              <!-- PROMINENT AUTOMATED MONTHLY REMINDER ALERT BANNER (1st to 10th of Month) -->
              @if (isMonthlyPeriod() && activeCust.totalUdhar > 0) {
                <div class="p-4 rounded-2xl bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-950 text-white border-2 border-emerald-400/80 shadow-lg ring-2 ring-emerald-500/30 space-y-3 animate-fade-in">
                  
                  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-500/30 pb-2.5">
                    <div class="flex items-center gap-2">
                      <span class="px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-black uppercase tracking-wider animate-pulse flex items-center gap-1">
                        <span class="w-1.5 h-1.5 rounded-full bg-slate-950"></span>
                        Auto-Detected Monthly Window (1st–10th)
                      </span>
                      <span class="text-xs font-bold text-emerald-300 flex items-center gap-1">
                        <mat-icon class="text-sm text-emerald-400">notifications_active</mat-icon>
                        {{ currentMonthName() }} Payment Alert
                      </span>
                    </div>
                    <span class="text-xs font-mono font-black text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-xl border border-emerald-500/40">
                      Balance: Rs. {{ activeCust.totalUdhar | number:'1.0-0' }}
                    </span>
                  </div>

                  <!-- Exact Prompt Requested Message Card -->
                  <div class="p-3 rounded-xl bg-slate-950/90 border border-emerald-500/40 text-emerald-200 font-mono text-xs leading-relaxed shadow-inner selection:bg-emerald-800">
                    "{{ storeService.getExactMonthlyUrduReminderText(activeCust) }}"
                  </div>

                  <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-1">
                    <p class="text-[11px] text-emerald-200/80 leading-snug">
                      Current day is between 1st & 10th. Click below to send 1-click WhatsApp payment request immediately.
                    </p>

                    <button 
                      type="button"
                      (click)="sendDirectWhatsAppMonthlyReminder(activeCust)"
                      class="py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-md shadow-emerald-950/50 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 whitespace-nowrap">
                      <mat-icon class="text-base">send</mat-icon>
                      Send WhatsApp Reminder
                    </button>
                  </div>

                </div>
              }

              <!-- Quick Action Toolbar for Customer -->
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-bold">
                
                <button 
                  type="button"
                  (click)="openAddEntryModal('diya')"
                  class="py-3 px-2 rounded-2xl bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-900/20 flex items-center justify-center gap-1 transition-all cursor-pointer active:scale-95">
                  <mat-icon class="text-base">add_circle_outline</mat-icon>
                  Udhar Diya (مال)
                </button>

                <button 
                  type="button"
                  (click)="openReceivePaymentModal(activeCust)"
                  class="py-3 px-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md shadow-emerald-950/20 flex items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer">
                  <mat-icon class="text-base">download_done</mat-icon> 
                  Udhar Wusooli
                </button>

                <button 
                  type="button"
                  (click)="openWhatsAppReminderModal(activeCust, 'statement')"
                  title="Send complete ledger breakdown to customer via WhatsApp message"
                  class="py-3 px-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md shadow-indigo-950/20 flex items-center justify-center gap-1 transition-all cursor-pointer active:scale-95">
                  <mat-icon class="text-base">receipt_long</mat-icon>
                  1-Click Statement
                </button>

                <button 
                  type="button"
                  (click)="openWhatsAppReminderModal(activeCust, 'monthly')"
                  title="Send monthly account summary and payment request"
                  class="py-3 px-2 rounded-2xl bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-slate-800 shadow-md flex items-center justify-center gap-1 transition-all cursor-pointer active:scale-95">
                  <mat-icon class="text-base">date_range</mat-icon>
                  Monthly Reminder
                </button>

              </div>

              <!-- Ledger Summary Bar & Filter Tabs -->
              <div class="space-y-3 pt-2">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                  <div class="flex items-center gap-2">
                    <div class="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold">
                      <mat-icon class="text-base">receipt_long</mat-icon>
                    </div>
                    <div>
                      <h3 class="font-extrabold text-slate-900 dark:text-slate-100 text-xs">
                        Transaction History & Detailed Ledger (کھاتہ تفاصیل)
                      </h3>
                      <p class="text-[10px] text-slate-500 dark:text-slate-400">Complete record of every past bill, POS invoice, and payment received</p>
                    </div>
                  </div>

                  <!-- Ledger Filter Tabs -->
                  <div class="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-[11px] font-bold">
                    <button 
                      type="button"
                      (click)="ledgerTab.set('ALL')"
                      class="px-2.5 py-1 rounded-lg transition-all cursor-pointer"
                      [ngClass]="ledgerTab() === 'ALL' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'">
                      All Activity (کل)
                    </button>
                    <button 
                      type="button"
                      (click)="ledgerTab.set('INVOICE')"
                      class="px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1"
                      [ngClass]="ledgerTab() === 'INVOICE' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'">
                      <span>📄 Bills & Invoices</span>
                      <span class="px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-600 text-[9px]">{{ activeCustomerTotalBillsCount() }}</span>
                    </button>
                    <button 
                      type="button"
                      (click)="ledgerTab.set('PAYMENT')"
                      class="px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1"
                      [ngClass]="ledgerTab() === 'PAYMENT' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'">
                      <span>🟢 Payments (وصولی)</span>
                    </button>
                  </div>
                </div>

                <!-- Ledger Quick Summary Metrics -->
                <div class="grid grid-cols-3 gap-2 text-center text-xs">
                  <div class="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                    <span class="text-[10px] text-slate-400 block font-bold">Total Invoices/Bills</span>
                    <strong class="text-xs font-black text-slate-800 dark:text-slate-200">
                      {{ activeCustomerTotalBillsCount() }} Bills (Rs. {{ activeCustomerTotalBillsAmount() | number:'1.0-0' }})
                    </strong>
                  </div>
                  <div class="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60">
                    <span class="text-[10px] text-emerald-800 dark:text-emerald-400 block font-bold">Total Payments Received</span>
                    <strong class="text-xs font-black text-emerald-700 dark:text-emerald-300">
                      Rs. {{ activeCustomerTotalPaymentsAmount() | number:'1.0-0' }}
                    </strong>
                  </div>
                  <div class="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60">
                    <span class="text-[10px] text-red-800 dark:text-red-400 block font-bold">Net Pending Balance</span>
                    <strong class="text-xs font-black text-red-600 dark:text-red-400">
                      Rs. {{ activeCust.totalUdhar | number:'1.0-0' }}
                    </strong>
                  </div>
                </div>

                <!-- Detailed Ledger Table -->
                <div class="border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-2xs">
                  <table class="w-full text-left text-xs">
                    <thead class="bg-slate-50 dark:bg-slate-800/90 text-slate-600 dark:text-slate-300 font-bold text-[10px] uppercase border-b border-slate-200 dark:border-slate-700">
                      <tr>
                        <th class="py-2.5 px-3">Date & Time</th>
                        <th class="py-2.5 px-3">Transaction Type</th>
                        <th class="py-2.5 px-3">Details / Items Summary</th>
                        <th class="py-2.5 px-3 text-right">Amount (PKR)</th>
                        <th class="py-2.5 px-3 text-center">Receipt</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-800 dark:text-slate-200">
                      @for (item of activeCustomerUnifiedLedger(); track item.id) {
                        <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                          <td class="py-2.5 px-3 text-slate-500 dark:text-slate-400 text-[11px] whitespace-nowrap">
                            {{ item.date | date:'dd-MMM-yyyy' }}
                            <span class="block text-[9px] text-slate-400">{{ item.date | date:'hh:mm a' }}</span>
                          </td>
                          <td class="py-2.5 px-3">
                            @if (item.type === 'diya') {
                              <span class="px-2 py-0.5 rounded-full font-bold text-[10px] bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300 inline-flex items-center gap-1">
                                <span class="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                                {{ item.kind === 'INVOICE' ? 'Bill / Udhar Sale' : 'Udhar Diya (دیا)' }}
                              </span>
                            } @else if (item.type === 'liya') {
                              <span class="px-2 py-0.5 rounded-full font-bold text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 inline-flex items-center gap-1">
                                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                Payment Received (وصولی)
                              </span>
                            } @else {
                              <span class="px-2 py-0.5 rounded-full font-bold text-[10px] bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 inline-flex items-center gap-1">
                                <span class="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                Fully Paid Bill (پورا ادا)
                              </span>
                            }
                            @if (item.invoiceNo) {
                              <span class="text-[10px] font-mono text-slate-400 block font-bold mt-0.5">#{{ item.invoiceNo }}</span>
                            }
                          </td>
                          <td class="py-2.5 px-3 text-slate-700 dark:text-slate-300 max-w-xs">
                            <span class="font-medium text-xs block leading-snug">{{ item.description }}</span>
                            @if (item.paymentMethod) {
                              <span class="text-[10px] font-semibold text-slate-400 uppercase">
                                Mode: {{ item.paymentMethod }}
                              </span>
                            }
                          </td>
                          <td 
                            class="py-2.5 px-3 text-right font-black text-sm whitespace-nowrap"
                            [ngClass]="item.type === 'diya' ? 'text-red-600 dark:text-red-400' : item.type === 'liya' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-800 dark:text-slate-200'">
                            {{ item.type === 'diya' ? '+' : item.type === 'liya' ? '-' : '' }} Rs. {{ item.amount | number:'1.0-0' }}
                          </td>
                          <td class="py-2.5 px-3 text-center whitespace-nowrap">
                            @if (item.transaction) {
                              <button 
                                type="button"
                                (click)="openInvoiceBillModal(item.transaction)"
                                title="View Complete Itemized Bill Receipt"
                                class="px-2.5 py-1 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-bold text-[11px] transition-all cursor-pointer flex items-center justify-center gap-1 mx-auto">
                                <mat-icon class="text-xs">visibility</mat-icon>
                                View Bill
                              </button>
                            } @else if (item.udharEntry) {
                              <button 
                                type="button"
                                (click)="openWhatsAppReminderModal(activeCust)"
                                title="Share Receipt / Details"
                                class="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer inline-flex items-center justify-center">
                                <mat-icon class="text-xs">share</mat-icon>
                              </button>
                            }
                          </td>
                        </tr>
                      } @empty {
                        <tr>
                          <td colspan="5" class="py-10 text-center text-slate-400">
                            <mat-icon class="text-2xl text-slate-300 dark:text-slate-700 block mb-1 mx-auto">receipt</mat-icon>
                            No records found for this filter tab.
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

          } @else {
            <div class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-12 text-center text-slate-400 space-y-2">
              <mat-icon class="text-4xl text-slate-300">contact_page</mat-icon>
              <h3 class="font-bold text-slate-700 dark:text-slate-300 text-base">Select a Customer to view Khata Ledger</h3>
              <p class="text-xs text-slate-500 dark:text-slate-400">Choose a customer from the left directory to record 'Diya' / 'Liya' or send WhatsApp reminders.</p>
            </div>
          }

        </div>

      </div>

    </div>

    <!-- DEDICATED PAYMENT RECEIVE SCREEN MODAL (رقم وصول کی) -->
    @if (showReceivePaymentModal(); as custToReceive) {
      <div class="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
        <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 text-slate-900 dark:text-slate-100">
          
          <!-- Modal Header -->
          <div class="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-black text-lg shadow-xs">
                💵
              </div>
              <div>
                <h3 class="font-black text-slate-900 dark:text-slate-100 text-base leading-tight">Payment Receive Screen (وصولی رقم)</h3>
                <p class="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                  Record money received to decrease customer pending balance
                </p>
              </div>
            </div>
            <button 
              type="button"
              (click)="showReceivePaymentModal.set(null)" 
              class="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:text-slate-300 transition-colors cursor-pointer">
              <mat-icon class="text-base">close</mat-icon>
            </button>
          </div>

          <!-- Customer Banner -->
          <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex justify-between items-center text-xs">
            <div>
              <span class="font-black text-slate-900 dark:text-slate-100 text-sm block">{{ custToReceive.name }}</span>
              <span class="text-slate-500 dark:text-slate-400 font-mono text-[11px] block">📱 {{ storeService.formatDisplayPhone(custToReceive.phone) }}</span>
            </div>
            <div class="text-right">
              <span class="text-[10px] text-slate-400 block font-bold uppercase">Current Udhar Balance</span>
              <span class="text-base font-black text-red-600 dark:text-red-400">Rs. {{ custToReceive.totalUdhar | number:'1.0-0' }}</span>
            </div>
          </div>

          <!-- Quick Amount Chips -->
          <div>
            <span class="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5">
              Quick Amount Presets (رقم منتخب کریں):
            </span>
            <div class="grid grid-cols-3 gap-2 text-xs font-extrabold">
              <button 
                type="button"
                (click)="receiveAmount = 500" 
                class="py-2 px-2 rounded-xl border bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-800 dark:text-slate-200 transition-all cursor-pointer text-center">
                Rs. 500
              </button>
              <button 
                type="button"
                (click)="receiveAmount = 1000" 
                class="py-2 px-2 rounded-xl border bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-800 dark:text-slate-200 transition-all cursor-pointer text-center">
                Rs. 1,000
              </button>
              <button 
                type="button"
                (click)="receiveAmount = 2000" 
                class="py-2 px-2 rounded-xl border bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-800 dark:text-slate-200 transition-all cursor-pointer text-center">
                Rs. 2,000
              </button>
              <button 
                type="button"
                (click)="receiveAmount = 5000" 
                class="py-2 px-2 rounded-xl border bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-800 dark:text-slate-200 transition-all cursor-pointer text-center">
                Rs. 5,000
              </button>
              <button 
                type="button"
                (click)="receiveAmount = custToReceive.totalUdhar" 
                class="col-span-2 py-2 px-2 rounded-xl border bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 transition-all cursor-pointer text-center font-black">
                Clear Full Balance (Rs. {{ custToReceive.totalUdhar | number:'1.0-0' }})
              </button>
            </div>
          </div>

          <!-- Payment Input & Channel -->
          <div class="space-y-3 text-xs">
            <div>
              <span class="block font-black text-slate-700 dark:text-slate-300 mb-1">
                Amount Received (وصول کی گئی رقم) *
              </span>
              <div class="relative">
                <input 
                  type="number" 
                  [(ngModel)]="receiveAmount"
                  placeholder="0"
                  class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-lg font-black text-emerald-700 dark:text-emerald-400 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                <span class="absolute right-3 top-3 text-sm font-bold text-slate-400 pointer-events-none">PKR</span>
              </div>
            </div>

            <!-- Payment Receiving Method Pills -->
            <div>
              <span class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Payment Channel (طریقہ):</span>
              <div class="grid grid-cols-4 gap-1.5 text-[11px] font-bold">
                <button 
                  type="button"
                  (click)="receiveMethod = 'cash'"
                  class="py-2 rounded-xl border transition-all cursor-pointer text-center"
                  [ngClass]="receiveMethod === 'cash' ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200'">
                  💵 Cash
                </button>
                <button 
                  type="button"
                  (click)="receiveMethod = 'easypaisa'"
                  class="py-2 rounded-xl border transition-all cursor-pointer text-center"
                  [ngClass]="receiveMethod === 'easypaisa' ? 'bg-green-600 text-white border-green-600 shadow-sm' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200'">
                  📲 EasyPaisa
                </button>
                <button 
                  type="button"
                  (click)="receiveMethod = 'jazzcash'"
                  class="py-2 rounded-xl border transition-all cursor-pointer text-center"
                  [ngClass]="receiveMethod === 'jazzcash' ? 'bg-red-600 text-white border-red-600 shadow-sm' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200'">
                  🔴 JazzCash
                </button>
                <button 
                  type="button"
                  (click)="receiveMethod = 'bank'"
                  class="py-2 rounded-xl border transition-all cursor-pointer text-center"
                  [ngClass]="receiveMethod === 'bank' ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200'">
                  🏛️ Bank
                </button>
              </div>
            </div>

            <div>
              <span class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Note / Reference</span>
              <input 
                type="text" 
                [(ngModel)]="receiveNotes"
                placeholder="e.g. Received cash at counter / Online transfer"
                class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <!-- New Remaining Balance Preview Banner -->
          @let newRemaining = Math.max(0, custToReceive.totalUdhar - receiveAmount);
          <div class="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 text-xs flex justify-between items-center font-bold">
            <div>
              <span class="block text-[10px] text-emerald-700 dark:text-emerald-400 uppercase tracking-wider font-extrabold">New Pending Balance</span>
              <span class="text-xs text-slate-600 dark:text-slate-300 font-medium">
                Rs. {{ custToReceive.totalUdhar }} - Rs. {{ receiveAmount }}
              </span>
            </div>
            <span class="text-lg font-black text-emerald-700 dark:text-emerald-300">
              Rs. {{ newRemaining | number:'1.0-0' }}
            </span>
          </div>

          <!-- Action Buttons -->
          <div class="space-y-2 pt-1">
            <button 
              type="button"
              (click)="confirmReceivePayment(true)"
              [disabled]="receiveAmount <= 0"
              class="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-black text-xs rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95">
              <mat-icon class="text-base">chat</mat-icon>
              Record & Send WhatsApp Receipt (وصولی رسید)
            </button>

            <button 
              type="button"
              (click)="confirmReceivePayment(false)"
              [disabled]="receiveAmount <= 0"
              class="w-full py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl transition-all cursor-pointer">
              Record Payment Only
            </button>
          </div>

        </div>
      </div>
    }

    <!-- ADD KHATA ENTRY MODAL ('DIYA' ONLY) -->
    @if (showEntryModal() === 'diya') {
      <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
        <div class="bg-white dark:bg-slate-900 rounded-3xl p-5 max-w-sm w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
          <div class="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <h3 class="font-bold text-slate-900 dark:text-slate-100 text-sm">
              Record Udhar Diya (ادھار دیا)
            </h3>
            <button (click)="showEntryModal.set(null)" class="text-slate-400 hover:text-slate-600">
              <mat-icon class="text-sm">close</mat-icon>
            </button>
          </div>

          <div class="space-y-3 text-xs">
            <div>
              <span class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Customer</span>
              <div class="p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-slate-100">
                {{ selectedCustomer()?.name }}
              </div>
            </div>

            <div>
              <span class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Amount (PKR) *</span>
              <input 
                type="number" 
                [(ngModel)]="entryAmount"
                placeholder="0"
                class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-black text-base text-red-600 dark:text-red-400 focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
            </div>

            <div>
              <span class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Note / Description</span>
              <input 
                type="text" 
                [(ngModel)]="entryNotes"
                placeholder="e.g. Monthly Rashan Bill / Goods provided"
                class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-medium focus:ring-2 focus:ring-red-500 focus:outline-none text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <button 
            type="button"
            (click)="saveUdharEntry()"
            [disabled]="entryAmount <= 0"
            class="w-full py-3.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-black text-xs rounded-2xl shadow-md transition-colors cursor-pointer">
            Save Udhar Record (ادھار درج کریں)
          </button>
        </div>
      </div>
    }

    <!-- WHATSAPP REMINDER & OVER-LIMIT NOTICE MODAL -->
    @if (reminderCustomer(); as remCust) {
      @let remLimit = remCust.creditLimit || 10000;
      @let isRemExceeded = remCust.totalUdhar > remLimit;

      <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
        <div class="bg-white dark:bg-slate-900 rounded-3xl p-5 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 text-slate-900 dark:text-slate-100">
          
          <div class="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-xl flex items-center justify-center font-bold"
                   [ngClass]="activeReminderType() === 'overlimit' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'">
                <mat-icon class="text-base">{{ activeReminderType() === 'overlimit' ? 'warning' : 'chat' }}</mat-icon>
              </div>
              <div>
                <h3 class="font-bold text-slate-900 dark:text-slate-100 text-sm">
                  {{ activeReminderType() === 'overlimit' ? 'Over-Limit Payment Demand Notice' : 'Send WhatsApp Udhar Reminder' }}
                </h3>
                <p class="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Pre-filled WhatsApp message for customer</p>
              </div>
            </div>
            <button (click)="reminderCustomer.set(null)" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
              <mat-icon class="text-sm">close</mat-icon>
            </button>
          </div>

          <div class="space-y-3 text-xs">
            
            <!-- Customer Summary Box -->
            <div class="p-3 rounded-2xl border transition-all"
                 [ngClass]="isRemExceeded ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-800 text-amber-950 dark:text-amber-200' : 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'">
              <div class="flex justify-between items-start">
                <div>
                  <span class="font-bold text-sm block">{{ remCust.name }}</span>
                  <span class="text-xs font-mono">📱 WhatsApp: {{ storeService.formatDisplayPhone(remCust.phone) }}</span>
                </div>
                <div class="text-right">
                  <span class="text-[10px] uppercase font-bold block opacity-80">Udhar Balance</span>
                  <span class="text-sm font-black text-red-600 dark:text-red-400">Rs. {{ remCust.totalUdhar | number:'1.0-0' }}</span>
                </div>
              </div>

              @if (isRemExceeded) {
                <div class="mt-2 pt-1.5 border-t border-amber-200 dark:border-amber-800/60 text-[11px] font-bold flex justify-between items-center text-amber-900 dark:text-amber-300">
                  <span>⚠️ Limit: Rs. {{ remLimit | number:'1.0-0' }}</span>
                  <span class="text-amber-700 dark:text-amber-400 font-black">Exceeded by Rs. {{ (remCust.totalUdhar - remLimit) | number:'1.0-0' }}</span>
                </div>
              }
            </div>

            <!-- Template Type Selector Buttons -->
            <div>
              <span class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Select Message Template (پیغام کی قسم):</span>
              <div class="grid grid-cols-2 gap-2 text-[11px] font-bold">
                <button 
                  type="button"
                  (click)="switchReminderTemplate('statement')"
                  class="py-2 px-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-center gap-1"
                  [ngClass]="activeReminderType() === 'statement' ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'">
                  <span>📄 Full Udhar Statement</span>
                </button>

                <button 
                  type="button"
                  (click)="switchReminderTemplate('monthly')"
                  class="py-2 px-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-center gap-1"
                  [ngClass]="activeReminderType() === 'monthly' ? 'bg-teal-600 text-white border-teal-600 shadow-xs' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'">
                  <span>🗓️ Monthly Reminder (1st-10th)</span>
                </button>

                <button 
                  type="button"
                  (click)="switchReminderTemplate('standard')"
                  class="py-2 px-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-center gap-1"
                  [ngClass]="activeReminderType() === 'standard' ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'">
                  <span>🟢 Standard Udhar Notice</span>
                </button>
                
                <button 
                  type="button"
                  (click)="switchReminderTemplate('overlimit')"
                  class="py-2 px-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-center gap-1"
                  [ngClass]="activeReminderType() === 'overlimit' ? 'bg-amber-600 text-white border-amber-600 shadow-xs' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-amber-700 dark:text-amber-400 hover:bg-amber-50'">
                  <span>⚠️ Over-Limit Demand</span>
                </button>
              </div>
            </div>

            <!-- Message Preview Editor -->
            <div>
              <span class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Edit Pre-Filled Message (پیغام کا جائزہ):</span>
              <textarea 
                rows="7"
                [(ngModel)]="reminderTextPreview"
                class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-900 dark:text-slate-100"
              ></textarea>
            </div>
          </div>

          <button 
            type="button"
            (click)="sendWhatsAppReminderNow()"
            class="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95">
            <mat-icon class="text-base">send</mat-icon>
            Trigger & Launch WhatsApp Chat Now
          </button>
        </div>
      </div>
    }

    <!-- ADD / EDIT CUSTOMER MODAL WITH CREDIT LIMIT & +92 PHONE -->
    @if (showAddCustModal() || editingCustomer()) {
      <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
        <div class="bg-white dark:bg-slate-900 rounded-3xl p-5 max-w-sm w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 text-slate-900 dark:text-slate-100">
          
          <div class="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <h3 class="font-bold text-slate-900 dark:text-slate-100 text-sm">
              {{ editingCustomer() ? 'Edit Customer Profile & Limit' : 'Add New Khata Customer' }}
            </h3>
            <button (click)="closeCustomerModal()" class="text-slate-400 hover:text-slate-600">
              <mat-icon class="text-sm">close</mat-icon>
            </button>
          </div>

          <div class="space-y-3 text-xs">
            <div>
              <span class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Customer Full Name *</span>
              <input 
                type="text" 
                [(ngModel)]="newCustName"
                placeholder="e.g. Malik Usman Farooq"
                class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-medium focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <span class="block font-bold text-slate-700 dark:text-slate-300 mb-1">WhatsApp / Phone Number (+92 Format) *</span>
              <input 
                type="text" 
                [(ngModel)]="newCustPhone"
                placeholder="e.g. 03215551234 or +92 321 5551234"
                class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-mono focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100"
              />
              <span class="text-[10px] text-slate-400 mt-0.5 block">Formats automatically to +92 for direct WhatsApp messaging.</span>
            </div>

            <div>
              <span class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Credit Limit (PKR - ادھار کی حد) *</span>
              <input 
                type="number" 
                [(ngModel)]="newCustCreditLimit"
                step="1000"
                min="500"
                placeholder="10000"
                class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-black text-amber-600 dark:text-amber-400 focus:ring-2 focus:ring-emerald-500"
              />
              <span class="text-[10px] text-slate-400 mt-0.5 block">Triggers visual alerts when customer balance exceeds limit.</span>
            </div>

            <div>
              <span class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Address / Location</span>
              <input 
                type="text" 
                [(ngModel)]="newCustAddress"
                placeholder="e.g. Shop #8, Main Bazaar"
                class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-medium focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <span class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Notes / Internal Tag</span>
              <input 
                type="text" 
                [(ngModel)]="newCustNotes"
                placeholder="e.g. Regular customer, clears bill monthly"
                class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-medium focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <button 
            type="button"
            (click)="saveCustomerProfile()"
            [disabled]="!newCustName || !newCustPhone"
            class="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-2xl shadow-md transition-all cursor-pointer">
            {{ editingCustomer() ? 'Update Customer Profile' : 'Create Customer Profile' }}
          </button>
        </div>
      </div>
    }

    <!-- DETAILED ITEMIZED INVOICE BILL MODAL -->
    @if (viewingInvoiceModal(); as invTx) {
      <div class="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
        <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 text-slate-900 dark:text-slate-100 max-h-[90vh] overflow-y-auto">
          
          <!-- Header -->
          <div class="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-black text-lg">
                🧾
              </div>
              <div>
                <h3 class="font-black text-slate-900 dark:text-slate-100 text-base leading-tight">Invoice Receipt #{{ invTx.invoiceNo }}</h3>
                <p class="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                  {{ invTx.timestamp | date:'dd-MMM-yyyy hh:mm a' }}
                </p>
              </div>
            </div>
            <button 
              type="button"
              (click)="closeInvoiceBillModal()" 
              class="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:text-slate-300 transition-colors cursor-pointer">
              <mat-icon class="text-base">close</mat-icon>
            </button>
          </div>

          <!-- Customer info banner -->
          <div class="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs flex justify-between items-center">
            <div>
              <span class="text-[10px] text-slate-400 uppercase font-bold block">Customer Details</span>
              <strong class="font-extrabold text-slate-900 dark:text-slate-100 text-sm block">{{ invTx.customerName || selectedCustomer()?.name || 'Walk-in Customer' }}</strong>
              @if (invTx.customerPhone || selectedCustomer()?.phone) {
                <span class="text-slate-500 font-mono text-[11px] block">{{ storeService.formatDisplayPhone(invTx.customerPhone || selectedCustomer()!.phone) }}</span>
              }
            </div>
            <div class="text-right">
              <span class="text-[10px] text-slate-400 uppercase font-bold block">Payment Method</span>
              <span class="px-2.5 py-1 rounded-full text-xs font-black uppercase inline-block"
                    [ngClass]="invTx.paymentMethod === 'udhar' ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300' : invTx.paymentMethod === 'partial_udhar' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'">
                {{ invTx.paymentMethod }}
              </span>
            </div>
          </div>

          <!-- Itemized Table -->
          <div class="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden text-xs">
            <table class="w-full text-left">
              <thead class="bg-slate-50 dark:bg-slate-800 text-slate-500 font-bold uppercase text-[10px]">
                <tr>
                  <th class="py-2 px-3">Item</th>
                  <th class="py-2 px-2 text-center">Qty</th>
                  <th class="py-2 px-2 text-right">Price</th>
                  <th class="py-2 px-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                @for (item of invTx.items; track item.item.id) {
                  <tr>
                    <td class="py-2 px-3 font-semibold text-slate-800 dark:text-slate-200">
                      {{ item.item.nameUr || item.item.nameEn }}
                    </td>
                    <td class="py-2 px-2 text-center font-mono font-bold text-slate-600 dark:text-slate-400">
                      {{ item.qty }} {{ item.item.unit }}
                    </td>
                    <td class="py-2 px-2 text-right font-mono text-slate-500">
                      Rs. {{ item.unitPrice | number:'1.0-0' }}
                    </td>
                    <td class="py-2 px-3 text-right font-extrabold text-slate-900 dark:text-slate-100">
                      Rs. {{ item.subtotal | number:'1.0-0' }}
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <!-- Bill Summary Calculation -->
          <div class="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 space-y-1.5 text-xs font-medium">
            <div class="flex justify-between text-slate-500">
              <span>Subtotal:</span>
              <span class="font-mono">Rs. {{ invTx.subtotal | number:'1.0-0' }}</span>
            </div>
            @if (invTx.discount > 0) {
              <div class="flex justify-between text-emerald-600 font-bold">
                <span>Discount:</span>
                <span class="font-mono">- Rs. {{ invTx.discount | number:'1.0-0' }}</span>
              </div>
            }
            <div class="flex justify-between text-slate-900 dark:text-slate-100 font-black text-sm pt-1 border-t border-slate-200 dark:border-slate-700">
              <span>Grand Total:</span>
              <span class="font-mono text-indigo-600 dark:text-indigo-400">Rs. {{ invTx.total | number:'1.0-0' }}</span>
            </div>

            @if (invTx.cashReceived && invTx.cashReceived > 0) {
              <div class="flex justify-between text-slate-600 dark:text-slate-400 text-xs pt-1">
                <span>Cash Received:</span>
                <span class="font-mono font-bold">Rs. {{ invTx.cashReceived | number:'1.0-0' }}</span>
              </div>
            }
            @if (invTx.udharAmount && invTx.udharAmount > 0) {
              <div class="flex justify-between text-red-600 dark:text-red-400 font-extrabold text-xs">
                <span>Added to Customer Udhar:</span>
                <span class="font-mono">Rs. {{ invTx.udharAmount | number:'1.0-0' }}</span>
              </div>
            }
          </div>

          <!-- Actions -->
          <div class="grid grid-cols-2 gap-2 pt-2">
            <button 
              type="button"
              (click)="shareInvoiceWhatsApp(invTx)"
              class="py-3 px-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer">
              <mat-icon class="text-base">send</mat-icon>
              Send Bill on WhatsApp
            </button>

            <button 
              type="button"
              (click)="printInvoiceReceipt()"
              class="py-3 px-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer">
              <mat-icon class="text-base">print</mat-icon>
              Print Bill Receipt
            </button>
          </div>

        </div>
      </div>
    }
  `
})
export class DigiKhataComponent {
  storeService = inject(StoreService);

  Math = Math; // expose Math object to template

  customerSearch = signal<string>('');
  customerFilter = signal<'ALL' | 'UDHAR_ONLY' | 'OVER_LIMIT'>('ALL');
  selectedCustomer = signal<Customer | null>(null);

  // Modals state
  showEntryModal = signal<'diya' | 'liya' | null>(null);
  entryAmount = 0;
  entryNotes = '';

  // Dedicated Payment Receive Modal State
  showReceivePaymentModal = signal<Customer | null>(null);
  receiveAmount = 0;
  receiveMethod: 'cash' | 'easypaisa' | 'jazzcash' | 'bank' = 'cash';
  receiveNotes = '';

  reminderCustomer = signal<Customer | null>(null);
  activeReminderType = signal<'standard' | 'overlimit' | 'statement' | 'monthly'>('standard');
  reminderTextPreview = '';

  isMonthlyPeriod = computed(() => this.storeService.isMonthlyReminderPeriod());
  currentMonthName = computed(() => new Date().toLocaleString('en-PK', { month: 'long' }));

  sendDirectWhatsAppMonthlyReminder(customer: Customer) {
    const msg = this.storeService.getExactMonthlyUrduReminderText(customer);
    const waUrl = this.storeService.generateWhatsAppUrl(customer.phone, msg);
    window.open(waUrl, '_blank');
  }

  showAddCustModal = signal<boolean>(false);
  editingCustomer = signal<Customer | null>(null);
  newCustName = '';
  newCustPhone = '';
  newCustAddress = '';
  newCustCreditLimit = 10000;
  newCustNotes = '';

  filteredCustomers = computed(() => {
    const q = this.customerSearch().toLowerCase().trim();
    const filt = this.customerFilter();

    return this.storeService.customers().filter(c => {
      const limit = c.creditLimit || 10000;
      const isExceeded = c.totalUdhar > limit;

      let matchFilter = true;
      if (filt === 'UDHAR_ONLY') matchFilter = c.totalUdhar > 0;
      if (filt === 'OVER_LIMIT') matchFilter = isExceeded;

      const matchQuery = !q || c.name.toLowerCase().includes(q) || c.phone.includes(q) || c.address?.toLowerCase().includes(q);
      return matchFilter && matchQuery;
    });
  });

  totalDebtorsCount = computed(() => {
    return this.storeService.customers().filter(c => c.totalUdhar > 0).length;
  });

  overLimitCount = computed(() => {
    return this.storeService.customers().filter(c => c.totalUdhar > (c.creditLimit || 10000)).length;
  });

  ledgerTab = signal<'ALL' | 'INVOICE' | 'PAYMENT'>('ALL');
  viewingInvoiceModal = signal<Transaction | null>(null);

  activeCustomerHistory = computed(() => {
    const c = this.selectedCustomer();
    if (!c) return [];
    return this.storeService.getCustomerUdharHistory(c.id);
  });

  activeCustomerUnifiedLedger = computed(() => {
    const c = this.selectedCustomer();
    if (!c) return [];
    const filter = this.ledgerTab();
    const all = this.storeService.getCustomerUnifiedLedger(c.id);
    if (filter === 'INVOICE') {
      return all.filter(i => i.kind === 'INVOICE' || i.type === 'diya');
    }
    if (filter === 'PAYMENT') {
      return all.filter(i => i.kind === 'PAYMENT_RECEIVED' || i.type === 'liya');
    }
    return all;
  });

  activeCustomerTotalBillsCount = computed(() => {
    const c = this.selectedCustomer();
    if (!c) return 0;
    return this.storeService.getCustomerTransactions(c.id).length;
  });

  activeCustomerTotalBillsAmount = computed(() => {
    const c = this.selectedCustomer();
    if (!c) return 0;
    const txs = this.storeService.getCustomerTransactions(c.id);
    return txs.reduce((sum, t) => sum + t.total, 0);
  });

  activeCustomerTotalPaymentsAmount = computed(() => {
    const c = this.selectedCustomer();
    if (!c) return 0;
    const history = this.storeService.getCustomerUdharHistory(c.id);
    return history.filter(h => h.type === 'liya').reduce((sum, h) => sum + h.amount, 0);
  });

  openInvoiceBillModal(tx: Transaction) {
    this.viewingInvoiceModal.set(tx);
  }

  closeInvoiceBillModal() {
    this.viewingInvoiceModal.set(null);
  }

  shareInvoiceWhatsApp(tx: Transaction) {
    const text = this.storeService.getFormattedInvoiceReceiptText(tx);
    const phone = tx.customerPhone || this.selectedCustomer()?.phone || '';
    const cleanPhone = this.storeService.cleanPhoneDigits(phone);
    const url = cleanPhone 
      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`
      : `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  }

  printInvoiceReceipt() {
    window.print();
  }

  openAddCustomerModal() {
    this.editingCustomer.set(null);
    this.newCustName = '';
    this.newCustPhone = '';
    this.newCustAddress = '';
    this.newCustCreditLimit = 10000;
    this.newCustNotes = '';
    this.showAddCustModal.set(true);
  }

  openEditCustomerModal(cust: Customer) {
    this.editingCustomer.set(cust);
    this.newCustName = cust.name;
    this.newCustPhone = cust.phone;
    this.newCustAddress = cust.address || '';
    this.newCustCreditLimit = cust.creditLimit || 10000;
    this.newCustNotes = cust.notes || '';
    this.showAddCustModal.set(false);
  }

  closeCustomerModal() {
    this.showAddCustModal.set(false);
    this.editingCustomer.set(null);
  }

  saveCustomerProfile() {
    if (!this.newCustName || !this.newCustPhone) return;

    const existing = this.editingCustomer();
    if (existing) {
      const updated: Customer = {
        ...existing,
        name: this.newCustName,
        phone: this.newCustPhone,
        address: this.newCustAddress,
        creditLimit: this.newCustCreditLimit,
        notes: this.newCustNotes
      };
      this.storeService.updateCustomer(updated);
      this.selectedCustomer.set(updated);
    } else {
      const created = this.storeService.addCustomer({
        name: this.newCustName,
        phone: this.newCustPhone,
        address: this.newCustAddress,
        creditLimit: this.newCustCreditLimit,
        notes: this.newCustNotes
      });
      this.selectedCustomer.set(created);
    }
    this.closeCustomerModal();
  }

  openAddEntryModal(type: 'diya' | 'liya') {
    if (!this.selectedCustomer()) return;
    this.entryAmount = 0;
    this.entryNotes = type === 'diya' ? 'Udhar Goods / Rashan Bill' : 'Cash Udhar Payment';
    this.showEntryModal.set(type);
  }

  saveUdharEntry() {
    const cust = this.selectedCustomer();
    const type = this.showEntryModal();
    if (!cust || !type || this.entryAmount <= 0) return;

    this.storeService.addUdharRecord(cust.id, type, this.entryAmount, this.entryNotes);
    this.showEntryModal.set(null);

    // Refresh selected customer signal reference
    const updated = this.storeService.customers().find(c => c.id === cust.id);
    if (updated) {
      this.selectedCustomer.set(updated);
    }
  }

  openReceivePaymentModal(customer: Customer) {
    this.showReceivePaymentModal.set(customer);
    this.receiveAmount = customer.totalUdhar > 0 ? Math.min(1000, customer.totalUdhar) : 0;
    this.receiveMethod = 'cash';
    this.receiveNotes = 'Udhar Payment Collection';
  }

  confirmReceivePayment(sendWhatsAppReceipt: boolean) {
    const cust = this.showReceivePaymentModal();
    if (!cust || this.receiveAmount <= 0) return;

    const notesWithMethod = `${this.receiveNotes} (${this.receiveMethod.toUpperCase()})`;
    this.storeService.addUdharRecord(cust.id, 'liya', this.receiveAmount, notesWithMethod);

    // Refresh selected customer signal reference
    const updated = this.storeService.customers().find(c => c.id === cust.id);
    if (updated) {
      this.selectedCustomer.set(updated);

      if (sendWhatsAppReceipt) {
        const receiptText = this.storeService.getFormattedPaymentReceiptText(
          updated, 
          this.receiveAmount, 
          this.receiveMethod, 
          this.receiveNotes
        );
        const waUrl = this.storeService.generateWhatsAppUrl(updated.phone, receiptText);
        window.open(waUrl, '_blank');
      }
    }

    this.showReceivePaymentModal.set(null);
  }

  openWhatsAppReminderModal(customer: Customer, initialType?: 'standard' | 'overlimit' | 'statement' | 'monthly') {
    this.reminderCustomer.set(customer);
    const limit = customer.creditLimit || 10000;
    
    let typeToUse: 'standard' | 'overlimit' | 'statement' | 'monthly' = initialType || 'standard';
    if (!initialType) {
      if (customer.totalUdhar > limit) {
        typeToUse = 'overlimit';
      } else if (this.storeService.isMonthlyReminderPeriod()) {
        typeToUse = 'monthly';
      }
    }

    this.switchReminderTemplate(typeToUse);
  }

  openWhatsAppOverLimitModal(customer: Customer) {
    this.openWhatsAppReminderModal(customer, 'overlimit');
  }

  switchReminderTemplate(type: 'standard' | 'overlimit' | 'statement' | 'monthly') {
    const cust = this.reminderCustomer();
    if (!cust) return;
    this.activeReminderType.set(type);
    if (type === 'statement') {
      this.reminderTextPreview = this.storeService.getFormattedUdharStatementText(cust);
    } else if (type === 'monthly') {
      this.reminderTextPreview = this.storeService.getFormattedMonthlyReminderText(cust);
    } else if (type === 'overlimit') {
      this.reminderTextPreview = this.storeService.getFormattedOverLimitNoticeText(cust);
    } else {
      this.reminderTextPreview = this.storeService.getFormattedUdharReminderText(cust);
    }
  }

  triggerMonthlyBatchReminders() {
    this.customerFilter.set('UDHAR_ONLY');
    const debtors = this.storeService.customers().filter(c => c.totalUdhar > 0);
    if (debtors.length === 0) {
      alert('No debtors found with pending udhar balance!');
      return;
    }
    const target = this.selectedCustomer()?.totalUdhar ? this.selectedCustomer()! : debtors[0];
    this.selectedCustomer.set(target);
    this.openWhatsAppReminderModal(target, 'monthly');
  }

  sendWhatsAppReminderNow() {
    const cust = this.reminderCustomer();
    if (!cust) return;

    const waUrl = this.storeService.generateWhatsAppUrl(cust.phone, this.reminderTextPreview);
    window.open(waUrl, '_blank');
    this.reminderCustomer.set(null);
  }
}
