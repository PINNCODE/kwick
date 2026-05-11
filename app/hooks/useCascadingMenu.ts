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
  
  // Panel states
  const [selectedCategory, setSelectedCategory] = useState<string | null>(currentCategory);
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [channels, setChannels] = useState<LiveStream[]>([]);
  const [epg, setEpg] = useState<any[]>([]);
  const [isLoadingChannels, setIsLoadingChannels] = useState(false);
  const [isLoadingEpg, setIsLoadingEpg] = useState(false);

  // View mode state for two-step cascade menu
  const [viewMode, setViewMode] = useState<ViewMode>('categories');

  // Keyboard focus state — tracks which item index is focused in each panel
  const [focusedCategoryIndex, setFocusedCategoryIndex] = useState(0);
  const [focusedChannelIndex, setFocusedChannelIndex] = useState(0);

  // Sync with props
  useEffect(() => {
    if (categories.length > 0 && !selectedCategory) {
      setSelectedCategory(currentCategory || categories[0]?.category_id);
    }
  }, [categories, currentCategory]);

  const openMenu = useCallback(() => {
    setIsOpen(true);
    setActivePanel(0);
    setViewMode('categories'); // Reset to categories view for fresh start
    setFocusedCategoryIndex(0);
    setFocusedChannelIndex(0);
  }, []);

  const closeMenu = useCallback(() => {
    setIsOpen(false);
    setActivePanel(0);
    setViewMode('categories'); // Reset for next open
    setFocusedCategoryIndex(0);
    setFocusedChannelIndex(0);
  }, []);

  const showChannelsView = useCallback(() => {
    setViewMode('channels');
    setActivePanel(1);
  }, []);

  const showCategoriesView = useCallback(() => {
    setViewMode('categories');
    setActivePanel(0);
    // Restore focus to the previously selected category
    if (selectedCategory) {
      const index = categories.findIndex(c => c.category_id === selectedCategory);
      if (index >= 0) {
        setFocusedCategoryIndex(index);
      } else {
        // Category not found in list — default to 0
        setFocusedCategoryIndex(0);
      }
    } else {
      // No selected category — default to 0
      setFocusedCategoryIndex(0);
    }
  }, [selectedCategory, categories]);

  const toggleMenu = useCallback(() => {
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  }, [isOpen, openMenu, closeMenu]);

  const selectCategory = useCallback(async (categoryId: string) => {
    setSelectedCategory(categoryId);
    setFocusedChannelIndex(0); // Reset channel focus when category changes
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

  const moveNextItem = useCallback(() => {
    if (viewMode === 'categories') {
      if (categories.length === 0) return;
      setFocusedCategoryIndex(prev => Math.min(prev + 1, categories.length - 1));
    } else {
      if (channels.length === 0) return;
      setFocusedChannelIndex(prev => Math.min(prev + 1, channels.length - 1));
    }
  }, [viewMode, categories.length, channels.length]);

  const movePreviousItem = useCallback(() => {
    if (viewMode === 'categories') {
      if (categories.length === 0) return;
      setFocusedCategoryIndex(prev => Math.max(prev - 1, 0));
    } else {
      if (channels.length === 0) return;
      setFocusedChannelIndex(prev => Math.max(prev - 1, 0));
    }
  }, [viewMode]);

  const selectFocusedItem = useCallback(() => {
    if (isLoadingChannels) return;

    if (viewMode === 'categories') {
      const category = categories[focusedCategoryIndex];
      if (category) {
        selectCategory(category.category_id);
      }
    } else {
      const channel = channels[focusedChannelIndex];
      if (channel) {
        selectChannel(channel);
        closeMenu();
      }
    }
  }, [viewMode, categories, channels, focusedCategoryIndex, focusedChannelIndex, selectCategory, selectChannel, closeMenu, isLoadingChannels]);

  const moveNextPanel = useCallback(() => {
    // When in categories view, Right arrow opens the focused category
    if (viewMode === 'categories') {
      const category = categories[focusedCategoryIndex];
      if (category) {
        selectCategory(category.category_id);
      }
    } else {
      // In channels view, Right arrow is a no-op
    }
  }, [viewMode, categories, focusedCategoryIndex, selectCategory]);

  const movePreviousPanel = useCallback(() => {
    setActivePanel(prev => {
      if (prev === 0) {
        closeMenu();
        return 0;
      }
      // When returning from channels to categories, restore focus
      showCategoriesView();
      return 0;
    });
  }, [closeMenu, showCategoriesView]);

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
    focusedCategoryIndex,
    focusedChannelIndex,
    openMenu,
    closeMenu,
    toggleMenu,
    selectCategory,
    selectChannel,
    selectFocusedItem,
    moveNextItem,
    movePreviousItem,
    moveNextPanel,
    movePreviousPanel,
    setActivePanel,
    showChannelsView,
    showCategoriesView
  };
}
