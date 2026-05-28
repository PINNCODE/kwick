import { Component, input } from '@angular/core';

@Component({
  selector: 'app-menu-layer',
  standalone: true,
  templateUrl: './menu-layer.component.html',
  styleUrl: './menu-layer.component.scss'
})
export class MenuLayerComponent {
  readonly username = input('');
  readonly initial = input('');
}