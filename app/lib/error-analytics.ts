// Error analytics and statistics tracking

import { ErrorLog, ErrorStats, ErrorType } from '../types/player';
import { 
  getErrorStats, 
  saveErrorStats, 
  appendErrorLog, 
  resolveError as storageResolveError 
} from './storage';

export class ErrorAnalytics {
  private static instance: ErrorAnalytics;
  
  private constructor() {}
  
  static getInstance(): ErrorAnalytics {
    if (!ErrorAnalytics.instance) {
      ErrorAnalytics.instance = new ErrorAnalytics();
    }
    return ErrorAnalytics.instance;
  }
  
  logError(params: {
    channelId: string;
    channelName: string;
    errorType: ErrorType;
    errorCode: string;
    retryCount: number;
  }): void {
    const log: ErrorLog = {
      timestamp: Date.now(),
      channelId: params.channelId,
      channelName: params.channelName,
      errorType: params.errorType,
      errorCode: params.errorCode,
      retryCount: params.retryCount,
      resolved: false,
    };
    
    appendErrorLog(log);
  }
  
  resolveError(channelId: string, timestamp: number): void {
    storageResolveError(channelId, timestamp);
  }
  
  getStats(): ErrorStats {
    return getErrorStats();
  }
  
  exportStats(): string {
    const stats = getErrorStats();
    return JSON.stringify(stats, null, 2);
  }
  
  resetStats(): void {
    const emptyStats: ErrorStats = {
      totalErrors: 0,
      errorsByType: { api: 0, hls: 0, network: 0, buffer: 0, auth: 0 },
      errorsByChannel: {},
      avgResolutionTime: 0,
      lastUpdated: Date.now(),
    };
    saveErrorStats(emptyStats);
  }
}

// Singleton export
export const errorAnalytics = ErrorAnalytics.getInstance();
