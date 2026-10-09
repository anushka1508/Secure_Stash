# SecureStash

SecureStash is a file storage and sharing application. The frontend is built with React and Vite; the backend is an Express API that stores file metadata in MongoDB and uploaded file contents on disk.

## Requirements

- Node.js and npm
- MongoDB running locally or a MongoDB Atlas connection

## Setup

### 1. Configure the backend

In PowerShell, open the backend directory and install its dependencies:

```powershell
cd backend
npm install
```

Create `backend/.env` with your MongoDB connection string and a private JWT signing secret:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/securestash
JWT_SECRET=replace-with-a-long-random-secret
```

For MongoDB Atlas, replace the `MONGO_URI` value with the connection string from your Atlas cluster. Ensure your current IP is allowed in Atlas Network Access. URL-encode special characters in the database password.

### 2. Configure the frontend

Open a second PowerShell terminal at the project root and install the frontend dependencies:

```powershell
cd frontend
npm install
```

The frontend uses `http://localhost:5000` by default. To override it locally, create `frontend/.env.local` with:

```env
VITE_API_URL=http://localhost:5000
```

## Run locally

Start the backend in one terminal:

```powershell
cd backend
npm run dev
```

Start the frontend in a second terminal:

```powershell
cd frontend
npm run dev
```

Open the Vite URL printed in the frontend terminal, normally <http://localhost:5173/>. Keep both servers and MongoDB running while using the app. The backend listens on port `5000` by default, or the port configured by `PORT`.

To create a production frontend bundle, run `npm run build` from `frontend`. The output is written to `frontend/dist`.

## Deploy to Render

Deploy the frontend and backend as separate Render services.

### Backend Web Service

- **Root Directory:** `backend`
- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Environment variables:**
  - `MONGO_URI`: MongoDB Atlas connection string. Allow Render to connect in your Atlas network access settings.
  - `JWT_SECRET`: a newly generated, long random secret.
  - Do not set `PORT`; Render supplies it.

### Frontend Static Site

- **Root Directory:** `frontend`
- **Build Command:** `npm install && npm run build`
- **Publish Directory:** `dist`
- **Environment variable:**
  - `VITE_API_URL`: the deployed backend URL, for example `https://your-backend.onrender.com`, with no trailing slash.

Set `VITE_API_URL` before building/redeploying the Static Site; Vite embeds it in the frontend bundle at build time.

Render's local filesystem is ephemeral by default. Uploaded files can be lost when the backend restarts or deploys. Configure persistent storage for `backend/uploads` or use external file storage before relying on uploads in production. Uploaded files are currently served from a public `/uploads` URL.

Before deploying, make sure `backend/.env` is not committed and rotate any credentials or secrets that were previously committed, because removing a file from the current version does not erase it from Git history.

## Features

- Register and sign in with an email and password
- Upload and list files
- Share an owned file with another registered account by email
- View files shared with the signed-in account
- Download and delete owned files

Uploaded file contents are stored in `backend/uploads`; file metadata and sharing information are stored in MongoDB. Keep environment files and uploaded content out of Git.

## API

All file endpoints require an `Authorization: Bearer <token>` header. Authentication endpoints return the token after successful registration or login.

| Method | Endpoint | Description | Access |
| --- | --- | --- | --- |
| `POST` | `/api/auth/register` | Create an account | Public |
| `POST` | `/api/auth/login` | Sign in | Public |
| `GET` | `/api/files` | List files owned by or shared with the current user | Authenticated |
| `POST` | `/api/files/upload` | Upload a file using multipart field `file` | Authenticated |
| `POST` | `/api/files/:id/share` | Share an owned file with the email in the JSON body | Owner only |
| `DELETE` | `/api/files/:id` | Delete an owned file | Owner only |

Example share request body:

```json
{
  "email": "recipient@example.com"
}
```

Uploaded files are served from `/uploads`. In this version, the Express server exposes that directory as a static path; add access controls before using it for private production files.

## Project layout

```text
backend/
  config/        MongoDB connection
  controllers/   Authentication and file operations
  middleawre/   JWT authentication middleware (folder name in this repository)
  models/        Mongoose User and File models
  routes/        API route definitions
  uploads/       Uploaded file contents (created as needed)
  server.js      Express server entry point
frontend/
  src/           React app, authentication, and dashboard
  index.html     Vite page entry
  package.json   Frontend scripts and dependencies
```

## Notes

- Keep `backend/.env` private and do not commit real credentials or secrets.
- The default local MongoDB URI uses port `27017`; update `MONGO_URI` when using a different local port or Atlas.
- If port `5000` is already occupied locally, set `PORT` to another available port and update `VITE_API_URL` in `frontend/.env.local` to match.
