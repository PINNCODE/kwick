import { ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface GlassPanelProps {
  children: ReactNode;
  className?: string;
  title?: string;
}

export function GlassPanel({ children, className, title }: GlassPanelProps) {
  return (
    <div
      className={cn(
        'backdrop-blur-2xl bg-white/10 rounded-2xl',
        'border border-white/20 shadow-xl',
        'text-white overflow-hidden',
        className
      )}
    >
      {title && (
        <div className="px-4 py-3 border-b border-white/10">
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
            {title}
          </h2>
        </div>
      )}
      <div className="p-2">{children}</div>
    </div>
  );
}
