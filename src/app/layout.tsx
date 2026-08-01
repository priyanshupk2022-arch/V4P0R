import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'VAPOR Enterprise Fintech Control Plane',
  description: 'Ultra-Low Latency Corporate Card Issuing & AI Fraud Risk Engine',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
