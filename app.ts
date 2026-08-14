import { ChangeDetectionStrategy, Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderNavComponent, ActiveTab } from './components/header-nav';
import { PosTerminalComponent } from './components/pos-terminal';
import { InventoryComponent } from './components/inventory';
import { DigiKhataComponent } from './components/digikhata';
import { WhatsappToolsComponent } from './components/whatsapp-tools';
import { ReportsComponent } from './components/reports';
import { SettingsComponent } from './components/settings';
import { PinModalComponent } from './components/pin-modal';
import { StoreService } from './services/store.service';

@Component({
  selector: 'app-root',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    HeaderNavComponent,
    PosTerminalComponent,
    InventoryComponent,
    DigiKhataComponent,
    WhatsappToolsComponent,
    ReportsComponent,
    SettingsComponent,
    PinModalComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  storeService = inject(StoreService);
  activeTab = signal<ActiveTab>('pos');

  setTab(tab: ActiveTab) {
    this.activeTab.set(tab);
  }
}
