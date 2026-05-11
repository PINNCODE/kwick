import { xtreamApi } from '../../app/lib/xtream-api';

describe('Xtream API Contract', () => {
  beforeEach(() => {
    xtreamApi.logout();
  });

  describe('getEPG', () => {
    it('should return typed EpgListing array', async () => {
      xtreamApi.setCredentials({
        host: 'http://test.example.com',
        username: 'testuser',
        password: 'testpass',
      });

      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              epg_listings: [
                {
                  id: '1',
                  title: 'Test Program',
                  start: '1715364780',
                  end: '1715379000',
                  description: 'Test description',
                },
              ],
            }),
        })
      ) as jest.Mock;

      (xtreamApi as unknown as { isAuthenticated: boolean }).isAuthenticated = true;

      const result = await xtreamApi.getEPG('101');

      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('title');
      expect(result[0]).toHaveProperty('start');
      expect(result[0]).toHaveProperty('end');
    });

    it('should return empty array on network error', async () => {
      xtreamApi.setCredentials({
        host: 'http://test.example.com',
        username: 'testuser',
        password: 'testpass',
      });

      global.fetch = jest.fn(() => Promise.reject(new Error('Network error'))) as jest.Mock;

      (xtreamApi as unknown as { isAuthenticated: boolean }).isAuthenticated = true;

      const result = await xtreamApi.getEPG('101');
      expect(result).toEqual([]);
    });

    it('should return empty array when epg_listings is missing', async () => {
      xtreamApi.setCredentials({
        host: 'http://test.example.com',
        username: 'testuser',
        password: 'testpass',
      });

      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({}),
        })
      ) as jest.Mock;

      (xtreamApi as unknown as { isAuthenticated: boolean }).isAuthenticated = true;

      const result = await xtreamApi.getEPG('101');
      expect(result).toEqual([]);
    });
  });
});
