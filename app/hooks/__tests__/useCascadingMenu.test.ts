import { renderHook, act } from '@testing-library/react';
import { useCascadingMenu } from '../useCascadingMenu';
import { Category, LiveStream } from '../../types/xtream';

// Mock the xtream API
jest.mock('../../lib/xtream-api', () => ({
  xtreamApi: {
    getStreams: jest.fn(),
    getEPG: jest.fn(),
  },
}));

const mockCategories: Category[] = [
  { category_id: '1', category_name: 'Sports', parent_id: 0 },
  { category_id: '2', category_name: 'Movies', parent_id: 0 },
];

const mockChannels: LiveStream[] = [
  {
    num: 1,
    name: 'Channel 1',
    stream_type: 'live',
    stream_id: '101',
    stream_icon: '',
    epg_channel_id: 'epg1',
    added: '',
    category_id: '1',
    custom_sid: '',
    tv_archive: 0,
    direct_source: '',
    tv_archive_duration: 0,
  },
];

describe('useCascadingMenu', () => {
  const mockOnChannelChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('view mode', () => {
    it('should start in categories view', () => {
      const { result } = renderHook(() =>
        useCascadingMenu({
          categories: mockCategories,
          currentCategory: '1',
          onChannelChange: mockOnChannelChange,
        })
      );

      expect(result.current.viewMode).toBe('categories');
    });

    it('should open menu in categories view', () => {
      const { result } = renderHook(() =>
        useCascadingMenu({
          categories: mockCategories,
          currentCategory: '1',
          onChannelChange: mockOnChannelChange,
        })
      );

      act(() => {
        result.current.openMenu();
      });

      expect(result.current.isOpen).toBe(true);
      expect(result.current.viewMode).toBe('categories');
      expect(result.current.activePanel).toBe(0);
    });

    it('should switch to channels view when category selected', async () => {
      const { xtreamApi } = require('../../lib/xtream-api');
      xtreamApi.getStreams.mockResolvedValue(mockChannels);
      xtreamApi.getEPG.mockResolvedValue([]);

      const { result } = renderHook(() =>
        useCascadingMenu({
          categories: mockCategories,
          currentCategory: '1',
          onChannelChange: mockOnChannelChange,
        })
      );

      await act(async () => {
        await result.current.selectCategory('1');
      });

      expect(result.current.viewMode).toBe('channels');
      expect(result.current.activePanel).toBe(1);
      expect(result.current.channels).toEqual(mockChannels);
    });

    it('should return to categories view when showCategoriesView called', async () => {
      const { xtreamApi } = require('../../lib/xtream-api');
      xtreamApi.getStreams.mockResolvedValue(mockChannels);

      const { result } = renderHook(() =>
        useCascadingMenu({
          categories: mockCategories,
          currentCategory: '1',
          onChannelChange: mockOnChannelChange,
        })
      );

      // First switch to channels view
      await act(async () => {
        await result.current.selectCategory('1');
      });

      expect(result.current.viewMode).toBe('channels');

      // Then go back
      act(() => {
        result.current.showCategoriesView();
      });

      expect(result.current.viewMode).toBe('categories');
      expect(result.current.activePanel).toBe(0);
    });

    it('should reset to categories view when menu closed', async () => {
      const { xtreamApi } = require('../../lib/xtream-api');
      xtreamApi.getStreams.mockResolvedValue(mockChannels);

      const { result } = renderHook(() =>
        useCascadingMenu({
          categories: mockCategories,
          currentCategory: '1',
          onChannelChange: mockOnChannelChange,
        })
      );

      // Open and switch to channels
      act(() => {
        result.current.openMenu();
      });

      await act(async () => {
        await result.current.selectCategory('1');
      });

      expect(result.current.viewMode).toBe('channels');

      // Close menu
      act(() => {
        result.current.closeMenu();
      });

      expect(result.current.isOpen).toBe(false);
      expect(result.current.viewMode).toBe('categories');
    });

    it('should always reset to categories view on menu open', async () => {
      const { xtreamApi } = require('../../lib/xtream-api');
      xtreamApi.getStreams.mockResolvedValue(mockChannels);

      const { result } = renderHook(() =>
        useCascadingMenu({
          categories: mockCategories,
          currentCategory: '1',
          onChannelChange: mockOnChannelChange,
        })
      );

      // Open and navigate to channels
      act(() => {
        result.current.openMenu();
      });

      await act(async () => {
        await result.current.selectCategory('1');
      });

      expect(result.current.viewMode).toBe('channels');

      // Close menu
      act(() => {
        result.current.closeMenu();
      });

      // Reopen menu
      act(() => {
        result.current.openMenu();
      });

      // Should be back to categories
      expect(result.current.viewMode).toBe('categories');
      expect(result.current.activePanel).toBe(0);
    });
  });

  describe('channel reload prevention', () => {
    it('should not call onChannelChange when menu opens', () => {
      const { result } = renderHook(() =>
        useCascadingMenu({
          categories: mockCategories,
          currentCategory: '1',
          onChannelChange: mockOnChannelChange,
        })
      );

      act(() => {
        result.current.openMenu();
      });

      expect(mockOnChannelChange).not.toHaveBeenCalled();
    });

    it('should not call onChannelChange when menu closes', () => {
      const { result } = renderHook(() =>
        useCascadingMenu({
          categories: mockCategories,
          currentCategory: '1',
          onChannelChange: mockOnChannelChange,
        })
      );

      act(() => {
        result.current.openMenu();
        result.current.closeMenu();
      });

      expect(mockOnChannelChange).not.toHaveBeenCalled();
    });

    it('should not call onChannelChange when toggling menu', () => {
      const { result } = renderHook(() =>
        useCascadingMenu({
          categories: mockCategories,
          currentCategory: '1',
          onChannelChange: mockOnChannelChange,
        })
      );

      act(() => {
        result.current.toggleMenu();
      });

      expect(mockOnChannelChange).not.toHaveBeenCalled();

      act(() => {
        result.current.toggleMenu();
      });

      expect(mockOnChannelChange).not.toHaveBeenCalled();
    });
  });

  describe('explicit channel selection', () => {
    it('should not call onChannelChange when selecting category', async () => {
      const { xtreamApi } = require('../../lib/xtream-api');
      xtreamApi.getStreams.mockResolvedValue(mockChannels);
      xtreamApi.getEPG.mockResolvedValue([]);

      const { result } = renderHook(() =>
        useCascadingMenu({
          categories: mockCategories,
          currentCategory: '1',
          onChannelChange: mockOnChannelChange,
        })
      );

      await act(async () => {
        await result.current.selectCategory('1');
      });

      expect(mockOnChannelChange).not.toHaveBeenCalled();
    });

    it('should call onChannelChange when selecting channel', async () => {
      const { xtreamApi } = require('../../lib/xtream-api');
      xtreamApi.getEPG.mockResolvedValue([]);

      const { result } = renderHook(() =>
        useCascadingMenu({
          categories: mockCategories,
          currentCategory: '1',
          onChannelChange: mockOnChannelChange,
        })
      );

      act(() => {
        result.current.selectChannel(mockChannels[0]);
      });

      expect(mockOnChannelChange).toHaveBeenCalledWith(mockChannels[0]);
      expect(mockOnChannelChange).toHaveBeenCalledTimes(1);
    });

    it('should not call onChannelChange when navigating panels', () => {
      const { result } = renderHook(() =>
        useCascadingMenu({
          categories: mockCategories,
          currentCategory: '1',
          onChannelChange: mockOnChannelChange,
        })
      );

      act(() => {
        result.current.moveNextPanel();
      });

      expect(mockOnChannelChange).not.toHaveBeenCalled();

      act(() => {
        result.current.movePreviousPanel();
      });

      expect(mockOnChannelChange).not.toHaveBeenCalled();
    });
  });

  describe('showChannelsView', () => {
    it('should set viewMode to channels and activePanel to 1', () => {
      const { result } = renderHook(() =>
        useCascadingMenu({
          categories: mockCategories,
          currentCategory: '1',
          onChannelChange: mockOnChannelChange,
        })
      );

      expect(result.current.viewMode).toBe('categories');
      expect(result.current.activePanel).toBe(0);

      act(() => {
        result.current.showChannelsView();
      });

      expect(result.current.viewMode).toBe('channels');
      expect(result.current.activePanel).toBe(1);
    });
  });

  describe('showCategoriesView', () => {
    it('should set viewMode to categories and activePanel to 0', async () => {
      const { xtreamApi } = require('../../lib/xtream-api');
      xtreamApi.getStreams.mockResolvedValue(mockChannels);

      const { result } = renderHook(() =>
        useCascadingMenu({
          categories: mockCategories,
          currentCategory: '1',
          onChannelChange: mockOnChannelChange,
        })
      );

      // First go to channels view
      await act(async () => {
        await result.current.selectCategory('1');
      });

      expect(result.current.viewMode).toBe('channels');

      // Then go back to categories
      act(() => {
        result.current.showCategoriesView();
      });

      expect(result.current.viewMode).toBe('categories');
      expect(result.current.activePanel).toBe(0);
    });
  });
});
