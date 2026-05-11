import { create } from 'zustand';
import { StreamingUIState } from '../types/streaming';

export const useStreamingUIStore = create<StreamingUIState>((set) => ({
  selectedCategoryId: null,
  selectedChannelId: null,
  setSelectedCategory: (id: string | null) => set({ selectedCategoryId: id }),
  setSelectedChannel: (id: string | null) => set({ selectedChannelId: id }),
  resetSelection: () => set({ selectedCategoryId: null, selectedChannelId: null }),
}));
