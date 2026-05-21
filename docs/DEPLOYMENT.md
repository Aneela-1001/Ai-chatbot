# Deployment Guide

## MongoDB Atlas

1. Create a MongoDB Atlas account.
2. Create a new cluster.
3. Add a database user with a strong password.
4. Add your deployment provider IP addresses to Network Access, or use `0.0.0.0/0` for quick testing.
5. Copy the connection string and use it as `MONGODB_URI`.

## Backend On Render

1. Create a new Web Service from your repository.
2. Set the root directory to `backend`.
3. Build command: `npm install && npm run build`
4. Start command: `npm start`
5. Add environment variables:

```env
NODE_ENV=production
PORT=10000
MONGODB_URI=<your-atlas-uri>
JWT_SECRET=<long-random-secret>
JWT_EXPIRES_IN=7d
CLIENT_URL=https://your-vercel-app.vercel.app
AI_PROVIDER=gemini
GEMINI_API_KEY=<your-gemini-key>
GEMINI_MODEL=gemini-2.5-flash-lite
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=120
```

Render provides the public backend URL after deployment. Use that URL for the frontend `VITE_API_URL`, including `/api`.

## Backend On Railway

1. Create a new Railway project from your repository.
2. Set the service root to `backend`.
3. Add the same backend environment variables listed above.
4. Set the build command to `npm run build`.
5. Set the start command to `npm start`.
6. Generate a public domain and copy it for the frontend.

## Frontend On Vercel

1. Import the repository into Vercel.
2. Set the root directory to `frontend`.
3. Build command: `npm run build`
4. Output directory: `dist`
5. Add environment variable:

```env
VITE_API_URL=https://your-backend-url.com/api
```

6. Redeploy after the environment variable is saved.
7. Update backend `CLIENT_URL` to the final Vercel URL and redeploy the backend.

## Production Checklist

- Use a strong `JWT_SECRET`.
- Keep `.env` files out of git.
- Restrict MongoDB Atlas network access when possible.
- Verify backend CORS `CLIENT_URL` matches the deployed frontend.
- Confirm the OpenAI API key has billing enabled.
- Test login, chat creation, streaming, rename, delete, and logout after deployment.
