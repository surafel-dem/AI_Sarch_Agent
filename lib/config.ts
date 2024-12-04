const getEnvironmentVariable = (environmentVariable: string, fallback: string): string => {
  const value = process.env[environmentVariable]
  return value ?? fallback
}

export const config = {
  supabase: {
    url: getEnvironmentVariable('NEXT_PUBLIC_SUPABASE_URL', 'https://mqqahrgwkhvdanloejjc.supabase.co'),
    anonKey: getEnvironmentVariable('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xcWFocmd3a2h2ZGFubG9lampjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjk1MDQzNTgsImV4cCI6MjA0NTA4MDM1OH0.FNBAZE-O9phPnzojGgQZjHiYCMWblRd-l4ICxirC5RU'),
  },
  resend: {
    apiKey: getEnvironmentVariable('RESEND_API_KEY', 're_UgBozWY9_GxrVPVm8AjVMJh3veXrgf81z'),
  },
  n8n: {
    agentToken: getEnvironmentVariable('NEXT_PUBLIC_AGENT_TOKEN', ''),
    webhookUrl: 'https://n8n.yotor.co/webhook/invoke_agent'
  }
} as const
