# Midnight Cravings — Frontend

This is a minimal React frontend scaffold for the `backend/` in this workspace.

Prereqs
- Node.js (16+ recommended)
- npm

Setup (Windows PowerShell)

1. Install dependencies

   npm install

2. Build Tailwind CSS (required once, or whenever you change `src/index.css`):

   npm run build:css

   This will generate `src/tailwind.generated.css` from `src/index.css` (the file with `@tailwind base; @tailwind components; @tailwind utilities`).

3. Start dev server

   npm run dev

Or run both build and dev in one step:

   npm run start:local

Notes
- API base URL is read from environment variable `VITE_API_URL`. By default it uses `http://localhost:5000`.
- The `Products` page requests `GET /api/products` — make sure your backend server is running.
- The project includes a small fallback stylesheet `src/fallback.css` so the app is usable even if Tailwind build isn't available in the environment.

Next steps
- Implement login/register forms and auth flow.
- Add Cart page and product detail pages.
