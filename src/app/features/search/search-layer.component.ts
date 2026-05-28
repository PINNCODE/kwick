import { Component, input, output, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Stream } from '../../../core/domain/entities/stream.entity';

@Component({
  selector: 'app-search-layer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './search-layer.component.html',
  styleUrl: './search-layer.component.scss',
})
export class SearchLayerComponent {
  readonly channels = input<Stream[]>([]);
  readonly channelSelected = output<Stream>();

  searchQuery = signal('');

  private channelList = computed(() => this.channels());

  filteredChannels = computed<Stream[]>(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const allChannels = this.channelList();
    if (!query) {
      return allChannels;
    }
    return allChannels.filter((channel: Stream) =>
      channel.name.toLowerCase().includes(query)
    );
  });

  onSearchChange(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  onChannelClick(channel: Stream): void {
    this.channelSelected.emit(channel);
  }
}