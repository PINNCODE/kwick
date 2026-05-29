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

    const grouped = new Map<string, Stream[]>(); // cambiamos a string
    for (const channel of filtered) {
      const list = grouped.get(channel.name) ?? [];
      list.push(channel);
      grouped.set(channel.name, list);
    }

    return Array.from(grouped.entries())
      .sort(([a], [b]) => a.localeCompare(b)) // ahora ordenamos por nombre
      .map(([categoryName, channels]) => ({
        categoryName,
        categoryId: -1, // colocamos -1
        channels,
      }));
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