# NITOGEN

### Gen AI Platform for Automated Content Transformation

NITOGEN is a local AI-powered content transformation platform that converts a single source into multiple communication-ready outputs.

It can transform:

- Text
- URLs / Articles
- PDF
- DOCX
- Images
- Videos

into:

- LinkedIn Post
- Twitter/X Post
- Advisory
- Video Script
- Executive Summary
- Infographic
- Presentation

---

## 🚀 Quick Start

The easiest way to run NITOGEN is using Docker.

### Requirements

Install only:

- Git
- Docker Desktop

You do **not** need to install:

- Node.js
- MongoDB
- Ollama
- Python
- FFmpeg

Everything required by the application runs inside Docker containers.

---

## 1. Clone the repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd NITOGEN
```

---

## 2. Start the application

Run:

```bash
docker compose up --build
```

That's it.

Docker will automatically start:

- MongoDB
- Ollama
- Backend
- Frontend
- Whisper / FFmpeg environment

Ollama will automatically download the required local AI models:

- Gemma 3 4B
- Qwen2.5-VL 7B

### First startup

The first startup can take some time because Docker images and AI models need to be downloaded.

Internet connection is required during the first setup.

---

## 3. Open NITOGEN

After the containers start, open:

### Frontend

http://localhost:3000

### Backend

http://localhost:5000

---

# 🔐 Demo Login

Docker Demo Mode is enabled by default.

Use:

```text
Email:
demo@nitogen.local

Password:
Demo@123456
```

No OTP or email verification is required in Demo Mode.

---

# 🧠 Local AI

NITOGEN uses local AI models through Ollama.

### Text Generation

```text
Gemma 3 4B
```

### Vision / Image Understanding

```text
Qwen2.5-VL 7B
```

The AI models run locally inside the Docker environment.

No external AI API key is required for the Docker demo.

---

# 🗄️ Database

NITOGEN uses MongoDB.

MongoDB is automatically started by Docker.

No manual MongoDB installation or configuration is required.

Database data is stored in a Docker volume.

---

# 📦 Generated Files

Generated files are stored locally using Docker volumes.

Cloudinary is not required for Demo Mode.

This allows the application to work without external file-storage credentials.

---

# 🛠️ Project Structure

```text
NITOGEN/
│
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── Dockerfile
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── app/
│   ├── components/
│   ├── public/
│   ├── Dockerfile
│   └── package.json
│
├── ollama/
│   └── entrypoint.sh
│
├── docker-compose.yml
└── README.md
```

---

# ⚙️ Environment Variables

Environment variable examples are provided for manual/local setup.

### Backend

Copy:

```text
backend/.env.example
```

to:

```text
backend/.env
```

### Frontend

Copy:

```text
frontend/.env.example
```

to:

```text
frontend/.env.local
```

For the Docker setup, environment variables are already configured in `docker-compose.yml`.

---

# 🧩 Supported Inputs

NITOGEN supports:

- Plain text
- Article URL
- PDF
- DOCX
- Image
- Video

For video input, FFmpeg extracts the audio and Whisper generates a transcript.

---

# 📤 Supported Outputs

NITOGEN can generate:

### LinkedIn

Professional publish-ready content.

### Twitter / X

Short-form posts or threads.

### Advisory

Structured advisory content.

### Video

Script, scenes, narration, subtitles and visual recommendations.

### Executive Summary

Short executive-level briefing.

### Infographic

Key information and visual layout recommendations.

### Presentation

Slide content with speaker notes.

---

# 🎛️ Operator Controls

The operator can control:

- Target audience
- Tone
- Language
- Level of detail
- Communication objective
- Content style
- Per-output overrides

This allows the same source to be transformed for different communication requirements.

---

# 🔒 Security

The platform is designed with security and controlled content transformation in mind.

Key areas include:

- JWT authentication
- Password hashing
- Input validation
- File validation
- Prompt injection protection
- Local LLM processing
- Audit logging
- Output integrity / hashing
- Controlled generated-file access

The architecture is designed to support on-premise/local deployment where sensitive content does not need to be sent to an external AI provider.

---

# 🧪 Stopping the Application

Press:

```text
Ctrl + C
```

Or run:

```bash
docker compose down
```

Docker volumes are preserved.

Therefore, MongoDB data and downloaded Ollama models are not removed.

---

# 🔄 Start Again

After the first setup:

```bash
docker compose up
```

You normally do not need to rebuild everything.

---

# 🧹 Complete Reset

If you want to remove containers AND stored data/models:

```bash
docker compose down -v
```

⚠️ This removes Docker volumes, including downloaded Ollama models and MongoDB data.

The next startup will download the models again.

---

# 🐛 Troubleshooting

## Docker is not running

Start Docker Desktop and run:

```bash
docker info
```

Then:

```bash
docker compose up --build
```

---

## Check running containers

```bash
docker compose ps
```

---

## View backend logs

```bash
docker compose logs backend
```

---

## View Ollama logs

```bash
docker compose logs ollama
```

---

## View frontend logs

```bash
docker compose logs frontend
```

---

# 💡 Important

The first Docker startup requires internet access because Docker images and local AI models must be downloaded.

After the models are downloaded, they are stored in a persistent Docker volume.

---

# 🎯 SIH 2026

Problem Statement: **26154**

### Gen AI Platform for Automated Content Transformation

The platform is designed as a local/on-premise content transformation system capable of converting a single source into multiple audience-specific communication outputs.

---

Built for Smart India Hackathon 2026.