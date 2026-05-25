import { Observable } from 'rxjs';
import { EPGListing } from '../../domain/entities/epg-listing.entity';

export interface EpgService {
  getEPG(streamId: number, limit?: number): Observable<EPGListing[]>;
}
