import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ColorSchemeName } from 'react-native';
import { darkTheme, lightTheme, AppTheme } from '../theme/colors';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeState {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  getColors: (systemColorScheme?: ColorSchemeName) => AppTheme;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      themeMode: 'system',
      setThemeMode: (mode) => set({ themeMode: mode }),
      getColors: (systemColorScheme) => {
        const mode = get().themeMode;
        if (mode === 'system') {
          return systemColorScheme === 'light' ? lightTheme : darkTheme;
        }
        return mode === 'dark' ? darkTheme : lightTheme;
      },
    }),
    {
      name: 'theme-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
