# SETUP.md - DevForge AI Setup Guide

Follow these steps to set up and run DevForge AI on your local environment or server.

## Prerequisites

- **Node.js**: v18.0.0 or higher (v26+ supported)
- **NPM**: v9.0.0 or higher
- **MongoDB**: Local MongoDB server or MongoDB Atlas URI (optional; fallback memory mode enabled)

## Step-by-Step Installation

1. **Clone Repository**:
   ```bash
   git clone https://github.com/developer/devforge-ai.git
   cd devforge-ai
   ```

2. **Configure Environment Variables**:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

3. **Install Client Dependencies**:
   ```bash
   cd client
   npm install
   cd ..
   ```

4. **Install Server Dependencies**:
   ```bash
   cd server
   npm install
   cd ..
   ```

5. **Run Concurrent Development Server**:
   ```bash
   npm run dev
   ```
   This will simultaneously launch:
   - Express REST API on `http://localhost:5000`
   - Next.js Web App on `http://localhost:3000`
