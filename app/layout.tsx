import type { Metadata } from 'next'
import { Inter, Poppins } from 'next/font/google'
import './globals.css'
import { ClerkProvider } from '@clerk/nextjs'
import { ThemeProvider } from '@/components/theme-provider'
import { Navbar } from '@/components/navbar'
import { Sidebar } from '@/components/sidebar'
import { Toaster } from 'sonner'
import { cn } from '@/lib/utils'

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
          "bg-white",
          "bg-[linear-gradient(to_bottom,rgba(247,247,255,1),rgba(255,255,255,1))]",
          "-webkit-font-smoothing: antialiased",
          "-moz-osx-font-smoothing: grayscale",
          poppins.variable,
          "font-poppins text-gray-900"
        )}
      >
        <ClerkProvider
          appearance={{
            baseTheme: {
              variables: {
                colorBackground: "#ffffff",
                colorInputBackground: "#ffffff",
                colorInputText: "#111827",
                colorText: "#111827",
                colorTextSecondary: "#374151",
                colorPrimary: "#5046e4",
                colorDanger: "#dc2626",
                colorSuccess: "#16a34a",
                colorWarning: "#d97706",
                colorBackgroundSecondary: "#f9fafb",
                colorAlphaShade: "#f3f4f6",
                colorShimmer: "#f3f4f6"
              },
              elements: {
                rootBox: {
                  backgroundColor: "transparent !important"
                },
                card: {
                  backgroundColor: "#ffffff !important",
                  borderColor: "#e5e7eb",
                  "& *": {
                    backgroundColor: "#ffffff !important"
                  }
                },
                userButtonAvatarBox: {
                  backgroundColor: "transparent !important"
                },
                userButtonTrigger: {
                  backgroundColor: "transparent !important",
                  "& *": {
                    backgroundColor: "transparent !important"
                  },
                  "&:hover": {
                    backgroundColor: "rgba(80, 70, 228, 0.1) !important"
                  }
                },
                userButtonPopoverCard: {
                  backgroundColor: "#ffffff !important",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                  "& *": {
                    backgroundColor: "#ffffff !important"
                  }
                },
                userButtonPopoverActions: {
                  backgroundColor: "transparent"
                },
                userButtonPopoverActionButton: {
                  backgroundColor: "transparent",
                  color: "#5046e4 !important",
                  "&:hover": {
                    backgroundColor: "rgba(80, 70, 228, 0.1) !important"
                  }
                },
                organizationSwitcherTrigger: {
                  backgroundColor: "transparent !important",
                  "& *": {
                    backgroundColor: "transparent !important"
                  },
                  "&:hover": {
                    backgroundColor: "rgba(80, 70, 228, 0.1) !important"
                  }
                },
                organizationSwitcherPopoverCard: {
                  backgroundColor: "transparent !important"
                },
                organizationPreview: {
                  backgroundColor: "transparent !important",
                  "&:hover": {
                    backgroundColor: "rgba(80, 70, 228, 0.1) !important"
                  }
                },
                organizationPreviewTextContainer: {
                  color: "#5046e4 !important"
                },
                formButtonPrimary: {
                  backgroundColor: "transparent",
                  color: "#5046e4",
                  "&:hover": {
                    backgroundColor: "rgba(80, 70, 228, 0.1)"
                  },
                  borderRadius: "0.5rem"
                },
                headerTitle: {
                  fontSize: "1.5rem",
                  color: "#5046e4"
                },
                headerSubtitle: {
                  color: "#6b5ce5"
                },
                formFieldInput: {
                  borderColor: "#e5e7eb",
                  backgroundColor: "transparent",
                  borderRadius: "0.5rem",
                  "&:focus": {
                    borderColor: "#5046e4",
                    boxShadow: "0 0 0 1px #5046e4"
                  }
                },
                dividerLine: {
                  backgroundColor: "#e5e7eb"
                },
                dividerText: {
                  color: "#6b5ce5"
                },
                footerActionLink: {
                  color: "#5046e4",
                  "&:hover": {
                    color: "#6b5ce5"
                  }
                },
                identityPreviewText: {
                  color: "#5046e4"
                },
                identityPreviewEditButton: {
                  color: "#5046e4"
                },
                avatarBox: {
                  backgroundColor: "transparent"
                },
                navbar: {
                  backgroundColor: "transparent",
                  borderColor: "#e5e7eb"
                },
                navbarButton: {
                  color: "#5046e4",
                  backgroundColor: "transparent",
                  "&:hover": {
                    backgroundColor: "rgba(80, 70, 228, 0.1)"
                  }
                },
                profileSectionPrimaryButton: {
                  backgroundColor: "transparent",
                  color: "#5046e4",
                  "&:hover": {
                    backgroundColor: "rgba(80, 70, 228, 0.1)"
                  }
                },
                profileSectionSecondaryButton: {
                  backgroundColor: "transparent",
                  color: "#5046e4",
                  "&:hover": {
                    backgroundColor: "rgba(80, 70, 228, 0.1)"
                  }
                },
                userPreviewMainIdentifier: {
                  color: "#5046e4"
                },
                userPreviewSecondaryIdentifier: {
                  color: "#6b5ce5"
                },
                userButtonPopoverCard: {
                  backgroundColor: "#ffffff !important",
                  borderColor: "#e5e7eb",
                  "& *": {
                    backgroundColor: "#ffffff !important"
                  }
                },
                userButtonPopoverActions: {
                  backgroundColor: "transparent"
                },
                userButtonPopoverActionButton: {
                  backgroundColor: "transparent",
                  color: "#5046e4",
                  "&:hover": {
                    backgroundColor: "rgba(80, 70, 228, 0.1)"
                  }
                },
                userButtonTrigger: {
                  backgroundColor: "transparent",
                  "&:hover": {
                    backgroundColor: "rgba(80, 70, 228, 0.1)"
                  }
                },
                organizationSwitcherTrigger: {
                  backgroundColor: "transparent",
                  "&:hover": {
                    backgroundColor: "rgba(80, 70, 228, 0.1)"
                  }
                }
              }
            },
            signIn: {
              elements: {
                rootBox: {
                  backgroundColor: "transparent !important"
                },
                card: {
                  backgroundColor: "#ffffff !important"
                }
              }
            }
          }}
        >
          <div className="min-h-screen">
            <Sidebar />
            <Navbar />
            <main className="w-full">
              {children}
            </main>
            <Toaster />
          </div>
        </ClerkProvider>
      </body>
    </html>
  )
}
