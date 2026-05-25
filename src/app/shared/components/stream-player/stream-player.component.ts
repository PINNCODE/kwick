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
import Hls from 'hls.js';
import { ErrorCode } from '../../../../core/error/error-codes';
import { StreamPlayerState, PlayerState, PlayerError } from './stream-player.state';

@Component({
  selector: 'app-stream-player',
  standalone: true,
  providers: [StreamPlayerState],
  templateUrl: './stream-player.component.html',
  styleUrl: './stream-player.component.scss',
})
export class StreamPlayerComponent implements OnInit, OnDestroy {
  @ViewChild('video') videoRef!: ElementRef<HTMLVideoElement>;

  readonly streamUrl = input.required<string>();
  readonly streamName = input<string>();
  readonly thumbnail = input<string>();
  readonly autoplay = input(true);
  readonly muted = input(false);
  readonly controls = input(true);

  readonly playerState = output<PlayerState>();
  readonly error = output<PlayerError>();

  private hls: Hls | null = null;

  constructor(private readonly state: StreamPlayerState) {
    effect(() => {
      this.playerState.emit(this.state.state());
    });

    effect(() => {
      const err = this.state.error();
      if (err) {
        this.error.emit(err);
      }
    });
  }

  ngOnInit(): void {
    this.state.setState('loading');
  }

  ngAfterViewInit(): void {
    const video = this.videoRef.nativeElement;

    this.setupVideoEventListeners(video);

    if (Hls.isSupported()) {
      this.hls = new Hls();
      this.hls.loadSource(this.streamUrl());
      this.hls.attachMedia(video);

      this.hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (this.autoplay()) {
          video.play().catch(() => {
            this.state.setState('waiting');
          });
        }
      });

      this.hls.on(Hls.Events.FRAG_BUFFERED, () => {
        this.state.setState('playing');
      });

      this.hls.on(Hls.Events.BUFFER_APPENDING, () => {
        this.state.setState('waiting');
      });

      this.hls.on(Hls.Events.ERROR, (_event, data) => {
        const correlationId = crypto.randomUUID();
        const playerError: PlayerError = {
          code: ErrorCode.PLAYER_ERROR,
          message: data.details || 'HLS playback error',
          correlationId,
        };
        this.state.setError(playerError);
      });

      this.hls.on(Hls.Events.MEDIA_ATTACHED, () => {
        video.poster = this.thumbnail() || '';
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = this.streamUrl();
      video.addEventListener('loadedmetadata', () => {
        this.state.setState('playing');
        if (this.autoplay()) {
          video.play().catch(() => {
            this.state.setState('waiting');
          });
        }
      });
    } else {
      this.state.setError({
        code: ErrorCode.PLAYER_ERROR,
        message: 'HLS is not supported in this browser',
        correlationId: crypto.randomUUID(),
      });
    }
  }

  private setupVideoEventListeners(video: HTMLVideoElement): void {
    video.addEventListener('play', () => {
      this.state.setState('playing');
    });

    video.addEventListener('pause', () => {
      this.state.setState('paused');
    });

    video.addEventListener('waiting', () => {
      this.state.setState('waiting');
    });

    video.addEventListener('playing', () => {
      this.state.setState('playing');
    });
  }

  ngOnDestroy(): void {
    this.hls?.destroy();
    this.hls = null;
    this.state.reset();
  }
}
