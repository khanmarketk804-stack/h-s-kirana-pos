import { Component, inject, signal, HostListener, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { StoreService } from './store.service';
@Component({
  selector: 'app-pin-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (storeService.isPinModalOpen() || storeService.isAppLocked()) {
      <div class="fixed inset-0 bg-slate-950/95 backdrop-blur-lg z-50 flex items-center justify-center p-4 overflow-y-auto no-print">
        <div class="bg-slate-900 text-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border-2 border-emerald-500/50 space-y-5 relative animate-scale-up">
          
          <!-- Top Header with Store Branding & Lock Icon -->
          <div class="text-center space-y-2">
            <div class="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-950/60 border border-emerald-400/50">
              <mat-icon class="text-3xl">lock</mat-icon>
            </div>

            <div class="space-y-1">
              <span class="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                HS KIRANA STORE • سکیورٹی لاک
              </span>
              <h2 class="text-xl font-black text-white tracking-wide pt-1">
                {{ storeService.isAppLocked() ? 'DUKAN ACCESS PASSWORD' : 'PIN SECURITY VERIFICATION' }}
              </h2>
            </div>

            <p class="text-xs text-slate-300 font-medium px-2 leading-relaxed">
              {{ storeService.isAppLocked() 
                ? 'براہ کرم دکان کا پاس ورڈ درج کریں تاکہ کوئی دوسرا شخص ویب سائٹ اور کھاتہ نہ دیکھ سکے۔' 
                : storeService.pinModalReason() }}
            </p>
          </div>

          <!-- Password Input Box (Masked by Default) -->
          <div class="space-y-2">
            <label for="storePwdInput" class="block text-[11px] font-bold text-emerald-300 uppercase tracking-wider text-center">
              Enter Password (پاس ورڈ درج کریں)
            </label>

            <div class="relative flex items-center">
              <input 
                #pwdInput
                id="storePwdInput"
                [type]="showPassword() ? 'text' : 'password'"
                [value]="pinInput()"
                (input)="onInputChange($event)"
                (keydown.enter)="submitPin()"
                placeholder="••••••••••"
                autocomplete="off"
                class="w-full bg-slate-950 border-2 border-emerald-500/60 rounded-2xl py-3.5 pl-4 pr-12 text-center text-xl font-mono tracking-widest text-emerald-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/30 focus:border-emerald-400 shadow-inner"
              />

              <!-- Password Visibility Toggle (Dikhna nahi chahiye by default) -->
              <button 
                type="button"
                (click)="toggleShowPassword()"
                title="Toggle Password Visibility"
                class="absolute right-3 p-2 text-slate-400 hover:text-emerald-300 transition-colors cursor-pointer">
                <mat-icon class="text-xl">{{ showPassword() ? 'visibility' : 'visibility_off' }}</mat-icon>
              </button>
            </div>

            <!-- Bullet Mask Preview -->
            <div class="flex justify-center items-center gap-1.5 py-1 min-h-6">
              @if (pinInput().length > 0) {
                <span class="text-xs font-mono text-emerald-400 font-bold tracking-widest">
                  {{ pinInput().length }} Digits entered (محفوظ)
                </span>
              } @else {
                <span class="text-[11px] text-slate-500 italic">
                  کی پیڈ یا کی بورڈ سے پاس ورڈ ٹائپ کریں
                </span>
              }
            </div>
          </div>

          <!-- Feedback Status Banner -->
          @if (errorMessage()) {
            <div class="p-2.5 rounded-xl bg-red-950/90 border border-red-500 text-red-200 text-xs text-center font-bold animate-shake flex items-center justify-center gap-1.5">
              <mat-icon class="text-sm">error</mat-icon>
              <span>{{ errorMessage() }}</span>
            </div>
          } @else if (successMessage()) {
            <div class="p-2.5 rounded-xl bg-emerald-950/90 border border-emerald-500 text-emerald-200 text-xs text-center font-bold flex items-center justify-center gap-1.5">
              <mat-icon class="text-sm">check_circle</mat-icon>
              <span>{{ successMessage() }}</span>
            </div>
          }

          <!-- Tactical Numeric Keypad (Quick touch screen input) -->
          <div class="grid grid-cols-3 gap-2.5 pt-1">
            @for (num of ['1','2','3','4','5','6','7','8','9']; track num) {
              <button 
                type="button"
                (click)="appendDigit(num)"
                class="py-3 rounded-2xl bg-slate-800/90 hover:bg-slate-700 active:bg-emerald-600 text-white font-black text-lg shadow-md border border-slate-700/80 transition-all cursor-pointer active:scale-95 flex items-center justify-center">
                {{ num }}
              </button>
            }

            <button 
              type="button"
              (click)="clearPin()"
              title="Clear Input"
              class="py-3 rounded-2xl bg-slate-800/60 hover:bg-slate-800 text-amber-400 font-bold text-xs border border-slate-800 transition-all cursor-pointer active:scale-95 flex items-center justify-center">
              CLEAR
            </button>

            <button 
              type="button"
              (click)="appendDigit('0')"
              class="py-3 rounded-2xl bg-slate-800/90 hover:bg-slate-700 active:bg-emerald-600 text-white font-black text-lg shadow-md border border-slate-700/80 transition-all cursor-pointer active:scale-95 flex items-center justify-center">
              0
            </button>

            <button 
              type="button"
              (click)="backspace()"
              title="Backspace"
              class="py-3 rounded-2xl bg-slate-800/60 hover:bg-slate-800 text-red-400 font-bold text-xs border border-slate-800 transition-all cursor-pointer active:scale-95 flex items-center justify-center">
              <mat-icon>backspace</mat-icon>
            </button>
          </div>

          <!-- Bottom Actions -->
          <div class="flex items-center justify-between gap-3 pt-2">
            @if (!storeService.isAppLocked()) {
              <button 
                type="button"
                (click)="storeService.closePinModal()"
                class="px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors cursor-pointer">
                Cancel (منسوخ)
              </button>
            }

            <button 
              type="button"
              (click)="submitPin()"
              [disabled]="pinInput().length === 0"
              class="flex-1 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg shadow-emerald-950/60 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95">
              <mat-icon class="text-lg">lock_open</mat-icon>
              <span>Unlock Dukan (دکان کھولیں)</span>
            </button>
          </div>

        </div>
      </div>
    }
  `
})
export class PinModalComponent {
  storeService = inject(StoreService);
  pinInput = signal<string>('');
  showPassword = signal<boolean>(false);
  errorMessage = signal<string>('');
  successMessage = signal<string>('');

  toggleShowPassword() {
    this.showPassword.update(v => !v);
  }

  onInputChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.pinInput.set(target.value);
    this.errorMessage.set('');
  }

  appendDigit(digit: string) {
    if (this.pinInput().length < 30) {
      this.pinInput.update(p => p + digit);
      this.errorMessage.set('');
    }
  }

  backspace() {
    if (this.pinInput().length > 0) {
      this.pinInput.update(p => p.slice(0, -1));
      this.errorMessage.set('');
    }
  }

  clearPin() {
    this.pinInput.set('');
    this.errorMessage.set('');
  }

  submitPin() {
    const pin = this.pinInput().trim();
    if (!pin) {
      this.errorMessage.set('براہ کرم پاس ورڈ درج کریں (Please enter password)');
      return;
    }

    if (this.storeService.isAppLocked()) {
      const res = this.storeService.unlockAppWithPin(pin);
      if (res.success) {
        this.successMessage.set(res.message);
        setTimeout(() => {
          this.pinInput.set('');
          this.successMessage.set('');
        }, 400);
      } else {
        this.errorMessage.set(res.message || 'Ghalt Password! (Incorrect Password)');
        this.pinInput.set('');
      }
    } else {
      const res = this.storeService.submitPinFromModal(pin);
      if (res.success) {
        this.successMessage.set(res.message);
        setTimeout(() => {
          this.pinInput.set('');
          this.successMessage.set('');
        }, 400);
      } else {
        this.errorMessage.set(res.message || 'Ghalt Password! (Incorrect Password)');
        this.pinInput.set('');
      }
    }
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardInput(event: KeyboardEvent) {
    if (!this.storeService.isPinModalOpen() && !this.storeService.isAppLocked()) {
      return;
    }

    // Ignore if typing inside the text input directly to avoid duplicate keys
    if ((event.target as HTMLElement)?.tagName === 'INPUT') {
      if (event.key === 'Enter') {
        this.submitPin();
      }
      return;
    }

    if (event.key >= '0' && event.key <= '9') {
      this.appendDigit(event.key);
    } else if (event.key === 'Backspace') {
      this.backspace();
    } else if (event.key === 'Enter') {
      this.submitPin();
    } else if (event.key === 'Escape') {
      if (!this.storeService.isAppLocked()) {
        this.storeService.closePinModal();
      }
    }
  }
}
