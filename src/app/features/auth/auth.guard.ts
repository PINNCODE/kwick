import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthServiceAdapter } from '../../../infrastructure/adapters/auth-service.adapter';

export const authGuard: CanActivateFn = async () => {
  const authService = inject(AuthServiceAdapter);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  const restored = await authService.restoreSession();
  return restored ? true : router.createUrlTree(['/login']);
};
