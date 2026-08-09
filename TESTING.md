# TESTING.md - Verification & Testing Protocol

DevForge AI contains automated type verification and manual feature testing workflows.

## Type Verification Commands

Run full monorepo type-checks:
```bash
npm run type-check
```

Or individually:
```bash
# Server compilation check
cd server && npm run type-check

# Client compilation check
cd client && npx tsc --noEmit
```

## Production Build Verification

Verify that production bundles compile cleanly without errors:
```bash
npm run build
```

## Manual QA Verification Checklist

- [x] Landing Page renders animations, product preview, FAQ, and CTA buttons.
- [x] Onboarding flow collects target role, skills, weekly hours, and redirects to Dashboard.
- [x] DevForge Career Readiness Score calculates 5 pillar bar gauges.
- [x] Skill Gap Analysis matches acquired skills against target role benchmarks.
- [x] AI Career Coach executes Gemini requests with markdown formatting and chat history.
- [x] Resume ATS Analyzer parses uploaded PDF or raw text and outputs ATS keyword density.
- [x] GitHub Profile Analyzer fetches public user repositories and top language percentages.
- [x] Projects manager supports CRUD and AI project idea blueprints.
- [x] Interview Simulator evaluates technical responses with score and improvement points.
- [x] Job Application Kanban board moves applications across stage columns.
- [x] Career Analytics renders Recharts readiness trends, radar charts, and funnels.
- [x] Dark/Light theme mode toggles seamlessly.
- [x] Command Palette (`Ctrl+K`) navigates across all features.
