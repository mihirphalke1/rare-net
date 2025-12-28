# RareNet Deployment Guide

## 1. Backend Deployment (Render)

Since RareNet uses a custom architecture (FastAPI + CyborgDB + Redis), we recommend **Render** for the backend as it supports `docker-compose` style services (via Blueprints) or individual Docker services.

### Option A: Deploy via `render.yaml` (Blueprint) - Recommended

1.  Push your code to valid Git repository (GitHub/GitLab).
2.  Go to [Render Dashboard](https://dashboard.render.com/).
3.  Click **New +** -> **Blueprint**.
4.  Connect your repository.
5.  Render will detect `render.yaml`.
6.  You will need to provide the following Environment Variables in the Render Dashboard when prompted:
    *   `CYBORGDB_API_KEY`: Your CyborgDB Key
    *   `CYBORGDB_ENCRYPTION_KEY`: Your Encryption Key
7.  Click **Apply**.

### Option B: Deploy Backend as Web Service (Docker)

1.  Go to Render -> New **Web Service**.
2.  Connect Repo.
3.  **Runtime**: Docker.
4.  **Root Directory**: `backend` (Important!).
5.  **Environment Variables**:
    *   `CYBORGDB_API_KEY`: ...
    *   `CYBORGDB_ENCRYPTION_KEY`: ...
    *   `CYBORGDB_URL`: The URL of your CyborgDB/Redis instance (Report back if you need help setting up Redis on Render).

## 2. Frontend Deployment (Vercel)

We have detected Vercel CLI is installed.

### Automated Deployment
Run the following in your terminal:

```bash
cd frontend
vercel deploy --prod
```

### Configuration
1.  When deploying, Vercel will build your React app.
2.  **Critical Step**: You must set the backend URL so the frontend knows where to connect.
    *   Go to Vercel Dashboard -> Your Project -> Settings -> Environment Variables.
    *   Add Key: `VITE_API_URL`
    *   Value: `https://your-backend-service.onrender.com` (The URL you got from Step 1).
3.  **Redeploy** the frontend (Deployment -> Redeploy) for the variable to take effect.

## 3. Verify Deployment

1.  Open your Vercel URL.
2.  Check the Network tab in DevTools.
3.  Ensure requests are going to your Render Backend (not localhost).
4.  Use the "Search" feature to test connectivity.
