import { Injectable, signal } from '@angular/core';
import { ErrorCode } from '../../../core';

export type PlayerState = 'idle' | 'loading' | 'playing' | 'paused' | 'waiting' | 'error';

export interface PlayerError {
  code: ErrorCode;
  message: string;
  correlationId: string;
}

@Injectable()
export class StreamPlayerState {
  readonly state = signal<PlayerState>('idle');
  readonly error = signal<PlayerError | null>(null);
  readonly volume = signal(1);

  setState(state: PlayerState): void {
    this.state.set(state);
  }

  setError(error: PlayerError): void {
    this.error.set(error);
    this.state.set('error');
  }

  setVolume(vol: number): void {
    this.volume.set(vol);
  }

  reset(): void {
    this.state.set('idle');
    this.error.set(null);
    this.volume.set(1);
  }
}
