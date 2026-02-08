# Pickleball Reserve

This is the frontend and backend for a Playwright-based system to reserve pickleball courts.

## Frontend setup

This is a React app bundled with Vite. Install dependencies with `npm i`. Run a development server with `npm run dev`. Set a .env file with `VITE_BACKEND_URL` set as the URL of the backend server (e.g. `http://localhost:3000`).

## Backend setup

This is a Node.js Express server, intended to run in a Docker container for Playwright dependencies. The dev flow could be refined, but it works well enough.

In a .env file, set `AUTH_PASSWORD` to the site entry password, `DATABASE_URL` to the URL of the postgres database, and `AES_KEY` to the base64-encoded 32-byte key for encrypting credentials.

1. Build the image with `docker build -t pickleball .`. This will run `npm i` and `npm run build`, but you can always run these later after updating the code.
2. Enter the container with `docker run -it --rm -p 3000:3000 -v .:/app pickleball /bin/bash`.
3. Run `npm run build` and `npm run start` to start the server. It will be available at `http://localhost:3000`.
