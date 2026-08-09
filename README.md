# DevForge AI 🚀
> **"Your AI-Powered Developer Career & Project Command Center."**

DevForge AI is an all-in-one AI-powered career operating system for CSE students, software developers, fresh graduates, internship seekers, and entry-level engineers.

It unifies profile intelligence, skill gap analysis, personalized learning roadmaps, AI ATS resume parsing, GitHub repository audits, technical interview preparation, project tracking, job application Kanban boards, and career readiness analytics into a single cohesive platform.

---

## 🌟 Key Features

1. **DevForge Career Readiness Score Engine**
   - 5-pillar composite scoring algorithm (Skills Coverage, Resume ATS, GitHub Profile, Portfolio Projects, Interview Prep).

2. **Skill Gap Analysis Engine**
   - Automatically compares current skills against live target role benchmarks (Frontend, Backend, Full Stack, AI/ML, DevOps).

3. **Phased Career Roadmap**
   - Tailored 4-phase learning path with task checkboxes, estimated effort hours, and AI roadmap regeneration.

4. **Context-Aware AI Career Coach**
   - Powered by Google Gemini (`@google/generative-ai`) for personalized career strategy sessions, project ideas, and interview advice.

5. **Resume ATS Analyzer**
   - Upload PDF resumes or paste text to extract ATS keywords, structural scores, missing keywords, and improvement tips.

6. **GitHub Profile Analyzer**
   - Fetches authorized public data via GitHub REST API to audit repo activity, top language distributions, README presence, and quality scores.

7. **Portfolio Project Engine**
   - Track portfolio projects with live demo & GitHub links + get AI-generated high-impact project blueprints.

8. **Technical Interview Simulator**
   - Practice questions across DSA, React, Backend, Database, and System Design with AI evaluation feedback and scoring.

9. **Job Search Kanban Board**
   - Drag & track job applications across Saved, Applied, Assessment, Interview, Offer, and Rejected stages.

10. **Recharts Analytics Hub**
    - Interactive visual charts for career readiness trends, technical competency radar, and application conversion funnels.

---

## 🛠️ Technology Stack

- **Frontend**: Next.js (App Router), React, TypeScript, Tailwind CSS, Framer Motion, Lucide React, Recharts.
- **Backend**: Node.js, Express.js, TypeScript, REST API Architecture.
- **Database**: MongoDB Atlas with Mongoose ORM models.
- **Authentication**: Clerk Auth + fallback authentication system.
- **AI Integration**: Google Gemini API (`@google/generative-ai`).
- **External Integrations**: GitHub REST API & `pdf-parse` for Resume parsing.

---

## 🚀 Quick Start

1. **Install Dependencies**:
   ```bash
   npm run dev
   ```
2. **Environment Configuration**:
   Copy `.env.example` to `.env` and populate API keys if available.

3. **Access Local Server**:
   - Frontend UI: `http://localhost:3000`
   - Express Backend API: `http://localhost:5000/api/health`

---

## 📚 Complete Documentation

- [SETUP.md](./SETUP.md) - Complete Setup & Environment Guide
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System Design & Monorepo Architecture
- [DATABASE.md](./DATABASE.md) - Mongoose Schemas & Data Models
- [API.md](./API.md) - REST API Endpoint Documentation
- [FEATURES.md](./FEATURES.md) - Product Vision & Functional Features
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Production Deployment to Vercel & Render
- [SECURITY.md](./SECURITY.md) - Security Standards & Input Sanitation
- [TESTING.md](./TESTING.md) - Verification & Type Checking Guide
- [ENVIRONMENT.md](./ENVIRONMENT.md) - Environment Variables Specification
