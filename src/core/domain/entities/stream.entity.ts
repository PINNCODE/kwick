export type StreamType = 'live';

export interface Stream {
  id: number;
  name: string;
  categoryId: number | string;
  type: StreamType;
  thumbnail?: string;
  streamIcon?: string;
}
