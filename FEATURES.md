# FEATURES.md - DevForge AI Feature Specifications

DevForge AI is built as a production-ready SaaS career operating system.

## Complete Feature Matrix

| Feature Module | Technical Capabilities | Underlying Tech |
|---|---|---|
| **Landing Page** | Hero, Feature showcase, Career Score preview, FAQ, dark mode aesthetics | Next.js, Tailwind CSS, Framer Motion |
| **Authentication & Onboarding** | Clerk Auth integration, fallback auth, multi-step role setup wizard | Clerk React/Express, Local Storage |
| **DevForge Career Readiness Engine** | 5-pillar scoring algorithm (Skills, Resume, GitHub, Projects, Interviews) | Custom TS Service, Mongoose |
| **Skill Gap Analysis** | Compares current skills vs role benchmarks, prioritizes missing skills | REST API, Target Role Dictionary |
| **Phased Career Roadmap** | 4-phase learning roadmap with completion toggles & AI regeneration | Gemini API, Mongoose |
| **Gemini AI Career Coach** | Context-aware chat session reading user profile, skills, and goals | `@google/generative-ai` |
| **Resume ATS Analyzer** | PDF parser, keyword density analysis, structure scoring & recommendations | `pdf-parse`, Express Multer |
| **GitHub Profile Analyzer** | Fetches user repos, top languages, stargazers, README documentation quality | GitHub REST API, Axios |
| **Portfolio Project Engine** | CRUD project manager + AI recommended project blueprints | REST API, Gemini AI |
| **Interview Preparation** | Questions bank across DSA, React, Node, System Design + AI evaluation | Gemini API evaluator |
| **Job Application Kanban** | Kanban board tracking applications across Saved, Applied, Interview, Offer | React State, REST API |
| **Recharts Analytics** | Score trend over time, technical skill radar chart, job application funnel | Recharts, Express Aggregations |
