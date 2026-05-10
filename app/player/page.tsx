'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
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
  
  // NAVIGATION STATE - Using refs to prevent re-renders when menu state changes
  // These do NOT affect VideoPlayer playback
  const menuCategoryRef = useRef<string>('');
  const streamsMapRef = useRef<Map<string, LiveStream[]>>(new Map());
  const isMenuOpenRef = useRef<boolean>(false);
  const selectedChannelIndexRef = useRef<number>(0);
  
  // Force re-render for menu UI updates only (doesn't affect VideoPlayer)
  const [, setMenuTrigger] = useState(0);
  const forceMenuUpdate = useCallback(() => setMenuTrigger(prev => prev + 1), []);
  
  const [isInitializing, setIsInitializing] = useState(true);

  // Fetch categories
  const { data: categories, error: categoriesError } = useSWR<Category[]>(
    '/api/xtream/categories',
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 300000 } // 5 minutes
  );

  // Initialize player - only load channels for the selected category
  useEffect(() => {
    const initPlayer = async () => {
      console.log('[DEBUG] initPlayer: Starting initialization');
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
          console.log('[DEBUG] initPlayer: Using last channel category:', targetCategoryId);
        }
      }
      
      // If no valid last category, use the first one
      if (!targetCategoryId) {
        targetCategoryId = categories[0].category_id;
        console.log('[DEBUG] initPlayer: Using first category:', targetCategoryId);
      }

      // Load streams ONLY for the target category
      const streams = new Map<string, LiveStream[]>();
      try {
        const categoryStreams = await xtreamApi.getStreams(targetCategoryId);
        streams.set(targetCategoryId, categoryStreams);
        console.log('[DEBUG] initPlayer: Loaded', categoryStreams.length, 'channels for category', targetCategoryId);
      } catch (error) {
        console.error(`Failed to load streams for category ${targetCategoryId}:`, error);
      }
      streamsMapRef.current = streams;

      // Determine which channel to play from the loaded category
      let channelToPlay: LiveStream | null = null;
      
      if (lastChannel && lastChannel.categoryId === targetCategoryId) {
        // Try to find the last watched channel in the loaded category
        const categoryStreams = streams.get(targetCategoryId) || [];
        channelToPlay = categoryStreams.find(c => c.stream_id === lastChannel.streamId) || null;
        if (channelToPlay) {
          console.log('[DEBUG] initPlayer: Found last watched channel:', channelToPlay.name);
        }
      }
      
      // If no last channel or not found, use the first channel of the category
      if (!channelToPlay) {
        const categoryStreams = streams.get(targetCategoryId) || [];
        channelToPlay = categoryStreams[0] || null;
        if (channelToPlay) {
          console.log('[DEBUG] initPlayer: Using first channel:', channelToPlay.name);
        }
      }
      
      if (channelToPlay) {
        console.log('[DEBUG] initPlayer: About to setCurrentChannel:', channelToPlay.name);
        setCurrentChannel(channelToPlay);
        setCurrentCategory(targetCategoryId);
        menuCategoryRef.current = targetCategoryId; // Sync menu with current category
        saveCurrentChannel(channelToPlay);
        
        // Set selected index
        const categoryStreams = streams.get(targetCategoryId) || [];
        const index = categoryStreams.findIndex(c => c.stream_id === channelToPlay!.stream_id);
        selectedChannelIndexRef.current = index >= 0 ? index : 0;
        console.log('[DEBUG] initPlayer: Channel set, selected index:', selectedChannelIndexRef.current);
      }

      setIsInitializing(false);
      console.log('[DEBUG] initPlayer: Initialization complete, forcing menu update');
      forceMenuUpdate(); // Trigger menu re-render
    };

    if (categories && isInitializing) {
      initPlayer();
    }
  }, [categories, getLastWatchedChannel, saveCurrentChannel, isInitializing, forceMenuUpdate]);

  // Handle channel change
  const handleChannelChange = useCallback((channel: LiveStream) => {
    console.log('[DEBUG] handleChannelChange called:', channel.name);
    setCurrentChannel(channel);
    saveCurrentChannel(channel);
    resetError();
  }, [saveCurrentChannel, resetError]);

  // Get channels for the category shown in menu (not necessarily the current playing category)
  const menuChannels = streamsMapRef.current.get(menuCategoryRef.current) || [];

  // Keyboard navigation handlers
  // KEY FIX: Menu open/close only updates refs, doesn't trigger VideoPlayer remount
  const handleToggleMenu = useCallback(() => {
    const newState = !isMenuOpenRef.current;
    isMenuOpenRef.current = newState;
    
    if (newState) {
      // When opening menu, sync menu category with current playing category
      menuCategoryRef.current = currentCategory;
      // Ensure current category channels are loaded
      if (currentCategory && !streamsMapRef.current.has(currentCategory)) {
        xtreamApi.getStreams(currentCategory).then(channels => {
          streamsMapRef.current.set(currentCategory, channels);
          forceMenuUpdate();
        }).catch(console.error);
      } else {
        forceMenuUpdate();
      }
    } else {
      forceMenuUpdate();
    }
  }, [currentCategory]);

  const handleMoveNext = useCallback(() => {
    if (menuChannels.length === 0) return;
    selectedChannelIndexRef.current = (selectedChannelIndexRef.current + 1) % menuChannels.length;
    forceMenuUpdate();
  }, [menuChannels.length]);

  const handleMovePrevious = useCallback(() => {
    if (menuChannels.length === 0) return;
    selectedChannelIndexRef.current = (selectedChannelIndexRef.current - 1 + menuChannels.length) % menuChannels.length;
    forceMenuUpdate();
  }, [menuChannels.length]);

  // KEY FIX: Category navigation ONLY updates refs, NOT playback state
  // User can browse categories without changing the currently playing channel
  const handleMoveNextCategory = useCallback(async () => {
    if (!categories || categories.length === 0) return;
    const currentIndex = categories.findIndex(c => c.category_id === menuCategoryRef.current);
    const nextIndex = (currentIndex + 1) % categories.length;
    const nextCategory = categories[nextIndex];
    const nextCategoryId = nextCategory.category_id;
    
    // Load channels for the new category if not already loaded
    if (!streamsMapRef.current.has(nextCategoryId)) {
      try {
        const categoryStreams = await xtreamApi.getStreams(nextCategoryId);
        streamsMapRef.current.set(nextCategoryId, categoryStreams);
      } catch (error) {
        console.error(`Failed to load streams for category ${nextCategoryId}:`, error);
      }
    }
    
    menuCategoryRef.current = nextCategoryId;
    selectedChannelIndexRef.current = 0;
    // CRITICAL: We do NOT change currentChannel or currentCategory here
    // Channel only changes on explicit selection (handleSelect)
    forceMenuUpdate();
  }, [categories]);

  // KEY FIX: Same as handleMoveNextCategory - only updates refs
  const handleMovePreviousCategory = useCallback(async () => {
    if (!categories || categories.length === 0) return;
    const currentIndex = categories.findIndex(c => c.category_id === menuCategoryRef.current);
    const prevIndex = (currentIndex - 1 + categories.length) % categories.length;
    const prevCategory = categories[prevIndex];
    const prevCategoryId = prevCategory.category_id;
    
    // Load channels for the new category if not already loaded
    if (!streamsMapRef.current.has(prevCategoryId)) {
      try {
        const categoryStreams = await xtreamApi.getStreams(prevCategoryId);
        streamsMapRef.current.set(prevCategoryId, categoryStreams);
      } catch (error) {
        console.error(`Failed to load streams for category ${prevCategoryId}:`, error);
      }
    }
    
    menuCategoryRef.current = prevCategoryId;
    selectedChannelIndexRef.current = 0;
    // CRITICAL: We do NOT change currentChannel or currentCategory here
    forceMenuUpdate();
  }, [categories]);

  const handleSelect = useCallback(() => {
    if (menuChannels.length === 0) return;
    const selectedChannel = menuChannels[selectedChannelIndexRef.current];
    if (selectedChannel) {
      // Only now we change the current channel and category
      console.log('[DEBUG] handleSelect: changing to', selectedChannel.name);
      setCurrentChannel(selectedChannel);
      setCurrentCategory(menuCategoryRef.current);
      handleChannelChange(selectedChannel);
      isMenuOpenRef.current = false;
      forceMenuUpdate();
    }
  }, [menuChannels, handleChannelChange]);

  const handleClose = useCallback(() => {
    isMenuOpenRef.current = false;
    forceMenuUpdate();
  }, []);

  // Handle category selection from UI (click on category tab)
  // KEY FIX: Category selection (click on category tab) only updates refs
  // User can browse different categories without changing the playing channel
  const handleCategorySelect = useCallback(async (categoryId: string) => {
    // Load channels for the selected category if not already loaded
    if (!streamsMapRef.current.has(categoryId)) {
      try {
        const categoryStreams = await xtreamApi.getStreams(categoryId);
        streamsMapRef.current.set(categoryId, categoryStreams);
      } catch (error) {
        console.error(`Failed to load streams for category ${categoryId}:`, error);
      }
    }
    
    menuCategoryRef.current = categoryId;
    selectedChannelIndexRef.current = 0;
    // CRITICAL: We do NOT change currentChannel or currentCategory here
    // Channel only changes when user selects one with Enter key or click on channel
    forceMenuUpdate();
  }, []);

  // Setup keyboard navigation
  useKeyboardNavigation({
    onToggleMenu: () => {
      handleToggleMenu();
    },
    onMoveNext: () => {
      handleMoveNext();
    },
    onMovePrevious: () => {
      handleMovePrevious();
    },
    onMoveNextCategory: () => {
      handleMoveNextCategory();
    },
    onMovePreviousCategory: () => {
      handleMovePreviousCategory();
    },
    onSelect: () => {
      handleSelect();
    },
    onClose: () => {
      handleClose();
    },
    isMenuOpen: isMenuOpenRef.current,
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isAuthLoading, router]);

  // DEBUG: Monitor when currentChannel changes
  useEffect(() => {
    console.log('[DEBUG] currentChannel changed to:', currentChannel?.name || 'null');
  }, [currentChannel]);

  // DEBUG: Monitor when menu category changes
  useEffect(() => {
    console.log('[DEBUG] menuCategoryRef changed to:', menuCategoryRef.current);
  }, [menuCategoryRef.current]);

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
  const selectedChannel = menuChannels[selectedChannelIndexRef.current] || currentChannel;

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
      <MenuOverlay isOpen={isMenuOpenRef.current} onClose={handleClose}>
        {categories && (
          <>
            <CategoryList
              categories={categories}
              activeCategoryId={menuCategoryRef.current}
              onSelectCategory={handleCategorySelect}
            />
            <ChannelGrid
              channels={menuChannels}
              selectedChannelId={selectedChannel.stream_id}
              onSelectChannel={(channel) => {
                console.log('[DEBUG] ChannelGrid onSelectChannel:', channel.name);
                setCurrentChannel(channel);
                setCurrentCategory(menuCategoryRef.current);
                handleChannelChange(channel);
                isMenuOpenRef.current = false;
                forceMenuUpdate();
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
