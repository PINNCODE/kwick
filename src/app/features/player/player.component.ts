import { Component, OnDestroy, OnInit, ViewChild, signal, Inject } from '@angular/core';
import { StreamPlayerComponent, StreamLayerComponent, StreamProgram, PlayerState, PlayerError } from '../../shared';
import { AuthServiceAdapter } from '../../../infrastructure/adapters/auth-service.adapter';
import { MenuLayerComponent } from '../../shared/components/menu-layer/menu-layer.component';
import { CredentialStoragePort } from '../../../core/ports/outbound/credential-storage.port';
import { CREDENTIAL_STORAGE_PORT } from '../../../core/ports/outbound/tokens';

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

  protected readonly streamUrl = signal('');
  protected readonly playerState = signal<PlayerState | ''>('');
  protected readonly errorMessage = signal('');
  protected readonly streamLayerVisible = signal(true);
  protected readonly userInitial = signal('');
  protected readonly userName = signal('');
  protected readonly isPlaying = signal(true);
  protected readonly isMuted = signal(false);
  protected readonly volume = signal(100);
  protected readonly programs = signal<StreamProgram[]>([
    { time: '17:00', endTime: '17:60', label: 'Ahora', description: 'Descripción del programa' },
    { time: '20:00', endTime: '22:00', label: 'Próximo', description: 'Siguiente programa' },
    { time: '22:00', endTime: '23:00', label: 'Más tarde', description: 'Programa posterior' },
  ]);

  constructor(
    private readonly authService: AuthServiceAdapter,
    @Inject(CREDENTIAL_STORAGE_PORT) private readonly credentialStorage: CredentialStoragePort,
  ) {}

  async ngOnInit(): Promise<void> {
    const creds = await this.credentialStorage.get();
    if (creds) {
      this.userName.set(creds.username);
      this.userInitial.set(creds.username.charAt(0).toUpperCase());
    }

    const streamCreds = this.authService.getStreamCredentials();
    if (streamCreds) {
      const { host, username, password } = streamCreds;
      const streamId = '319999';
      this.streamUrl.set(`${host}/live/${username}/${password}/${streamId}.m3u8`);
    }

    this.resetHideTimer();
  }

  protected toggleStreamLayer(): void {
    this.streamLayerVisible.set(!this.streamLayerVisible());
    this.resetHideTimer();
  }

  private resetHideTimer(): void {
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
    }
    if (this.streamLayerVisible()) {
      this.hideTimeout = setTimeout(() => {
        this.streamLayerVisible.set(false);
      }, 20_000);
    }
  }

  protected onPlayerState(state: PlayerState): void {
    this.playerState.set(state);
  }

  protected onPlayerError(error: PlayerError): void {
    this.errorMessage.set(`Error: ${error.message} (${error.correlationId})`);
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
    this.player?.setVolume(volume);
  }

  protected onChannelChange(streamId: number): void {
    const streamCreds = this.authService.getStreamCredentials();
    if (streamCreds) {
      const { host, username, password } = streamCreds;
      this.streamUrl.set(`${host}/live/${username}/${password}/${streamId}.m3u8`);
    }
  }

  ngOnDestroy(): void {
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
    }
  }
}