import {
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
  input,
  output,
} from '@angular/core';
import { StreamPlayerComponent } from '../../../../shared/components/stream-player/stream-player.component';
import { PlayerState, PlayerError } from '../../../../shared/state/stream-player.state';

/**
 * StreamControllerComponent is a dumb (presentational) component that wraps
 * StreamPlayerComponent and exposes imperative player methods as events
 * for the parent component to handle.
 *
 * This component contains NO business logic - it only translates
 * imperative player calls into event emissions.
 */
@Component({
  selector: 'app-stream-controller',
  standalone: true,
  templateUrl: './stream-controller.component.html',
  styleUrl: './stream-controller.component.scss',
})
export class StreamControllerComponent implements OnInit, OnDestroy {
  @ViewChild('streamPlayer') playerRef!: StreamPlayerComponent;

  // Inputs from parent (smart component)
  readonly streamUrl = input.required<string>();
  readonly streamName = input<string>();
  readonly thumbnail = input<string>();
  readonly muted = input(false);
  readonly controls = input(true);
  readonly volume = input(1.0);
  readonly isMuted = input(false);

  // Outputs to parent (smart component handles all business logic)
  readonly playerState = output<PlayerState>();
  readonly errorOccurred = output<PlayerError>();

  // Player control events - parent subscribes and calls methods on this component
  readonly playRequested = output<void>();
  readonly pauseRequested = output<void>();
  readonly muteRequested = output<void>();
  readonly unmuteRequested = output<void>();
  readonly volumeChangeRequested = output<number>();
  readonly reloadRequested = output<void>();

  private _stateInterval: ReturnType<typeof setInterval> | null = null;
  private _errorCheckInterval: ReturnType<typeof setInterval> | null = null;
  private _lastEmittedErrorId: string | null = null;

  ngOnInit(): void {
    // Poll player state from StreamPlayerComponent and emit to parent
    this._stateInterval = setInterval(() => {
      if (this.playerRef) {
        const state = this.playerRef.getPlayerState();
        if (state !== 'idle') {
          this.playerState.emit(state);
        }
      }
    }, 100);

    // Poll errors from StreamPlayerComponent and emit to parent
    this._errorCheckInterval = setInterval(() => {
      if (this.playerRef) {
        const err = this.playerRef.getPlayerError();
        if (err) {
          if (err.correlationId !== this._lastEmittedErrorId) {
            this._lastEmittedErrorId = err.correlationId;
            this.errorOccurred.emit(err);
          }
        } else {
          this._lastEmittedErrorId = null;
        }
      }
    }, 100);
  }

  // These methods are called by the parent via ViewChild access
  play(): void {
    this.playerRef?.play();
  }

  pause(): void {
    this.playerRef?.pause();
  }

  mute(): void {
    this.playerRef?.mute();
  }

  unmute(): void {
    this.playerRef?.unmute();
  }

  isMutedMethod(): boolean {
    return this.playerRef?.isMuted() ?? false;
  }

  reload(): void {
    const url = this.streamUrl();
    if (url) {
      this.playerRef?.reload();
    }
  }

  setVolume(volume: number): void {
    this.playerRef?.setVolume(volume);
  }

  ngOnDestroy(): void {
    if (this._stateInterval) clearInterval(this._stateInterval);
    if (this._errorCheckInterval) clearInterval(this._errorCheckInterval);
  }
}
