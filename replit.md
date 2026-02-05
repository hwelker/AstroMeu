# AstroMeu - Personalized Astrological Guidance Platform

## Overview

AstroMeu is a personalized astrological guidance web application built for Brazilian Portuguese-speaking users. The platform offers daily astrological audio messages, AI-powered chat conversations with an astrologer persona named "Luna", zodiac sign calculations, and subscription-based plan management. Users register with their birth data to receive tailored astrological content.

## Recent Changes (February 2026)

- **Login Page**: Created login page at /login with email/password form, forgot password placeholder, navigation to/from registration
- **Terms of Use**: Full legal page at /terms with LGPD-compliant content covering all app features, plan pricing, AI usage, data retention
- **Privacy Policy**: Full legal page at /privacy with data collection details, LGPD rights, retention periods (chat: 90 days, diary: 1 year, audio: 30 days)
- **BrazilStateCitySelector**: Reusable component with all 27 Brazilian states and top 10 cities per state, used in onboarding and RadarCoracao
- **BottomNav**: Mobile bottom navigation component with dynamic tabs based on user plan (Essência: Chat+Profile, Conexão: +Radar, Plenitude: +Diário)
- **Onboarding Improvements**: Profile photo upload (2MB limit, base64), state/city birth location selector, visual voice preference cards with gradient backgrounds, "Already have account?" login link, footer with terms/privacy links
- **RadarCoracao Updates**: Partner photo upload with same UX pattern, BrazilStateCitySelector for partner location
- **Login Stub Endpoint**: POST /api/auth/login endpoint using email lookup (password hashing not yet implemented)
- **Mapa Astral**: Natal chart display with sun, moon, ascendant signs, element badge, and planetary positions (mock data)
- **Horóscopo do Dia**: Daily horoscope with general/love/career predictions, lucky numbers, intensity meter, and mood badges
- **Radar do Coração**: Partner compatibility module with 0-100 score, 7-day forecast, and daily relationship alerts (Premium: Conexão+)
- **Diário das Estrelas**: Emotional diary with mood tracking, AI responses, pattern detection (Premium: Plenitude only)
- **Dashboard Navigation**: Restructured with 7 tabs (Chat, Horóscopo, Mapa, Radar, Diário, Perfil, Planos) + BottomNav for mobile
- **Plan-based Gating**: Lock/unlock features based on subscription with upgrade prompts
- **Design Polish**: Updated primary color to exact #6366F1 indigo, border-radius to 20px spec

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state and caching
- **UI Components**: shadcn/ui component library with Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming (light/dark mode support)
- **Forms**: React Hook Form with Zod validation
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express 5
- **Language**: TypeScript with ESM modules
- **API Pattern**: RESTful JSON APIs under `/api/*` routes
- **AI Integration**: OpenAI-compatible API via Replit AI Integrations for chat completions, text-to-speech, and speech-to-text
- **Database ORM**: Drizzle ORM with PostgreSQL dialect

### Data Storage
- **Primary Database**: PostgreSQL accessed via `DATABASE_URL` environment variable
- **Schema Location**: `shared/schema.ts` contains all table definitions
- **Key Tables**: 
  - `users` - User profiles with birth data and subscription plans
  - `chatMessages` - AI chat conversation history
  - `dailyAudios` - Generated daily audio messages
  - `dailyQuestionCounts` - Rate limiting for chat questions
  - `partners` - Relationship compatibility data
  - `diaryEntries` - User journal entries
  - `conversations` / `messages` - Generic chat storage for AI integrations

### Authentication & Authorization
- No authentication system currently implemented
- Plan-based rate limiting controls feature access (essencia: 3 questions/day, conexao: 10/day, plenitude: unlimited)

### Key Design Decisions
- **Monorepo Structure**: Client (`client/`), server (`server/`), and shared code (`shared/`) in single repository
- **Shared Types**: TypeScript types and Zod schemas shared between frontend and backend via `@shared/*` path alias
- **Database Migrations**: Drizzle Kit with `db:push` command for schema synchronization
- **Build Process**: Custom build script using esbuild for server bundling and Vite for client

## External Dependencies

### AI Services
- **OpenAI API**: Configured via `AI_INTEGRATIONS_OPENAI_API_KEY` and `AI_INTEGRATIONS_OPENAI_BASE_URL` environment variables
- **Models Used**: Chat completions for astrology responses, text-to-speech for audio generation, speech-to-text for voice input

### Database
- **PostgreSQL**: Required, connection via `DATABASE_URL` environment variable
- **Session Storage**: `connect-pg-simple` for PostgreSQL-backed sessions (configured but may not be active)

### Third-Party Libraries
- **Voice Features**: Custom audio worklet implementation for real-time voice streaming
- **Audio Processing**: FFmpeg dependency for audio format conversion (server-side)
- **Rate Limiting**: `p-limit` and `p-retry` for batch processing with backoff

### Replit-Specific
- **Dev Plugins**: `@replit/vite-plugin-runtime-error-modal`, `@replit/vite-plugin-cartographer`, `@replit/vite-plugin-dev-banner` for enhanced development experience