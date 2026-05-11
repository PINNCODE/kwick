'use client';

import { useEffect, useRef } from 'react';
import { GlassPanel } from '../ui/GlassPanel';
import { LiveBadge } from '../ui/LiveBadge';
import { StadiumBackground } from '../ui/StadiumBackground';
import { Category, LiveStream, EpgListing } from '../../types/xtream';
import { cn } from '../../lib/utils';
import { UseCascadingMenuReturn } from '../../types/streaming-menu';

interface StreamingMenuOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  menuState: UseCascadingMenuReturn;
}

function decodeBase64(str: string): string {
  if (!str || typeof str !== 'string') return '';
  
  const trimmed = str.trim();
  
  if (trimmed.includes(' ') || trimmed.length < 4) return trimmed;
  
  try {
    const decoded = atob(trimmed);
    
    const bytes = new Uint8Array(decoded.length);
    for (let i = 0; i < decoded.length; i++) {
      bytes[i] = decoded.charCodeAt(i);
    }
    
    const utf8String = new TextDecoder('utf-8').decode(bytes);
    
    if (utf8String.length > 0 && /[\u00C0-\u00FFa-zA-Z0-9\s]/.test(utf8String)) {
      return utf8String;
    }
    
    return decoded;
  } catch {
    // Not valid Base64
  }
  
  return trimmed;
}

function formatTime(value: string | null): string {
  if (!value) return '--:--';
  
  const trimmed = value.trim();
  let date: Date;
  
  if (/^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}$/.test(trimmed)) {
    date = new Date(trimmed + ' UTC');
  } else {
    const parsed = parseInt(trimmed, 10);
    if (isNaN(parsed) || parsed === 0) return '--:--';
    date = new Date(parsed * 1000);
  }
  
  if (isNaN(date.getTime())) return '--:--';
  
  const hours = date.getUTCHours().toString().padStart(2, '0');
  const minutes = date.getUTCMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

function parseTimestamp(value: string | null | undefined): number | null {
  if (!value || value === '0' || value.trim() === '') return null;
  
  const trimmed = value.trim();
  
  if (/^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}$/.test(trimmed)) {
    const dateMs = new Date(trimmed + ' UTC').getTime();
    if (isNaN(dateMs) || dateMs === 0) return null;
    return dateMs;
  }
  
  const parsed = parseInt(trimmed, 10);
  if (isNaN(parsed) || parsed === 0) return null;
  
  if (parsed < 946684800) return null;
  
  return parsed * 1000;
}

function isProgramLive(program: EpgListing): boolean {
  const startMs = parseTimestamp(program.start_timestamp) ?? parseTimestamp(program.start);
  const endMs = parseTimestamp(program.stop_timestamp) ?? parseTimestamp(program.end) ?? parseTimestamp(program.stop);
  
  if (startMs === null || endMs === null) return false;
  
  if (endMs <= startMs) return false;
  
  const now = Date.now();
  const oneDayMs = 24 * 60 * 60 * 1000;
  
  if (startMs > now + oneDayMs || endMs < now - oneDayMs) return false;
  
  return now >= startMs && now < endMs;
}

