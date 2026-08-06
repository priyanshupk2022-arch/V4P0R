import type { Metadata } from 'next';
import './globals.css';
import { AppShell } from '../components/shell/AppShell';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'VAPOR | Command Center',
  description: 'Core Design System & App Shell for VAPOR',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`antialiased ${inter.className}`}>
        <AppShell>
          {children}
        </AppShell>
      </body>
    </html>
  );
}
