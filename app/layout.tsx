'use client';

import './globals.css';
import { SidePanel } from '@/components/side-panel';
import { AuthProvider } from '@/contexts/auth-context';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="bg-white">
      <body className="bg-white">
        <AuthProvider>
          <SidePanel />
          <main className="ml-12 transition-all duration-300">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
