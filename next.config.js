/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_SUPABASE_URL: 'https://mqqahrgwkhvdanloejjc.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xcWFocmd3a2h2ZGFubG9lampjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjk1MDQzNTgsImV4cCI6MjA0NTA4MDM1OH0.FNBAZE-O9phPnzojGgQZjHiYCMWblRd-l4ICxirC5RU',
    RESEND_API_KEY: 're_UgBozWY9_GxrVPVm8AjVMJh3veXrgf81z',
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
    ],
  },
}

module.exports = nextConfig
