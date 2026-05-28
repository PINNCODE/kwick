import { Injectable, inject, signal } from '@angular/core';
import { IPTV_API_PORT } from '../../../core/ports/outbound/tokens';
import { Stream } from '../../../core/domain/entities/stream.entity';
import { AuthServiceAdapter } from '../../../infrastructure/adapters/auth-service.adapter';

@Injectable({ providedIn: 'root' })
export class SearchService {
  private readonly api = inject(IPTV_API_PORT);
  private readonly auth = inject(AuthServiceAdapter);

  private readonly channelsCache = signal<Stream[]>([]);
  private readonly loading = signal(false);

  getChannels() {
    return this.channelsCache;
  }

  isLoading() {
    return this.loading;
  }

  async fetchChannels(): Promise<void> {
    if (this.channelsCache().length > 0) {
      return;
    }

    const credentials = this.auth.getStreamCredentials();
    if (!credentials) {
      return;
    }

    this.loading.set(true);
    try {
      const streams = await new Promise<Stream[]>((resolve, reject) => {
        this.api.getLivestreams(credentials.host, `${credentials.username}:${credentials.password}`, undefined).subscribe({
          next: resolve,
          error: reject,
        });
      });
      this.channelsCache.set(streams);
    } finally {
      this.loading.set(false);
    }
  }
}