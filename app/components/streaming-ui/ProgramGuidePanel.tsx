'use client';

import { GlassPanel } from '../ui/GlassPanel';
import { LiveBadge } from '../ui/LiveBadge';
import { Program } from '../../types/streaming';
import { cn } from '../../lib/utils';

interface ProgramGuidePanelProps {
  programs: Program[];
  isLoading: boolean;
  error: Error | null;
  onRetry: () => void;
}

function formatTime(unixTimestamp: string): string {
  const date = new Date(parseInt(unixTimestamp, 10) * 1000);
  return date.toLocaleTimeString('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

function isProgramLive(program: Program): boolean {
  const now = Date.now();
  const start = parseInt(program.start, 10) * 1000;
  const end = program.end ? parseInt(program.end, 10) * 1000 : null;
  return now >= start && (end === null || now < end);
}

export function ProgramGuidePanel({
  programs,
  isLoading,
  error,
  onRetry,
}: ProgramGuidePanelProps) {
  if (isLoading) {
    return (
      <GlassPanel title="Guía de Programas" className="w-72 h-full">
        <div className="flex items-center justify-center py-8">
          <div className="text-blue-400 text-sm">Cargando...</div>
        </div>
      </GlassPanel>
    );
  }

  if (error) {
    return (
      <GlassPanel title="Guía de Programas" className="w-72 h-full">
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <p className="text-gray-400 text-sm">
            Información del programa temporalmente no disponible
          </p>
          <button
            onClick={onRetry}
            className="mt-3 px-4 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Reintentar
          </button>
        </div>
      </GlassPanel>
    );
  }

  if (programs.length === 0) {
    return (
      <GlassPanel title="Guía de Programas" className="w-72 h-full">
        <div className="flex items-center justify-center py-8">
          <p className="text-gray-500 text-sm">Sin programación disponible</p>
        </div>
      </GlassPanel>
    );
  }

  return (
    <GlassPanel title="Guía de Programas" className="w-72 h-full">
      <ul className="space-y-2 max-h-full overflow-y-auto scrollbar-hide">
        {programs.map((program) => {
          const live = isProgramLive(program);

          return (
            <li
              key={program.id}
              className={cn(
                'px-3 py-2 rounded-lg',
                live && 'bg-red-600/10 border border-red-500/20'
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className={cn('text-sm truncate', live && 'text-white font-medium')}>
                    {program.title}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {formatTime(program.start)}→
                    {program.end ? formatTime(program.end) : 'Hora de fin por definir'}
                  </p>
                </div>
                {live && <LiveBadge />}
              </div>
            </li>
          );
        })}
      </ul>
    </GlassPanel>
  );
}
