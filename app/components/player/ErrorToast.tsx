'use client';

import { useEffect, useState, useCallback } from 'react';
import { PlayerError } from '../../types/player';

interface Toast {
  id: string;
  message: string;
  type: 'info' | 'warning' | 'error';
  persistent: boolean;
}

interface ErrorToastProps {
  error: PlayerError | null;
  isRetrying: boolean;
  retryCount: number;
  onDismiss: () => void;
}

export function ErrorToast({ error, isRetrying, retryCount, onDismiss }: ErrorToastProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: 'info' | 'warning' | 'error', persistent: boolean = false) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type, persistent }]);
    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Handle retrying state
  useEffect(() => {
    if (isRetrying && retryCount > 0) {
      const toastId = addToast(`Reconectando... (Intento ${retryCount})`, 'warning');
      return () => removeToast(toastId);
    }
  }, [isRetrying, retryCount, addToast, removeToast]);

  // Handle error state
  useEffect(() => {
    if (error) {
      const toastId = addToast(error.message, 'error', true);
      return () => {
        // Only remove if not persistent
        const toast = toasts.find(t => t.id === toastId);
        if (!toast?.persistent) {
          removeToast(toastId);
        }
      };
    }
  }, [error, addToast, removeToast, toasts]);

  // Handle recovery - dismiss non-persistent toasts
  useEffect(() => {
    if (!isRetrying && !error && toasts.length > 0) {
      setToasts(prev => prev.filter(t => t.persistent));
      onDismiss();
    }
  }, [isRetrying, error, toasts.length, onDismiss]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            px-4 py-3 rounded-lg shadow-lg max-w-sm animate-fade-in
            ${
              toast.type === 'error'
                ? 'bg-red-900/90 text-white border border-red-700'
                : toast.type === 'warning'
                ? 'bg-yellow-900/90 text-white border border-yellow-700'
                : 'bg-blue-900/90 text-white border border-blue-700'
            }
          `}
        >
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div className="flex-shrink-0 mt-0.5">
              {toast.type === 'error' ? (
                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : toast.type === 'warning' ? (
                <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>
            
            {/* Message */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">
                {toast.type === 'error' ? 'Error de conexión' : 
                 toast.type === 'warning' ? 'Reconectando' : 'Información'}
              </p>
              <p className="text-sm opacity-90 mt-1">{toast.message}</p>
            </div>
            
            {/* Close button for persistent toasts */}
            {toast.persistent && (
              <button
                onClick={() => removeToast(toast.id)}
                className="flex-shrink-0 text-white/70 hover:text-white"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          
          {/* Progress bar for non-persistent toasts */}
          {!toast.persistent && (
            <div className="mt-3 h-1 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white/60 rounded-full animate-progress" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
