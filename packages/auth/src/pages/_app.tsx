import '../styles/globals.css';
import { useTheme } from '@hooks';
import type { AppProps } from 'next/app';

export default function App({ Component, pageProps }: AppProps) {
  useTheme('light');
  return <Component {...pageProps} />;
}
