'use client';

import { useEffect, useRef, useCallback } from 'react';
import Hls from 'hls.js';
import { LiveStream } from '../types/xtream';
import { PlayerError } from '../types/player';

interface VideoPlayerProps {
  channel: LiveStream;
  streamUrl: string;
  autoPlay?: boolean;
  onError?: (error: PlayerError) => void;
  onPlaying?: () => void;
  onBuffering?: () => void;
  onRetry?: (attempt: number) => void;
}

export function VideoPlayer({
  channel,
  streamUrl,
  autoPlay = true,
  onError,
  onPlaying,
  onBuffering,
  onRetry,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const retryCountRef = useRef(0);
  const maxRetries = 3;

  const destroyHls = useCallback(() => {
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
  }, []);

  const setupHls = useCallback(() => {
    if (!videoRef.current) return;

    destroyHls();
    retryCountRef.current = 0;

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
        maxBufferLength: 30,
        maxMaxBufferLength: 60,
        liveSyncDurationCount: 3,
        liveMaxLatencyDurationCount: 10,
      });

      hlsRef.current = hls;

      // Error handling with retry logic
      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              if (retryCountRef.current < maxRetries) {
                retryCountRef.current++;
                onRetry?.(retryCountRef.current);
                
                // Exponential backoff: 1s, 2s, 4s
                const delay = Math.pow(2, retryCountRef.current - 1) * 1000;
                setTimeout(() => {
                  hls.startLoad();
                }, delay);
              } else {
                onError?.({
                  code: 'NETWORK_ERROR',
                  message: 'Error de red después de múltiples intentos',
                  type: 'network',
                  recoverable: false,
                });
              }
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              if (retryCountRef.current < maxRetries) {
                retryCountRef.current++;
                onRetry?.(retryCountRef.current);
                hls.recoverMediaError();
              } else {
                onError?.({
                  code: 'MEDIA_ERROR',
                  message: 'Error de media después de múltiples intentos',
                  type: 'media',
                  recoverable: false,
                });
              }
              break;
            default:
              onError?.({
                code: 'UNKNOWN_ERROR',
                message: 'Error desconocido',
                type: 'other',
                recoverable: false,
              });
              break;
          }
        }
      });

      // Events
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (autoPlay && videoRef.current) {
          videoRef.current.play().catch(() => {
            // Autoplay blocked, will need user interaction
          });
        }
      });

      hls.on(Hls.Events.BUFFER_STALLED, () => {
        onBuffering?.();
      });

      hls.on(Hls.Events.BUFFER_FLUSHED, () => {
        onPlaying?.();
      });

      hls.loadSource(streamUrl);
      hls.attachMedia(videoRef.current);
    } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS support (Safari)
      videoRef.current.src = streamUrl;
      if (autoPlay) {
        videoRef.current.play().catch(() => {
          // Autoplay blocked
        });
      }
    }
  }, [streamUrl, autoPlay, onError, onPlaying, onBuffering, onRetry, destroyHls]);

  useEffect(() => {
    setupHls();

    return () => {
      destroyHls();
    };
  }, [setupHls, destroyHls]);

  // Handle visibility change (pause when tab hidden)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (videoRef.current) {
        if (document.hidden) {
          videoRef.current.pause();
        } else {
          videoRef.current.play().catch(() => {
            // Ignore autoplay errors
          });
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <video
      ref={videoRef}
      className="w-full h-full object-contain"
      autoPlay={autoPlay}
      playsInline
      muted={false}
      controls={false}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 1,
      }}
    />
  );
}
