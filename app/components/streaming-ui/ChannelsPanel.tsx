'use client';

import Image from 'next/image';
import { GlassPanel } from '../ui/GlassPanel';
import { Channel } from '../../types/streaming';
import { cn } from '../../lib/utils';

interface ChannelsPanelProps {
  channels: Channel[];
  selectedChannelId: string | null;
  isLoading: boolean;
  onChannelSelect: (streamId: string) => void;
}

export function ChannelsPanel({
  channels,
  selectedChannelId,
  isLoading,
  onChannelSelect,
}: ChannelsPanelProps) {
  if (isLoading) {
    return (
      <GlassPanel title="Canales" className="flex-1 h-full">
        <div className="flex items-center justify-center py-8">
          <div className="text-blue-400 text-sm">Cargando...</div>
        </div>
      </GlassPanel>
    );
  }

  if (channels.length === 0) {
    return (
      <GlassPanel title="Canales" className="flex-1 h-full">
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <p className="text-gray-400 text-sm">No hay canales disponibles</p>
          <p className="text-gray-500 text-xs mt-2">Explora otras categorías</p>
        </div>
      </GlassPanel>
    );
  }

  return (
    <GlassPanel title="Canales" className="flex-1 h-full">
      <ul className="space-y-1 max-h-full overflow-y-auto scrollbar-hide">
        {channels.map((channel) => {
          const isSelected = channel.stream_id === selectedChannelId;

          return (
            <li key={channel.stream_id}>
              <button
                onClick={() => onChannelSelect(channel.stream_id)}
                className={cn(
                  'w-full text-left px-3 py-2 rounded-lg text-sm',
                  'flex items-center gap-3 transition-colors duration-150',
                  'hover:bg-white/10',
                  isSelected && 'bg-blue-600/30 border border-blue-500/40'
                )}
              >
                <span className="text-xs text-gray-500 w-5 text-right flex-shrink-0">
                  {channel.num}.
                </span>
                <div className="relative w-8 h-8 flex-shrink-0 bg-gray-800 rounded overflow-hidden">
                  {channel.stream_icon ? (
                    <Image
                      src={channel.stream_icon}
                      alt={channel.name}
                      fill
                      className="object-contain"
                      sizes="32px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">
                      TV
                    </div>
                  )}
                </div>
                <span className={cn('truncate', isSelected && 'text-blue-300')}>
                  {channel.name}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </GlassPanel>
  );
}
