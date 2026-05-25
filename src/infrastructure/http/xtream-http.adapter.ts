import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { IptvApiPort, AuthResult, Category, Stream, EPGListing, IptvApiException, ErrorCode } from '../../core';

interface XtreamApiResponse {
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
    const url = `${host}/panel_api.php?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`;

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
    const url = `${host}/panel_api.php?action=get_categories`;

    return this.http.get<XtreamApiResponse>(url).pipe(
      map((response) =>
        (response.categories ?? []).map((cat) => ({
          id: Number(cat.category_id),
          name: cat.category_name,
          type: cat.category_type as 'live',
        }))
      ),
      catchError((err) => this.handleHttpError(err))
    );
  }

  getLivestreams(host: string, authToken: string, categoryId?: number): Observable<Stream[]> {
    const url = categoryId
      ? `${host}/panel_api.php?action=get_live_streams&category_id=${categoryId}`
      : `${host}/panel_api.php?action=get_live_streams`;

    return this.http.get<XtreamApiResponse>(url).pipe(
      map((response) =>
        (response.livestreams ?? []).map((stream) => ({
          id: stream.stream_id,
          name: stream.name,
          categoryId: stream.category_id,
          type: stream.stream_type as 'live',
          thumbnail: stream.thumbnail,
        }))
      ),
      catchError((err) => this.handleHttpError(err))
    );
  }

  getEPG(host: string, authToken: string, streamId: number, limit?: number): Observable<EPGListing[]> {
    let url = `${host}/panel_api.php?action=get_short_epg&stream_id=${streamId}`;
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

  private mapAuthResult(response: XtreamApiResponse, username: string): AuthResult {
    if (!response.user || !response.server_info) {
      throw new IptvApiException(ErrorCode.AUTH_FAILED, 'Invalid server response');
    }

    return {
      user: { username: response.user.username },
      serverInfo: {
        url: response.server_info.url,
        port: response.server_info.port,
        httpsPort: response.server_info.https_port,
        serverProtocol: response.server_info.server_protocol,
        rtmpPort: response.server_info.rtmp_port,
        timestamp: response.server_info.timestamp,
      },
      authToken: `${response.user.username}:${Date.now()}`,
      status: response.user.status as 'active' | 'expired' | 'disabled',
    };
  }

  private handleHttpError(err: { status: number; message?: string }): Observable<never> {
    if (err.status === 0 || err.status >= 500) {
      return throwError(() => new IptvApiException(ErrorCode.SERVER_ERROR, 'Server error'));
    }
    return throwError(() => new IptvApiException(ErrorCode.NETWORK_ERROR, 'Network error'));
  }
}
