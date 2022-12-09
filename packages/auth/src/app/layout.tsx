import '../styles/globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html className="light">
      <head />
      <body>{children}</body>
    </html>
  );
}
