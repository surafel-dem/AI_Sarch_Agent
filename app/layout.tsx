'use client';

import './globals.css';
import { ClerkProvider } from '@clerk/nextjs';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#0a0a0a]">
        <ClerkProvider>
          <div className="relative flex min-h-screen flex-col">
            {children}
          </div>
        </ClerkProvider>
      </body>
    </html>
  );
}
