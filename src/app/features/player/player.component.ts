import { Component, OnDestroy, OnInit, ViewChild, signal, Inject, computed, inject } from '@angular/core';
import { StreamPlayerComponent, StreamLayerComponent, StreamProgram, PlayerState, PlayerError } from '../../shared';
import { AuthServiceAdapter } from '../../../infrastructure/adapters/auth-service.adapter';
import { MenuLayerComponent } from '../../shared/components/menu-layer/menu-layer.component';
import { CredentialStoragePort } from '../../../core/ports/outbound/credential-storage.port';
import { CREDENTIAL_STORAGE_PORT } from '../../../core/ports/outbound/tokens';
import { SearchService } from '../../core/application/search.service';
import { EpgService } from '../../core/application/epg.service';
import { Stream } from '../../../core/domain/entities/stream.entity';

@Component({
  selector: 'app-player',
  standalone: true,
  imports: [StreamPlayerComponent, StreamLayerComponent, MenuLayerComponent],
  templateUrl: './player.component.html',
  styleUrl: './player.component.scss',
})
export class PlayerComponent implements OnInit, OnDestroy {
  @ViewChild(StreamPlayerComponent) player!: StreamPlayerComponent;

  private hideTimeout: ReturnType<typeof setTimeout> | null = null;
  private retryTimeout: ReturnType<typeof setTimeout> | null = null;

  protected readonly streamUrl = signal('');
  protected readonly playerState = signal<PlayerState | ''>('');
  protected readonly errorMessage = signal('');
  protected readonly activeLayer = signal<'stream' | 'menu' | null>('stream');
  protected readonly userInitial = signal('');
  protected readonly userName = signal('');
  protected readonly isPlaying = signal(true);
  protected readonly isMuted = signal(false);
  protected readonly volume = signal(100);
  protected readonly channelName = signal('Canal 5');
  protected readonly channelLogo = signal('https://futuretv.mx/logos/canales.v158645616521/mex.canal5.png');
  protected readonly programs = signal<StreamProgram[]>([]);
  protected readonly currentChannelId = signal<number | null>(null);

  protected readonly retryCount = signal(0);
  protected readonly isRetrying = signal(false);
  protected readonly hasFailedCompletely = signal(false);

  private readonly searchService = inject(SearchService);
  private readonly allChannels = this.searchService.getChannels();

  protected readonly currentCategoryChannels = computed<Stream[]>(() => {
    const channels = this.allChannels();
    const activeId = this.currentChannelId();
    if (!channels.length || activeId === null) {
      return [];
    }

    const currentChannel = channels.find(c => c.id === activeId);
    if (!currentChannel) {
      return [];
    }

    const catId = currentChannel.categoryId;
    const categoryChannels = channels.filter(c => c.categoryId === catId);
    return [...categoryChannels].sort((a, b) => a.name.localeCompare(b.name));
  });

  constructor(
    private readonly authService: AuthServiceAdapter,
    @Inject(CREDENTIAL_STORAGE_PORT) private readonly credentialStorage: CredentialStoragePort,
    private readonly epgService: EpgService,
  ) {}

  async ngOnInit(): Promise<void> {
    const creds = await this.credentialStorage.get();
    if (creds) {
      this.userName.set(creds.username);
      this.userInitial.set(creds.username.charAt(0).toUpperCase());
    }

    const savedChannelName = localStorage.getItem('kwick_last_channel_name') || 'Canal 5';
    const savedChannelLogo = localStorage.getItem('kwick_last_channel_logo') || 'https://futuretv.mx/logos/canales.v158645616521/mex.canal5.png';
    this.channelName.set(savedChannelName);
    this.channelLogo.set(savedChannelLogo);

    const savedVolume = localStorage.getItem('kwick_last_volume');
    if (savedVolume !== null) {
      this.volume.set(parseFloat(savedVolume));
    }

    const streamCreds = this.authService.getStreamCredentials();
    if (streamCreds) {
      const { host, username, password } = streamCreds;
      const savedStreamId = localStorage.getItem('kwick_last_channel_id');
      const streamId = savedStreamId ? parseInt(savedStreamId, 10) : 319999;
      this.currentChannelId.set(streamId);
      this.streamUrl.set(`${host}/live/${username}/${password}/${streamId}.m3u8`);
      
      this.fetchEpgForChannel(streamId);
    }

    // Prefetch channels and categories in the background so switching is ready
    this.searchService.fetchChannels().catch((err) => {
      console.error('[PlayerComponent] Error prefetching channels/categories:', err);
    });

    this.resetHideTimer();
  }

  protected toggleStreamLayer(): void {
    const current = this.activeLayer();
    if (current === 'stream') {
      this.activeLayer.set(null);
    } else {
      this.activeLayer.set('stream');
    }
    this.resetHideTimer();
  }

  protected toggleMenuLayer(): void {
    const current = this.activeLayer();
    if (current === 'menu') {
      this.activeLayer.set(null);
    } else {
      this.activeLayer.set('menu');
    }
  }

