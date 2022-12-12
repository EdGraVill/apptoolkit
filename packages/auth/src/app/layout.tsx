import { LayoutBody } from '@components/layout/Loader';

import '../styles/globals.css';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <head />
      <LayoutBody>{children}</LayoutBody>
    </html>
  );
}
