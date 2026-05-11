import { renderHook, act } from '@testing-library/react';
import { useCascadingMenu } from '../useCascadingMenu';
import { Category, LiveStream } from '../../types/xtream';
import { xtreamApi } from '../../lib/xtream-api';

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

  describe('focus state - category navigation (US1)', () => {
    it('T007: moveNextItem increments focusedCategoryIndex in categories view', () => {
      const { result } = renderHook(() =>
        useCascadingMenu({
          categories: mockCategories,
          currentCategory: '1',
          onChannelChange: mockOnChannelChange,
        })
      );

      expect(result.current.focusedCategoryIndex).toBe(0);

      act(() => {
        result.current.moveNextItem();
      });

      expect(result.current.focusedCategoryIndex).toBe(1);
    });

    it('T008: movePreviousItem decrements focusedCategoryIndex in categories view', () => {
      const { result } = renderHook(() =>
        useCascadingMenu({
          categories: mockCategories,
          currentCategory: '1',
          onChannelChange: mockOnChannelChange,
        })
      );

      // Move to index 1 first
      act(() => {
        result.current.moveNextItem();
      });

      expect(result.current.focusedCategoryIndex).toBe(1);

      act(() => {
        result.current.movePreviousItem();
      });

      expect(result.current.focusedCategoryIndex).toBe(0);
    });

    it('T009: moveNextItem stops at last category (no wrap-around)', () => {
      const { result } = renderHook(() =>
        useCascadingMenu({
          categories: mockCategories,
          currentCategory: '1',
          onChannelChange: mockOnChannelChange,
        })
      );

      // Move to last index
      act(() => {
        result.current.moveNextItem();
      });

      expect(result.current.focusedCategoryIndex).toBe(1);

      // Try to go past the end
      act(() => {
        result.current.moveNextItem();
      });

      expect(result.current.focusedCategoryIndex).toBe(1); // Still at last
    });

    it('T010: movePreviousItem stops at first category (no wrap-around)', () => {
      const { result } = renderHook(() =>
        useCascadingMenu({
          categories: mockCategories,
          currentCategory: '1',
          onChannelChange: mockOnChannelChange,
        })
      );

      expect(result.current.focusedCategoryIndex).toBe(0);

      // Try to go before the start
      act(() => {
        result.current.movePreviousItem();
      });

      expect(result.current.focusedCategoryIndex).toBe(0); // Still at 0
    });

    it('T011: moveNextItem/movePreviousItem do not affect focusedChannelIndex in categories view', () => {
      const { result } = renderHook(() =>
        useCascadingMenu({
          categories: mockCategories,
          currentCategory: '1',
          onChannelChange: mockOnChannelChange,
        })
      );

      const initialChannelIndex = result.current.focusedChannelIndex;

      act(() => {
        result.current.moveNextItem();
        result.current.movePreviousItem();
      });

      expect(result.current.focusedChannelIndex).toBe(initialChannelIndex);
    });

    it('T012: moveNextItem with empty categories list does not cause errors', () => {
      const { result } = renderHook(() =>
        useCascadingMenu({
          categories: [],
          currentCategory: '',
          onChannelChange: mockOnChannelChange,
        })
      );

      expect(() => {
        act(() => {
          result.current.moveNextItem();
          result.current.movePreviousItem();
        });
      }).not.toThrow();
    });
  });

  describe('focus state - channel navigation (US2)', () => {
    const multipleChannels: LiveStream[] = [
      { ...mockChannels[0], stream_id: '101', name: 'Channel 1' },
      { ...mockChannels[0], stream_id: '102', name: 'Channel 2' },
      { ...mockChannels[0], stream_id: '103', name: 'Channel 3' },
    ];

    it('T013: moveNextItem increments focusedChannelIndex in channels view', async () => {
      xtreamApi.getStreams.mockResolvedValue(multipleChannels);
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

      expect(result.current.focusedChannelIndex).toBe(0);

      act(() => {
        result.current.moveNextItem();
      });

      expect(result.current.focusedChannelIndex).toBe(1);
    });

    it('T014: movePreviousItem decrements focusedChannelIndex in channels view', async () => {
      xtreamApi.getStreams.mockResolvedValue(multipleChannels);
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

      // Move to index 1
      act(() => {
        result.current.moveNextItem();
      });

      expect(result.current.focusedChannelIndex).toBe(1);

      act(() => {
        result.current.movePreviousItem();
      });

      expect(result.current.focusedChannelIndex).toBe(0);
    });

    it('T015: moveNextItem stops at last channel (no wrap-around)', async () => {
      xtreamApi.getStreams.mockResolvedValue(multipleChannels);
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

      // Move to last index (2)
      act(() => {
        result.current.moveNextItem();
        result.current.moveNextItem();
      });

      expect(result.current.focusedChannelIndex).toBe(2);

      // Try to go past the end
      act(() => {
        result.current.moveNextItem();
      });

      expect(result.current.focusedChannelIndex).toBe(2); // Still at last
    });

    it('T016: movePreviousItem stops at first channel (no wrap-around)', async () => {
      xtreamApi.getStreams.mockResolvedValue(multipleChannels);
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

      expect(result.current.focusedChannelIndex).toBe(0);

      // Try to go before the start
      act(() => {
        result.current.movePreviousItem();
      });

      expect(result.current.focusedChannelIndex).toBe(0); // Still at 0
    });

    it('T017: moveNextItem/movePreviousItem do not affect focusedCategoryIndex in channels view', async () => {
      xtreamApi.getStreams.mockResolvedValue(multipleChannels);
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

      const initialCategoryIndex = result.current.focusedCategoryIndex;

      act(() => {
        result.current.moveNextItem();
        result.current.movePreviousItem();
      });

      expect(result.current.focusedCategoryIndex).toBe(initialCategoryIndex);
    });

    it('T018: moveNextItem with empty channels list does not cause errors', async () => {
      xtreamApi.getStreams.mockResolvedValue([]);
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

      expect(() => {
        act(() => {
          result.current.moveNextItem();
          result.current.movePreviousItem();
        });
      }).not.toThrow();
    });
  });

  describe('focus state - reset behavior (US3)', () => {
    it('T019: openMenu resets focusedCategoryIndex and focusedChannelIndex to 0', () => {
      const { result } = renderHook(() =>
        useCascadingMenu({
          categories: mockCategories,
          currentCategory: '1',
          onChannelChange: mockOnChannelChange,
        })
      );

      // Move focus away from 0
      act(() => {
        result.current.moveNextItem();
      });

      expect(result.current.focusedCategoryIndex).toBe(1);

      // Open menu should reset
      act(() => {
        result.current.openMenu();
      });

      expect(result.current.focusedCategoryIndex).toBe(0);
      expect(result.current.focusedChannelIndex).toBe(0);
    });

    it('T020: closeMenu resets focusedCategoryIndex and focusedChannelIndex to 0', () => {
      const { result } = renderHook(() =>
        useCascadingMenu({
          categories: mockCategories,
          currentCategory: '1',
          onChannelChange: mockOnChannelChange,
        })
      );

      act(() => {
        result.current.openMenu();
        result.current.moveNextItem();
      });

      expect(result.current.focusedCategoryIndex).toBe(1);

      act(() => {
        result.current.closeMenu();
      });

      expect(result.current.focusedCategoryIndex).toBe(0);
      expect(result.current.focusedChannelIndex).toBe(0);
    });

    it('T021: selectCategory resets focusedChannelIndex to 0', async () => {
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

      // Channel index should be 0 after selectCategory
      expect(result.current.focusedChannelIndex).toBe(0);
    });

    it('T022: Focus indices remain at 0 when category list is empty', () => {
      const { result } = renderHook(() =>
        useCascadingMenu({
          categories: [],
          currentCategory: '',
          onChannelChange: mockOnChannelChange,
        })
      );

      expect(result.current.focusedCategoryIndex).toBe(0);

      act(() => {
        result.current.moveNextItem();
      });

      expect(result.current.focusedCategoryIndex).toBe(0); // Still 0
    });

    it('T023: focusedChannelIndex remains at 0 when channel list is empty after selecting category', async () => {
      xtreamApi.getStreams.mockResolvedValue([]);
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

      expect(result.current.focusedChannelIndex).toBe(0);

      act(() => {
        result.current.moveNextItem();
      });

      expect(result.current.focusedChannelIndex).toBe(0); // Still 0
    });
  });
});
