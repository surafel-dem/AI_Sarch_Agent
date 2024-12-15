import type { Metadata } from 'next'
import { Inter, Poppins } from 'next/font/google'
import './globals.css'
import { ClerkProvider } from '@clerk/nextjs'
import { cn } from '@/lib/utils'
import { Sidebar } from '@/components/sidebar'
import { Toaster } from 'sonner'
import { clerkConfig } from '@/lib/clerk-config'

const poppins = Poppins({ 
  subsets: ['latin'],
  weight: ['400', '600'],
  variable: '--font-poppins',
})

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
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen antialiased",
          "bg-black bg-[radial-gradient(ellipse_at_top,rgba(51,51,51,0.4)_0%,rgba(17,17,17,0.2)_50%,transparent_100%)]",
          poppins.variable,
          "font-poppins text-white",
          inter.className
        )}
      >
        <ClerkProvider 
          {...clerkConfig}
          publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
        >
          <div className="min-h-screen">
            <Sidebar />
            <main>{children}</main>
          </div>
          <Toaster />
        </ClerkProvider>
      </body>
    </html>
  )
}
