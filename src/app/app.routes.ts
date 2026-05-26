import { Routes } from '@angular/router';
import { authGuard } from './features/auth/auth.guard';

export const routes: Routes = [
  { path: 'player', loadComponent: () => import('./features/player').then(m => m.PlayerComponent), canActivate: [authGuard] },
  { path: 'login', loadComponent: () => import('./features/auth/auth.component').then(m => m.AuthComponent) },
  { path: '', redirectTo: 'player', pathMatch: 'full' },
];
