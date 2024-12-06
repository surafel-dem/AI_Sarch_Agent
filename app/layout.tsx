import type { Metadata } from 'next'
import { Poppins } from 'next/font/google'
import './globals.css'
import { ClerkProvider } from '@clerk/nextjs'
import { Navbar } from '@/components/navbar'
import { Sidebar } from '@/components/sidebar'
import { Toaster } from 'sonner'

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
      <body className={`${poppins.variable} font-poppins`}>
        <ClerkProvider
          appearance={{
            baseTheme: {
              variables: {
                colorBackground: "transparent",
                colorInputBackground: "transparent",
                colorInputText: "#3b82f6",
                colorText: "#3b82f6",
                colorTextSecondary: "#60a5fa",
                colorPrimary: "#3b82f6",
                colorDanger: "#ef4444",
                colorSuccess: "#22c55e",
                colorWarning: "#f59e0b",
                colorBackgroundSecondary: "transparent",
                colorAlphaShade: "transparent",
                colorShimmer: "transparent"
              },
              elements: {
                rootBox: {
                  backgroundColor: "transparent !important"
                },
                card: {
                  backgroundColor: "transparent !important",
                  borderColor: "rgba(255, 255, 255, 0.05)",
                  "& *": {
                    backgroundColor: "transparent !important"
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
                    backgroundColor: "rgba(59, 130, 246, 0.1) !important"
                  }
                },
                userButtonPopoverCard: {
                  backgroundColor: "transparent !important",
                  "& *": {
                    backgroundColor: "transparent !important"
                  }
                },
                userButtonPopoverActions: {
                  backgroundColor: "transparent !important"
                },
                userButtonPopoverActionButton: {
                  backgroundColor: "transparent !important",
                  color: "#3b82f6 !important",
                  "&:hover": {
                    backgroundColor: "rgba(59, 130, 246, 0.1) !important"
                  }
                },
                organizationSwitcherTrigger: {
                  backgroundColor: "transparent !important",
                  "& *": {
                    backgroundColor: "transparent !important"
                  },
                  "&:hover": {
                    backgroundColor: "rgba(59, 130, 246, 0.1) !important"
                  }
                },
                organizationSwitcherPopoverCard: {
                  backgroundColor: "transparent !important"
                },
                organizationPreview: {
                  backgroundColor: "transparent !important",
                  "&:hover": {
                    backgroundColor: "rgba(59, 130, 246, 0.1) !important"
                  }
                },
                organizationPreviewTextContainer: {
                  color: "#3b82f6 !important"
                },
                formButtonPrimary: {
                  backgroundColor: "transparent",
                  color: "#3b82f6",
                  "&:hover": {
                    backgroundColor: "rgba(59, 130, 246, 0.1)"
                  },
                  borderRadius: "0.5rem"
                },
                headerTitle: {
                  fontSize: "1.5rem",
                  color: "#3b82f6"
                },
                headerSubtitle: {
                  color: "#60a5fa"
                },
                formFieldInput: {
                  borderColor: "rgba(255, 255, 255, 0.05)",
                  backgroundColor: "transparent",
                  borderRadius: "0.5rem",
                  "&:focus": {
                    borderColor: "#3b82f6",
                    boxShadow: "0 0 0 1px #3b82f6"
                  }
                },
                dividerLine: {
                  backgroundColor: "rgba(255, 255, 255, 0.05)"
                },
                dividerText: {
                  color: "#60a5fa"
                },
                footerActionLink: {
                  color: "#3b82f6",
                  "&:hover": {
                    color: "#60a5fa"
                  }
                },
                identityPreviewText: {
                  color: "#3b82f6"
                },
                identityPreviewEditButton: {
                  color: "#3b82f6"
                },
                avatarBox: {
                  backgroundColor: "transparent"
                },
                navbar: {
                  backgroundColor: "transparent",
                  borderColor: "rgba(255, 255, 255, 0.05)"
                },
                navbarButton: {
                  color: "#3b82f6",
                  backgroundColor: "transparent",
                  "&:hover": {
                    backgroundColor: "rgba(59, 130, 246, 0.1)"
                  }
                },
                profileSectionPrimaryButton: {
                  backgroundColor: "transparent",
                  color: "#3b82f6",
                  "&:hover": {
                    backgroundColor: "rgba(59, 130, 246, 0.1)"
                  }
                },
                profileSectionSecondaryButton: {
                  backgroundColor: "transparent",
                  color: "#3b82f6",
                  "&:hover": {
                    backgroundColor: "rgba(59, 130, 246, 0.1)"
                  }
                },
                userPreviewMainIdentifier: {
                  color: "#3b82f6"
                },
                userPreviewSecondaryIdentifier: {
                  color: "#60a5fa"
                },
                userButtonPopoverCard: {
                  backgroundColor: "transparent",
                  borderColor: "rgba(255, 255, 255, 0.05)"
                },
                userButtonPopoverActions: {
                  backgroundColor: "transparent"
                },
                userButtonPopoverActionButton: {
                  backgroundColor: "transparent",
                  color: "#3b82f6",
                  "&:hover": {
                    backgroundColor: "rgba(59, 130, 246, 0.1)"
                  }
                },
                userButtonTrigger: {
                  backgroundColor: "transparent",
                  "&:hover": {
                    backgroundColor: "rgba(59, 130, 246, 0.1)"
                  }
                },
                organizationSwitcherTrigger: {
                  backgroundColor: "transparent",
                  "&:hover": {
                    backgroundColor: "rgba(59, 130, 246, 0.1)"
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
                  backgroundColor: "transparent !important"
                }
              }
            }
          }}
        >
          <div className="min-h-screen bg-[#0a0a0a]">
            <div className="fixed inset-0 -z-10 h-full w-full bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px]"></div>
            <Sidebar />
            <Navbar />
            <main className="w-full">
              {children}
            </main>
          </div>
          <Toaster />
        </ClerkProvider>
      </body>
    </html>
  )
}
