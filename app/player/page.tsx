'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { useXtreamAuth } from '../hooks/useXtreamAuth';
import { useChannelPersistence } from '../hooks/useChannelPersistence';
import { useHlsPlayer } from '../hooks/useHlsPlayer';
import { useKeyboardNavigation } from '../hooks/useKeyboardNavigation';
import { VideoPlayer } from '../components/player/VideoPlayer';
import { ErrorToast } from '../components/player/ErrorToast';
import { MenuOverlay } from '../components/menu/MenuOverlay';
import { CategoryList } from '../components/menu/CategoryList';
import { ChannelGrid } from '../components/menu/ChannelGrid';
import { Category, LiveStream } from '../types/xtream';
import { xtreamApi } from '../lib/xtream-api';
import { getCredentials } from '../lib/storage';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function PlayerPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading } = useXtreamAuth();
  const { saveCurrentChannel, getLastWatchedChannel, getAutoPlayChannel } = useChannelPersistence();
  const { 
    playerState, 
    error, 
    retryCount,
    isRetrying, 
    handleError, 
    handleRetry, 
    handlePlaying,
    handleBuffering,
    resetError
  } = useHlsPlayer();
  
  // PLAYBACK STATE - Changes to these will cause VideoPlayer to remount (key={currentChannel.stream_id})
  // Only updated on: initial load and explicit channel selection (Enter key or click)
  const [currentChannel, setCurrentChannel] = useState<LiveStream | null>(null);
  const [currentCategory, setCurrentCategory] = useState<string>('');
  
  // NAVIGATION STATE - UI only, changes do NOT affect VideoPlayer playback
  // Updated on: menu open/close, category/channel navigation with arrow keys
  const [menuCategory, setMenuCategory] = useState<string>('');
  const [streamsMap, setStreamsMap] = useState<Map<string, LiveStream[]>>(new Map());
  const [isInitializing, setIsInitializing] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedChannelIndex, setSelectedChannelIndex] = useState(0);

  // Fetch categories
  const { data: categories, error: categoriesError } = useSWR<Category[]>(
    '/api/xtream/categories',
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 300000 } // 5 minutes
  );

  // Initialize player - only load channels for the selected category
  useEffect(() => {
    const initPlayer = async () => {
      if (!categories || categories.length === 0) return;

      const credentials = getCredentials();
      if (!credentials) return;

      // Set API credentials
      xtreamApi.setCredentials({
        host: credentials.host,
        username: credentials.username,
        password: credentials.password,
      });

      // Determine which category to load first
      let targetCategoryId = '';
      const lastChannel = await getLastWatchedChannel();
      
      if (lastChannel) {
        // Check if the last channel's category still exists
        const categoryExists = categories.some(c => c.category_id === lastChannel.categoryId);
        if (categoryExists) {
          targetCategoryId = lastChannel.categoryId;
        }
      }
      
      // If no valid last category, use the first one
      if (!targetCategoryId) {
        targetCategoryId = categories[0].category_id;
      }

      // Load streams ONLY for the target category
      const streams = new Map<string, LiveStream[]>();
      try {
        const categoryStreams = await xtreamApi.getStreams(targetCategoryId);
        streams.set(targetCategoryId, categoryStreams);
      } catch (error) {
        console.error(`Failed to load streams for category ${targetCategoryId}:`, error);
      }
      setStreamsMap(streams);

      // Determine which channel to play from the loaded category
      let channelToPlay: LiveStream | null = null;
      
      if (lastChannel && lastChannel.categoryId === targetCategoryId) {
        // Try to find the last watched channel in the loaded category
        const categoryStreams = streams.get(targetCategoryId) || [];
        channelToPlay = categoryStreams.find(c => c.stream_id === lastChannel.streamId) || null;
      }
      
      // If no last channel or not found, use the first channel of the category
      if (!channelToPlay) {
        const categoryStreams = streams.get(targetCategoryId) || [];
        channelToPlay = categoryStreams[0] || null;
      }
      
      if (channelToPlay) {
        setCurrentChannel(channelToPlay);
        setCurrentCategory(targetCategoryId);
        setMenuCategory(targetCategoryId); // Sync menu with current category
        saveCurrentChannel(channelToPlay);
        
        // Set selected index
        const categoryStreams = streams.get(targetCategoryId) || [];
        const index = categoryStreams.findIndex(c => c.stream_id === channelToPlay!.stream_id);
        setSelectedChannelIndex(index >= 0 ? index : 0);
      }

      setIsInitializing(false);
    };

    if (categories && isInitializing) {
      initPlayer();
    }
  }, [categories, getLastWatchedChannel, saveCurrentChannel, isInitializing]);

  // Handle channel change
  const handleChannelChange = useCallback((channel: LiveStream) => {
    setCurrentChannel(channel);
    saveCurrentChannel(channel);
    resetError();
  }, [saveCurrentChannel, resetError]);

  // Get channels for the category shown in menu (not necessarily the current playing category)
  const menuChannels = streamsMap.get(menuCategory) || [];

  // Keyboard navigation handlers
  // KEY FIX: Menu open/close only updates menu state (menuCategory, streamsMap, isMenuOpen)
  // Does NOT update currentChannel or currentCategory, so VideoPlayer doesn't remount
  const handleToggleMenu = useCallback(() => {
    setIsMenuOpen(prev => {
      const newState = !prev;
      if (newState) {
        // When opening menu, sync menu category with current playing category
        setMenuCategory(currentCategory);
        // Ensure current category channels are loaded
        if (currentCategory && !streamsMap.has(currentCategory)) {
          xtreamApi.getStreams(currentCategory).then(channels => {
            setStreamsMap(prev => new Map(prev).set(currentCategory, channels));
          }).catch(console.error);
        }
      }
      return newState;
    });
  }, [currentCategory, streamsMap]);

  const handleMoveNext = useCallback(() => {
    if (menuChannels.length === 0) return;
    setSelectedChannelIndex(prev => (prev + 1) % menuChannels.length);
  }, [menuChannels.length]);

  const handleMovePrevious = useCallback(() => {
    if (menuChannels.length === 0) return;
    setSelectedChannelIndex(prev => (prev - 1 + menuChannels.length) % menuChannels.length);
  }, [menuChannels.length]);

  // KEY FIX: Category navigation ONLY updates menu state, NOT playback state
  // User can browse categories without changing the currently playing channel
  const handleMoveNextCategory = useCallback(async () => {
    if (!categories || categories.length === 0) return;
    const currentIndex = categories.findIndex(c => c.category_id === menuCategory);
    const nextIndex = (currentIndex + 1) % categories.length;
    const nextCategory = categories[nextIndex];
    const nextCategoryId = nextCategory.category_id;
    
    // Load channels for the new category if not already loaded
    if (!streamsMap.has(nextCategoryId)) {
      try {
        const categoryStreams = await xtreamApi.getStreams(nextCategoryId);
        setStreamsMap(prev => new Map(prev).set(nextCategoryId, categoryStreams));
      } catch (error) {
        console.error(`Failed to load streams for category ${nextCategoryId}:`, error);
      }
    }
    
    setMenuCategory(nextCategoryId);
    setSelectedChannelIndex(0);
    // CRITICAL: We do NOT change currentChannel or currentCategory here
    // Channel only changes on explicit selection (handleSelect)
  }, [categories, menuCategory, streamsMap]);

  // KEY FIX: Same as handleMoveNextCategory - only updates menu state
  const handleMovePreviousCategory = useCallback(async () => {
    if (!categories || categories.length === 0) return;
    const currentIndex = categories.findIndex(c => c.category_id === menuCategory);
    const prevIndex = (currentIndex - 1 + categories.length) % categories.length;
    const prevCategory = categories[prevIndex];
    const prevCategoryId = prevCategory.category_id;
    
    // Load channels for the new category if not already loaded
    if (!streamsMap.has(prevCategoryId)) {
      try {
        const categoryStreams = await xtreamApi.getStreams(prevCategoryId);
        setStreamsMap(prev => new Map(prev).set(prevCategoryId, categoryStreams));
      } catch (error) {
        console.error(`Failed to load streams for category ${prevCategoryId}:`, error);
      }
    }
    
    setMenuCategory(prevCategoryId);
    setSelectedChannelIndex(0);
    // CRITICAL: We do NOT change currentChannel or currentCategory here
  }, [categories, menuCategory, streamsMap]);

  const handleSelect = useCallback(() => {
    if (menuChannels.length === 0) return;
    const selectedChannel = menuChannels[selectedChannelIndex];
    if (selectedChannel) {
      // Only now we change the current channel and category
      setCurrentChannel(selectedChannel);
      setCurrentCategory(menuCategory);
      handleChannelChange(selectedChannel);
      setIsMenuOpen(false);
    }
  }, [menuChannels, selectedChannelIndex, menuCategory, handleChannelChange]);

  const handleClose = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  // Handle category selection from UI (click on category tab)
  // KEY FIX: Category selection (click on category tab) only updates menu state
  // User can browse different categories without changing the playing channel
  const handleCategorySelect = useCallback(async (categoryId: string) => {
    // Load channels for the selected category if not already loaded
    if (!streamsMap.has(categoryId)) {
      try {
        const categoryStreams = await xtreamApi.getStreams(categoryId);
        setStreamsMap(prev => new Map(prev).set(categoryId, categoryStreams));
      } catch (error) {
        console.error(`Failed to load streams for category ${categoryId}:`, error);
      }
    }
    
    setMenuCategory(categoryId);
    setSelectedChannelIndex(0);
    // CRITICAL: We do NOT change currentChannel or currentCategory here
    // Channel only changes when user selects one with Enter key or click on channel
  }, [streamsMap]);

  // Setup keyboard navigation
  useKeyboardNavigation({
    onToggleMenu: handleToggleMenu,
    onMoveNext: handleMoveNext,
    onMovePrevious: handleMovePrevious,
    onMoveNextCategory: handleMoveNextCategory,
    onMovePreviousCategory: handleMovePreviousCategory,
    onSelect: handleSelect,
    onClose: handleClose,
    isMenuOpen,
  });

  // Update selected index when menu category changes
  useEffect(() => {
    if (currentChannel && menuCategory) {
      const channels = streamsMap.get(menuCategory) || [];
      const index = channels.findIndex(c => c.stream_id === currentChannel.stream_id);
      if (index >= 0) {
        setSelectedChannelIndex(index);
      } else {
        setSelectedChannelIndex(0);
      }
    }
  }, [menuCategory, currentChannel, streamsMap]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isAuthLoading, router]);

  if (isAuthLoading || isInitializing) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center">
          <svg className="animate-spin h-12 w-12 text-blue-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-400">
            {isInitializing ? 'Cargando canales...' : 'Verificando sesión...'}
          </p>
        </div>
      </div>
    );
  }

  if (categoriesError) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">Error al cargar categorías</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!currentChannel) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-gray-400">No hay canales disponibles</p>
      </div>
    );
  }

  const streamUrl = xtreamApi.getStreamUrl(currentChannel.stream_id);
  const selectedChannel = menuChannels[selectedChannelIndex] || currentChannel;

  return (
    <div className="relative w-screen h-screen bg-black overflow-hidden">
      {/* Video Player */}
      <VideoPlayer
        key={currentChannel.stream_id}
        channel={currentChannel}
        streamUrl={streamUrl}
        autoPlay={true}
        onError={(err) => handleError(err, currentChannel)}
        onRetry={handleRetry}
        onPlaying={handlePlaying}
        onBuffering={handleBuffering}
      />

      {/* Loading/Retrying Overlay */}
      {(playerState === 'loading' || playerState === 'buffering' || isRetrying) && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10 pointer-events-none">
          <div className="flex flex-col items-center">
            <svg className="animate-spin h-10 w-10 text-blue-500 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-white text-sm">
              {isRetrying ? 'Reconectando...' : 'Cargando...'}
            </p>
          </div>
        </div>
      )}

      {/* Error Toast System */}
      <ErrorToast
        error={error}
        isRetrying={isRetrying}
        retryCount={retryCount}
        onDismiss={() => {
          // Toast auto-dismisses on recovery
        }}
      />

      {/* Menu Overlay */}
      <MenuOverlay isOpen={isMenuOpen} onClose={handleClose}>
        {categories && (
          <>
            <CategoryList
              categories={categories}
              activeCategoryId={menuCategory}
              onSelectCategory={handleCategorySelect}
            />
            <ChannelGrid
              channels={menuChannels}
              selectedChannelId={selectedChannel.stream_id}
              onSelectChannel={(channel) => {
                setCurrentChannel(channel);
                setCurrentCategory(menuCategory);
                handleChannelChange(channel);
                setIsMenuOpen(false);
              }}
            />
          </>
        )}
      </MenuOverlay>

      {/* Channel Info */}
      <div className="absolute bottom-4 left-4 text-white/70 text-sm z-20 pointer-events-none">
        <p className="font-medium">{currentChannel.name}</p>
        <p className="text-xs">{categories?.find(c => c.category_id === currentCategory)?.category_name}</p>
        <p className="text-xs text-gray-500 mt-1">Presiona M para menú</p>
      </div>
    </div>
  );
}
