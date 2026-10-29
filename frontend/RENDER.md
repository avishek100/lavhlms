# Render deployment

Create a **Static Site** from this repository and configure:

- Root Directory: `frontend`
- Build Command: `npm ci && npm run build`
- Publish Directory: `dist`

The production build reads `VITE_API_URL` from `.env.production` and sends API
requests to the existing backend at `https://lms-school-colleges.onrender.com`.

After creating the Static Site, set `CLIENT_URL` in the backend Render service
to the Static Site's `https://...onrender.com` URL, then redeploy the backend.
