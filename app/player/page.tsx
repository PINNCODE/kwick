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
  const { saveCurrentChannel, getAutoPlayChannel } = useChannelPersistence();
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
  
  const [currentChannel, setCurrentChannel] = useState<LiveStream | null>(null);
  const [currentCategory, setCurrentCategory] = useState<string>('');
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

  // Initialize player
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

      // Load streams for all categories
      const streams = new Map<string, LiveStream[]>();
      for (const category of categories) {
        try {
          const categoryStreams = await xtreamApi.getStreams(category.category_id);
          streams.set(category.category_id, categoryStreams);
        } catch (error) {
          console.error(`Failed to load streams for category ${category.category_id}:`, error);
        }
      }
      setStreamsMap(streams);

      // Determine which channel to play
      const { channel, categoryId } = await getAutoPlayChannel(categories, streams);
      
      if (channel) {
        setCurrentChannel(channel);
        setCurrentCategory(categoryId);
        saveCurrentChannel(channel);
        
        // Set selected index
        const categoryStreams = streams.get(categoryId) || [];
        const index = categoryStreams.findIndex(c => c.stream_id === channel.stream_id);
        setSelectedChannelIndex(index >= 0 ? index : 0);
      }

      setIsInitializing(false);
    };

    if (categories && !isInitializing) {
      initPlayer();
    }
  }, [categories, getAutoPlayChannel, saveCurrentChannel, isInitializing]);

  // Handle channel change
  const handleChannelChange = useCallback((channel: LiveStream) => {
    setCurrentChannel(channel);
    saveCurrentChannel(channel);
    resetError();
  }, [saveCurrentChannel, resetError]);

  // Get current category channels
  const currentChannels = streamsMap.get(currentCategory) || [];

  // Keyboard navigation handlers
  const handleToggleMenu = useCallback(() => {
    setIsMenuOpen(prev => !prev);
  }, []);

  const handleMoveNext = useCallback(() => {
    if (currentChannels.length === 0) return;
    setSelectedChannelIndex(prev => (prev + 1) % currentChannels.length);
  }, [currentChannels.length]);

  const handleMovePrevious = useCallback(() => {
    if (currentChannels.length === 0) return;
    setSelectedChannelIndex(prev => (prev - 1 + currentChannels.length) % currentChannels.length);
  }, [currentChannels.length]);

  const handleMoveNextCategory = useCallback(() => {
    if (!categories || categories.length === 0) return;
    const currentIndex = categories.findIndex(c => c.category_id === currentCategory);
    const nextIndex = (currentIndex + 1) % categories.length;
    const nextCategory = categories[nextIndex];
    setCurrentCategory(nextCategory.category_id);
    setSelectedChannelIndex(0);
  }, [categories, currentCategory]);

  const handleMovePreviousCategory = useCallback(() => {
    if (!categories || categories.length === 0) return;
    const currentIndex = categories.findIndex(c => c.category_id === currentCategory);
    const prevIndex = (currentIndex - 1 + categories.length) % categories.length;
    const prevCategory = categories[prevIndex];
    setCurrentCategory(prevCategory.category_id);
    setSelectedChannelIndex(0);
  }, [categories, currentCategory]);

  const handleSelect = useCallback(() => {
    if (currentChannels.length === 0) return;
    const selectedChannel = currentChannels[selectedChannelIndex];
    if (selectedChannel) {
      handleChannelChange(selectedChannel);
      setIsMenuOpen(false);
    }
  }, [currentChannels, selectedChannelIndex, handleChannelChange]);

  const handleClose = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

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

  // Update selected index when category changes
  useEffect(() => {
    if (currentChannel && currentCategory) {
      const channels = streamsMap.get(currentCategory) || [];
      const index = channels.findIndex(c => c.stream_id === currentChannel.stream_id);
      if (index >= 0) {
        setSelectedChannelIndex(index);
      }
    }
  }, [currentCategory, currentChannel, streamsMap]);

  // Handle category selection from UI
  const handleCategorySelect = useCallback((categoryId: string) => {
    setCurrentCategory(categoryId);
    setSelectedChannelIndex(0);
  }, []);

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
  const selectedChannel = currentChannels[selectedChannelIndex] || currentChannel;

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
              activeCategoryId={currentCategory}
              onSelectCategory={handleCategorySelect}
            />
            <ChannelGrid
              channels={currentChannels}
              selectedChannelId={selectedChannel.stream_id}
              onSelectChannel={(channel) => {
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
