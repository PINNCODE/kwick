import { Component, OnDestroy, OnInit, ViewChild, signal } from '@angular/core';
import { StreamPlayerComponent, StreamLayerComponent, PlayerState, PlayerError } from '../../shared';
import { AuthServiceAdapter } from '../../../infrastructure/adapters/auth-service.adapter';
import { MenuLayerComponent } from '../../shared/components/menu-layer/menu-layer.component';

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

  constructor(private readonly authService: AuthServiceAdapter) {}

  ngOnInit(): void {
    const creds = this.authService.getStreamCredentials();
    console.log(creds);
    if (creds) {
      const { host, username, password } = creds;
      const streamId = '319999'; // TODO: retrieve from stream list
      console.log(`${host}/live/${username}/${password}/${streamId}.m3u8`);
      this.streamUrl.set(`${host}/live/${username}/${password}/${streamId}.m3u8`);
    }
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
    }
  }

  protected onToggleMute(): void {
    if (this.player) {
      this.player.isMuted() ? this.player.unmute() : this.player.mute();
    }
  }

  protected onVolumeChange(volume: number): void {
    this.player?.setVolume(volume);
  }

  ngOnDestroy(): void {
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
    }
  }
}
