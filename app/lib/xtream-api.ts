// Xtream Codes API Client

import { Category, LiveStream, UserInfo, Credentials, AuthResult } from '../types/xtream';

class XtreamAPIClient {
  private host: string = '';
  private username: string = '';
  private password: string = '';
  private isAuthenticated: boolean = false;

  setCredentials(credentials: Credentials): void {
    this.host = credentials.host.replace(/\/$/, ''); // Remove trailing slash
    this.username = credentials.username;
    this.password = credentials.password;
  }

  getBaseUrl(): string {
    return this.host;
  }

  async checkConnectivity(host: string): Promise<{ reachable: boolean; latency: number }> {
    const startTime = Date.now();
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${host}/player_api.php`, {
        method: 'HEAD',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const latency = Date.now() - startTime;

      return {
        reachable: response.ok || response.status === 401, // 401 means server exists but auth required
        latency,
      };
    } catch (error) {
      return {
        reachable: false,
        latency: Date.now() - startTime,
      };
    }
  }

  async authenticate(credentials: Credentials): Promise<AuthResult> {
    this.setCredentials(credentials);

    try {
      const url = new URL(`${this.host}/player_api.php`);
      url.searchParams.append('username', this.username);
      url.searchParams.append('password', this.password);

      const response = await fetch(url.toString());

      if (!response.ok) {
        return {
          success: false,
          error: `Server returned ${response.status}`,
        };
      }

      const data = await response.json();

      if (data.user_info && data.user_info.status === 'Active') {
        this.isAuthenticated = true;
        return {
          success: true,
          userInfo: data.user_info,
        };
      }

      return {
        success: false,
        error: 'Invalid credentials or inactive account',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async getCategories(): Promise<Category[]> {
    this.ensureAuthenticated();

    const url = new URL(`${this.host}/player_api.php`);
    url.searchParams.append('username', this.username);
    url.searchParams.append('password', this.password);
    url.searchParams.append('action', 'get_live_categories');

    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(`Failed to fetch categories: ${response.status}`);
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  }

  async getStreams(categoryId?: string): Promise<LiveStream[]> {
    this.ensureAuthenticated();

    const url = new URL(`${this.host}/player_api.php`);
    url.searchParams.append('username', this.username);
    url.searchParams.append('password', this.password);
    url.searchParams.append('action', 'get_live_streams');

    if (categoryId) {
      url.searchParams.append('category_id', categoryId);
    }

    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(`Failed to fetch streams: ${response.status}`);
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  }

  async getEPG(streamId: string): Promise<any[]> {
    this.ensureAuthenticated();
    
    try {
      const url = new URL(`${this.host}/player_api.php`);
      url.searchParams.append('username', this.username);
      url.searchParams.append('password', this.password);
      url.searchParams.append('action', 'get_short_epg');
      url.searchParams.append('stream_id', streamId);
      
      const response = await fetch(url.toString());
      
      if (!response.ok) {
        return [];
      }
      
      const data = await response.json();
      return data.epg_listings || [];
    } catch (error) {
      console.error('Error fetching EPG:', error);
      return [];
    }
  }

  getStreamUrl(streamId: string): string {
    if (!this.host || !this.username || !this.password) {
      return '';
    }
    return `${this.host}/live/${this.username}/${this.password}/${streamId}.m3u8`;
  }

  private ensureAuthenticated(): void {
    if (!this.isAuthenticated && !this.username) {
      throw new Error('Not authenticated. Call authenticate() first.');
    }
  }

  isLoggedIn(): boolean {
    return this.isAuthenticated;
  }

  logout(): void {
    this.host = '';
    this.username = '';
    this.password = '';
    this.isAuthenticated = false;
  }
}

// Export singleton instance
export const xtreamApi = new XtreamAPIClient();
