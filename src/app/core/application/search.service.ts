import { Injectable, inject, signal } from '@angular/core';
import { IPTV_API_PORT } from '../../../core/ports/outbound/tokens';
import { Stream } from '../../../core/domain/entities/stream.entity';
import { AuthServiceAdapter } from '../../../infrastructure/adapters/auth-service.adapter';

@Injectable({ providedIn: 'root' })
export class SearchService {
  private readonly api = inject(IPTV_API_PORT);
  private readonly auth = inject(AuthServiceAdapter);

  private readonly channelsCache = signal<Stream[]>([]);
  private readonly categoryMap = signal<Map<number, string>>(new Map());
  private readonly loading = signal(false);

  getChannels() {
    return this.channelsCache;
  }

  getCategoryName(categoryId: number): string {
    return this.categoryMap().get(categoryId) ?? `Category ${categoryId}`;
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
      const [streams, categories] = await Promise.all([
        new Promise<Stream[]>((resolve, reject) => {
          this.api.getLivestreams(credentials.host, `${credentials.username}:${credentials.password}`, undefined).subscribe({
            next: resolve,
            error: reject,
          });
        }),
        new Promise<any[]>((resolve, reject) => {
          this.api.getCategories(credentials.host, `${credentials.username}:${credentials.password}`).subscribe({
            next: resolve,
            error: reject,
          });
        }),
      ]);

      const catMap = new Map<number, string>();
      for (const cat of categories) {
        catMap.set(cat.id, cat.name);
      }
      this.categoryMap.set(catMap);
      console.log('[SearchService] categoryMap set with', catMap.size, 'entries. Sample:', catMap.get(103), catMap.get(107));
      this.channelsCache.set(streams);
      console.log('[SearchService] channels cached:', streams.length, 'sample categoryIds:', streams.slice(0, 5).map(s => s.categoryId));
    } finally {
      this.loading.set(false);
    }
  }
}