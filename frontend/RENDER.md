# Render deployment

Create a **Static Site** from this repository and configure:

- Root Directory: `frontend`
- Build Command: `npm ci && npm run build`
- Publish Directory: `dist`
- Environment Variable: `VITE_API_URL=https://lavhlms.onrender.com`
- Rewrite Rule: source `/*`, destination `/index.html`, action **Rewrite**

The production build reads `VITE_API_URL` from `.env.production` and sends API
requests to the existing backend at `https://lavhlms.onrender.com`. You can
also set the same value in the Render dashboard under the Static Site's
environment settings.

After creating the Static Site:

1. Copy its `https://...onrender.com` URL.
2. Set `CLIENT_URL` in the backend Render service to that exact URL.
3. Save and redeploy the backend so its CORS configuration allows the frontend.
