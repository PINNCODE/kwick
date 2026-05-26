import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: 'player', loadComponent: () => import('./features/player').then(m => m.PlayerComponent) },
  { path: '', redirectTo: 'player', pathMatch: 'full' },
];
