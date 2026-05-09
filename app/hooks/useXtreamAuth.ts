// Authentication state management with Zustand

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Credentials, UserInfo } from '../types/xtream';
import { 
  saveCredentials, 
  getCredentials, 
  clearCredentials 
} from '../lib/storage';

interface AuthState {
  // State
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  userInfo: UserInfo | null;
  host: string;
  
  // Actions
  login: (credentials: Credentials) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
  checkStoredAuth: () => Promise<boolean>;
}

export const useXtreamAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      isAuthenticated: false,
      isLoading: false,
      error: null,
      userInfo: null,
      host: '',

      // Login action
      login: async (credentials: Credentials) => {
        set({ isLoading: true, error: null });

        try {
          // Step 1: Check connectivity
          const healthResponse = await fetch('/api/xtream/health', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ host: credentials.host }),
          });

          const healthData = await healthResponse.json();

          if (!healthData.reachable) {
            set({ 
              isLoading: false, 
              error: 'No se puede conectar al servidor. Verifica la URL.' 
            });
            return false;
          }

          // Step 2: Authenticate
          const authResponse = await fetch('/api/xtream/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials),
          });

          const authData = await authResponse.json();

          if (authData.success && authData.userInfo) {
            // Save to storage
            saveCredentials({
              ...credentials,
              userInfo: authData.userInfo,
            });

            set({
              isAuthenticated: true,
              isLoading: false,
              error: null,
              userInfo: authData.userInfo,
              host: credentials.host,
            });
            return true;
          } else {
            set({ 
              isLoading: false, 
              error: authData.error || 'Usuario o contraseña incorrectos' 
            });
            return false;
          }
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'Error desconocido' 
          });
          return false;
        }
      },

      // Logout action
      logout: () => {
        clearCredentials();
        set({
          isAuthenticated: false,
          isLoading: false,
          error: null,
          userInfo: null,
          host: '',
        });
      },

      // Clear error
      clearError: () => {
        set({ error: null });
      },

      // Check stored credentials on mount
      checkStoredAuth: async () => {
        const stored = getCredentials();
        
        if (!stored) {
          return false;
        }

        set({ isLoading: true });

        try {
          // Verify credentials are still valid
          const authResponse = await fetch('/api/xtream/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              host: stored.host,
              username: stored.username,
              password: stored.password,
            }),
          });

          const authData = await authResponse.json();

          if (authData.success) {
            set({
              isAuthenticated: true,
              isLoading: false,
              error: null,
              userInfo: authData.userInfo,
              host: stored.host,
            });
            return true;
          } else {
            // Credentials invalid, clear them
            clearCredentials();
            set({
              isAuthenticated: false,
              isLoading: false,
              error: 'Sesión expirada. Por favor inicia sesión nuevamente.',
              userInfo: null,
              host: '',
            });
            return false;
          }
        } catch (error) {
          clearCredentials();
          set({
            isAuthenticated: false,
            isLoading: false,
            error: 'Error al verificar sesión. Por favor inicia sesión nuevamente.',
            userInfo: null,
            host: '',
          });
          return false;
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        isAuthenticated: state.isAuthenticated,
        userInfo: state.userInfo,
        host: state.host,
      }),
    }
  )
);
