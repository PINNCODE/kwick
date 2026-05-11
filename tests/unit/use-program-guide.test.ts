import { renderHook, waitFor } from '@testing-library/react';
import { useProgramGuide } from '../../app/hooks/use-program-guide';
import { xtreamApi } from '../../app/lib/xtream-api';

jest.mock('../../app/lib/xtream-api', () => ({
  xtreamApi: {
    getEPG: jest.fn(),
  },
}));

const mockEpgListings = [
  { id: '1', title: 'RTC', start: '1715364780', end: '1715379000', description: '' },
  { id: '2', title: 'Inova', start: '1715364780', end: '1715382000', description: '' },
];

describe('useProgramGuide', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return empty programs when streamId is null', () => {
    const { result } = renderHook(() => useProgramGuide(null));
    expect(result.current.programs).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });

  it('should fetch EPG data when streamId is provided', async () => {
    (xtreamApi.getEPG as jest.Mock).mockResolvedValue(mockEpgListings);

    const { result } = renderHook(() => useProgramGuide('101'));

    await waitFor(() => {
      expect(result.current.programs).toEqual(mockEpgListings);
    });
    expect(result.current.isLoading).toBe(false);
  });

  it('should handle fetch errors gracefully', async () => {
    (xtreamApi.getEPG as jest.Mock).mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useProgramGuide('999'));

    await waitFor(() => {
      expect(result.current.programs).toEqual([]);
    });
  });

  it('should provide a retry function', () => {
    (xtreamApi.getEPG as jest.Mock).mockResolvedValue([]);

    const { result } = renderHook(() => useProgramGuide('101'));
    expect(typeof result.current.retry).toBe('function');
  });
});