export function StreamingMenuOverlay({ isOpen, onClose, categories, menuState }: StreamingMenuOverlayProps) {
  const categoryRefs = useRef<HTMLButtonElement[]>([]);
  const channelRefs = useRef<HTMLButtonElement[]>([]);
  const prevCategoryRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (menuState.selectedCategory !== prevCategoryRef.current) {
      prevCategoryRef.current = menuState.selectedCategory;
    }
  }, [menuState.selectedCategory]);

  const shouldShowChannelFocus = menuState.activePanel === 1 && menuState.viewMode === 'channels';

  useEffect(() => {
    if (shouldShowChannelFocus) {
      channelRefs.current[menuState.focusedChannelIndex]?.scrollIntoView({ block: 'nearest' });
    }
  }, [menuState.focusedChannelIndex, shouldShowChannelFocus]);

  useEffect(() => {
    categoryRefs.current[menuState.focusedCategoryIndex]?.scrollIntoView({ block: 'nearest' });
  }, [menuState.focusedCategoryIndex]);

  useEffect(() => {
    if (isOpen) {
      categoryRefs.current = [];
      channelRefs.current = [];
      prevCategoryRef.current = null;
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      if (menuState.selectedCategory) {
        const catIdx = categories.findIndex(c => c.category_id === menuState.selectedCategory);
        if (catIdx >= 0) {
          categoryRefs.current[catIdx]?.scrollIntoView({ block: 'center' });
        }
      }
      if (menuState.viewMode === 'channels' && menuState.selectedChannel) {
        const chIdx = menuState.channels.findIndex(c => c.stream_id === menuState.selectedChannel);
        if (chIdx >= 0) {
          channelRefs.current[chIdx]?.scrollIntoView({ block: 'center' });
        }
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [isOpen, menuState.viewMode, menuState.selectedCategory, menuState.selectedChannel, menuState.channels, categories]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0" onClick={onClose}>
        <StadiumBackground />
      </div>

      <div className="absolute inset-0 bg-black/40" />

      <div className="relative z-10 flex items-stretch justify-start gap-4 p-6 h-full">
        {/* Categories Panel */}
        <GlassPanel title="Categorías" className="w-64 h-full">
          <ul className="space-y-1 max-h-full overflow-y-auto scrollbar-hide">
            {categories.map((category, index) => {
              const isSelected = category.category_id === menuState.selectedCategory;
              const isFocused = index === menuState.focusedCategoryIndex;
              const decodedName = decodeBase64(category.category_name);
              const shouldShowCategoryFocus = menuState.activePanel === 0;

              return (
                <li
                  key={category.category_id}
                  className="rounded-xl transition-all duration-150"
                >
                  <button
                    ref={el => { categoryRefs.current[index] = el!; }}
                    onClick={() => menuState.selectCategory(category.category_id)}
                    className={cn(
                      'w-full text-left px-3 py-2 rounded-xl text-sm',
                      'text-white transition-all duration-150',
                      'hover:bg-white/15',
                      'focus:outline-none',
                      isSelected && 'bg-white/20 font-semibold shadow-inner',
                      shouldShowCategoryFocus && isFocused && 'ring-2 ring-white/40'
                    )}
                    style={{ textShadow: '0 1px 2px rgba(0,0,0,0.7)' }}
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-xs opacity-50">TV</span>
                      {decodedName}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </GlassPanel>

        {/* Channels Panel */}
        {menuState.viewMode === 'channels' && (
          <GlassPanel title="Canales" className="flex-1 h-full">
            {menuState.isLoadingChannels ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin h-8 w-8 border-2 border-white/40 border-t-white rounded-full" />
              </div>
            ) : menuState.channels.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <p className="text-white/60 text-sm">No hay canales disponibles</p>
              </div>
            ) : (
              <ul className="space-y-1 max-h-full overflow-y-auto scrollbar-hide">
                {menuState.channels.map((channel: LiveStream, index: number) => {
                  const isSelected = channel.stream_id === menuState.selectedChannel;
                  const isFocused = index === menuState.focusedChannelIndex;
                  const decodedName = decodeBase64(channel.name);

                  return (
                    <li key={channel.stream_id}>
                      <button
                        ref={el => { channelRefs.current[index] = el!; }}
                        onClick={() => menuState.selectChannel(channel)}
                        className={cn(
                          'w-full text-left px-3 py-2 rounded-xl text-sm',
                          'flex items-center gap-3 transition-all duration-150',
                          'text-white hover:bg-white/15',
                          'focus:outline-none',
                          isSelected && 'bg-white/10 border-l-2 border-white/50',
                          shouldShowChannelFocus && isFocused && 'ring-2 ring-white/40 bg-white/15'
                        )}
                        style={{ textShadow: '0 1px 2px rgba(0,0,0,0.7)' }}
                      >
                        <span className="text-xs text-white/50 w-5 text-right flex-shrink-0 font-mono">
                          {index + 1}
                        </span>
                        <div className="relative w-8 h-8 flex-shrink-0 bg-white/10 rounded-lg overflow-hidden backdrop-blur-sm">
                          {channel.stream_icon ? (
                            <img
                              src={channel.stream_icon}
                              alt=""
                              className="w-full h-full object-contain"
                              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white/30 text-xs">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <span className="truncate flex-1">
                          {decodedName}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </GlassPanel>
        )}

        {/* EPG Panel */}
        {menuState.viewMode === 'channels' && (
          <GlassPanel title="Guía de Programas" className="w-72 h-full">
            {menuState.isLoadingEpg ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin h-8 w-8 border-2 border-white/40 border-t-white rounded-full" />
              </div>
            ) : menuState.epg.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-white/50 text-sm">Sin programación disponible</p>
              </div>
            ) : (
              <ul className="space-y-2 max-h-full overflow-y-auto scrollbar-hide">
                {menuState.epg.map((program: EpgListing) => {
                  const live = isProgramLive(program);
                  const decodedTitle = decodeBase64(program.title);

                  return (
                    <li
                      key={program.id}
                      className={cn(
                        'px-3 py-2 rounded-xl',
                        live && 'bg-red-500/20 border border-red-400/30'
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm truncate text-white" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.7)' }}>
                            {decodedTitle}
                          </p>
                          <p className="text-xs text-white/60 mt-0.5" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
                            {formatTime(program.start)}→
                            {formatTime(program.stop) || formatTime(program.end) || 'Hora de fin por definir'}
                          </p>
                        </div>
                        {live && <LiveBadge />}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </GlassPanel>
        )}
      </div>
    </div>
  );
}
