import { Observable } from 'rxjs';
import { Stream } from '../../domain/entities/stream.entity';

export interface StreamService {
  getStreams(categoryId?: number): Observable<Stream[]>;
  getStreamById(id: number): Observable<Stream | null>;
  getStreamUrl(streamId: number): string;
}
