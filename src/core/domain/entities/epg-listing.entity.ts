export interface EPGListing {
  id: number;
  channelId: number;
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  startTimestamp: number;
  endTimestamp: number;
}
