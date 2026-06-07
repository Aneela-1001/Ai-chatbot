# Full-Stack AI Chatbot

A complete Gemini style web application with React, Vite, Tailwind CSS, TypeScript, Express, MongoDB, JWT authentication, and OpenAI streaming responses.

## Project Folder Structure

```text
ai-chatbot/
  backend/
    src/
      config/
      controllers/
      middleware/
      models/
      routes/
      services/
      types/
      utils/
      app.ts
      server.ts
    .env.example
    package.json
    tsconfig.json
  frontend/
    src/
      components/
      hooks/
      lib/
      store/
      styles/
      App.tsx
      main.tsx
      types.ts
    .env.example
    index.html
    package.json
    tailwind.config.js
    tsconfig.json
    vite.config.ts
  docs/
    API.md
    DEPLOYMENT.md
  package.json
  README.md
```

## Features

- Register, login, password hashing, and JWT protected routes
- Conversation create, rename, delete, and history persistence
- OpenAI streaming responses through server-sent events
- System prompt and temperature controls per conversation
- Conversation memory with basic token limit trimming
- Markdown rendering, GitHub-flavored markdown, syntax highlighting, and copy code buttons
- Responsive dark UI with sidebar, chat bubbles, loading states, and mobile menu
- Rate limiting, CORS, Helmet, environment variables, and input validation

## Requirements

- Node.js 20 or newer
- MongoDB Atlas or local MongoDB
- Gemini API key from Google AI Studio, or an OpenAI API key

## Environment Setup

Create backend environment file:

```bash
cp backend/.env.example backend/.env
```

Update `backend/.env`:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ai-chatbot
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
AI_PROVIDER=gemini
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-2.5-flash-lite
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=120
```

Create frontend environment file:

```bash
cp frontend/.env.example frontend/.env
```

Update `frontend/.env` if needed:

```env
VITE_API_URL=http://localhost:5000/api
```

## Installation

Install all dependencies from the project root:

```bash
npm run install:all
```

Or install each app separately:

```bash
cd backend
npm install

cd ../frontend
npm install
```

## Run Locally

Start the backend:

```bash
npm run dev:backend
```

Start the frontend in another terminal:

```bash
npm run dev:frontend
```

Open:

```text
http://localhost:5173
```

## Build

```bash
npm run build
```

## API Documentation

See [docs/API.md](docs/API.md).

## Deployment

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for Vercel, Render, Railway, and MongoDB Atlas instructions.

## Important Notes

- The backend owns all AI API calls so keys are never exposed to the browser.
- Streaming uses `text/event-stream`.
- The frontend stores the JWT in local storage through Zustand persistence.
- For higher-security deployments, consider rotating refresh tokens with httpOnly cookies.
- The current token limiter uses a safe approximation. For advanced production workloads, add a tokenizer such as `tiktoken`.
