import type { Metadata } from 'next'
import { Inter, Poppins } from 'next/font/google'
import './globals.css'
import { ClerkProvider } from '@clerk/nextjs'
import { cn } from '@/lib/utils'
import { Sidebar } from '@/components/sidebar'
import { Navbar } from '@/components/navbar'
import { Toaster } from 'sonner'
import { clerkConfig } from '@/lib/clerk-config'

const poppins = Poppins({ 
  subsets: ['latin'],
  weight: ['400', '600'],
  variable: '--font-poppins',
})

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
      <body
        className={cn(
          "min-h-screen antialiased",
          "bg-gradient-to-b from-[rgb(247,247,255)] to-white",
          poppins.variable,
          "font-poppins"
        )}
      >
        <ClerkProvider 
          {...clerkConfig}
          publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
        >
          <div className="min-h-screen">
            <Sidebar />
            <Navbar />
            <main>{children}</main>
          </div>
          <Toaster />
        </ClerkProvider>
      </body>
    </html>
  )
}
