import { Category, LiveStream, EpgListing } from './xtream';

export interface UseCascadingMenuReturn {
  isOpen: boolean;
  activePanel: number;
  selectedCategory: string | null;
  selectedChannel: string | null;
  channels: LiveStream[];
  epg: EpgListing[];
  isLoadingChannels: boolean;
  isLoadingEpg: boolean;
  viewMode: 'categories' | 'channels';
  focusedCategoryIndex: number;
  focusedChannelIndex: number;
  openMenu: () => void;
  closeMenu: () => void;
  toggleMenu: () => void;
  selectCategory: (categoryId: string) => void;
  selectChannel: (channel: LiveStream) => void;
  selectFocusedItem: () => void;
  moveNextItem: () => void;
  movePreviousItem: () => void;
  moveNextPanel: () => void;
  movePreviousPanel: () => void;
  setActivePanel: (panel: number) => void;
  showChannelsView: () => void;
  showCategoriesView: () => void;
}
