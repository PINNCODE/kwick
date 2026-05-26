import { Component, signal, ViewChild } from '@angular/core';
import { StreamPlayerComponent, StreamLayerComponent, PlayerState, PlayerError } from '../../shared';

@Component({
  selector: 'app-player',
  standalone: true,
  imports: [StreamPlayerComponent, StreamLayerComponent],
  templateUrl: './player.component.html',
  styleUrl: './player.component.scss',
})
export class PlayerComponent {
  @ViewChild(StreamPlayerComponent) player!: StreamPlayerComponent;

  protected readonly streamUrl = 'https://ftvpro.net:8443/live/Trujillo2303/SAFJC4xWVRp5/319999.m3u8';
  protected readonly playerState = signal<PlayerState | ''>('');
  protected readonly errorMessage = signal('');
  protected readonly streamLayerVisible = signal(true);

  protected toggleStreamLayer(): void {
    this.streamLayerVisible.set(!this.streamLayerVisible());
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
}
