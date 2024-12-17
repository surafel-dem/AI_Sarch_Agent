Here’s the full **Markdown layout** with the updated response structure integrated:

```markdown
# [Project Name]

Every time you choose to apply a rule(s), explicitly state the rule(s) in the output. You can abbreviate the rule description to a single word or phrase.

---

## Project Context

A modern, AI-powered car search platform that helps users find their ideal vehicle through intelligent search, real-time data processing, and conversational AI assistance.

- Multi-step, intelligent car search interface combining traditional and modern form filters.
- Real-time AI assistance through chat interface and background contextual understanding.
- Personalized car recommendations and advice through AI Agent using best GPTs and searches.
- [more description]

---

## Code Style and Structure

- Write concise, technical TypeScript code with accurate examples.
- Use functional and declarative programming patterns; avoid classes.
- Prefer iteration and modularization over code duplication.
- Use descriptive variable names with auxiliary verbs (e.g., `isLoading`, `hasError`).
- Structure of files as follows:

```plaintext
├── README.md                      # Project documentation, setup instructions, and project overview
├── app/                           # Next.js 13+ app directory (server components by default)
│   ├── (auth)/                    # Authentication routes with Clerk integration (grouped routes)
│   ├── api/                       # API route handlers for server-side operations
│   ├── favicon.ico                # Website favicon
│   ├── fonts/                     # Custom font files for typography
│   ├── globals.css                # Global styles and Tailwind CSS imports
│   ├── layout.tsx                 # Root layout with providers and global UI elements
│   ├── page.tsx                   # Homepage component (server-side rendered)
│   └── search/                    # Search functionality pages and route handlers
├── components/                    # Reusable React components (client & server)
│   ├── ai-assistant.tsx           # AI chat assistant interface component
│   ├── animated-background.tsx    # Background animation effects
│   ├── auth/                      # Authentication-related components (login, register)
│   ├── card.tsx                   # Reusable card component for displaying items
│   ├── chat/                      # Chat interface components and logic
│   ├── filter-form.tsx            # Search filtering and sorting form
│   ├── floating-menu.tsx          # Floating navigation menu component
│   ├── loading-dots.tsx           # Loading animation component
│   ├── navbar.tsx                 # Main navigation bar
│   ├── navigation.tsx             # Navigation logic and routing components
│   ├── quick-links.tsx            # Quick access navigation links
│   ├── route-handler.tsx          # Custom route handling component
│   ├── search/                    # Search-related components and forms
│   ├── sidebar.tsx                # Sidebar navigation component
│   └── ui/                        # Shadcn UI components and custom UI elements
├── components.json                # Shadcn UI components configuration
├── contexts/                      # React Context providers
│   └── auth-context.tsx           # Authentication state management
├── docs/                          # Project documentation
│   ├── Tables.md                  # Database schema documentation
│   ├── clerk_supabase_integration.md  # Auth integration guide
│   ├── homepage-implementation.md     # Homepage features documentation
│   └── [other].md                 # Various feature documentation
├── lib/                           # Utility functions and core logic
│   ├── auth.ts                    # Authentication utilities
│   ├── clerk-config.ts            # Clerk authentication configuration
│   ├── config.ts                  # Application configuration
│   ├── email-templates.ts         # Email notification templates
│   ├── hooks/                     # Custom React hooks
│   ├── services/                  # Business logic services
│   ├── supabase-utils.ts          # Supabase helper functions
│   ├── utils/                     # General utility functions
│   └── utils.ts                   # Common utility functions
├── middleware.ts                  # Next.js middleware for auth and routing
├── public/                        # Static assets
│   ├── images/                    # Image assets
│   └── logos/                     # Logo files and branding assets
├── supabase/                      # Supabase database configuration
│   ├── migrations/                # Database migration files
│   └── users.sql                  # User table and auth schema
├── types/                         # TypeScript type definitions
│   ├── database.ts                # Database schema types
│   ├── search.ts                  # Search functionality types
│   ├── supabase.ts                # Supabase client types
│   └── user.ts                    # User-related type definitions
├── package.json                   # Project dependencies and scripts
├── tailwind.config.js             # Tailwind CSS configuration
└── [config files]                 # Various configuration files (next.config.js, tsconfig.json, etc.)
```

---

## Tech Stack

- Next.js 13+
- TypeScript
- Tailwind CSS
- Shadcn UI
- Supabase (PostgreSQL)
- Clerk (Authentication)
- Express.js
- n8n (Workflow Engine)

---

## Naming Conventions

- Use lowercase with dashes for directories (e.g., `components/form-wizard`).
- Favor named exports for components and utilities.
- Use PascalCase for component files (e.g., `VisaForm.tsx`).
- Use camelCase for utility files (e.g., `formValidator.ts`).

---

## TypeScript Usage

- Use TypeScript for all code; prefer interfaces over types.
- Avoid enums; use const objects with `as const` assertion.
- Use functional components with TypeScript interfaces.
- Define strict types for message passing between different parts of the extension.
- Use absolute imports for all files `@/...`.
- Avoid try/catch blocks unless translating or handling errors meaningfully.
- Use explicit return types for all functions.

---

## n8n Usage

On any webhook communication with **n8n**, use these rules **STRICTLY**:

- **Webhook URL**: `https://n8n.yotor.co/webhook/invoke_agent`
- **Authorization Header**: A Bearer token stored in the environment variable: `NEXT_PUBLIC_AGENT_TOKEN`
- Every request body **MUST** be structured as follows:

