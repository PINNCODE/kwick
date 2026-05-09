// HLS Player hook with error handling and retry logic

import { useState, useCallback, useRef } from 'react';
import { LiveStream } from '../types/xtream';
import { PlayerError } from '../types/player';
import { errorAnalytics } from '../lib/error-analytics';

type PlayerState = 'idle' | 'loading' | 'playing' | 'buffering' | 'error' | 'retrying';

interface UseHlsPlayerReturn {
  playerState: PlayerState;
  error: PlayerError | null;
  retryCount: number;
  isRetrying: boolean;
  handleError: (error: PlayerError, channel: LiveStream) => void;
  handleRetry: (attempt: number) => void;
  handlePlaying: () => void;
  handleBuffering: () => void;
  resetError: () => void;
}

export function useHlsPlayer(): UseHlsPlayerReturn {
  const [playerState, setPlayerState] = useState<PlayerState>('idle');
  const [error, setError] = useState<PlayerError | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  
  const errorTimestampRef = useRef<number | null>(null);
  const currentChannelRef = useRef<LiveStream | null>(null);

  const handleError = useCallback((playerError: PlayerError, channel: LiveStream) => {
    currentChannelRef.current = channel;
    
    // Log error
    errorAnalytics.logError({
      channelId: channel.stream_id,
      channelName: channel.name,
      errorType: playerError.type === 'network' ? 'network' : 'hls',
      errorCode: playerError.code,
      retryCount: retryCount,
    });

    if (!errorTimestampRef.current) {
      errorTimestampRef.current = Date.now();
    }

    setError(playerError);
    setPlayerState('error');
    setIsRetrying(false);
  }, [retryCount]);

  const handleRetry = useCallback((attempt: number) => {
    setRetryCount(attempt);
    setIsRetrying(true);
    setPlayerState('retrying');
    
    // Clear error when retrying
    if (attempt === 1) {
      setError(null);
    }
  }, []);

  const handlePlaying = useCallback(() => {
    setPlayerState('playing');
    setIsRetrying(false);
    setRetryCount(0);
    
    // Resolve error if we were in error state
    if (errorTimestampRef.current && currentChannelRef.current) {
      errorAnalytics.resolveError(
        currentChannelRef.current.stream_id,
        errorTimestampRef.current
      );
      errorTimestampRef.current = null;
    }
    
    setError(null);
  }, []);

  const handleBuffering = useCallback(() => {
    setPlayerState('buffering');
  }, []);

  const resetError = useCallback(() => {
    setError(null);
    setRetryCount(0);
    setIsRetrying(false);
    setPlayerState('idle');
    errorTimestampRef.current = null;
  }, []);

  return {
    playerState,
    error,
    retryCount,
    isRetrying,
    handleError,
    handleRetry,
    handlePlaying,
    handleBuffering,
    resetError,
  };
}
