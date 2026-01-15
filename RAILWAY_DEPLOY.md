# Deployment Guide: Railway (Simplest Option)

If Google Compute Engine is too complex, **Railway** is the best alternative. It is a Platform-as-a-Service (PaaS) that connects directly to your code and handles the servers for you.

Why Railway?
- No managing VMs or SSH keys.
- **Persistent Storage**: Easy to add a "Volume" so your Vector DB isn't lost on restart.
- **Easy Networking**: Backend and Frontend can talk to each other easily.

## Prerequisites
- A [GitHub](https://github.com/) account.
- A [Railway](https://railway.app/) account (Free tier available).

## Step 1: Push to GitHub
If you haven't already, push your code to a new GitHub repository:
```bash
git init
git add .
git commit -m "Initial commit"
# Create a new repo on GitHub.com and copy the URL
git remote add origin <YOUR_GITHUB_REPO_URL>
git push -u origin main
```

## Step 2: Create Railway Project
1.  Go to [Railway Dashboard](https://railway.app/dashboard).
2.  Click **New Project** > **Deploy from GitHub repo**.
3.  Select your `rag-pdc-project` repository.

## Step 3: Configure Services
Railway will likely try to deploy *everything*. You want to configure two services: `backend` and `frontend`.

### Backend Service
1.  Click the repo card in the canvas.
2.  Go to **Settings** > **General** > **Root Directory**. Set it to `/backend`.
3.  Railway should detect the `Dockerfile` automatically.
4.  **Add Volume (Crucial)**:
    -   Go to **Volumes**.
    -   Click **New Volume**.
    -   Mount Path: `/app/storage` (and `/app/data` if you want to keep uploaded PDFs).
    -   *Note: Without this, your vector index will disappear every time you deploy.*
5.  **Environment Variables**:
    -   Go to **Variables**.
    -   Add `GOOGLE_API_KEY` with your value.
    -   Add `PORT` = `8000`.

### Frontend Service
*(If Railway didn't create a second service automatically, click "New" > "GitHub Repo" > Select the same repo again)*
1.  Go to **Settings** > **General** > **Root Directory**. Set it to `/frontend`.
2.  It should detect the `Dockerfile`.
3.  **Networking**:
    -   Go to **Settings** > **Networking**.
    -   Generate a Domain (e.g., `frontend-production.up.railway.app`).

## Step 4: Connect Frontend to Backend
1.  Get the **Backend's** domain from its Networking tab (e.g., `backend-production.up.railway.app`).
2.  In the **Frontend** service:
    -   You might need to rebuild the frontend with the backend URL if it's hardcoded.
    -   *Ideally*, update your `frontend/src/App.jsx` (or config) to use the backend URL variable, or hardcode the Railway backend URL once generated.

## Step 5: Verify
-   Open your Frontend URL.
-   Upload a document (it will persist thanks to the Volume).
-   Chat!
