'use client';

import { LiveStream } from '../../types/xtream';

interface ChannelGridProps {
  channels: LiveStream[];
  selectedChannelId: string;
  onSelectChannel: (channel: LiveStream) => void;
}

export function ChannelGrid({
  channels,
  selectedChannelId,
  onSelectChannel,
}: ChannelGridProps) {
  if (channels.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No hay canales en esta categoría
      </div>
    );
  }

  return (
    <div className="overflow-y-auto h-full p-4">
      <div className="grid grid-cols-1 gap-2">
        {channels.map((channel, index) => (
          <button
            key={channel.stream_id}
            onClick={() => onSelectChannel(channel)}
            className={`
              flex items-center p-3 rounded-lg transition-all text-left
              ${
                selectedChannelId === channel.stream_id
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }
            `}
          >
            {/* Channel Number */}
            <span className="text-sm font-mono text-gray-500 w-8 flex-shrink-0">
              {index + 1}
            </span>
            
            {/* Channel Logo */}
            {channel.stream_icon ? (
              <img
                src={channel.stream_icon}
                alt={channel.name}
                className="w-10 h-10 object-contain mr-3 flex-shrink-0"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="w-10 h-10 bg-gray-700 rounded flex items-center justify-center mr-3 flex-shrink-0">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
            )}
            
            {/* Channel Name */}
            <span className="font-medium truncate flex-1">{channel.name}</span>
            
            {/* Playing Indicator */}
            {selectedChannelId === channel.stream_id && (
              <svg className="w-5 h-5 ml-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
