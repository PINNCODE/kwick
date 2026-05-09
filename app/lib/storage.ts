// Storage utilities for LocalStorage and SessionStorage

import { Credentials, UserInfo } from '../types/xtream';
import { LastChannel, ErrorStats, ErrorLog, SessionState } from '../types/player';

const STORAGE_KEYS = {
  CREDENTIALS: 'credentials',
  LAST_CHANNEL: 'lastChannel',
  ERROR_STATS: 'errorStats',
  SESSION_STATE: 'sessionState',
} as const;

// Credentials
export function saveCredentials(credentials: Credentials & { userInfo: UserInfo }): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.CREDENTIALS, JSON.stringify(credentials));
  }
}

export function getCredentials(): (Credentials & { userInfo: UserInfo }) | null {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem(STORAGE_KEYS.CREDENTIALS);
  return data ? JSON.parse(data) : null;
}

export function clearCredentials(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEYS.CREDENTIALS);
  }
}

// Last Channel
export function saveLastChannel(channel: LastChannel): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.LAST_CHANNEL, JSON.stringify(channel));
  }
}

export function getLastChannel(): LastChannel | null {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem(STORAGE_KEYS.LAST_CHANNEL);
  return data ? JSON.parse(data) : null;
}

export function clearLastChannel(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEYS.LAST_CHANNEL);
  }
}

// Error Stats
export function getErrorStats(): ErrorStats {
  if (typeof window === 'undefined') {
    return {
      totalErrors: 0,
      errorsByType: { api: 0, hls: 0, network: 0, buffer: 0, auth: 0 },
      errorsByChannel: {},
      avgResolutionTime: 0,
      lastUpdated: Date.now(),
    };
  }
  
  const data = localStorage.getItem(STORAGE_KEYS.ERROR_STATS);
  if (data) {
    return JSON.parse(data);
  }
  
  return {
    totalErrors: 0,
    errorsByType: { api: 0, hls: 0, network: 0, buffer: 0, auth: 0 },
    errorsByChannel: {},
    avgResolutionTime: 0,
    lastUpdated: Date.now(),
  };
}

export function saveErrorStats(stats: ErrorStats): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.ERROR_STATS, JSON.stringify(stats));
  }
}

export function appendErrorLog(log: ErrorLog): void {
  const stats = getErrorStats();
  stats.totalErrors++;
  stats.errorsByType[log.errorType]++;
  stats.errorsByChannel[log.channelId] = (stats.errorsByChannel[log.channelId] || 0) + 1;
  stats.lastUpdated = Date.now();
  
  // Calculate new average resolution time
  const logs = getErrorLogs();
  const resolvedLogs = [...logs, log].filter(l => l.resolved && l.resolutionTime);
  if (resolvedLogs.length > 0) {
    const totalTime = resolvedLogs.reduce((sum, l) => sum + (l.resolutionTime || 0), 0);
    stats.avgResolutionTime = totalTime / resolvedLogs.length;
  }
  
  saveErrorStats(stats);
  saveErrorLogs([...logs, log]);
}

function getErrorLogs(): ErrorLog[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem('errorLogs');
  return data ? JSON.parse(data) : [];
}

function saveErrorLogs(logs: ErrorLog[]): void {
  if (typeof window !== 'undefined') {
    // Keep only last 100 logs to prevent storage bloat
    const trimmedLogs = logs.slice(-100);
    localStorage.setItem('errorLogs', JSON.stringify(trimmedLogs));
  }
}

export function resolveError(channelId: string, timestamp: number): void {
  const logs = getErrorLogs();
  const updatedLogs = logs.map(log => {
    if (log.channelId === channelId && log.timestamp === timestamp && !log.resolved) {
      return {
        ...log,
        resolved: true,
        resolutionTime: Date.now() - log.timestamp,
      };
    }
    return log;
  });
  saveErrorLogs(updatedLogs);
  
  // Recalculate stats
  const stats = getErrorStats();
  const resolvedLogs = updatedLogs.filter(l => l.resolved && l.resolutionTime);
  if (resolvedLogs.length > 0) {
    const totalTime = resolvedLogs.reduce((sum, l) => sum + (l.resolutionTime || 0), 0);
    stats.avgResolutionTime = totalTime / resolvedLogs.length;
    saveErrorStats(stats);
  }
}

// Session State
export function saveSessionState(state: SessionState): void {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(STORAGE_KEYS.SESSION_STATE, JSON.stringify(state));
  }
}

export function getSessionState(): SessionState | null {
  if (typeof window === 'undefined') return null;
  const data = sessionStorage.getItem(STORAGE_KEYS.SESSION_STATE);
  return data ? JSON.parse(data) : null;
}

export function clearSession(): void {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(STORAGE_KEYS.SESSION_STATE);
  }
}
