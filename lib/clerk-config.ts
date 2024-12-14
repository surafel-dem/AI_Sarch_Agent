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
      colorPrimary: "#00875A",
      colorText: "#FFFFFF",
      colorTextOnPrimaryBackground: "#FFFFFF",
      colorBackground: "#000000",
      colorInputBackground: "#111111",
      colorInputText: "#FFFFFF",
      colorTextSecondary: "#FFFFFF",
      borderRadius: "8px",
      fontFamily: "var(--font-poppins)",
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
        backgroundColor: "#000000",
      },
      header: {
        display: "none",
      },
      headerTitle: {
        color: "#FFFFFF",
        fontSize: "1.875rem",
        fontWeight: "700",
      },
      headerSubtitle: {
        color: "#AAAAAA",
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
        border: "1px solid #AAAAAA",
        margin: "0",
        padding: "0",
        backgroundColor: "#000000",
        color: "#FFFFFF",
        "&:hover": {
          backgroundColor: "#111111",
          borderColor: "#AAAAAA",
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
        backgroundColor: "#00875A",
        color: "#FFFFFF",
        transition: "all 0.2s ease",
        "&:hover": {
          backgroundColor: "#006644",
        },
      },
      formFieldInput: {
        height: "2.75rem",
        padding: "0 1rem",
        fontSize: "0.9375rem",
        fontWeight: "400",
        borderColor: "#AAAAAA",
        backgroundColor: "#111111",
        color: "#FFFFFF",
        transition: "all 0.2s ease",
        "&:hover": {
          borderColor: "#AAAAAA",
        },
        "&:focus": {
          borderColor: "#00875A",
          boxShadow: "none",
        },
      },
      formFieldLabel: {
        fontSize: "0.9375rem",
        fontWeight: "500",
        color: "#AAAAAA",
        letterSpacing: "-0.01em",
        marginBottom: "0.375rem",
      },
      dividerRow: {
        gap: "0.75rem",
        margin: "1.5rem 0",
      },
      dividerLine: {
        backgroundColor: "#AAAAAA",
      },
      dividerText: {
        fontSize: "0.875rem",
        color: "#AAAAAA",
        letterSpacing: "-0.01em",
      },
      footerActionText: {
        fontSize: "0.875rem",
        color: "#AAAAAA",
        letterSpacing: "-0.01em",
      },
      footerActionLink: {
        fontSize: "0.875rem",
        color: "#00875A",
        fontWeight: "500",
        letterSpacing: "-0.01em",
        textDecoration: "none",
        transition: "all 0.2s ease",
        "&:hover": {
          color: "#006644",
          textDecoration: "none",
        },
      },
      identityPreviewText: {
        fontSize: "0.9375rem",
        color: "#FFFFFF",
        letterSpacing: "-0.01em",
      },
      formFieldWarningText: {
        fontSize: "0.875rem",
        color: "#F59E0B",
        letterSpacing: "-0.01em",
      },
      formFieldErrorText: {
        fontSize: "0.875rem",
        color: "#EF4444",
        letterSpacing: "-0.01em",
      },
      footer: {
        margin: "1.5rem 0 0",
        display: "none",
      },
      alternativeMethodsBlockButton: {
        height: "2.75rem",
        border: "1px solid #AAAAAA",
        backgroundColor: "#000000",
        color: "#FFFFFF",
        fontSize: "0.9375rem",
        fontWeight: "500",
        letterSpacing: "-0.01em",
        "&:hover": {
          backgroundColor: "#111111",
          borderColor: "#AAAAAA",
        },
      },
    },
  },
} as const;
