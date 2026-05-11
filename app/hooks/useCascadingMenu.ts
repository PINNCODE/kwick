'use client';

import { useState, useCallback, useEffect } from 'react';
import { Category, LiveStream } from '../types/xtream';
import { ViewMode } from '../types/menu';
import { xtreamApi } from '../lib/xtream-api';

interface UseCascadingMenuProps {
  categories: Category[];
  currentCategory: string;
  onChannelChange: (channel: LiveStream) => void;
}

export function useCascadingMenu({ categories, currentCategory, onChannelChange }: UseCascadingMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activePanel, setActivePanel] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Panel states
  const [selectedCategory, setSelectedCategory] = useState<string | null>(currentCategory);
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [channels, setChannels] = useState<LiveStream[]>([]);
  const [epg, setEpg] = useState<any[]>([]);
  const [isLoadingChannels, setIsLoadingChannels] = useState(false);
  const [isLoadingEpg, setIsLoadingEpg] = useState(false);

  // View mode state for two-step cascade menu
  const [viewMode, setViewMode] = useState<ViewMode>('categories');

  // Sync with props
  useEffect(() => {
    if (categories.length > 0 && !selectedCategory) {
      setSelectedCategory(currentCategory || categories[0]?.category_id);
    }
  }, [categories, currentCategory]);

  const openMenu = useCallback(() => {
    setIsOpen(true);
    setActivePanel(0);
    setViewMode('categories');
    setSelectedIndex(0); // Reset index for fresh start
  }, []);

  const closeMenu = useCallback(() => {
    setIsOpen(false);
    setActivePanel(0);
    setViewMode('categories'); // Reset for next open
  }, []);

  const showChannelsView = useCallback(() => {
    setViewMode('channels');
    setActivePanel(1);
    setSelectedIndex(0);
  }, []);

  const showCategoriesView = useCallback(() => {
    setViewMode('categories');
    setActivePanel(0);
    setSelectedIndex(0);
  }, []);

  const toggleMenu = useCallback(() => {
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  }, [isOpen, openMenu, closeMenu]);

  const selectCategory = useCallback(async (categoryId: string) => {
    setSelectedCategory(categoryId);
    setIsLoadingChannels(true);
    setChannels([]);
    setEpg([]);

    try {
      const streams = await xtreamApi.getStreams(categoryId);
      setChannels(streams);
      if (streams.length > 0) {
        setSelectedChannel(streams[0].stream_id);
        // Auto-load EPG for first channel
        setIsLoadingEpg(true);
        try {
          const epgData = await xtreamApi.getEPG(streams[0].stream_id);
          setEpg(epgData);
        } catch (error) {
          console.error('Error loading EPG:', error);
          setEpg([]);
        } finally {
          setIsLoadingEpg(false);
        }
      }
      // Switch to channels view after loading
      showChannelsView();
    } catch (error) {
      console.error('Error loading channels:', error);
    } finally {
      setIsLoadingChannels(false);
    }
  }, [showChannelsView]);

  const selectChannel = useCallback(async (channel: LiveStream) => {
    setSelectedChannel(channel.stream_id);
    onChannelChange(channel);
    
    // Load EPG automatically
    setIsLoadingEpg(true);
    try {
      const epgData = await xtreamApi.getEPG(channel.stream_id);
      setEpg(epgData);
    } catch (error) {
      console.error('Error loading EPG:', error);
      setEpg([]);
    } finally {
      setIsLoadingEpg(false);
    }
  }, [onChannelChange]);

  const moveNextPanel = useCallback(() => {
    setActivePanel(prev => Math.min(prev + 1, 2));
  }, []);

  const movePreviousPanel = useCallback(() => {
    setActivePanel(prev => {
      if (prev === 0) {
        closeMenu();
        return 0;
      }
      return prev - 1;
    });
  }, [closeMenu]);

  const moveNextItem = useCallback(() => {
    if (viewMode === 'categories') {
      setSelectedIndex(prev => Math.min(prev + 1, categories.length - 1));
    } else if (viewMode === 'channels') {
      setSelectedIndex(prev => Math.min(prev + 1, channels.length - 1));
    }
  }, [viewMode, categories.length, channels.length]);

  const movePreviousItem = useCallback(() => {
    setSelectedIndex(prev => Math.max(prev - 1, 0));
  }, []);

  const selectCurrentItem = useCallback(() => {
    if (viewMode === 'categories' && categories[selectedIndex]) {
      selectCategory(categories[selectedIndex].category_id);
    } else if (viewMode === 'channels' && channels[selectedIndex]) {
      selectChannel(channels[selectedIndex]);
    }
  }, [viewMode, categories, channels, selectedIndex, selectCategory, selectChannel]);

  return {
    isOpen,
    activePanel,
    selectedCategory,
    selectedChannel,
    channels,
    epg,
    isLoadingChannels,
    isLoadingEpg,
    viewMode,
    selectedIndex,
    openMenu,
    closeMenu,
    toggleMenu,
    selectCategory,
    selectChannel,
    moveNextPanel,
    movePreviousPanel,
    moveNextItem,
    movePreviousItem,
    selectCurrentItem,
    setActivePanel,
    showChannelsView,
    showCategoriesView
  };
}
