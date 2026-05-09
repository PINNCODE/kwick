'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useXtreamAuth } from '../../hooks/useXtreamAuth';
import { Button } from '../ui/Button';

export function AuthRedirectBanner() {
  const { isAuthenticated, checkStoredAuth } = useXtreamAuth();
  const router = useRouter();
  const [showBanner, setShowBanner] = useState(false);
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    checkStoredAuth();
  }, [checkStoredAuth]);

  const handleRedirect = useCallback(() => {
    router.push('/player');
  }, [router]);

  useEffect(() => {
    if (isAuthenticated) {
      setShowBanner(true);
      setCountdown(3);

      const timer = setTimeout(() => {
        handleRedirect();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, handleRedirect]);

  useEffect(() => {
    if (isAuthenticated && countdown > 0) {
      const interval = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isAuthenticated, countdown]);

  const handleStay = () => {
    setShowBanner(false);
  };

  if (!isAuthenticated || !showBanner) {
    return null;
  }

  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-40 w-full max-w-md px-4">
      <div className="bg-blue-900/90 border border-blue-700 rounded-lg p-4 shadow-lg backdrop-blur-sm">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <p className="text-blue-100 font-medium text-sm">
              Redirigiendo al player en {Math.max(0, countdown)}s...
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleStay}
            className="min-h-[36px] min-w-[36px] px-4"
          >
            Quedarse
          </Button>
        </div>
      </div>
    </div>
  );
}
