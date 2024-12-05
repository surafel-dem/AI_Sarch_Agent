export const clerkConfig = {
  signIn: {
    allowedAuthFactors: ['password', 'email_code', 'email_link'],
    restrictToPasswordless: false,
    routing: "virtual",
    afterSignInUrl: "/",
    signUpUrl: null
  },
  signUp: {
    allowedAuthFactors: ['password', 'email_code', 'email_link'],
    restrictToPasswordless: false,
    routing: "virtual",
    afterSignUpUrl: "/",
    signInUrl: null,
    verifyEmailUrl: null
  },
  appearance: {
    elements: {
      rootBox: "mx-auto",
      formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-sm font-medium",
      formFieldInput: "h-11 px-4 bg-white rounded-xl border border-gray-200",
      footer: "flex items-center justify-center",
      header: "hidden",
      card: "shadow-none p-0",
      dividerLine: "bg-gray-200",
      dividerText: "text-gray-500",
      formFieldLabel: "text-gray-700 font-medium",
      footerActionLink: "text-blue-600 hover:text-blue-700",
      socialButtons: "grid gap-2",
      formFieldPassword: "h-11 px-4 bg-white rounded-xl border border-gray-200",
      formFieldPasswordConfirm: "h-11 px-4 bg-white rounded-xl border border-gray-200",
      formFieldCode: "h-11 px-4 bg-white rounded-xl border border-gray-200"
    },
    layout: {
      showOptionalFields: true,
      socialButtonsPlacement: "bottom",
      helpPageUrl: false,
      privacyPageUrl: "/privacy",
      termsPageUrl: "/terms",
      logoPlacement: "inside"
    },
    variables: {
      borderRadius: "0.75rem",
      spacingUnit: "0.25rem"
    }
  }
};
