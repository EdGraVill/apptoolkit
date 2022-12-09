import useSwitch from './useSwitch';
import { useEffect } from 'react';

const getCurrentTheme = () => globalThis?.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;

export default function useTheme(overridedTheme?: 'light' | 'dark') {
  const [isDarkTheme, switchTheme, overrideTheme] = useSwitch(getCurrentTheme());

  useEffect(() => {
    if (!overridedTheme) {
      overrideTheme(getCurrentTheme());
    } else if (overridedTheme === 'light') {
      overrideTheme(false);
    } else {
      overrideTheme(true);
    }
  }, [overrideTheme]);

  useEffect(() => {
    const listener = (event: MediaQueryListEvent) => {
      overrideTheme(event.matches);
    };

    const mediaQueryList = globalThis?.matchMedia('(prefers-color-scheme: dark)');
    mediaQueryList.addEventListener('change', listener);

    return () => mediaQueryList.removeEventListener('change', listener);
  }, []);

  useEffect(() => {
    if (isDarkTheme) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkTheme]);

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      // @ts-ignore
      globalThis.switchTheme = () => {
        switchTheme();
      };
    }
  }, []);
}
