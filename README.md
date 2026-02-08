# History Mind AI Frontend

This is the frontend application for History Mind AI, built with React, Vite, and TypeScript.

## Local Development

To run the frontend locally and connect to the local backend (port 8080):

1.  Make sure your backend is running on port 8080.
2.  Create a `.env.local` file in the root directory (this file is gitignored and will override `.env`).
3.  Add the following line to `.env.local`:
    ```env
    VITE_API_URL=
    ```
    (Leave the value empty to use the Vite proxy configuration which forwards `/api` requests to `http://localhost:8080`.)

4.  Install dependencies:
    ```bash
    npm install
    ```

5.  Start the development server:
    ```bash
    npm run dev
    ```
    The app will be available at `http://localhost:3000`.

## Production Deployment

For production deployment (e.g., on Vercel), ensure the environment variable `VITE_API_URL` is set to the production backend URL:
`https://behistorymindai-production.up.railway.app`

## Running Tests

To run the unit tests:
```bash
npm test
```
