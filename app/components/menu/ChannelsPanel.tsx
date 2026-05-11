'use client';

import { useRef, useEffect } from 'react';
import { LiveStream } from '../../types/xtream';

interface ChannelsPanelProps {
  channels: LiveStream[];
  selectedId: string | null;
  focusedIndex: number;
  isActive: boolean;
  isLoading: boolean;
  onSelect: (channel: LiveStream) => void;
  onBack: () => void;
}

// Helper function to decode Base64 with UTF-8 support
function decodeBase64(str: string): string {
  if (!str || typeof str !== 'string') return '';
  
  const trimmed = str.trim();
  
  // If it has spaces or is too short, it's not Base64
  if (trimmed.includes(' ') || trimmed.length < 4) return trimmed;
  
  try {
    // Decode Base64 to bytes (Latin1)
    const decoded = atob(trimmed);
    
    // Convert to bytes array
    const bytes = new Uint8Array(decoded.length);
    for (let i = 0; i < decoded.length; i++) {
      bytes[i] = decoded.charCodeAt(i);
    }
    
    // Decode as UTF-8 for proper Spanish characters (áéíóúüñ)
    const utf8String = new TextDecoder('utf-8').decode(bytes);
    
    // Check if result looks like readable text
    if (utf8String.length > 0 && /[\u00C0-\u00FFa-zA-Z0-9\s]/.test(utf8String)) {
      return utf8String;
    }
    
    return decoded; // Fallback to Latin1
  } catch (e) {
    // Not valid Base64
  }
  
  return trimmed;
}

export function ChannelsPanel({ channels, selectedId, focusedIndex, isActive, isLoading, onSelect, onBack }: ChannelsPanelProps) {
  const itemRefs = useRef<HTMLButtonElement[]>([]);

  useEffect(() => {
    itemRefs.current[focusedIndex]?.scrollIntoView({ block: 'nearest' });
  }, [focusedIndex]);

  return (
    <div 
      className={`flex flex-col h-full border-r border-gray-800 ${isActive ? 'bg-gray-800/30' : ''}`}
      style={{ flex: '0 0 35%' }}
    >
      <div className="p-4 border-b border-gray-800 flex-shrink-0 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Canales</h3>
        <button onClick={onBack} className="text-gray-400 hover:text-white">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full" />
          </div>
        ) : channels.length === 0 ? (
          <p className="text-gray-500 text-center p-4">Selecciona una categoría</p>
        ) : (
          channels.map((channel, index) => (
            <button
              key={channel.stream_id}
              ref={el => { itemRefs.current[index] = el!; }}
              onClick={() => onSelect(channel)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                selectedId === channel.stream_id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              } ${
                focusedIndex === index ? 'ring-2 ring-blue-400' : ''
              }`}
            >
              <span className="text-xs font-mono text-gray-500 w-6">{index + 1}</span>
              {channel.stream_icon ? (
                <img 
                  src={channel.stream_icon} 
                  alt="" 
                  className="w-8 h-8 object-contain"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              ) : (
                <div className="w-8 h-8 bg-gray-700 rounded flex items-center justify-center">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
              <span className="flex-1 text-sm truncate">{decodeBase64(channel.name)}</span>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
