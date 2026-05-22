import { useTheme } from '@hooks';
import type { AppProps } from 'next/app';

import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  useTheme('light');
  return <Component {...pageProps} />;
}
