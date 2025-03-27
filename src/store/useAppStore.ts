import { create } from 'zustand';
import { logger } from '../utils/debug';

export interface AppState {
  isLoading: boolean;
  error: string | null;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useAppStore = create<AppState>(set => ({
  isLoading: false,
  error: null,
  setLoading: isLoading => {
    logger.store('App', 'setLoading', { isLoading });
    set({ isLoading });
  },
  setError: error => {
    logger.store('App', 'setError', { error });
    set({ error });
  },
  clearError: () => {
    logger.store('App', 'clearError');
    set({ error: null });
  },
}));
