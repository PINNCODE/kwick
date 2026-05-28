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

  readonly playerState = output<PlayerState>();
  readonly errorOccurred = output<PlayerError>();

  private readonly player = new HlsPlayerService();
  private _stateInterval: ReturnType<typeof setInterval> | null = null;
  private _errorCheckInterval: ReturnType<typeof setInterval> | null = null;
  private _videoAttached = false;

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
  }

  ngOnInit(): void {
    // Poll state changes
    this._stateInterval = setInterval(() => {
      const state = this.player.state();
      if (state !== 'idle') {
        this.playerState.emit(state);
      }
    }, 100);

    // Poll errors
    this._errorCheckInterval = setInterval(() => {
      const err = this.player.error();
      if (err) {
        this.errorOccurred.emit(err);
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

  setVolume(volume: number): void {
    this.player.setVolume(volume);
  }

  getVolume(): number {
    return this.player.getVolume();
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