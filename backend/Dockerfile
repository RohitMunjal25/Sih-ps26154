FROM node:20-bookworm

WORKDIR /app

# FFmpeg + Python + build tools
RUN apt-get update && apt-get install -y \
    ffmpeg \
    python3 \
    python3-pip \
    python3-venv \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Whisper
RUN python3 -m venv /opt/whisper

RUN /opt/whisper/bin/pip install --upgrade \
    pip \
    setuptools \
    wheel

RUN /opt/whisper/bin/pip install openai-whisper

ENV PATH="/opt/whisper/bin:${PATH}"

# Node dependencies
COPY package*.json ./

RUN npm ci

# Backend source
COPY . .

# Required folders
RUN mkdir -p /app/generated
RUN mkdir -p /app/uploads
RUN mkdir -p /app/uploads/presentations

ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

CMD ["npm", "start"]