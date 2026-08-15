import { Component, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Transaction } from './store.models';
import { StoreService } from './store.service';

@Component({
  selector: 'app-receipt-modal',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    @if (transaction()) {
      <div class="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in no-print">
        <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col max-h-[90vh]">
          
          <!-- Modal Header -->
          <div class="bg-slate-900 text-white p-4 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <mat-icon class="text-emerald-400">receipt_long</mat-icon>
              <div>
                <h3 class="font-bold text-base leading-tight">Bill Invoice #{{ transaction()?.invoiceNo }}</h3>
                <p class="text-xs text-slate-400">{{ transaction()?.timestamp | date:'medium' }}</p>
              </div>
            </div>
            <button 
              (click)="closeModal.emit()"
              class="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300">
              <mat-icon class="text-base">close</mat-icon>
            </button>
          </div>

          <!-- Thermal Receipt Preview Container -->
          <div class="p-6 overflow-y-auto bg-slate-100 flex-1 flex justify-center">
            
            <div id="printable-receipt" class="bg-white p-4 rounded-lg border border-slate-200 shadow-sm w-[72mm] max-w-[72mm] text-slate-900 text-xs font-mono">
              
              <!-- Store Header -->
              <div class="text-center pb-3 mb-3 border-b border-dashed border-slate-300">
                <h2 class="font-extrabold text-sm uppercase tracking-wide text-slate-900">
                  {{ storeService.config().storeName }}
                </h2>
                <p class="text-[11px] text-slate-600 font-sans mt-0.5">{{ storeService.config().tagline }}</p>
                <p class="text-[11px] text-slate-600 mt-1">📍 {{ storeService.config().address }}</p>
                <p class="text-[11px] text-slate-600">📞 {{ storeService.config().phone }}</p>
                @if (storeService.config().ntn) {
                  <p class="text-[10px] text-slate-500">NTN: {{ storeService.config().ntn }}</p>
                }
              </div>

              <!-- Transaction Meta -->
              <div class="text-[11px] space-y-0.5 pb-2 mb-2 border-b border-dashed border-slate-300">
                <div class="flex justify-between">
                  <span>Invoice #:</span>
                  <span class="font-bold">{{ transaction()?.invoiceNo }}</span>
                </div>
                <div class="flex justify-between">
                  <span>Date:</span>
                  <span>{{ transaction()?.timestamp | date:'dd-MMM-yyyy hh:mm a' }}</span>
                </div>
                @if (transaction()?.customerName) {
                  <div class="flex justify-between font-bold text-slate-900 mt-1">
                    <span>Customer:</span>
                    <span>{{ transaction()?.customerName }}</span>
                  </div>
                }
              </div>

              <!-- Items Table -->
              <table class="w-full text-left border-collapse mb-3">
                <thead>
                  <tr class="border-b border-slate-400 text-[10px] uppercase">
                    <th class="py-1">Item</th>
                    <th class="py-1 text-center">Qty</th>
                    <th class="py-1 text-right">Total</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-200">
                  @for (ci of transaction()?.items; track ci.item.id) {
                    <tr>
                      <td class="py-1.5 pr-1 leading-tight">
                        <div class="font-medium text-slate-900">{{ ci.item.nameEn }}</div>
                        <div class="text-[9px] text-slate-500 font-sans">@ {{ ci.unitPrice }} / {{ ci.item.unit }}</div>
                      </td>
                      <td class="py-1.5 text-center font-semibold">{{ ci.qty }}</td>
                      <td class="py-1.5 text-right font-bold">Rs. {{ ci.subtotal | number:'1.0-0' }}</td>
                    </tr>
                  }
                </tbody>
              </table>

              <!-- Totals Section -->
              <div class="border-t-2 border-slate-800 pt-2 space-y-1 text-[11px]">
                <div class="flex justify-between">
                  <span>Subtotal:</span>
                  <span>Rs. {{ transaction()?.subtotal | number:'1.0-0' }}</span>
                </div>
                @if (transaction()?.discount && transaction()?.discount! > 0) {
                  <div class="flex justify-between text-red-600 font-medium">
                    <span>Discount:</span>
                    <span>- Rs. {{ transaction()?.discount | number:'1.0-0' }}</span>
                  </div>
                }
                <div class="flex justify-between font-extrabold text-sm pt-1 border-t border-slate-300 text-slate-900">
                  <span>NET TOTAL:</span>
                  <span>Rs. {{ transaction()?.total | number:'1.0-0' }}</span>
                </div>
              </div>

              <!-- Payment Info -->
              <div class="mt-3 pt-2 border-t border-dashed border-slate-300 text-[11px] space-y-0.5">
                <div class="flex justify-between">
                  <span>Payment Mode:</span>
                  <span class="font-bold uppercase text-emerald-700">
                    {{ transaction()?.paymentMethod === 'partial_udhar' ? 'Partial Cash + Udhar' : transaction()?.paymentMethod }}
                  </span>
                </div>
                @if (transaction()?.paymentMethod === 'cash') {
                  <div class="flex justify-between">
                    <span>Cash Received:</span>
                    <span>Rs. {{ transaction()?.cashReceived | number:'1.0-0' }}</span>
                  </div>
                  @if (transaction()?.cashChange && transaction()?.cashChange! > 0) {
                    <div class="flex justify-between font-bold text-slate-900">
                      <span>Change Given:</span>
                      <span>Rs. {{ transaction()?.cashChange | number:'1.0-0' }}</span>
                    </div>
                  }
                } @else if (transaction()?.paymentMethod === 'partial_udhar') {
                  <div class="flex justify-between">
                    <span>Cash Paid:</span>
                    <span>Rs. {{ transaction()?.cashReceived | number:'1.0-0' }}</span>
                  </div>
                  <div class="flex justify-between text-amber-700 font-bold">
                    <span>Udhar Added:</span>
                    <span>Rs. {{ transaction()?.udharAmount | number:'1.0-0' }}</span>
                  </div>
                } @else if (transaction()?.paymentMethod === 'udhar') {
                  <div class="flex justify-between text-amber-700 font-bold">
                    <span>Full Udhar Added:</span>
                    <span>Rs. {{ transaction()?.total | number:'1.0-0' }}</span>
                  </div>
                }
              </div>

              <!-- Footer Greeting & Note -->
              <div class="text-center mt-4 pt-3 border-t border-dashed border-slate-300 text-[10px] text-slate-700 font-sans">
                <p class="font-bold text-xs text-slate-900 leading-snug">شکریہ! دوبارہ تشریف لائیں</p>
                <p class="text-[10px] text-slate-600 font-medium mt-0.5">Shukriya! Dobara Tashreef Laein</p>
                <p class="text-[9px] text-slate-500 mt-0.5">Thank you for shopping with us!</p>
                <p class="mt-1 text-[8px] text-slate-400">Powered by Kirana POS</p>
              </div>

            </div>

          </div>

          <!-- Modal Action Bar -->
          <div class="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row gap-2">
            
            <button 
              (click)="printReceipt()"
              class="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors shadow-sm">
              <mat-icon class="text-base">print</mat-icon>
              Print Receipt (پرنٹ)
            </button>

            <button 
              (click)="sendWhatsAppReceipt()"
              class="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer">
              <mat-icon class="text-base">send</mat-icon>
              1-Click WhatsApp Bill Share (واٹس ایپ رسید)
            </button>

          </div>

        </div>
      </div>
    }
  `
})
export class ReceiptModalComponent {
  storeService = inject(StoreService);
  transaction = input<Transaction | null>(null);
  closeModal = output<void>();

  printReceipt() {
    window.print();
  }

  sendWhatsAppReceipt() {
    const tx = this.transaction();
    if (!tx) return;

    const msg = this.storeService.getFormattedInvoiceReceiptText(tx);
    const targetPhone = tx.customerPhone || '';
    const waUrl = this.storeService.generateWhatsAppUrl(targetPhone, msg);
    window.open(waUrl, '_blank');
  }
}
