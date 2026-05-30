import { Injectable, inject, signal, computed } from '@angular/core';
import { IPTV_API_PORT } from '../../../core/ports/outbound/tokens';
import { Stream } from '../../../core/domain/entities/stream.entity';
import { AuthServiceAdapter } from '../../../infrastructure/adapters/auth-service.adapter';

@Injectable({ providedIn: 'root' })
export class SearchService {
  private readonly api = inject(IPTV_API_PORT);
  private readonly auth = inject(AuthServiceAdapter);

  private readonly channelsCache = signal<Stream[]>([]);
  private readonly categoryMap = signal<Map<number | string, string>>(new Map());
  private readonly loading = signal(false);

  getChannels() {
    return this.channelsCache;
  }

  readonly categories = computed(() => {
    return Array.from(this.categoryMap().entries())
      .filter(([id]) => typeof id === 'string') // Only return the string keys to avoid duplicate entries in list
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  });

  getCategoryName(categoryId: number | string): string {
    return this.categoryMap().get(categoryId) ?? 
           this.categoryMap().get(String(categoryId)) ?? 
           this.categoryMap().get(Number(categoryId)) ?? 
           `Category ${categoryId}`;
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

      const catMap = new Map<number | string, string>();
      for (const cat of categories) {
        catMap.set(cat.id, cat.name);
        if (cat.id !== undefined && cat.id !== null) {
          const numId = Number(cat.id);
          if (!isNaN(numId)) {
            catMap.set(numId, cat.name);
          }
        }
      }
      this.categoryMap.set(catMap);

      // Deduplicate by stream id and category id combined
      const seen = new Set<string>();
      const uniqueStreams = streams.filter((s) => {
        const key = `${s.id}-${s.categoryId}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      this.channelsCache.set(uniqueStreams);
      console.log('[SearchService] channels cached:', uniqueStreams.length, 'after deduplication');
    } finally {
      this.loading.set(false);
    }
  }

}