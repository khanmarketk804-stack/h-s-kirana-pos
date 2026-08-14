import { Component, inject, signal, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { StoreService } from '../services/store.service';
import QRCode from 'qrcode';

@Component({
  selector: 'app-whatsapp-tools',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      <!-- Page Header -->
      <div class="bg-gradient-to-r from-emerald-900 to-slate-900 text-white rounded-2xl p-6 shadow-md border border-emerald-800/40 flex flex-col md:flex-row items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center font-bold shadow-lg shadow-emerald-500/20">
            <mat-icon class="text-2xl">chat</mat-icon>
          </div>
          <div>
            <h1 class="text-lg sm:text-xl font-extrabold tracking-tight">WhatsApp Direct Chat & QR Generator</h1>
            <p class="text-xs text-emerald-200 mt-1">
              Send messages without saving contacts to phonebook • Create QR Codes for EasyPaisa & Store
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2 text-xs font-semibold bg-emerald-950/60 p-2 rounded-xl border border-emerald-800/60">
          <mat-icon class="text-emerald-400">verified</mat-icon>
          <span>Ultra-Fast Direct Link Utility</span>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        <!-- LEFT: DIRECT WHATSAPP LAUNCHER & TEMPLATES (7 Cols) -->
        <div class="lg:col-span-7 space-y-6">
          
          <!-- Direct Launcher Form -->
          <div class="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
            
            <div class="flex items-center gap-2 border-b border-slate-200 pb-3">
              <mat-icon class="text-emerald-600">contact_phone</mat-icon>
              <h2 class="font-bold text-slate-900 text-sm">Direct WhatsApp Message Launcher</h2>
            </div>

            <div class="space-y-3 text-xs">
              
              <div>
                <span class="block font-bold text-slate-700 mb-1">
                  Mobile / Phone Number (نمبر درج کریں) *
                </span>
                <div class="relative">
                  <span class="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-500 font-mono">
                    🇵🇰
                  </span>
                  <input 
                    type="text" 
                    [(ngModel)]="directPhone"
                    (ngModelChange)="onPhoneInput($event)"
                    placeholder="e.g. 03001234567 or 0321-5551234"
                    class="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <p class="text-[11px] text-slate-400 mt-1">
                  Cleaned International Number: <strong class="text-emerald-700 font-mono">+{{ cleanPhone() || '92300xxxxxxx' }}</strong>
                </p>
              </div>

              <div>
                <span class="block font-bold text-slate-700 mb-1">Message Text (پیغام)</span>
                <textarea 
                  rows="4"
                  [(ngModel)]="directMessage"
                  placeholder="Type custom message or pick a pre-formatted template below..."
                  class="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                ></textarea>
              </div>

            </div>

            <!-- Launcher Actions -->
            <div class="pt-2 flex flex-col sm:flex-row gap-2">
              <button 
                (click)="launchWhatsAppChat()"
                [disabled]="!cleanPhone()"
                class="flex-1 py-3 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-black text-xs shadow-md shadow-orange-950/20 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95">
                <mat-icon class="text-base">launch</mat-icon>
                WhatsApp Paigam Ravana Karein
              </button>

              <button 
                (click)="copyDirectLink()"
                [disabled]="!cleanPhone()"
                class="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors">
                <mat-icon class="text-base">content_copy</mat-icon>
                {{ copiedLink() ? 'Copy Ho Gaya!' : 'Link Copy Karein' }}
              </button>
            </div>

          </div>

          <!-- Quick Templates Picker -->
          <div class="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-3">
            <h3 class="font-bold text-slate-900 text-sm flex items-center gap-2">
              <mat-icon class="text-emerald-600 text-base">forum</mat-icon>
              Quick Kirana Templates (پیغام کے ٹیمپلیٹس)
            </h3>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              @for (tpl of storeService.templates(); track tpl.id) {
                <button 
                  type="button"
                  (click)="useTemplate(tpl.content)"
                  class="p-3 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-emerald-400 hover:bg-emerald-50/50 transition-all cursor-pointer group flex flex-col justify-between text-left w-full">
                  <div>
                    <span class="font-bold text-slate-900 text-xs group-hover:text-emerald-800 block mb-1">
                      {{ tpl.title }}
                    </span>
                    <p class="text-[11px] text-slate-600 line-clamp-3 leading-relaxed">
                      {{ tpl.content }}
                    </p>
                  </div>
                  <div class="mt-2 pt-2 border-t border-slate-200/60 text-[10px] font-bold text-emerald-600 flex items-center justify-between">
                    <span>Click to use</span>
                    <mat-icon class="text-xs">arrow_forward</mat-icon>
                  </div>
                </button>
              }
            </div>
          </div>

        </div>

        <!-- RIGHT: CUSTOM QR CODE GENERATOR (5 Cols) -->
        <div class="lg:col-span-5 space-y-6">
          
          <div class="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
            
            <div class="flex items-center gap-2 border-b border-slate-200 pb-3">
              <mat-icon class="text-emerald-600">qr_code_2</mat-icon>
              <h2 class="font-bold text-slate-900 text-sm">Store QR Code Generator</h2>
            </div>

            <!-- QR Mode Selection -->
            <div class="space-y-3 text-xs">
              
              <div>
                <span class="block font-bold text-slate-700 mb-1">Select QR Type (کیو آر کی قسم)</span>
                <div class="grid grid-cols-3 gap-1.5 font-semibold text-[11px]">
                  <button 
                    (click)="setQrMode('wa')"
                    class="py-2 px-1 rounded-xl border text-center transition-all"
                    [ngClass]="qrMode() === 'wa' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-50 text-slate-700 border-slate-200'">
                    💬 WhatsApp
                  </button>

                  <button 
                    (click)="setQrMode('easypaisa')"
                    class="py-2 px-1 rounded-xl border text-center transition-all"
                    [ngClass]="qrMode() === 'easypaisa' ? 'bg-green-600 text-white border-green-600' : 'bg-slate-50 text-slate-700 border-slate-200'">
                    📲 EasyPaisa
                  </button>

                  <button 
                    (click)="setQrMode('custom')"
                    class="py-2 px-1 rounded-xl border text-center transition-all"
                    [ngClass]="qrMode() === 'custom' ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-700 border-slate-200'">
                    🔗 Custom Link
                  </button>
                </div>
              </div>

              <div>
                <span class="block font-bold text-slate-700 mb-1">QR Target Value / Link</span>
                <input 
                  type="text" 
                  [(ngModel)]="qrInputValue"
                  (ngModelChange)="generateQrCode()"
                  placeholder="Enter link or text for QR code..."
                  class="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

            </div>

            <!-- Canvas Rendered QR Display -->
            <div class="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 flex flex-col items-center justify-center">
              <canvas #qrCanvas class="shadow-md rounded-xl bg-white p-2 border border-slate-200"></canvas>

              <p class="text-xs font-bold text-slate-800 mt-3 text-center">
                {{ qrTitleText() }}
              </p>
              <p class="text-[10px] text-slate-500 mt-0.5 text-center max-w-xs truncate">
                {{ qrInputValue }}
              </p>

              <!-- QR Action Buttons -->
              <div class="flex gap-2 mt-4 w-full">
                <button 
                  (click)="downloadQrImage()"
                  class="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors">
                  <mat-icon class="text-sm">download</mat-icon> Download PNG
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  `
})
export class WhatsappToolsComponent implements AfterViewInit {
  storeService = inject(StoreService);

  @ViewChild('qrCanvas') qrCanvasRef!: ElementRef<HTMLCanvasElement>;

  directPhone = '03001234567';
  directMessage = '';
  copiedLink = signal<boolean>(false);

  qrMode = signal<'wa' | 'easypaisa' | 'custom'>('wa');
  qrInputValue = '';

  cleanPhone = signal<string>('');

  ngAfterViewInit() {
    this.updatePhoneAndQr();
  }

  onPhoneInput(val: string) {
    const clean = this.storeService.cleanPhoneDigits(val);
    this.cleanPhone.set(clean);
    if (this.qrMode() === 'wa') {
      this.qrInputValue = this.storeService.generateWhatsAppUrl(clean, this.directMessage);
      this.generateQrCode();
    }
  }

  setQrMode(mode: 'wa' | 'easypaisa' | 'custom') {
    this.qrMode.set(mode);
    const cfg = this.storeService.config();

    if (mode === 'wa') {
      this.qrInputValue = this.storeService.generateWhatsAppUrl(this.cleanPhone(), this.directMessage);
    } else if (mode === 'easypaisa') {
      this.qrInputValue = `EasyPaisa: ${cfg.easypaisaNo || cfg.phone} (${cfg.storeName})`;
    } else {
      this.qrInputValue = 'https://whatsappdirect.store/';
    }
    this.generateQrCode();
  }

  qrTitleText(): string {
    const mode = this.qrMode();
    if (mode === 'wa') return 'Scan to Chat on WhatsApp';
    if (mode === 'easypaisa') return 'Scan / Send EasyPaisa Payment';
    return 'Scan Custom QR Code';
  }

  updatePhoneAndQr() {
    const clean = this.storeService.cleanPhoneDigits(this.directPhone);
    this.cleanPhone.set(clean);
    this.setQrMode('wa');
  }

  useTemplate(content: string) {
    const cfg = this.storeService.config();
    this.directMessage = content
      .replace(/{store}/g, cfg.storeName)
      .replace(/{phone}/g, cfg.phone)
      .replace(/{customer}/g, 'Valued Customer');

    if (this.qrMode() === 'wa') {
      this.qrInputValue = this.storeService.generateWhatsAppUrl(this.cleanPhone(), this.directMessage);
      this.generateQrCode();
    }
  }

  launchWhatsAppChat() {
    const url = this.storeService.generateWhatsAppUrl(this.cleanPhone(), this.directMessage);
    window.open(url, '_blank');
  }

  copyDirectLink() {
    const url = this.storeService.generateWhatsAppUrl(this.cleanPhone(), this.directMessage);
    navigator.clipboard.writeText(url);
    this.copiedLink.set(true);
    setTimeout(() => this.copiedLink.set(false), 2000);
  }

  generateQrCode() {
    if (!this.qrCanvasRef?.nativeElement || !this.qrInputValue) return;

    QRCode.toCanvas(
      this.qrCanvasRef.nativeElement,
      this.qrInputValue,
      {
        width: 200,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff'
        }
      },
      (err) => {
        if (err) console.error('Error generating QR:', err);
      }
    );
  }

  downloadQrImage() {
    const canvas = this.qrCanvasRef?.nativeElement;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `hs-kirana-qr-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }
}
