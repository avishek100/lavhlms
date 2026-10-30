# Render backend and Vercel frontend

The backend runs on Render at `https://lavhlms.onrender.com`. The frontend is a
Vite single-page app configured for Vercel in `vercel.json`; its production API
URL is `https://lavhlms.onrender.com` from `.env.production`.

## Deploy the frontend to Vercel

Import this GitHub repository into Vercel and set:

- Root Directory: `frontend`
- Framework Preset: Vite
- Build Command: `npm run build`
- Output Directory: `dist`
- Environment Variable: `VITE_API_URL=https://lavhlms.onrender.com`

The rewrite in `vercel.json` sends client-side routes back to `index.html`.
The production Vercel origin `https://lavhlms.vercel.app` is already allowed
by the backend CORS configuration. If you connect a custom domain or another
production origin, add it to the Render backend's `CLIENT_URL` environment
variable.

## Connect backend CORS

For a custom domain or additional production origins, set `CLIENT_URL` in the
Render backend service's environment settings to a comma-separated list of
origins with no paths, for example:
`https://www.example.com,https://another-production-origin.vercel.app`.
Save the environment variable and redeploy the backend. Preview deployment
origins are not allowed unless explicitly added.

Do not change backend secrets or database settings when updating `CLIENT_URL`.
