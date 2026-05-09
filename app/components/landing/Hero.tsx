'use client';

import Link from 'next/link';
import { Button } from '../ui/Button';
import { Section } from '../ui/Section';

export function Hero() {
  return (
    <Section variant="gradient" className="min-h-screen flex items-center relative overflow-hidden">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        {/* Left: Text Content */}
        <div className="space-y-6 order-2 lg:order-1">
          <h1 
            className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white"
            style={{ 
              fontSize: 'clamp(2.25rem, 5vw, 3.75rem)',
              lineHeight: '1.1'
            }}
          >
            TV Simple.{' '}
            <span className="text-blue-500">Sin Distracciones.</span>
          </h1>
          
          <p 
            className="text-lg sm:text-xl text-gray-300 max-w-xl"
            style={{ fontSize: 'clamp(1rem, 2vw, 1.25rem)' }}
          >
            La experiencia de streaming más sencilla. Solo canales de TV. 
            Nada de VOD, nada de menús complejos. Solo enciende y mira.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link href="/login">
              <Button size="lg" className="w-full sm:w-auto">
                Iniciar Sesión
              </Button>
            </Link>
          </div>

          <p className="text-sm text-gray-400 pt-2">
            Sin registro. Acceso inmediato con tus credenciales de IPTV.
          </p>
        </div>

        {/* Right: Visual Placeholder */}
        <div className="relative order-1 lg:order-2">
          <div className="aspect-video bg-gray-900 rounded-lg border border-gray-800 overflow-hidden shadow-2xl">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="w-20 h-20 mx-auto bg-blue-600/20 rounded-full flex items-center justify-center">
                  <svg className="w-10 h-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-gray-400 text-sm">Vista previa de la aplicación</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
