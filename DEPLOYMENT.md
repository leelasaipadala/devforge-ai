# DEPLOYMENT.md - Production Deployment Guide

DevForge AI is structured for high-performance cloud deployment.

## Frontend Deployment (Vercel)

1. Connect your GitHub repository to [Vercel](https://vercel.com).
2. Set Root Directory to `client`.
3. Set Build Command: `npm run build`
4. Set Environment Variables:
   - `NEXT_PUBLIC_BACKEND_URL`: `https://your-express-backend.onrender.com/api`
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: `pk_live_...`

## Backend Deployment (Render / Railway)

1. Create a Web Service on [Render](https://render.com) or [Railway](https://railway.app).
2. Set Root Directory to `server`.
3. Build Command: `npm run build`
4. Start Command: `npm start`
5. Set Environment Variables:
   - `PORT`: `5000`
   - `MONGODB_URI`: `mongodb+srv://...`
   - `GEMINI_API_KEY`: `AIzaSy...`
   - `CLERK_SECRET_KEY`: `sk_live_...`
   - `FRONTEND_URL`: `https://your-app.vercel.app`
