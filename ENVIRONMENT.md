# ENVIRONMENT.md - DevForge AI Environment Configuration Guide

This document details all required and optional environment variables, their source locations, exact usage, and client/server visibility scopes.

> [!CAUTION]
> Never commit actual secrets or your `.env` file to source control. Add `.env` to `.gitignore`.

---

## Environment Variables Matrix

| Variable Name | Purpose / Description | Required / Optional | Scope | Where to Get Credentials |
|---|---|---|---|---|
| `PORT` | Express Server HTTP Port | Required (Default `5000`) | Server-Side | Configured in server environment |
| `NODE_ENV` | Application environment mode (`development` or `production`) | Required | Server & Client | Configured in server environment |
| `FRONTEND_URL` | Frontend Web App Origin URL for CORS configuration | Required (Default `http://localhost:3000`) | Server-Side | Your deployed Vercel domain or localhost |
| `BACKEND_URL` | Express REST API Base URL | Required (Default `http://localhost:5000`) | Server-Side | Your deployed Render API domain or localhost |
| `NEXT_PUBLIC_BACKEND_URL` | Public API URL accessible from browser | Required | Client-Side (`NEXT_PUBLIC_`) | Public endpoint for backend REST API |
| `MONGODB_URI` | MongoDB Atlas Database connection string | Required for persistence | Server-Side Only | [MongoDB Atlas Portal](https://mongodb.com/atlas) |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk Auth Publishable Key for client SDK | Required for Authentication | Client-Side (`NEXT_PUBLIC_`) | [Clerk Dashboard](https://dashboard.clerk.com) |
| `CLERK_SECRET_KEY` | Clerk Auth Secret Key for backend token verification | Required for API Authorization | Server-Side Only | [Clerk Dashboard](https://dashboard.clerk.com) |
| `GEMINI_API_KEY` | Google Gemini AI Key for Career Coach, Project ideas & Interview evaluation | Required for AI Features | Server-Side Only | [Google AI Studio](https://aistudio.google.com) |
| `GITHUB_CLIENT_ID` | GitHub OAuth App Client ID | Optional (Authorized OAuth) | Server-Side Only | [GitHub Developer Settings](https://github.com/settings/developers) |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth App Client Secret | Optional (Authorized OAuth) | Server-Side Only | [GitHub Developer Settings](https://github.com/settings/developers) |
| `GITHUB_TOKEN` | GitHub Personal Access Token for API rate limits | Optional | Server-Side Only | [GitHub Personal Access Tokens](https://github.com/settings/tokens) |

---

## Environment Setup Instructions

1. **Copy Configuration Template**:
   ```bash
   cp .env.example .env
   ```

2. **Populate Database Credentials**:
   - Create a free cluster on MongoDB Atlas.
   - Set `MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/devforge-ai`.

3. **Populate Clerk Credentials**:
   - Create an application on Clerk.com.
   - Copy `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` into `.env`.

4. **Populate Gemini AI Key**:
   - Generate a free API key at Google AI Studio.
   - Set `GEMINI_API_KEY=AIzaSy...`.
