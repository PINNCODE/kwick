import { Component, signal, ViewChild } from '@angular/core';
import { StreamPlayerComponent, PlayerState, PlayerError, StreamLayerComponent } from './shared';

@Component({
  selector: 'app-root',
  imports: [StreamPlayerComponent, StreamLayerComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  @ViewChild(StreamPlayerComponent) player!: StreamPlayerComponent;

  protected readonly title = signal('kwick');
  protected readonly streamUrl = 'https://ftvpro.net:8443/live/Trujillo2303/SAFJC4xWVRp5/319999.m3u8';
  protected readonly playerState = signal<PlayerState | ''>('');
  protected readonly errorMessage = signal('');

  protected onPlayerState(state: PlayerState): void {
    this.playerState.set(state);
  }

  protected onPlayerError(error: PlayerError): void {
    this.errorMessage.set(`Error: ${error.message} (${error.correlationId})`);
  }

  protected onTogglePlayPause(): void {
    this.togglePlay();
  }

  protected onToggleMute(): void {
    this.toggleMute();
  }

  protected onVolumeChange(volume: number): void {
    this.player?.setVolume(volume);
  }

  protected togglePlay(): void {
    if (this.player) {
      this.playerState() === 'playing' ? this.player.pause() : this.player.play();
    }
  }

  protected setVolume(volume: number): void {
    this.player?.setVolume(volume);
  }

  protected toggleMute(): void {
    if (this.player) {
      this.player.isMuted() ? this.player.unmute() : this.player.mute();
    }
  }
}
