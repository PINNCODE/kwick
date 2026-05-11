// Streaming UI Types

export interface Category {
  category_id: string;
  category_name: string;
  parent_id: number;
  isFeatured: boolean;
}

export interface Channel {
  num: number;
  name: string;
  stream_id: string;
  stream_icon: string;
  category_id: string;
  epg_channel_id: string;
}

export interface Program {
  id: string;
  title: string;
  start: string;
  end: string | null;
  isLive: boolean;
}

export interface StreamingUIState {
  selectedCategoryId: string | null;
  selectedChannelId: string | null;
  setSelectedCategory: (id: string | null) => void;
  setSelectedChannel: (id: string | null) => void;
  resetSelection: () => void;
}
