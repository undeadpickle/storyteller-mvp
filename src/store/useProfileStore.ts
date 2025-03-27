import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { logger } from '../utils/debug';

export interface Profile {
  id: string;
  name: string;
  avatar: string;
  createdAt: number;
}

export interface ProfileState {
  profiles: Profile[];
  activeProfileId: string | null;
  addProfile: (profile: Omit<Profile, 'id' | 'createdAt'>) => void;
  updateProfile: (id: string, updates: Partial<Omit<Profile, 'id' | 'createdAt'>>) => void;
  deleteProfile: (id: string) => void;
  setActiveProfile: (id: string | null) => void;
  getActiveProfile: () => Profile | null;
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set, get) => ({
      profiles: [],
      activeProfileId: null,

      addProfile: profile => {
        const newProfile: Profile = {
          ...profile,
          id: crypto.randomUUID(),
          createdAt: Date.now(),
        };

        logger.store('Profile', 'addProfile', { newProfile });

        set(state => {
          const newState = {
            profiles: [...state.profiles, newProfile],
            // If this is the first profile, set it as active
            activeProfileId: state.profiles.length === 0 ? newProfile.id : state.activeProfileId,
          };
          return newState;
        });
      },

      updateProfile: (id, updates) => {
        logger.store('Profile', 'updateProfile', { id, updates });

        set(state => ({
          profiles: state.profiles.map(profile =>
            profile.id === id ? { ...profile, ...updates } : profile
          ),
        }));
      },

      deleteProfile: id => {
        logger.store('Profile', 'deleteProfile', { id });

        set(state => ({
          profiles: state.profiles.filter(profile => profile.id !== id),
          // If deleting the active profile, set activeProfileId to null
          activeProfileId: state.activeProfileId === id ? null : state.activeProfileId,
        }));
      },

      setActiveProfile: id => {
        logger.store('Profile', 'setActiveProfile', { id });
        set({ activeProfileId: id });
      },

      getActiveProfile: () => {
        const { profiles, activeProfileId } = get();
        const profile = profiles.find(profile => profile.id === activeProfileId) || null;

        // Only log when this is called, but don't log on each render
        // Use Vite's import.meta.env.DEV instead of process.env.NODE_ENV
        if (import.meta.env.DEV) {
          const stack = new Error().stack?.split('\n') || [];
          // Check if this was called from a component or from a hook/other function
          if (stack.length > 3 && !stack[3].includes('getActiveProfile')) {
            logger.store('Profile', 'getActiveProfile', {
              profileId: activeProfileId,
              found: !!profile,
            });
          }
        }

        return profile;
      },
    }),
    {
      name: 'storyteller-profiles',
      onRehydrateStorage: () => {
        logger.store('Profile', 'rehydrated');
      },
    }
  )
);
