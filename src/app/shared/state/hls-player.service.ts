import { Injectable, signal } from '@angular/core';
import Hls from 'hls.js';
import { ErrorCode } from '../../../core';
import { PlayerState, PlayerError } from './stream-player.state';

@Injectable()
export class HlsPlayerService {
  private hls: Hls | null = null;
  private videoEl: HTMLVideoElement | null = null;

  readonly state = signal<PlayerState>('idle');
  readonly error = signal<PlayerError | null>(null);
  readonly volume = signal(1);

  attachVideo(videoEl: HTMLVideoElement): void {
    this.videoEl = videoEl;
    this.setupVideoEventListeners(videoEl);
  }

  load(url: string, thumbnail?: string): void {
    if (!this.videoEl) return;

    this.cleanup();
    this.state.set('loading');
    this.error.set(null);

    if (Hls.isSupported()) {
      this.hls = new Hls();
      this.hls.loadSource(url);
      this.hls.attachMedia(this.videoEl);

      this.hls.on(Hls.Events.MANIFEST_PARSED, () => {
        this.videoEl?.play().catch(() => this.state.set('waiting'));
      });

      this.hls.on(Hls.Events.FRAG_BUFFERED, () => this.state.set('playing'));
      this.hls.on(Hls.Events.BUFFER_APPENDING, () => this.state.set('waiting'));

      this.hls.on(Hls.Events.ERROR, (_event, data) => {
        this.setError({
          code: ErrorCode.PLAYER_ERROR,
          message: data.details || 'HLS playback error',
          correlationId: crypto.randomUUID(),
        });
      });

      this.hls.on(Hls.Events.MEDIA_ATTACHED, () => {
        if (this.videoEl && thumbnail) {
          this.videoEl.poster = thumbnail;
        }
      });
    } else if (this.videoEl.canPlayType('application/vnd.apple.mpegurl')) {
      this.videoEl.src = url;
      this.videoEl.addEventListener('loadedmetadata', () => {
        this.state.set('playing');
        this.videoEl?.play().catch(() => this.state.set('waiting'));
      });
    } else {
      this.setError({
        code: ErrorCode.PLAYER_ERROR,
        message: 'HLS is not supported in this browser',
        correlationId: crypto.randomUUID(),
      });
    }
  }

  play(): void {
    this.videoEl?.play();
  }

  pause(): void {
    this.videoEl?.pause();
  }

  setVolume(volume: number): void {
    if (this.videoEl) {
      this.videoEl.volume = Math.max(0, Math.min(1, volume));
    }
  }

  getVolume(): number {
    return this.videoEl?.volume ?? 1;
  }

  isMuted(): boolean {
    return this.videoEl?.muted ?? false;
  }

  mute(): void {
    if (this.videoEl) this.videoEl.muted = true;
  }

  unmute(): void {
    if (this.videoEl) this.videoEl.muted = false;
  }

  private setupVideoEventListeners(video: HTMLVideoElement): void {
    video.addEventListener('play', () => this.state.set('playing'));
    video.addEventListener('pause', () => this.state.set('paused'));
    video.addEventListener('waiting', () => this.state.set('waiting'));
    video.addEventListener('playing', () => this.state.set('playing'));
    video.addEventListener('volumechange', () => {
      if (this.videoEl) this.volume.set(this.videoEl.volume);
    });
  }

  private setError(playerError: PlayerError): void {
    this.error.set(playerError);
    this.state.set('error');
  }

  private cleanup(): void {
    this.hls?.destroy();
    this.hls = null;
  }

  reset(): void {
    this.cleanup();
    this.state.set('idle');
    this.error.set(null);
    this.volume.set(1);
  }
}