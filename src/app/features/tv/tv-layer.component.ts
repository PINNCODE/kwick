import { Component, OnInit, OnDestroy, HostListener, signal, computed, inject, output, effect, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { SearchService } from '../../core/application/search.service';
import { EpgService } from '../../core/application/epg.service';
import { Stream } from '../../../core/domain/entities/stream.entity';
import { StreamProgram } from '../../shared';

@Component({
  selector: 'app-tv-layer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tv-layer.component.html',
  styleUrl: './tv-layer.component.scss',
  host: {
    'tabindex': '0',
    'style': 'outline: none; display: block; height: 100%;'
  }
})
export class TvLayerComponent implements OnInit, OnDestroy {
  private readonly searchService = inject(SearchService);
  private readonly epgService = inject(EpgService);
  private readonly el = inject(ElementRef);

  readonly channelSelected = output<Stream>();

  readonly activeColumn = signal<'categories' | 'channels'>('categories');
  readonly selectedCategoryIndex = signal(0);
  readonly selectedChannelIndex = signal(0);

  readonly allChannels = this.searchService.getChannels();
  readonly isLoadingChannels = this.searchService.isLoading();

  private currentEpgSubscription: Subscription | null = null;
  readonly epgPrograms = signal<any[]>([]);
  readonly epgLoading = signal(false);

  readonly categories = this.searchService.categories;

  readonly selectedCategory = computed(() => {
    const list = this.categories();
    const index = this.selectedCategoryIndex();
    return list[index] || null;
  });

  readonly currentCategoryChannels = computed(() => {
    const activeCategory = this.selectedCategory();
    if (!activeCategory) return [];
    
    const channels = this.allChannels();
    return channels
      .filter(ch => String(ch.categoryId) === String(activeCategory.id))
      .sort((a, b) => a.name.localeCompare(b.name));
  });

  readonly selectedChannel = computed(() => {
    const list = this.currentCategoryChannels();
    const index = this.selectedChannelIndex();
    return list[index] || null;
  });

  constructor() {
    effect(() => {
      // Trigger effect when indices or active column change to handle scrolling automatically
      const catIdx = this.selectedCategoryIndex();
      const chanIdx = this.selectedChannelIndex();
      const col = this.activeColumn();

      setTimeout(() => {
        const activeEl = document.querySelector('.tv-container .focused');
        if (activeEl) {
          activeEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
      }, 50);
    });
  }

  ngOnInit(): void {
    this.searchService.fetchChannels().then(() => {
      this.fetchEpgForSelectedChannel();
      setTimeout(() => {
        this.el.nativeElement.focus();
      }, 100);
    });
  }

  @HostListener('keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent): void {
    const categoriesList = this.categories();
    const channelsList = this.currentCategoryChannels();

    if (this.activeColumn() === 'categories') {
      if (!categoriesList.length) return;

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        event.stopPropagation();
        const nextIndex = (this.selectedCategoryIndex() + 1) % categoriesList.length;
        this.selectedCategoryIndex.set(nextIndex);
        this.selectedChannelIndex.set(0);
        this.fetchEpgForSelectedChannel();
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        event.stopPropagation();
        const prevIndex = (this.selectedCategoryIndex() - 1 + categoriesList.length) % categoriesList.length;
        this.selectedCategoryIndex.set(prevIndex);
        this.selectedChannelIndex.set(0);
        this.fetchEpgForSelectedChannel();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        event.stopPropagation();
        if (channelsList.length > 0) {
          this.activeColumn.set('channels');
          this.fetchEpgForSelectedChannel();
        }
      }
    } else if (this.activeColumn() === 'channels') {
      if (!channelsList.length) return;

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        event.stopPropagation();
        const nextIndex = (this.selectedChannelIndex() + 1) % channelsList.length;
        this.selectedChannelIndex.set(nextIndex);
        this.fetchEpgForSelectedChannel();
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        event.stopPropagation();
        const prevIndex = (this.selectedChannelIndex() - 1 + channelsList.length) % channelsList.length;
        this.selectedChannelIndex.set(prevIndex);
        this.fetchEpgForSelectedChannel();
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        event.stopPropagation();
        this.activeColumn.set('categories');
      } else if (event.key === 'Enter') {
        event.preventDefault();
        event.stopPropagation();
        const channel = this.selectedChannel();
        if (channel) {
          this.channelSelected.emit(channel);
        }
      }
    }
  }

  fetchEpgForSelectedChannel(): void {
    if (this.currentEpgSubscription) {
      this.currentEpgSubscription.unsubscribe();
      this.currentEpgSubscription = null;
    }

    const channel = this.selectedChannel();
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

        const formatTime = (d: Date) => {
          const date = new Date(d);
          return date.toLocaleTimeString('es-MX', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
            timeZone: 'America/Mexico_City',
          });
        };

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

          let progress = 0;
          if (index === 0) {
            const start = new Date(listing.startTime).getTime();
            const end = new Date(listing.endTime).getTime();
            const total = end - start;
            if (total > 0) {
              progress = Math.max(0, Math.min(100, ((now - start) / total) * 100));
            }
          }

          return {
            time: formatTime(listing.startTime),
            endTime: formatTime(listing.endTime),
            label: timeLabel,
            title: listing.title,
            description,
            progress: index === 0 ? progress : undefined
          };
        });

        this.epgPrograms.set(mapped);
      },
      error: (err) => {
        console.error('[TvLayerComponent] Error fetching EPG:', err);
        this.epgLoading.set(false);
        this.epgPrograms.set([]);
      }
    });
  }

  onCategorySelect(index: number): void {
    this.selectedCategoryIndex.set(index);
    this.selectedChannelIndex.set(0);
    this.activeColumn.set('categories');
    this.fetchEpgForSelectedChannel();
  }

  onChannelSelect(index: number): void {
    this.selectedChannelIndex.set(index);
    this.activeColumn.set('channels');
    this.fetchEpgForSelectedChannel();
  }

  onChannelDoubleClick(channel: Stream): void {
    this.channelSelected.emit(channel);
  }

  ngOnDestroy(): void {
    if (this.currentEpgSubscription) {
      this.currentEpgSubscription.unsubscribe();
    }
  }
}
