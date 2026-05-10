import { Category, LiveStream } from './xtream';

export interface PanelState<T = any> {
  selectedId: string | null;
  scrollPosition: number;
  data: T[];
  isLoading: boolean;
  error: Error | null;
}

export interface NavigationState {
  isOpen: boolean;
  activePanelIndex: number;
  panels: [
    PanelState<Category>,
    PanelState<LiveStream>,
    PanelState<any>
  ];
}

export type PanelLevel = 0 | 1 | 2;

/**
 * Represents the current view mode of the cascade menu
 * - 'categories': Only categories panel is visible
 * - 'channels': Channels and EPG panels are visible
 */
export type ViewMode = 'categories' | 'channels';
