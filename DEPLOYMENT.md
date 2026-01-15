# Deployment Guide: Google Compute Engine (GCE)

The easiest way to host this application is on **Google Compute Engine**.
Why? The application uses local filesystem storage (`./data` and `./storage`) for the vector database. GCE provides persistent disks out-of-the-box, making it a drop-in match for your local Docker setup.

## Prerequisites
- Google Cloud Project
- `gcloud` CLI installed (or use Cloud Console)

## Step 1: Create a VM Instance
Run this command to create a VM with Docker pre-installed (using Container-Optimized OS is possible, but Ubuntu is easier for docker-compose flexibility):

```bash
gcloud compute instances create rag-chatbot-vm \
    --project=YOUR_PROJECT_ID \
    --zone=us-central1-a \
    --machine-type=e2-medium \
    --image-family=ubuntu-2204-lts \
    --image-project=ubuntu-os-cloud \
    --tags=http-server,https-server
```

**Firewall Rules**:
Allow traffic on port 80 (Frontend) and 8000 (Backend).
```bash
gcloud compute firewall-rules create allow-rag-app \
    --allow tcp:3000,tcp:8000 \
    --target-tags=http-server
```

## Step 2: Deploy Code
1. **SSH into the VM**:
   ```bash
   gcloud compute ssh rag-chatbot-vm --zone=us-central1-a
   ```

2. **Install Docker & Docker Compose** (inside VM):
   ```bash
   # Add Docker's official GPG key:
   sudo apt-get update
   sudo apt-get install ca-certificates curl
   sudo install -m 0755 -d /etc/apt/keyrings
   sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
   sudo chmod a+r /etc/apt/keyrings/docker.asc

   # Add the repository to Apt sources:
   echo \
     "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
     $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
     sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
   
   sudo apt-get update
   sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
   ```

3. **Copy Project Files**:
   You can use `gcloud compute scp` or `git clone` if your repo is public/accessible.
   
   **Using SCP (run from your local machine):**
   ```bash
   # Zip your project first to make it faster
   zip -r rag-project.zip . -x ".git/*" ".venv/*" "node_modules/*"
   
   gcloud compute scp rag-project.zip rag-chatbot-vm:~ --zone=us-central1-a
   ```
   
   **Back in VM:**
   ```bash
   unzip rag-project.zip -d rag-app
   cd rag-app
   ```

## Step 3: Start the Application
1. **Set your API Key**:
   ```bash
   export GOOGLE_API_KEY="your-actual-api-key"
   ```

2. **Run Docker Compose**:
   ```bash
   sudo -E docker compose up -d --build
   ```
   *(The `-E` flag passes your environment variables like the API key to sudo)*

3. **Access**:
   Find your VM's External IP:
   ```bash
   curl ifconfig.me
   ```
   - **Frontend**: `http://<EXTERNAL_IP>:3000`
   - **Backend**: `http://<EXTERNAL_IP>:8000`
