# SECURITY.md - Security Architecture & Standards

DevForge AI incorporates enterprise-grade security practices.

## Core Security Controls

1. **Server-Side AI API Protection**:
   - Google Gemini API keys are strictly kept on the Express backend (`server/src/services/geminiService.ts`). Keys are never exposed to browser client bundles.

2. **HTTP Security Headers**:
   - Express server implements `helmet` middleware for HTTP security headers (XSS Protection, Content Security Policy, Frameguard).

3. **CORS Policy Restrictions**:
   - Backend restricts origins to specified `FRONTEND_URL` and trusted localhost origins.

4. **Multi-User Data Isolation**:
   - All Mongoose database queries enforce `userId` filter scoping derived from authenticated tokens.

5. **File Upload Security**:
   - Resume parser limits uploads to 10MB PDF/text files in memory using `multer`.
