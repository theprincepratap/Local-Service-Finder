import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import apiService from '../services/apiService';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      
      setToken: (token) => {
        if (token) {
          localStorage.setItem('token', token);
        } else {
          localStorage.removeItem('token');
        }
        set({ token });
      },

      // Manual auth setter for demo/testing
      setAuth: (user, token) => {
        if (token) {
          localStorage.setItem('token', token);
        }
        set({
          user,
          token,
          isAuthenticated: true,
        });
      },

      updateUser: (userData) => {
        set((state) => ({
          user: { ...state.user, ...userData }
        }));
      },

      login: async (credentials) => {
        console.log('🔑 [AUTH] Login started with:', credentials.email);
        set({ isLoading: true });
        try {
          console.log('📡 [AUTH] Calling apiService.auth.login...');
          const data = await apiService.auth.login(credentials);
          
          console.log('✅ [AUTH] Login response received:', {
            hasToken: !!data.token,
            hasUser: !!data.user,
            userRole: data.user?.role,
            tokenLength: data.token?.length || 0
          });
          
          // Save token to localStorage explicitly FIRST
          if (data.token) {
            console.log('💾 [AUTH] Saving token to localStorage:', data.token.substring(0, 30) + '...');
            localStorage.setItem('token', data.token);
            console.log('✅ [AUTH] Token saved to localStorage');
            
            // Verify it was saved
            const verifyToken = localStorage.getItem('token');
            console.log('🔍 [AUTH] Verification - token in storage:', !!verifyToken);
            
            if (!verifyToken) {
              console.error('❌ [AUTH] CRITICAL: Token NOT saved to localStorage!');
            }
          } else {
            console.error('❌ [AUTH] NO TOKEN in login response!');
          }
          
          // Update Zustand state
          set({
            user: data.user,
            token: data.token,
            isAuthenticated: true,
            isLoading: false,
          });
          
          console.log('✅ [AUTH] Zustand state updated:', {
            user: data.user?.email,
            isAuthenticated: true,
            tokenInState: !!data.token
          });
          
          // Wait a tiny bit for Zustand persist to sync
          await new Promise(resolve => setTimeout(resolve, 100));
          
          console.log('✅ [AUTH] Post-sync verification:', {
            tokenInLocalStorage: !!localStorage.getItem('token'),
            tokenLength: localStorage.getItem('token')?.length || 0
          });
          
          return data;
        } catch (error) {
          console.error('❌ [AUTH] Login error:', error);
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (userData) => {
        set({ isLoading: true });
        try {
          const data = await apiService.auth.register(userData);
          
          // Save token to localStorage explicitly
          if (data.token) {
            localStorage.setItem('token', data.token);
            console.log('✅ [AUTH] Registration token saved to localStorage');
          }
          
          set({
            user: data.user,
            token: data.token,
            isAuthenticated: true,
            isLoading: false,
          });
          
          // Wait for Zustand persist to sync
          await new Promise(resolve => setTimeout(resolve, 100));
          
          return data;
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        try {
          await apiService.auth.logout();
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
          });
        }
      },

      checkAuth: async () => {
        const token = localStorage.getItem('token');
        if (!token) {
          set({ isAuthenticated: false, user: null });
          return;
        }

        try {
          const data = await apiService.auth.getMe();
          set({
            user: data.data.user,
            isAuthenticated: true,
            token,
          });
        } catch (error) {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
          });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        console.log('🔄 Auth state rehydrated from localStorage:', {
          hasUser: !!state?.user,
          hasToken: !!state?.token,
          isAuthenticated: state?.isAuthenticated,
        });
      },
    }
  )
);
