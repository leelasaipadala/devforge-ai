# ARCHITECTURE.md - Monorepo System Design

DevForge AI follows a clean monorepo architecture separating client-side Next.js user experience from server-side Node.js/Express API business logic and database models.

```
DEVFORGE AI
├── client/                     # Next.js Frontend Application
│   ├── src/app/                # App Router Pages (/dashboard, /skills, /roadmap, /ai-coach, /resume, /github, /projects, /interview, /jobs, /analytics)
│   ├── src/components/         # Sleek UI Components (Sidebar, Header, CmdKModal, ThemeToggle, Skeletons)
│   └── src/lib/                # API Client Utility
├── server/                     # Express.js TypeScript Backend API
│   ├── src/config/             # Environment & Database Connection
│   ├── src/models/             # Mongoose Schemas (UserProfile, Skill, Roadmap, Resume, GitHub, Project, Interview, Job, Activity)
│   ├── src/services/           # Core Engines (CareerReadinessService, GeminiService, GitHubService, ResumeParserService)
│   ├── src/controllers/        # Express Request Controllers
│   ├── src/routes/             # REST Endpoint Routers
│   └── src/middleware/         # Clerk & Fallback Auth Middleware
└── .env                        # Root Environment Configuration
```

## Security & Privacy Controls
- All AI calls are executed server-side to protect Gemini API keys.
- User data is scoped by `userId` in all database queries and memory stores.
