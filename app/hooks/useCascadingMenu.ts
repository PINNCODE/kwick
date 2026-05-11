'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Category, LiveStream, EpgListing } from '../types/xtream';
import { ViewMode } from '../types/menu';
import { xtreamApi } from '../lib/xtream-api';
import { UseCascadingMenuReturn } from '../types/streaming-menu';

interface UseCascadingMenuProps {
  categories: Category[];
  currentCategory: string;
  onChannelChange: (channel: LiveStream) => void;
}

const STORAGE_KEY = 'kwick-menu-selection';

function loadStoredSelection(): { categoryId: string | null; channelId: string | null } {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // ignore
  }
  return { categoryId: null, channelId: null };
}

function saveStoredSelection(categoryId: string | null, channelId: string | null) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ categoryId, channelId }));
  } catch {
    // ignore
  }
}

export function useCascadingMenu({ categories, currentCategory, onChannelChange }: UseCascadingMenuProps): UseCascadingMenuReturn {
  const stored = loadStoredSelection();
  const initialFetchAttempted = useRef(false);
  const autoTransitioned = useRef(false);

  const [isOpen, setIsOpen] = useState(false);
  const [activePanel, setActivePanel] = useState(0);
  
  // Panel states
  const [selectedCategory, setSelectedCategory] = useState<string | null>(currentCategory || stored.categoryId);
  const [selectedChannel, setSelectedChannel] = useState<string | null>(stored.channelId);
  const [channels, setChannels] = useState<LiveStream[]>([]);
  const [epg, setEpg] = useState<EpgListing[]>([]);
  const [isLoadingChannels, setIsLoadingChannels] = useState(false);
  const [isLoadingEpg, setIsLoadingEpg] = useState(false);

  // View mode state for two-step cascade menu
  const [viewMode, setViewMode] = useState<ViewMode>('categories');

  // Keyboard focus state — tracks which item index is focused in each panel
  const [focusedCategoryIndex, setFocusedCategoryIndex] = useState(0);
  const [focusedChannelIndex, setFocusedChannelIndex] = useState(0);

  // Persisted last state — survives menu close and page refresh
  const [lastSelectedCategory, setLastSelectedCategory] = useState<string | null>(currentCategory || stored.categoryId);
  const [lastSelectedChannel, setLastSelectedChannel] = useState<string | null>(stored.channelId);

  // Sync with props
  useEffect(() => {
    if (categories.length > 0 && !selectedCategory) {
      setSelectedCategory(currentCategory || categories[0]?.category_id);
    }
  }, [categories, currentCategory]);

  // Restore focus indices when categories/channels change to match last selection
  useEffect(() => {
    if (lastSelectedCategory && categories.length > 0) {
      const index = categories.findIndex(c => c.category_id === lastSelectedCategory);
      if (index >= 0) {
        setFocusedCategoryIndex(index);
      }
    }
  }, [categories, lastSelectedCategory]);

  useEffect(() => {
    if (lastSelectedChannel && channels.length > 0) {
      const index = channels.findIndex(c => c.stream_id === lastSelectedChannel);
      if (index >= 0) {
        setFocusedChannelIndex(index);
      }
    }
  }, [channels, lastSelectedChannel]);

  // On mount or when categories load, if there's a stored category but no channels loaded, fetch them (once only)
  useEffect(() => {
    if (initialFetchAttempted.current) return;
    if (lastSelectedCategory && channels.length === 0 && categories.length > 0) {
      initialFetchAttempted.current = true;
      const categoryExists = categories.some(c => c.category_id === lastSelectedCategory);
      if (categoryExists) {
        setIsLoadingChannels(true);
        xtreamApi.getStreams(lastSelectedCategory)
          .then(streams => {
            setChannels(streams);
            if (streams.length > 0 && lastSelectedChannel) {
              const exists = streams.some(s => s.stream_id === lastSelectedChannel);
              if (!exists) {
                setSelectedChannel(streams[0].stream_id);
                setLastSelectedChannel(streams[0].stream_id);
                saveStoredSelection(lastSelectedCategory, streams[0].stream_id);
              }
            }
          })
          .catch(() => setChannels([]))
          .finally(() => setIsLoadingChannels(false));
      }
    }
  }, [categories]); // eslint-disable-line react-hooks/exhaustive-deps

  const openMenu = useCallback(() => {
    setIsOpen(true);
  }, []);

  // When channels load and menu is open, switch to channels view (once per open)
  useEffect(() => {
    if (autoTransitioned.current) return;
    if (isOpen && lastSelectedCategory && channels.length > 0 && viewMode === 'categories') {
      autoTransitioned.current = true;
      setViewMode('channels');
      setActivePanel(1);
    }
  }, [isOpen, channels.length, lastSelectedCategory, viewMode]);

  const closeMenu = useCallback(() => {
    setIsOpen(false);
    autoTransitioned.current = false;
    // Do NOT reset selection state — preserve for next open
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
    setLastSelectedCategory(categoryId);
    saveStoredSelection(categoryId, null);
    setFocusedChannelIndex(0); // Reset channel focus when category changes
    setIsLoadingChannels(true);
    setChannels([]);
    setEpg([]);

    try {
      const streams = await xtreamApi.getStreams(categoryId);
      setChannels(streams);
      if (streams.length > 0) {
        setSelectedChannel(streams[0].stream_id);
        setLastSelectedChannel(streams[0].stream_id);
        saveStoredSelection(categoryId, streams[0].stream_id);
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
    setLastSelectedChannel(channel.stream_id);
    saveStoredSelection(lastSelectedCategory, channel.stream_id);
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
  }, [onChannelChange, lastSelectedCategory]);

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
  }, [viewMode, categories.length, channels.length]);

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
    if (viewMode === 'channels') {
      showCategoriesView();
    } else {
      closeMenu();
    }
  }, [viewMode, closeMenu, showCategoriesView]);

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
