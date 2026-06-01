import { Component, OnInit, OnDestroy, HostListener, signal, computed, inject, output, effect, ElementRef, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { SearchService } from '../../core/application/search.service';
import { TvLayerService, EpgProgram } from './tv-layer.service';
import { Stream } from '../../../core/domain/entities/stream.entity';

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
  private readonly tvLayerService = inject(TvLayerService);
  private readonly el = inject(ElementRef);

  readonly channelSelected = output<Stream>();

  readonly activeColumn = signal<'categories' | 'channels'>('categories');
  readonly selectedCategoryIndex = signal(0);
  readonly selectedChannelIndex = signal(0);

  readonly allChannels = this.searchService.getChannels();
  readonly isLoadingChannels = this.searchService.isLoading();

  // Expose EPG state from service
  readonly epgPrograms = this.tvLayerService.epgPrograms;
  readonly epgLoading = this.tvLayerService.epgLoading;

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
      this.tvLayerService.fetchEpgForChannel(this.selectedChannel());
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
        this.tvLayerService.fetchEpgForChannel(this.selectedChannel());
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        event.stopPropagation();
        const prevIndex = (this.selectedCategoryIndex() - 1 + categoriesList.length) % categoriesList.length;
        this.selectedCategoryIndex.set(prevIndex);
        this.selectedChannelIndex.set(0);
        this.tvLayerService.fetchEpgForChannel(this.selectedChannel());
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        event.stopPropagation();
        if (channelsList.length > 0) {
          this.activeColumn.set('channels');
          this.tvLayerService.fetchEpgForChannel(this.selectedChannel());
        }
      }
    } else if (this.activeColumn() === 'channels') {
      if (!channelsList.length) return;

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        event.stopPropagation();
        const nextIndex = (this.selectedChannelIndex() + 1) % channelsList.length;
        this.selectedChannelIndex.set(nextIndex);
        this.tvLayerService.fetchEpgForChannel(this.selectedChannel());
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        event.stopPropagation();
        const prevIndex = (this.selectedChannelIndex() - 1 + channelsList.length) % channelsList.length;
        this.selectedChannelIndex.set(prevIndex);
        this.tvLayerService.fetchEpgForChannel(this.selectedChannel());
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

  onCategorySelect(index: number): void {
    this.selectedCategoryIndex.set(index);
    this.selectedChannelIndex.set(0);
    this.activeColumn.set('categories');
    this.tvLayerService.fetchEpgForChannel(this.selectedChannel());
  }

  onChannelSelect(index: number): void {
    this.selectedChannelIndex.set(index);
    this.activeColumn.set('channels');
    this.tvLayerService.fetchEpgForChannel(this.selectedChannel());
  }

  onChannelDoubleClick(channel: Stream): void {
    this.channelSelected.emit(channel);
  }

  ngOnDestroy(): void {
    this.tvLayerService.cancelEpgSubscription();
  }
}