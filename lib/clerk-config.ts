import { clerkAppearance } from "@clerk/nextjs";

export const clerkConfig = {
  publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  afterSignIn: "/",
  afterSignUp: "/",
  signIn: {
    path: "/sign-in",
    afterSignInUrl: "/",
    signUpUrl: "/sign-up",
    redirectUrl: "/",
  },
  signUp: {
    path: "/sign-up",
    afterSignUpUrl: "/",
    signInUrl: "/sign-in",
    redirectUrl: "/",
  },
  appearance: {
    baseTheme: undefined,
    layout: {
      socialButtonsPlacement: "bottom",
      socialButtonsVariant: "iconButton",
      privacyPageUrl: "/privacy",
      termsPageUrl: "/terms",
      showOptionalFields: false,
      logoPlacement: "none",
    },
    variables: {
      colorPrimary: "#18181b",
      colorTextOnPrimaryBackground: "#ffffff",
      colorBackground: "#ffffff",
      colorText: "#18181b",
      colorTextSecondary: "#71717a",
      fontFamily: "var(--font-poppins)",
      borderRadius: "0px",
    },
    elements: {
      rootBox: {
        width: "100%",
        maxWidth: "360px",
        margin: "0 auto",
      },
      card: {
        border: "none",
        boxShadow: "none",
        width: "100%",
        margin: 0,
      },
      header: {
        display: "none",
      },
      main: {
        gap: "1.5rem",
      },
      form: {
        gap: "1.25rem",
      },
      socialButtons: {
        display: "flex",
        gap: "0.75rem",
        justifyContent: "center",
      },
      socialButtonsIconButton: {
        width: "2.75rem",
        height: "2.75rem",
        border: "1px solid #e4e4e7",
        margin: "0",
        padding: "0",
        backgroundColor: "#ffffff",
        color: "#18181b",
        "&:hover": {
          backgroundColor: "#fafafa",
          borderColor: "#d4d4d8",
        },
      },
      socialButtonsProviderIcon: {
        width: "1.25rem",
        height: "1.25rem",
      },
      formButtonPrimary: {
        height: "2.75rem",
        textTransform: "none",
        fontSize: "0.9375rem",
        fontWeight: "500",
        letterSpacing: "-0.01em",
        backgroundColor: "#18181b",
        transition: "all 0.2s ease",
        "&:hover": {
          backgroundColor: "#27272a",
        },
      },
      formFieldInput: {
        height: "2.75rem",
        padding: "0 1rem",
        fontSize: "0.9375rem",
        fontWeight: "400",
        borderColor: "#e4e4e7",
        backgroundColor: "#ffffff",
        transition: "all 0.2s ease",
        "&:hover": {
          borderColor: "#d4d4d8",
        },
        "&:focus": {
          borderColor: "#18181b",
          boxShadow: "none",
        },
      },
      formFieldLabel: {
        fontSize: "0.9375rem",
        fontWeight: "500",
        color: "#18181b",
        letterSpacing: "-0.01em",
        marginBottom: "0.375rem",
      },
      dividerRow: {
        gap: "0.75rem",
        margin: "1.5rem 0",
      },
      dividerLine: {
        backgroundColor: "#e4e4e7",
      },
      dividerText: {
        fontSize: "0.875rem",
        color: "#71717a",
        letterSpacing: "-0.01em",
      },
      footerActionText: {
        fontSize: "0.875rem",
        color: "#71717a",
        letterSpacing: "-0.01em",
      },
      footerActionLink: {
        fontSize: "0.875rem",
        color: "#18181b",
        fontWeight: "500",
        letterSpacing: "-0.01em",
        textDecoration: "none",
        transition: "all 0.2s ease",
        "&:hover": {
          color: "#000000",
          textDecoration: "none",
        },
      },
      identityPreviewText: {
        fontSize: "0.9375rem",
        color: "#18181b",
        letterSpacing: "-0.01em",
      },
      formFieldWarningText: {
        fontSize: "0.875rem",
        color: "#f59e0b",
        letterSpacing: "-0.01em",
      },
      formFieldErrorText: {
        fontSize: "0.875rem",
        color: "#ef4444",
        letterSpacing: "-0.01em",
      },
      footer: {
        margin: "1.5rem 0 0",
      },
      alternativeMethodsBlockButton: {
        height: "2.75rem",
        border: "1px solid #e4e4e7",
        backgroundColor: "#ffffff",
        color: "#18181b",
        fontSize: "0.9375rem",
        fontWeight: "500",
        letterSpacing: "-0.01em",
        "&:hover": {
          backgroundColor: "#fafafa",
          borderColor: "#d4d4d8",
        },
      },
    },
  },
} as const;
