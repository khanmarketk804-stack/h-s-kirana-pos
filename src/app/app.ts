import { Component, signal, inject } from '@angular/core';
import { HeaderNavComponent } from './header-nav';
import { PosTerminalComponent } from './pos-terminal';
import { InventoryComponent } from './inventory';
import { DigikhataComponent } from './digikhata';
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
    DigikhataComponent,
    WhatsappToolsComponent,
    ReportsComponent,
    SettingsComponent,
    PinModalComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent {
  storeService = inject(StoreService);
  activeTab = signal<string>('pos');

  setTab(tab: string) {
    this.activeTab.set(tab);
  }
}
