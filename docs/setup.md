# Car Search AI Setup Guide

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Environment Setup](#environment-setup)
4. [Development](#development)
5. [Project Structure](#project-structure)

## Prerequisites

### Required Software
- Node.js (v18 or higher)
- npm or yarn
- Git

### Required Accounts & API Keys
1. **Supabase Account**
   - Create a new project
   - Get project URL and anon key
   - Enable email authentication

2. **OpenAI API Account**
   - Sign up for OpenAI API access
   - Generate API key

3. **Resend Email Service**
   - Create account at resend.com
   - Generate API key for email services

## Installation

1. **Clone the Repository**
```bash
git clone <repository-url>
cd cars_sales_ai_agent_backup
```

2. **Install Dependencies**
```bash
npm install
# or
yarn install
```

## Environment Setup

1. **Create Environment File**
Create a `.env.local` file in the root directory with the following variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# API Keys
RESEND_API_KEY=your_email_service_key
OPENAI_API_KEY=your_openai_api_key
```

2. **Supabase Setup**
   - Enable Email Authentication in Supabase dashboard
   - Configure email templates for magic links
   - Set up database tables and RLS policies

## Development

### Running the Development Server

```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:3000`

### Key Features Development
1. **Authentication**
   - Passwordless authentication using magic links
   - Session management via Supabase
   - Protected routes and middleware

2. **Car Search**
   - AI-powered natural language processing
   - Real-time car data integration
   - Multi-source aggregation

3. **User Interface**
   - Modern, responsive design
   - Real-time chat interface
   - Dynamic car search results

## Project Structure

```
cars_sales_ai_agent_backup/
├── app/                    # Next.js 14 app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication routes
│   └── page.tsx           # Main page
├── components/            # React components
│   ├── car-search-ai.tsx  # Main chat interface
│   ├── nav-bar.tsx       # Navigation
│   └── ui/               # UI components
├── lib/                   # Utility functions
│   └── supabase.ts       # Supabase client
├── types/                 # TypeScript types
├── styles/               # CSS styles
└── public/               # Static assets
```

### Key Components

1. **Car Search AI (`components/car-search-ai.tsx`)**
   - Main chat interface
   - Car search logic
   - Results display

2. **Authentication**
   - PKCE flow implementation
   - Session management
   - Protected routes

3. **API Routes**
   - Email service
   - Authentication callback
   - Data endpoints

## Development Guidelines

### Code Style
- Use TypeScript for type safety
- Follow Next.js 14 best practices
- Implement proper error handling
- Write clean, documented code

### Testing
- Test authentication flows
- Verify API integrations
- Check responsive design
- Validate car search functionality

### Security Considerations
- Secure API key management
- Input validation
- Rate limiting
- Error handling
- Session security

## Troubleshooting

### Common Issues

1. **Authentication Problems**
   - Verify Supabase configuration
   - Check email templates
   - Validate environment variables

2. **API Integration Issues**
   - Confirm API keys are valid
   - Check rate limits
   - Verify endpoint URLs

3. **Development Server**
   - Clear `.next` cache
   - Restart development server
   - Check for port conflicts

## Support

For development support:
1. Check existing documentation
2. Review code comments
3. Consult team members
4. Reference external documentation:
   - Next.js
   - Supabase
   - OpenAI
