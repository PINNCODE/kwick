import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { IptvApiPort, AuthResult, Category, Stream, EPGListing, IptvApiException, ErrorCode } from '../../core';

interface XtreamApiResponse {
  user_info?: {
    username: string;
    status: string;
    exp_date?: string;
  };
  user?: {
    username: string;
    status: string;
    exp_date?: string;
  };
  server_info?: {
    url: string;
    port: number;
    https_port: number;
    server_protocol: string;
    rtmp_port: number;
    timestamp: number;
  };
  categories?: Array<{
    category_id: string;
    category_name: string;
    category_type: string;
  }>;
  livestreams?: Array<{
    num: number;
    name: string;
    stream_type: string;
    stream_id: number;
    category_id: number;
    thumbnail?: string;
  }>;
  epg_listings?: Array<{
    id: number;
    channel_id: number;
    title: string;
    description: string;
    start_timestamp: number;
    end_timestamp: number;
  }>;
}

@Injectable()
export class XtreamHttpAdapter implements IptvApiPort {
  private readonly http = inject(HttpClient);

  login(username: string, password: string, host: string): Observable<AuthResult> {
    const url = this.buildUrl(host, '/player_api.php', {
      username: encodeURIComponent(username),
      password: encodeURIComponent(password),
    });

    return this.http.get<XtreamApiResponse>(url).pipe(
      map((response) => this.mapAuthResult(response, username)),
      catchError((err) => {
        if (err.status === 0 || err.status === 404) {
          return throwError(() => new IptvApiException(ErrorCode.AUTH_FAILED, 'Invalid credentials'));
        }
        return throwError(() => new IptvApiException(ErrorCode.SERVER_ERROR, 'Server error during login'));
      })
    );
  }

  getCategories(host: string, authToken: string): Observable<Category[]> {
    const url = this.buildUrl(host, '/player_api.php', { action: 'get_live_categories' }, authToken);

    return this.http.get(url).pipe(
      map((response: any) => {
        const cats = Array.isArray(response) ? response : Object.values(response);
        return cats.map((cat: any) => ({
          id: Number(cat.category_id),
          name: cat.category_name,
          type: cat.category_type as 'live',
        }));
      }),
      catchError((err) => this.handleHttpError(err))
    );
  }

  getLivestreams(host: string, authToken: string, categoryId?: number): Observable<Stream[]> {
    const params: Record<string, string> = { action: 'get_live_streams' };
    if (categoryId) {
      params['category_id'] = categoryId.toString();
    }
    const url = this.buildUrl(host, '/player_api.php', params, authToken);

    return this.http.get(url).pipe(
      map((response: any) => {
        const streams = Object.values(response) as any[];
        return streams.map((stream: any) => ({
          id: stream.stream_id,
          name: stream.name,
          categoryId: stream.category_id,
          type: stream.stream_type as 'live',
          thumbnail: stream.thumbnail,
          streamIcon: stream.stream_icon,
        }));
      }),
      catchError((err) => this.handleHttpError(err))
    );
  }

  getEPG(host: string, authToken: string, streamId: number, limit?: number): Observable<EPGListing[]> {
    let url = this.buildUrl(host, '/panel_api.php', { action: 'get_short_epg', stream_id: streamId.toString() }, authToken);
    if (limit) {
      url += `&limit=${limit}`;
    }

    return this.http.get<XtreamApiResponse>(url).pipe(
      map((response) => {
        const epgData = (response as unknown as { epg_listings?: EPGListing[] }).epg_listings ?? [];
        return epgData.map((item) => ({
          id: item.id,
          channelId: item.channelId,
          title: item.title,
          description: item.description,
          startTime: new Date(item.startTimestamp * 1000),
          endTime: new Date(item.endTimestamp * 1000),
          startTimestamp: item.startTimestamp,
          endTimestamp: item.endTimestamp,
        }));
      }),
      catchError((err) => this.handleHttpError(err))
    );
  }

  private buildUrl(host: string, path: string, params: Record<string, string>, authToken?: string): string {
    const credentials = authToken ? authToken.split(':') : [];
    let qs: string;
    if (credentials.length === 2) {
      const credParams = new URLSearchParams({ username: credentials[0], password: credentials[1] });
      const actionParams = new URLSearchParams(params);
      qs = credParams.toString() + '&' + actionParams.toString();
    } else {
      qs = new URLSearchParams(params).toString();
    }
    return `${path}?${qs}`;
  }

  private mapAuthResult(response: XtreamApiResponse, username: string): AuthResult {
    const user = response.user_info ?? response.user;
    if (!user || !response.server_info) {
      throw new IptvApiException(ErrorCode.AUTH_FAILED, 'Invalid server response');
    }

    return {
      user: { username: user.username },
      serverInfo: {
        url: response.server_info.url,
        port: response.server_info.port,
        httpsPort: response.server_info.https_port,
        serverProtocol: response.server_info.server_protocol,
        rtmpPort: response.server_info.rtmp_port,
        timestamp: response.server_info.timestamp,
      },
      authToken: `${user.username}:${Date.now()}`,
      status: user.status as 'active' | 'expired' | 'disabled',
    };
  }

  private handleHttpError(err: { status: number; message?: string }): Observable<never> {
    if (err.status === 0 || err.status >= 500) {
      return throwError(() => new IptvApiException(ErrorCode.SERVER_ERROR, 'Server error'));
    }
    return throwError(() => new IptvApiException(ErrorCode.NETWORK_ERROR, 'Network error'));
  }
}
