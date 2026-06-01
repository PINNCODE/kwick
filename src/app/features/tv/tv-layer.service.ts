import { Injectable, inject, signal, computed, DestroyRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { EpgService } from '../../core/application/epg.service';
import { Stream } from '../../../core/domain/entities/stream.entity';

export interface EpgProgram {
  time: string;
  endTime: string;
  label: string;
  title: string;
  description: string;
  progress?: number;
}

@Injectable({ providedIn: 'root' })
export class TvLayerService {
  private readonly epgService = inject(EpgService);
  private readonly destroyRef = inject(DestroyRef);

  private currentEpgSubscription: Subscription | null = null;

  readonly epgPrograms = signal<EpgProgram[]>([]);
  readonly epgLoading = signal(false);

  private readonly formatTime = (d: Date): string => {
    const date = new Date(d);
    return date.toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'America/Mexico_City',
    });
  };

  fetchEpgForChannel(channel: Stream | null): void {
    if (this.currentEpgSubscription) {
      this.currentEpgSubscription.unsubscribe();
      this.currentEpgSubscription = null;
    }

    if (!channel) {
      this.epgPrograms.set([]);
      return;
    }

    this.epgLoading.set(true);
    this.currentEpgSubscription = this.epgService.getEPG(channel.id).subscribe({
      next: (epgListings) => {
        this.epgLoading.set(false);
        if (!epgListings || epgListings.length === 0) {
          this.epgPrograms.set([]);
          return;
        }

        const now = Date.now();
        const futurePrograms = epgListings.filter(listing => {
          return new Date(listing.endTime).getTime() > now;
        });

        if (futurePrograms.length === 0) {
          this.epgPrograms.set([]);
          return;
        }

        const mapped = futurePrograms.slice(0, 3).map((listing, index) => {
          let timeLabel = '';
          if (index === 0) timeLabel = 'Ahora';
          else if (index === 1) timeLabel = 'Próximo';
          else if (index === 2) timeLabel = 'Más tarde';

          let description = listing.description || '';
          const cleanDesc = description.trim().toLowerCase();
          if (!cleanDesc ||
              cleanDesc === 'no description info' ||
              cleanDesc === 'no description' ||
              cleanDesc === 'no description.') {
            description = channel.name;
          }

          let progress: number | undefined;
          if (index === 0) {
            const start = new Date(listing.startTime).getTime();
            const end = new Date(listing.endTime).getTime();
            const total = end - start;
            if (total > 0) {
              progress = Math.max(0, Math.min(100, ((now - start) / total) * 100));
            }
          }

          return {
            time: this.formatTime(listing.startTime),
            endTime: this.formatTime(listing.endTime),
            label: timeLabel,
            title: listing.title,
            description,
            progress
          };
        });

        this.epgPrograms.set(mapped);
      },
      error: (err) => {
        console.error('[TvLayerService] Error fetching EPG:', err);
        this.epgLoading.set(false);
        this.epgPrograms.set([]);
      }
    });
  }

  cancelEpgSubscription(): void {
    if (this.currentEpgSubscription) {
      this.currentEpgSubscription.unsubscribe();
      this.currentEpgSubscription = null;
    }
  }
}