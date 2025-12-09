import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MINO - Parallel Search',
  description: 'AI-powered web agent that searches multiple sites simultaneously and delivers synthesized answers',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {children}
        <div id="portal-root" />
      </body>
    </html>
  );
}
