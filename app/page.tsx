'use client';

import { useEffect } from 'react';
import { useXtreamAuth } from './hooks/useXtreamAuth';

export default function Home() {
  const { isAuthenticated, isLoading, checkStoredAuth } = useXtreamAuth();

  useEffect(() => {
    // Check for stored credentials on mount
    checkStoredAuth();
  }, [checkStoredAuth]);

  useEffect(() => {
    // Redirect based on auth state
    if (!isLoading) {
      if (isAuthenticated) {
        // Redirect to player
        window.location.href = '/player';
      } else {
        // Redirect to login
        window.location.href = '/login';
      }
    }
  }, [isAuthenticated, isLoading]);

  // Loading state while checking auth
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="flex flex-col items-center">
        <svg className="animate-spin h-12 w-12 text-blue-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-gray-400">Verificando sesión...</p>
      </div>
    </div>
  );
}
