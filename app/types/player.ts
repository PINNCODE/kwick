// Player State and Error Types

import { LiveStream } from './xtream';

export type ErrorType = 'api' | 'hls' | 'network' | 'buffer' | 'auth';

export interface PlayerError {
  code: string;
  message: string;
  type: 'network' | 'media' | 'decode' | 'other';
  recoverable: boolean;
}

export interface PlayerState {
  currentChannel: LiveStream | null;
  isPlaying: boolean;
  isBuffering: boolean;
  error: PlayerError | null;
  quality: string;
  volume: number;
}

export interface LastChannel {
  streamId: string;
  name: string;
  categoryId: string;
  timestamp: number;
}

export interface ErrorLog {
  timestamp: number;
  channelId: string;
  channelName: string;
  errorType: ErrorType;
  errorCode: string;
  retryCount: number;
  resolved: boolean;
  resolutionTime?: number;
}

export interface ErrorStats {
  totalErrors: number;
  errorsByType: Record<ErrorType, number>;
  errorsByChannel: Record<string, number>;
  avgResolutionTime: number;
  lastUpdated: number;
}

export interface SessionState {
  currentChannel: {
    streamId: string;
    streamUrl: string;
    name: string;
    categoryId: string;
    startTime: number;
  } | null;
  playerState: {
    isPlaying: boolean;
    quality: string;
  };
}

export interface Toast {
  id: string;
  message: string;
  type: 'info' | 'warning' | 'error';
  persistent: boolean;
  autoDismiss?: number;
}
