# API.md - DevForge AI REST API Specification

All API endpoints are prefixed with `/api` and require Authorization headers.

## Endpoints Summary

### Profile & Onboarding
- `GET /api/profile` - Get authenticated user profile & Readiness Score
- `PUT /api/profile` - Update user profile fields
- `POST /api/profile/onboarding` - Complete multi-step onboarding wizard

### Skills & Gap Engine
- `GET /api/skills` - Get user skills inventory
- `POST /api/skills` - Add new skill
- `PUT /api/skills/:id` - Update skill
- `DELETE /api/skills/:id` - Delete skill
- `GET /api/skills/gap-analysis` - Analyze skill gaps vs target role

### Roadmap
- `GET /api/roadmap` - Get current career roadmap
- `POST /api/roadmap/generate` - Generate new AI roadmap
- `POST /api/roadmap/item/toggle` - Toggle roadmap item completion

### AI Career Coach
- `POST /api/ai/chat` - Send query to Gemini AI coach
- `GET /api/ai/history` - Get conversation history
- `DELETE /api/ai/history` - Clear chat history

### Resume ATS Parser
- `POST /api/resume/analyze` - Upload PDF resume or text for ATS analysis
- `GET /api/resume/history` - Get previous resume ATS audits

### GitHub Profile
- `GET /api/github/profile` - Get user GitHub profile audit
- `GET /api/github/analyze?username=...` - Analyze specific username

### Projects
- `GET /api/projects` - Get portfolio projects
- `POST /api/projects` - Create portfolio project
- `DELETE /api/projects/:id` - Delete project
- `GET /api/projects/ai-ideas` - Get AI recommended project blueprints

### Interview Preparation
- `GET /api/interview/questions` - Get practice questions by category
- `POST /api/interview/evaluate` - Evaluate technical answer via Gemini AI

### Job Search Tracker
- `GET /api/jobs` - Get job applications list
- `POST /api/jobs` - Add job application
- `PUT /api/jobs/:id` - Update status stage
- `DELETE /api/jobs/:id` - Delete job application

### Analytics
- `GET /api/analytics` - Get Recharts analytics data
