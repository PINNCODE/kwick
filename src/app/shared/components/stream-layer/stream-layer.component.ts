import { CommonModule } from '@angular/common';
import { Component, ElementRef, AfterViewInit, QueryList, ViewChildren, OnDestroy, output, signal } from '@angular/core';

@Component({
  selector: 'app-stream-layer',
  standalone: true,
  templateUrl: './stream-layer.component.html',
  styleUrl: './stream-layer.component.scss',
  imports: [CommonModule],
})
export class StreamLayerComponent implements AfterViewInit, OnDestroy {
  @ViewChildren('descRef') descRefs!: QueryList<ElementRef<HTMLElement>>;

  readonly togglePlayPause = output<void>();
  readonly toggleMuteUnmute = output<void>();
  readonly volumeChange = output<number>();

  isPlaying = true;
  isMuted = false;
  volume = 100;

  onVolumeChange(event: Event): void {
    const value = (event.target as HTMLInputElement).valueAsNumber;
    this.volume = value;
    this.volumeChange.emit(value / 100);
  }

  programs = [
    { time: '17:00', end_time: '17:60', label: 'Ahora', description: 'Descripción del programa' },
    { time: '20:00', end_time: '22:00', label: 'Próximo', description: 'Siguiente programa' },
    { time: '22:00', end_time: '23:00', label: 'Más tarde', description: 'Programa posterior Programa posterior Programa posterior Programa posterior Programa posterior Programa posterior Programa posterior Programa posterior Programa posterior Programa posterior Programa posterior Programa posterior Programa posterior Programa posterior Programa posterior Programa posterior Programa posterior Programa posterior Programa posterior Programa posterior Programa posterior Programa posterior Programa posterior' },
  ];

  ngAfterViewInit() {
    this.descRefs.forEach((ref) => {
      const text = ref.nativeElement.querySelector('p');
      if (text && text.scrollWidth > text.clientWidth) {
        text.classList.add('scrolling');
      }
    });
  }

  ngOnDestroy() {}

  togglePlay() {
    this.isPlaying = !this.isPlaying;
    this.togglePlayPause.emit();
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    this.toggleMuteUnmute.emit();
  }

  getProgress(startTime: string, endTime: string): number {
    const now = new Date();
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);

    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    if (currentMinutes < startMinutes) return 0;
    if (currentMinutes >= endMinutes) return 100;

    return ((currentMinutes - startMinutes) / (endMinutes - startMinutes)) * 100;
  }
}
