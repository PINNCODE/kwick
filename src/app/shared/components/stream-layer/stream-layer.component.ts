import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface StreamProgram {
  time: string;
  endTime: string;
  label: string;
  description: string;
}

@Component({
  selector: 'app-stream-layer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stream-layer.component.html',
  styleUrl: './stream-layer.component.scss',
})
export class StreamLayerComponent {
  readonly isPlaying = input(true);
  readonly isMuted = input(false);
  readonly volume = input(100);
  readonly channelLogo = input('https://futuretv.mx/logos/canales.v158645616521/mex.canal5.png');
  readonly channelName = input('Channel Name');
  readonly programs = input<StreamProgram[]>([]);

  readonly togglePlayPause = output<void>();
  readonly toggleMuteUnmute = output<void>();
  readonly volumeChange = output<number>();

  onVolumeChange(event: Event): void {
    const value = (event.target as HTMLInputElement).valueAsNumber;
    this.volumeChange.emit(value / 100);
  }

  togglePlay(): void {
    this.togglePlayPause.emit();
  }

  toggleMute(): void {
    this.toggleMuteUnmute.emit();
  }

  getProgress(startTime: string, endTime: string): number {
    const now = new Date();
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);

    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    const currentMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();

    if (currentMinutes < startMinutes) return 0;
    if (currentMinutes >= endMinutes) return 100;

    return ((currentMinutes - startMinutes) / (endMinutes - startMinutes)) * 100;
  }
}