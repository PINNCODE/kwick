import { Component, signal, OnInit, Inject } from '@angular/core';
import { CREDENTIAL_STORAGE_PORT } from '../../../../core/ports/outbound/tokens';
import { CredentialStoragePort } from '../../../../core/ports/outbound/credential-storage.port';

@Component({
  selector: 'app-menu-layer',
  standalone: true,
  templateUrl: './menu-layer.component.html',
  styleUrl: './menu-layer.component.scss'
})
export class MenuLayerComponent implements OnInit {
  username = signal('');
  initial = signal('');

  constructor(@Inject(CREDENTIAL_STORAGE_PORT) private credentialStorage: CredentialStoragePort) {}

  async ngOnInit() {
    const credentials = await this.credentialStorage.get();
    if (credentials) {
      this.username.set(credentials.username);
      this.initial.set(credentials.username.charAt(0).toUpperCase());
    }
  }
}