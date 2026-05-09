'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '../ui/Button';
import { useXtreamAuth } from '../../hooks/useXtreamAuth';
import { useRouter } from 'next/navigation';

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const { isAuthenticated } = useXtreamAuth();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled ? 'bg-black/95 backdrop-blur-md border-b border-gray-800' : 'bg-transparent'
      )}
    >
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-lg sm:text-xl font-bold text-white">Kwick</span>
          </Link>

          {/* Login Button */}
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <Button
                variant="primary"
                size="sm"
                onClick={() => router.push('/player')}
                className="min-h-[44px]"
              >
                Ir al Player
              </Button>
            ) : (
              <Link href="/login">
                <Button variant="primary" size="md" className="min-h-[44px]">
                  Iniciar Sesión
                </Button>
              </Link>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}

function cn(...classes: unknown[]) {
  return classes.filter(Boolean).join(' ');
}