```json
{
  "sessionId": "<unique-session-id>",
  "chatInput": "<user-input-text>",
  "carSpecs": {
    "make": "<car-make>",
    "model": "<car-model>",
    "year": "<car-year>",
    "county": "<car-county>",
    "features": "<additional-features>",
    "usage": "<new-or-used>",
    "minPrice": "<minimum-price>",
    "maxPrice": "<maximum-price>",
    "preferences": "<additional-preferences>"
  },
  "results": [
    {
      "id": "<result-id>",
      "title": "<car-title>",
      "price": "<car-price>",
      "location": "<car-location>"
    }
  ]
}
```

- **Response Structure**:

The AI Agent's response will follow this structure:

```json
[
  {
    "output": "Hello! It seems you're interested in Volkswagen cars in Dublin. Unfortunately, the list you provided shows Volkswagen models predominantly available in Galway. If you are considering expanding your search or need further assistance in finding a specific Volkswagen model in Dublin, just let me know how I can help.\n\nIf there is anything else specific you are looking for, such as certain models or features, feel free to share, and I'll do my best to assist you!"
  }
]
```

- Structure: The response is an array containing one or more objects
- output: A string containing the AI Agent's response message. The message provides contextual feedback, highlights limitations (e.g., search location mismatches), and offers further assistance.
  
---

## State Management

- Use React Context for global state when needed.
- Implement state persistence using `chrome.storage`.
- Ensure cleanup in `useEffect` hooks.

---

## UI and Styling

- Use **Shadcn UI** and Radix for components.
- Use `npx shadcn@latest add <component-name>` to add new components.
- Implement **Tailwind CSS** for styling.
- Follow Material Design guidelines where applicable.
- Document new component installation commands.

---

## Error Handling

- Implement error boundaries.
- Log errors appropriately for debugging.
- Provide user-friendly error messages.
- Handle network failures gracefully.

---

## Security

- Implement Content Security Policy.
- Sanitize user inputs.
- Handle sensitive data properly.
- Follow Chrome extension security best practices.

---

## Git Usage

**Commit Message Prefixes**:
- `fix:` for bug fixes
- `feat:` for new features
- `perf:` for performance improvements
- `docs:` for documentation changes
- `style:` for formatting changes
- `refactor:` for code refactoring
- `test:` for adding missing tests
- `chore:` for maintenance tasks

**Rules**:
- Use lowercase for commit messages.
- Keep the summary line concise.
- Reference issue numbers when applicable.

---

## Documentation

- Maintain a clear `README.md` with setup instructions.
- Document API interactions and data flows.
- Keep `manifest.json` and permissions well-documented.

---

## Development Workflow

- Use proper version control.
- Follow semantic versioning for releases.
- Implement code reviews and testing in multiple environments.
- Maintain a **CHANGELOG** for version history.

