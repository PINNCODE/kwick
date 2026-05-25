import { Component, signal } from '@angular/core';
import { StreamPlayerComponent, PlayerState, PlayerError } from './shared';

@Component({
  selector: 'app-root',
  imports: [StreamPlayerComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('kwick');
  protected readonly streamUrl = 'https://ftvpro.net:8443/live/Trujillo2303/SAFJC4xWVRp5/5.m3u8';
  protected readonly playerState = signal<PlayerState | ''>('');
  protected readonly errorMessage = signal('');

  protected onPlayerState(state: PlayerState): void {
    this.playerState.set(state);
  }

  protected onPlayerError(error: PlayerError): void {
    this.errorMessage.set(`Error: ${error.message} (${error.correlationId})`);
  }
}
