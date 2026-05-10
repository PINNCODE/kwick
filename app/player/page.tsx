'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { useXtreamAuth } from '../hooks/useXtreamAuth';
import { useChannelPersistence } from '../hooks/useChannelPersistence';
import { useHlsPlayer } from '../hooks/useHlsPlayer';
import { useKeyboardNavigation } from '../hooks/useKeyboardNavigation';
import { useCascadingMenu } from '../hooks/useCascadingMenu';
import { VideoPlayer } from '../components/player/VideoPlayer';
import { ErrorToast } from '../components/player/ErrorToast';
import { MenuOverlay } from '../components/menu/MenuOverlay';
import { CategoriesPanel } from '../components/menu/CategoriesPanel';
import { ChannelsPanel } from '../components/menu/ChannelsPanel';
import { EPGPanel } from '../components/menu/EPGPanel';
import { Category, LiveStream } from '../types/xtream';
import { xtreamApi } from '../lib/xtream-api';
import { getCredentials } from '../lib/storage';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function PlayerPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading } = useXtreamAuth();
  const { saveCurrentChannel, getLastWatchedChannel } = useChannelPersistence();
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
  const [isInitializing, setIsInitializing] = useState(true);

  const { data: categories, error: categoriesError } = useSWR<Category[]>(
    '/api/xtream/categories',
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 300000 }
  );

  // Initialize player
  useEffect(() => {
    const initPlayer = async () => {
      if (!categories || categories.length === 0) return;

      const credentials = getCredentials();
      if (!credentials) return;

      xtreamApi.setCredentials({
        host: credentials.host,
        username: credentials.username,
        password: credentials.password,
      });

      let targetCategoryId = '';
      const lastChannel = await getLastWatchedChannel();
      
      if (lastChannel) {
        const categoryExists = categories.some(c => c.category_id === lastChannel.categoryId);
        if (categoryExists) {
          targetCategoryId = lastChannel.categoryId;
        }
      }
      
      if (!targetCategoryId) {
        targetCategoryId = categories[0].category_id;
      }

      try {
        const categoryStreams = await xtreamApi.getStreams(targetCategoryId);
        
        let channelToPlay: LiveStream | null = null;
        
        if (lastChannel && lastChannel.categoryId === targetCategoryId) {
          channelToPlay = categoryStreams.find(c => c.stream_id === lastChannel.streamId) || null;
        }
        
        if (!channelToPlay) {
          channelToPlay = categoryStreams[0] || null;
        }
        
        if (channelToPlay) {
          setCurrentChannel(channelToPlay);
          setCurrentCategory(targetCategoryId);
          saveCurrentChannel(channelToPlay);
        }

        setIsInitializing(false);
      } catch (error) {
        console.error('Failed to initialize player:', error);
        setIsInitializing(false);
      }
    };

    if (categories && isInitializing) {
      initPlayer();
    }
  }, [categories, getLastWatchedChannel, saveCurrentChannel, isInitializing]);

  const handleChannelChange = useCallback((channel: LiveStream) => {
    setCurrentChannel(channel);
    saveCurrentChannel(channel);
    resetError();
  }, [saveCurrentChannel, resetError]);

  // Cascading Menu Hook
  const menu = useCascadingMenu({
    categories: categories || [],
    currentCategory,
    onChannelChange: handleChannelChange
  });

  // Keyboard Navigation
  useKeyboardNavigation({
    onToggleMenu: menu.toggleMenu,
    onMoveNext: () => {},
    onMovePrevious: () => {},
    onMoveNextPanel: menu.moveNextPanel,
    onMovePreviousPanel: menu.movePreviousPanel,
    onSelect: () => {},
    onClose: menu.closeMenu,
    isMenuOpen: menu.isOpen
  });

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
        onDismiss={() => {}}
      />

      {/* Cascading Menu */}
      <MenuOverlay 
        isOpen={menu.isOpen} 
        onClose={menu.closeMenu}
        activePanel={menu.activePanel}
      >
        {categories && (
          <>
            <CategoriesPanel
              categories={categories}
              selectedId={menu.selectedCategory}
              isActive={menu.activePanel === 0}
              onSelect={menu.selectCategory}
            />
            <ChannelsPanel
              channels={menu.channels}
              selectedId={menu.selectedChannel}
              isActive={menu.activePanel === 1}
              isLoading={menu.isLoadingChannels}
              onSelect={menu.selectChannel}
              onBack={() => menu.setActivePanel(0)}
            />
            <EPGPanel
              epg={menu.epg}
              isActive={menu.activePanel === 2}
              isLoading={menu.isLoadingEpg}
              onBack={() => menu.setActivePanel(1)}
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
