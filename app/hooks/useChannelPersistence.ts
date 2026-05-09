// Channel persistence and auto-play logic

import { useCallback } from 'react';
import { LiveStream } from '../types/xtream';
import { Category } from '../types/xtream';
import { LastChannel } from '../types/player';
import { saveLastChannel, getLastChannel } from '../lib/storage';

export function useChannelPersistence() {
  // Save current channel as last watched
  const saveCurrentChannel = useCallback((channel: LiveStream) => {
    const lastChannel: LastChannel = {
      streamId: channel.stream_id,
      name: channel.name,
      categoryId: channel.category_id,
      timestamp: Date.now(),
    };
    saveLastChannel(lastChannel);
  }, []);

  // Get last watched channel
  const getLastWatchedChannel = useCallback((): LastChannel | null => {
    return getLastChannel();
  }, []);

  // Determine which channel to auto-play
  const getAutoPlayChannel = useCallback(async (
    categories: Category[],
    streams: Map<string, LiveStream[]>
  ): Promise<{ channel: LiveStream | null; categoryId: string }> => {
    // First, try to get last watched channel
    const lastChannel = getLastChannel();
    
    if (lastChannel) {
      // Find the channel in the streams
      for (const [catId, channelList] of streams.entries()) {
        const found = channelList.find(c => c.stream_id === lastChannel.streamId);
        if (found) {
          return { channel: found, categoryId: catId };
        }
      }
    }
    
    // Fallback: first channel of first category
    if (categories.length > 0) {
      const firstCatId = categories[0].category_id;
      const firstCatStreams = streams.get(firstCatId);
      if (firstCatStreams && firstCatStreams.length > 0) {
        return { 
          channel: firstCatStreams[0], 
          categoryId: firstCatId 
        };
      }
    }
    
    return { channel: null, categoryId: '' };
  }, []);

  return {
    saveCurrentChannel,
    getLastWatchedChannel,
    getAutoPlayChannel,
  };
}
