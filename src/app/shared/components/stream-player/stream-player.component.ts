import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  input,
  output,
  ViewChild,
  effect,
} from '@angular/core';
import { HlsPlayerService } from '../../state/hls-player.service';
import { PlayerState, PlayerError } from '../../state/stream-player.state';

@Component({
  selector: 'app-stream-player',
  standalone: true,
  templateUrl: './stream-player.component.html',
  styleUrl: './stream-player.component.scss',
})
export class StreamPlayerComponent implements OnInit, OnDestroy {
  @ViewChild('video') videoRef!: ElementRef<HTMLVideoElement>;

  readonly streamUrl = input.required<string>();
  readonly streamName = input<string>();
  readonly thumbnail = input<string>();
  readonly muted = input(false);
  readonly controls = input(true);
  readonly volume = input(1.0);

  readonly playerState = output<PlayerState>();
  readonly errorOccurred = output<PlayerError>();

  private readonly player = new HlsPlayerService();
  private _stateInterval: ReturnType<typeof setInterval> | null = null;
  private _errorCheckInterval: ReturnType<typeof setInterval> | null = null;
  private _videoAttached = false;
  private _lastEmittedErrorId: string | null = null;

  constructor() {
    // React to streamUrl changes after video is attached
    effect(() => {
      const url = this.streamUrl();
      if (url && this._videoAttached) {
        this.player.load(url, this.thumbnail());
      }
    });

    // React to muted input changes
    effect(() => {
      const muted = this.muted();
      if (this._videoAttached) {
        if (muted) {
          this.player.mute();
        } else {
          this.player.unmute();
        }
      }
    });

    // React to volume input changes
    effect(() => {
      const vol = this.volume();
      if (this._videoAttached) {
        this.player.setVolume(vol);
      }
    });
  }

  ngOnInit(): void {
    // Poll state changes
    this._stateInterval = setInterval(() => {
      const state = this.player.state();
      if (state !== 'idle') {
        this.playerState.emit(state);
      }
    }, 100);

    // Poll errors and only emit unique new errors
    this._errorCheckInterval = setInterval(() => {
      const err = this.player.error();
      if (err) {
        if (err.correlationId !== this._lastEmittedErrorId) {
          this._lastEmittedErrorId = err.correlationId;
          this.errorOccurred.emit(err);
        }
      } else {
        this._lastEmittedErrorId = null;
      }
    }, 100);
  }

  ngAfterViewInit(): void {
    if (this.videoRef) {
      this.player.attachVideo(this.videoRef.nativeElement);
      this._videoAttached = true;
      const url = this.streamUrl();
      if (url) {
        this.player.load(url, this.thumbnail());
      }
    }
  }

  play(): void {
    this.player.play();
  }

  pause(): void {
    this.player.pause();
  }

  reload(): void {
    const url = this.streamUrl();
    if (url && this._videoAttached) {
      this.player.load(url, this.thumbnail());
    }
  }

  setVolume(volume: number): void {
    this.player.setVolume(volume);
  }

  getVolume(): number {
    return this.player.getVolume();
  }

  getPlayerState(): PlayerState {
    return this.player.state();
  }

  getPlayerError(): PlayerError | null {
    return this.player.error();
  }

  isMuted(): boolean {
    return this.player.isMuted();
  }

  mute(): void {
    this.player.mute();
  }

  unmute(): void {
    this.player.unmute();
  }

  ngOnDestroy(): void {
    if (this._stateInterval) clearInterval(this._stateInterval);
    if (this._errorCheckInterval) clearInterval(this._errorCheckInterval);
    this.player.reset();
  }
}