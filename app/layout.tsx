import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ClerkProvider } from '@clerk/nextjs'
import { Navbar } from '@/components/navbar'
import { Toaster } from 'sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Car Sales Agent',
  description: 'AI-powered car sales assistant',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ClerkProvider
          appearance={{
            baseTheme: {
              variables: {
                colorBackground: '#0a0a0a',
                colorInputBackground: '#1e293b',
                colorInputText: '#ffffff',
                colorText: '#ffffff',
                colorTextSecondary: '#94a3b8',
                colorPrimary: '#3b82f6',
              },
              elements: {
                formButtonPrimary: {
                  backgroundColor: '#3b82f6',
                  '&:hover': {
                    backgroundColor: '#2563eb',
                  },
                  borderRadius: '0.5rem',
                },
                card: {
                  backgroundColor: '#0a0a0a',
                  borderColor: '#334155',
                  borderRadius: '0.5rem',
                },
                headerTitle: {
                  fontSize: '1.5rem',
                  color: '#ffffff',
                },
                headerSubtitle: {
                  color: '#94a3b8',
                },
                formFieldInput: {
                  borderColor: '#334155',
                  backgroundColor: '#1e293b',
                  borderRadius: '0.5rem',
                  '&:focus': {
                    borderColor: '#3b82f6',
                    boxShadow: '0 0 0 1px #3b82f6',
                  },
                },
                dividerLine: {
                  backgroundColor: '#334155',
                },
                dividerText: {
                  color: '#94a3b8',
                },
                footerActionLink: {
                  color: '#3b82f6',
                  '&:hover': {
                    color: '#2563eb',
                  },
                },
                identityPreviewText: {
                  color: '#ffffff',
                },
                identityPreviewEditButton: {
                  color: '#3b82f6',
                },
              },
            },
          }}
        >
          <div className="min-h-screen bg-[#0a0a0a]">
            <div className="fixed inset-0 -z-10 h-full w-full bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px]"></div>
            <Navbar />
            <main className="pt-16 container mx-auto px-4">
              {children}
            </main>
            <Toaster />
          </div>
        </ClerkProvider>
      </body>
    </html>
  )
}
