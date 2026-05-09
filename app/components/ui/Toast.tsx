'use client';

import { useEffect, useState } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

export interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, type = 'info', onClose, duration = 5000 }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const typeStyles = {
    success: 'bg-green-900/90 border-green-700 text-green-100',
    error: 'bg-red-900/90 border-red-700 text-red-100',
    info: 'bg-blue-900/90 border-blue-700 text-blue-100',
    warning: 'bg-yellow-900/90 border-yellow-700 text-yellow-100',
  };

  const iconMap = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
    warning: '⚠',
  };

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        'fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg',
        'animate-fade-in max-w-md',
        typeStyles[type]
      )}
      role="alert"
    >
      <span className="text-xl font-bold">{iconMap[type]}</span>
      <p className="text-sm font-medium">{message}</p>
      <button
        onClick={() => {
          setIsVisible(false);
          setTimeout(onClose, 300);
        }}
        className="ml-auto text-current opacity-70 hover:opacity-100 transition-opacity"
        aria-label="Close"
      >
        ✕
      </button>
    </div>
  );
}
