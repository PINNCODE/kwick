import { Component, input, output, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Stream } from '../../../core/domain/entities/stream.entity';
import { SearchService } from '../../core/application/search.service';

export interface ChannelGroup {
  categoryId: number;
  categoryName: string;
  channels: Stream[];
}

@Component({
  selector: 'app-search-layer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './search-layer.component.html',
  styleUrl: './search-layer.component.scss',
})
export class SearchLayerComponent {
  private readonly searchService = inject(SearchService);

  readonly channels = input<Stream[]>([]);
  readonly channelSelected = output<Stream>();

  searchQuery = signal('');

  private channelList = computed(() => this.channels());

  filteredGroupedChannels = computed<ChannelGroup[]>(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const allChannels = this.channelList();

    const filtered = query
      ? allChannels.filter((channel: Stream) =>
          channel.name.toLowerCase().includes(query)
        )
      : allChannels;

    const grouped = new Map<number, Stream[]>();
    for (const channel of filtered) {
      const catId = Number(channel.categoryId);
      const list = grouped.get(catId) ?? [];
      list.push(channel);
      grouped.set(catId, list);
    }

    return Array.from(grouped.entries())
      .map(([categoryId, channels]) => {
        const categoryName = this.searchService.getCategoryName(categoryId);
        const sortedChannels = [...channels].sort((a, b) => a.name.localeCompare(b.name));
        return {
          categoryId,
          categoryName,
          channels: sortedChannels,
        };
      })
      .sort((a, b) => a.categoryName.localeCompare(b.categoryName));
  });

  onSearchChange(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  clearSearch(): void {
    this.searchQuery.set('');
  }

  onChannelClick(channel: Stream): void {
    this.channelSelected.emit(channel);
  }
}