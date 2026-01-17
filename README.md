# VoiceAI Platform

A modern, production-ready Voice AI web platform where users can create voice chatbots, configure their behavior, have voice conversations through the browser, and view conversation logs.

![VoiceAI Platform](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38B2AC?style=flat-square&logo=tailwind-css)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green?style=flat-square&logo=supabase)

## 🚀 Live Demo

**[View Live Demo →](https://voiceai.platform.adityadev.codes/)**

## 📖 Product Overview

VoiceAI Platform enables users to:

1. **Create Voice Bots** - Build custom voice AI agents with personalized system prompts
2. **Configure Behavior** - Select voices (12+ options), AI models, and response temperature
3. **Voice Conversations** - Have real-time voice conversations through the browser
4. **View Logs** - Review all conversation history with timestamps and roles

This is an MVP implementation of a voice AI platform similar to systems used for customer support, appointment booking, and sales assistants.

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS v4 |
| **UI Components** | shadcn/ui (Radix primitives) |
| **Database** | Supabase (PostgreSQL) |
| **Authentication** | Supabase Auth |
| **Speech-to-Text** | Deepgram Nova-2 |
| **Text-to-Speech** | Deepgram Aura |
| **LLM** | Google Gemini 1.5 Flash |
| **Deployment** | Vercel |

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js)                        │
├───────────────┬───────────────┬──────────────┬─────────────────┤
│  Landing Page │   Auth Pages  │  Dashboard   │  Conversations   │
└───────┬───────┴───────┬───────┴──────┬───────┴────────┬────────┘
        │               │              │                │
        ▼               ▼              ▼                ▼
┌───────────────────────────────────────────────────────────────┐
│                     API Routes (Next.js)                       │
├────────────────┬────────────────┬────────────────────────────┤
│  Auth Handlers │  Deepgram STT  │  Deepgram TTS  │  Gemini   │
└───────┬────────┴───────┬────────┴───────┬────────┴─────┬─────┘
        │                │                │              │
        ▼                ▼                ▼              ▼
┌──────────────┐  ┌────────────┐  ┌────────────┐  ┌───────────┐
│   Supabase   │  │  Deepgram  │  │  Deepgram  │  │   Gemini  │
│   DB + Auth  │  │    STT     │  │    TTS     │  │    LLM    │
└──────────────┘  └────────────┘  └────────────┘  └───────────┘
```

### Voice Conversation Flow

```
User speaks → Microphone capture → Deepgram STT → Gemini LLM → Deepgram TTS → Audio playback
```

## 📁 Project Structure

```
voice-ai-platform/
├── app/
│   ├── (auth)/              # Auth pages (login, signup)
│   ├── (dashboard)/         # Protected dashboard pages
│   │   ├── dashboard/       # Main dashboard
│   │   ├── bots/            # Bot management (list, create, edit)
│   │   └── conversations/   # Conversation history
│   ├── api/                 # API routes
│   │   ├── deepgram/        # STT & TTS endpoints
│   │   └── gemini/          # LLM endpoint
│   └── auth/callback/       # OAuth callback
├── components/
│   ├── ui/                  # shadcn/ui components
│   ├── voice/               # Voice conversation components
│   └── ...
├── lib/
│   └── supabase/            # Supabase client setup
├── types/                   # TypeScript types
└── supabase/
    └── schema.sql           # Database schema
```

## 🚀 Setup Instructions

### Prerequisites

- Node.js 18+
- Supabase account (free tier works)
- Deepgram account (free tier: $200 credit)
- Google AI Studio account (free tier available)

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd voice-ai-platform
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the contents of `supabase/schema.sql`
3. Go to **Settings > API** and copy your URL and anon key

### 3. Get API Keys

- **Deepgram**: Sign up at [deepgram.com](https://deepgram.com) → Dashboard → API Keys
- **Gemini**: Go to [aistudio.google.com](https://aistudio.google.com) → Get API Key

### 4. Configure Environment

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
DEEPGRAM_API_KEY=your_deepgram_api_key
GEMINI_API_KEY=your_gemini_api_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🤖 AI Tools Used

- **GitHub Copilot** - Code completion and suggestions
- **Cursor AI** - Code generation and refactoring
- **Claude** - Architecture design and code review
- **ChatGPT** - Documentation and problem-solving

## ⚠️ Known Limitations

1. **Batch Processing** - Audio is processed after recording stops (not real-time streaming)
2. **Browser Only** - No phone/telephony integration in MVP
3. **English Only** - Single language support
4. **No SSO** - Email/password and magic link auth only
5. **Basic Rate Limiting** - No advanced API protection

## 🔮 Scaling to Production (Retell-like Platform)

If building this as a production voice AI platform, I would implement:

### Architecture Changes

1. **WebSocket Streaming** - Replace batch audio processing with real-time WebSocket connections for <500ms latency
2. **Media Server** - Deploy dedicated media servers (e.g., Janus, Mediasoup) for handling concurrent audio streams
3. **Telephony Integration** - Add Twilio/Vonage for phone call support with SIP trunking
4. **Multi-region Deployment** - Deploy API servers globally to minimize latency

### Technical Improvements

1. **Model Abstraction Layer** - Support multiple LLMs (OpenAI, Anthropic, Claude) with unified interface
2. **Voice Cloning** - Integrate ElevenLabs or custom voice training
3. **Intent Recognition** - Add NLU layer for structured data extraction
4. **Caching** - Redis for session management and response caching
5. **Queue System** - Bull/BullMQ for async processing

### Platform Features

1. **Analytics Dashboard** - Conversation insights, sentiment analysis, success metrics
2. **A/B Testing** - Test different prompts and voices
3. **Webhook Integration** - CRM/Calendar integration for appointment booking
4. **Team Management** - Multi-user organizations with RBAC
5. **API for Developers** - REST/GraphQL APIs for programmatic access

### Infrastructure

1. **Kubernetes** - Container orchestration for scaling
2. **CloudFlare** - CDN and DDoS protection
3. **Arcjet** - API rate limiting and bot protection
4. **Monitoring** - DataDog/New Relic for observability

## 📄 License

This project was built for the DareXAI Full-Stack Intern Assignment.

---

Built with ❤️ using Next.js, Supabase, Deepgram, and Gemini AI