  private resetHideTimer(): void {
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
    }
    if (this.activeLayer() === 'stream') {
      this.hideTimeout = setTimeout(() => {
        this.activeLayer.set(null);
      }, 20_000);
    }
  }

  protected onPlayerState(state: PlayerState): void {
    this.playerState.set(state);
    if (state === 'playing') {
      this.resetRetryState();
    }
  }

  private resetRetryState(): void {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
      this.retryTimeout = null;
    }
    this.retryCount.set(0);
    this.isRetrying.set(false);
    this.hasFailedCompletely.set(false);
  }

  protected onPlayerError(error: PlayerError): void {
    const errorMsg = error.message?.toLowerCase() || '';
    this.errorMessage.set(`Error: ${error.message} (${error.correlationId})`);
    
    if (this.hasFailedCompletely()) {
      return;
    }

    const isDirectFailure = errorMsg.includes('stream is down') || errorMsg.includes('503');
    if (isDirectFailure) {
      if (this.retryTimeout) {
        clearTimeout(this.retryTimeout);
        this.retryTimeout = null;
      }
      this.isRetrying.set(false);
      this.hasFailedCompletely.set(true);
      return;
    }

    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }

    const nextCount = this.retryCount() + 1;
    this.retryCount.set(nextCount);

    if (nextCount <= 3) {
      this.isRetrying.set(true);
      this.retryTimeout = setTimeout(() => {
        if (this.player) {
          this.player.reload();
        }
      }, 2500);
    } else {
      this.isRetrying.set(false);
      this.hasFailedCompletely.set(true);
    }
  }

  protected onTogglePlayPause(): void {
    if (this.player) {
      this.playerState() === 'playing' ? this.player.pause() : this.player.play();
      this.isPlaying.set(!this.isPlaying());
    }
  }

  protected onToggleMute(): void {
    if (this.player) {
      this.player.isMuted() ? this.player.unmute() : this.player.mute();
      this.isMuted.set(!this.isMuted());
    }
  }

  protected onVolumeChange(volume: number): void {
    const volPercent = Math.round(volume * 100);
    this.volume.set(volPercent);
    localStorage.setItem('kwick_last_volume', volPercent.toString());
  }

  protected onChannelChange(channel: Stream): void {
    this.resetRetryState();
    const streamCreds = this.authService.getStreamCredentials();
    if (streamCreds) {
      const { host, username, password } = streamCreds;
      const streamId = channel.id;
      this.currentChannelId.set(streamId);
      this.streamUrl.set(`${host}/live/${username}/${password}/${streamId}.m3u8`);
      localStorage.setItem('kwick_last_channel_id', streamId.toString());

      const name = channel.name;
      const logo = channel.streamIcon || channel.thumbnail || 'https://futuretv.mx/logos/canales.v158645616521/mex.canal5.png';
      this.channelName.set(name);
      this.channelLogo.set(logo);
      localStorage.setItem('kwick_last_channel_name', name);
      localStorage.setItem('kwick_last_channel_logo', logo);

      this.fetchEpgForChannel(streamId);
      this.showStreamLayerBriefly();
    }
  }

  protected onNextChannel(): void {
    const channels = this.currentCategoryChannels();
    if (!channels.length) {
      return;
    }

    const activeId = this.currentChannelId();
    const currentIndex = channels.findIndex((c) => c.id === activeId);
    const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % channels.length;
    const nextChannel = channels[nextIndex];
    this.onChannelChange(nextChannel);
    this.showStreamLayerBriefly();
  }

  private fetchEpgForChannel(streamId: number): void {
    this.epgService.getEPG(streamId).subscribe({
      next: (epgListings) => {
        if (!epgListings || epgListings.length === 0) {
          this.programs.set([]);
          return;
        }

        const now = Date.now();
        const futurePrograms = epgListings.filter(listing => {
          return new Date(listing.endTime).getTime() > now;
        });

        if (futurePrograms.length === 0) {
          this.programs.set([]);
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

        const mapped: StreamProgram[] = futurePrograms.slice(0, 3).map((listing, index) => {
          let timeLabel = '';
          if (index === 0) timeLabel = 'Ahora';
          else if (index === 1) timeLabel = 'Próximo';
          else if (index === 2) timeLabel = 'Más tarde';

          const label = timeLabel || '';

          let description = listing.description;
          const cleanDesc = description.trim().toLowerCase();
          if (!cleanDesc || 
              cleanDesc === 'no description info' || 
              cleanDesc === 'no description' || 
              cleanDesc === 'no description.') {
            description = this.channelName();
          }

          return {
            time: formatTime(listing.startTime),
            endTime: formatTime(listing.endTime),
            label,
            title: listing.title,
            description,
          };
        });

        this.programs.set(mapped);
      },
      error: (err) => {
        console.error('[PlayerComponent] Error fetching EPG:', err);
        this.programs.set([]);
      }
    });
  }

  protected onArrowUp(event: Event): void {
    if (this.activeLayer() === 'menu') {
      return;
    }
    event.preventDefault();

    const channels = this.currentCategoryChannels();
    if (!channels.length) {
      return;
    }

    const activeId = this.currentChannelId();
    const currentIndex = channels.findIndex((c) => c.id === activeId);
    if (currentIndex === -1) {
      return;
    }

    const prevIndex = (currentIndex - 1 + channels.length) % channels.length;
    const nextChannel = channels[prevIndex];
    this.onChannelChange(nextChannel);
    this.showStreamLayerBriefly();
  }

  protected onArrowDown(event: Event): void {
    if (this.activeLayer() === 'menu') {
      return;
    }
    event.preventDefault();

    const channels = this.currentCategoryChannels();
    if (!channels.length) {
      return;
    }

    const activeId = this.currentChannelId();
    const currentIndex = channels.findIndex((c) => c.id === activeId);
    if (currentIndex === -1) {
      return;
    }

    const nextIndex = (currentIndex + 1) % channels.length;
    const nextChannel = channels[nextIndex];
    this.onChannelChange(nextChannel);
    this.showStreamLayerBriefly();
  }

  private showStreamLayerBriefly(): void {
    this.activeLayer.set('stream');
    this.resetHideTimer();
  }

  ngOnDestroy(): void {
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
    }
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }
  }
}