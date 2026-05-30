import { Observable } from 'rxjs';
import { AuthResult } from '../../domain/entities/auth-result.entity';
import { Category } from '../../domain/entities/category.entity';
import { Stream } from '../../domain/entities/stream.entity';
import { EPGListing } from '../../domain/entities/epg-listing.entity';

export interface IptvApiPort {
  login(username: string, password: string, host: string): Observable<AuthResult>;
  getCategories(host: string, authToken: string): Observable<Category[]>;
  getLivestreams(host: string, authToken: string, categoryId?: number | string): Observable<Stream[]>;
  getEPG(host: string, authToken: string, streamId: number, limit?: number): Observable<EPGListing[]>;
}
