# Nexallure

Nexallure is a React application built with Vite, Framer Motion, and Tailwind CSS. It uses Vercel Serverless Functions for its backend API.

## Local Development

To run the project locally, you need to use `vercel dev` to ensure that both the Vite frontend and the Vercel serverless functions in the `api/` directory are served correctly.

### Prerequisites

- Node.js and npm
- Vercel CLI (optional, can be run via `npx`)

### Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables. You will need to set up Supabase and Groq API keys in your environment or a `.env` file.
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `GROQ_API_KEY`

### Running the Project

Run the development server:
```bash
npm run dev
```

This command runs `npx vercel dev`, which starts a local development server that supports both the frontend and the backend routes.

## Testing

Run the tests using:
```bash
npm test
```

## Building for Production

Build the project for production:
```bash
npm run build
```
