import { Component, signal, inject } from '@angular/core';
import { HeaderNavComponent, ActiveTab } from './header-nav';
import { PosTerminalComponent } from './pos-terminal';
import { InventoryComponent } from './inventory';
import { DigiKhataComponent } from './digikhata';
import { WhatsappToolsComponent } from './whatsapp-tools';
import { ReportsComponent } from './reports';
import { SettingsComponent } from './settings';
import { PinModalComponent } from './pin-modal';
import { StoreService } from './store.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
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
  styleUrl: './app.css'
})
export class App {

  storeService = inject(StoreService);
  activeTab = signal<ActiveTab>('pos');

  setTab(tab: ActiveTab) {
    this.activeTab.set(tab);
  }
}
