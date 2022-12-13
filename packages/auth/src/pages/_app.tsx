import type { AppProps } from 'next/app';

import { useTheme } from '@hooks';

import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  useTheme('light');
  return <Component {...pageProps} />;
}
