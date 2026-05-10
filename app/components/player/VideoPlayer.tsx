'use client';

import { useEffect, useRef, useCallback } from 'react';
import Hls from 'hls.js';
import { LiveStream } from '../../types/xtream';
import { PlayerError } from '../../types/player';

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
  
  // Store callbacks in refs to prevent re-creation of setupHls
  const onErrorRef = useRef(onError);
  const onPlayingRef = useRef(onPlaying);
  const onBufferingRef = useRef(onBuffering);
  const onRetryRef = useRef(onRetry);
  
  // Update refs when callbacks change (doesn't trigger re-renders)
  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);
  
  useEffect(() => {
    onPlayingRef.current = onPlaying;
  }, [onPlaying]);
  
  useEffect(() => {
    onBufferingRef.current = onBuffering;
  }, [onBuffering]);
  
  useEffect(() => {
    onRetryRef.current = onRetry;
  }, [onRetry]);

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

      // Error handling with retry logic - use refs to prevent re-creation
      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              if (retryCountRef.current < maxRetries) {
                retryCountRef.current++;
                onRetryRef.current?.(retryCountRef.current);
                
                // Exponential backoff: 1s, 2s, 4s
                const delay = Math.pow(2, retryCountRef.current - 1) * 1000;
                setTimeout(() => {
                  hls.startLoad();
                }, delay);
              } else {
                onErrorRef.current?.({
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
                onRetryRef.current?.(retryCountRef.current);
                hls.recoverMediaError();
              } else {
                onErrorRef.current?.({
                  code: 'MEDIA_ERROR',
                  message: 'Error de media después de múltiples intentos',
                  type: 'media',
                  recoverable: false,
                });
              }
              break;
            default:
              onErrorRef.current?.({
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

      // Handle buffer events
      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.details === Hls.ErrorDetails.BUFFER_STALLED_ERROR) {
          onBufferingRef.current?.();
        }
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
  }, [streamUrl, autoPlay, destroyHls]); // Removed callback dependencies

  useEffect(() => {
    setupHls();

    return () => {
      destroyHls();
    };
  }, [setupHls, destroyHls]); // setupHls now only depends on streamUrl and autoPlay

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
