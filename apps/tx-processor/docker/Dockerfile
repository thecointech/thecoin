FROM node:22-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    ca-certificates \
    fonts-freefont-ttf \
    libusb-1.0-0-dev \
    pkg-config \
    libudev-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /apps/tx-processor

# Setup Yarn 4.x
RUN corepack enable

# Set default environment & disable typescript processing
ENV CONFIG_NAME=prod \
    NODE_ENV=production \
    TS_NODE_PROJECT=none

# Copy workspace files
COPY temp/package.json ./
COPY temp/.yarnrc.yml ./
COPY temp/yarn.lock ./

# Install dependencies and cleanup sensitive files
RUN YARN_ENABLE_GLOBAL_CACHE=false yarn workspaces focus --production && \
    rm -f .yarnrc.yml

# Copy source code
COPY build ./build

# Create environment config directory
RUN mkdir -p /environments
COPY temp/environments/*.env /environments/

# Add entrypoint script
COPY docker/docker-entrypoint.sh /
RUN chmod +x /docker-entrypoint.sh

# Hard-code the path to run-env to avoid issues with
# Yarn not thinking it's been installed
CMD ["node", "node_modules/@thecointech/setenv/bin/run-env.mjs", "build/main.js"]
