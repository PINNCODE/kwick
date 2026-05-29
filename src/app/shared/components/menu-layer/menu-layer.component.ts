import { Component, input, signal, inject, computed, output } from '@angular/core';
import { SearchService } from '../../../core/application/search.service';
import { SearchLayerComponent } from '../../../features/search';
import { Stream } from '../../../../core/domain/entities/stream.entity';

@Component({
  selector: 'app-menu-layer',
  standalone: true,
  imports: [SearchLayerComponent],
  templateUrl: './menu-layer.component.html',
  styleUrl: './menu-layer.component.scss'
})
export class MenuLayerComponent {
  readonly username = input('');
  readonly initial = input('');
  readonly visible = input(true);

  private readonly searchService = inject(SearchService);

  activePanel = signal<string | null>(null);

  readonly channels = this.searchService.getChannels();
  readonly isLoading = this.searchService.isLoading();
  readonly showSearch = computed(() => this.activePanel() === 'search');
  readonly isVisible = computed(() => this.activePanel() !== null);

  readonly channelChangeRequested = output<Stream>();

  toggleSearch(): void {
    if (this.activePanel() === 'search') {
      this.activePanel.set(null);
    } else {
      this.activePanel.set('search');
      this.searchService.fetchChannels();
    }
  }

  onChannelSelected(channel: Stream): void {
    this.channelChangeRequested.emit(channel);
  }
}