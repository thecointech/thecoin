FROM node:22-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    ca-certificates \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libc6 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libexpat1 \
    libfontconfig1 \
    libgbm1 \
    libgcc1 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libstdc++6 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxss1 \
    libxtst6 \
    lsb-release \
    wget \
    xdg-utils \
    fonts-freefont-ttf \
    libusb-1.0-0-dev \
    pkg-config \
    libudev-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /tx-processor

# Setup Yarn 4.x
RUN corepack enable

# Set default environment & disable typescript processing
ENV NODE_ENV=production \
    TS_NODE_PROJECT=none \
    THECOIN_CONSOLE_ONLY=true \
    THECOIN_DATA=/data \
    THECOIN_SECRETS=/secrets

# Copy workspace files
COPY temp/package.json ./
COPY temp/.yarnrc.yml ./
COPY temp/yarn.lock ./

# Install dependencies and cleanup sensitive files
RUN yarn workspaces focus --production && \
    rm -f .yarnrc.yml

# Copy source code
COPY build ./build

# Setup directory structure
# - /environments for build-time config
# - /data for runtime persistent data
# - /secrets for sensitive credentials
RUN mkdir -p environments && \
    mkdir -p /data/dbs && \
    mkdir -p /data/logs && \
    mkdir -p /secrets && \
    # Ensure secrets directory has restricted permissions
    chmod 700 /secrets

# Copy environment configs
COPY temp/environments/*.env ./environments/

# Create volume mount points
VOLUME /data
VOLUME /secrets

# Hard-code the path to run-env to avoid issues with
# Yarn not thinking it's been installed
CMD ["node", "node_modules/@thecointech/setenv/bin/run-env.mjs", "build/main.js"]
