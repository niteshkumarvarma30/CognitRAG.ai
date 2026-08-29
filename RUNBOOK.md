# CognitRAG Production Engineering Runbook

This runbook outlines the exact steps required to deploy the CognitRAG architecture to an AWS EC2 instance.

## 1. Provision EC2 Infrastructure
1. Go to AWS EC2 Console.
2. Launch a new instance (Amazon Linux 2023 or Ubuntu 22.04 LTS).
3. Select **t3.medium** or larger (Next.js and FastAPI require at least 2-4GB RAM).
4. Configure Security Group to allow:
   - Port `22` (SSH)
   - Port `80` (HTTP)
   - Port `443` (HTTPS)

## 2. Server Preparation
SSH into your instance:
```bash
ssh -i your-key.pem ec2-user@<your-ec2-ip>
```

Install Docker and Docker Compose:
```bash
sudo dnf update -y
sudo dnf install -y docker
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker ec2-user

# Log out and log back in for docker group to apply
exit
```

Install Git and clone the repository:
```bash
sudo dnf install -y git
git clone https://github.com/your-org/cognitrag.git
cd cognitrag
```

## 3. Environment Variables
Create a `.env` file in the root of the project:
```bash
cp .env.example .env
nano .env
```
Ensure the following keys are set:
- `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` (Database)
- `NEO4J_URI` / `NEO4J_USER` / `NEO4J_PASSWORD` (Knowledge Graph)
- `NVIDIA_API_KEY` (Nemotron Synthesizer)
- `SARVAM_API_KEY` / `OPENROUTER_API_KEY` (Llama 3 Routing)
- `STRIPE_SECRET_KEY` (Billing)
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (Auth)

## 4. Deployment
Run the production docker-compose file in detached mode:
```bash
docker-compose up -d --build
```

Verify services are running:
```bash
docker-compose ps
docker-compose logs -f api
docker-compose logs -f frontend
```

## 5. Reverse Proxy & SSL (Optional but Recommended)
For production, it is highly recommended to run Nginx or Caddy in front of the application to handle SSL termination.

If using Caddy, simply run:
```bash
sudo dnf install -y caddy
sudo caddy reverse-proxy --to localhost:3000
```
This will automatically issue Let's Encrypt certificates for your domain!

## 6. Maintenance & Troubleshooting
- **Restarting API**: `docker-compose restart api`
- **Rebuilding after git pull**: `docker-compose up -d --build`
- **Clearing Docker Cache**: `docker system prune -af`
