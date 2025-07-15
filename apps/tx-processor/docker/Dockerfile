FROM node:22-slim

# copied from puppeteer dockerfile
# https://github.com/puppeteer/puppeteer/blob/main/docker/Dockerfile
ENV \
    # Configure default locale (important for chrome-headless-shell).
    LANG=en_US.UTF-8 \
    # UID of the non-root user 'pptruser'
    PPTRUSER_UID=10042

# Install latest chrome dev package and fonts to support major charsets (Chinese, Japanese, Arabic, Hebrew, Thai and a few others)
# Note: this installs the necessary libs to make the bundled version of Chrome that Puppeteer
# installs, work.
RUN apt-get update \
    && apt-get install -y --no-install-recommends fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-khmeros \
    fonts-kacst fonts-freefont-ttf dbus dbus-x11

# Install extra puppeteer dependencies
# https://pptr.dev/troubleshooting#chrome-doesnt-launch-on-linux
RUN apt-get install -y --no-install-recommends \
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
    xdg-utils

# Install other dependencies (mostly for thecoin/signers)
RUN apt-get install -y --no-install-recommends \
    xz-utils \
    python3 \
    make \
    g++ \
    libusb-1.0-0-dev \
    pkg-config \
    libudev-dev \
    xvfb \
    libgl1-mesa-glx \
    && rm -rf /var/lib/apt/lists/*

# Setup Yarn 4.x
RUN corepack enable

# Setup directory structure
# - /app for the app itself
# - /environments for build-time config
# - /data for runtime persistent data
# - /secrets for sensitive credentials
# NOTE: if the data volume is mounted,
#       the host needs to allow pptruser rw access to it
RUN mkdir -p \
  /home/pptruser/Downloads \
  /app \
  /app/environments \
  /data \
  /secrets

# Add pptruser.
RUN groupadd -r pptruser && useradd -u $PPTRUSER_UID -rm -g pptruser -G audio,video pptruser

RUN chown -R pptruser:pptruser /home/pptruser \
  && chown -R pptruser:pptruser /app \
  && chown -R pptruser:pptruser /data \
  && chown -R pptruser:pptruser /secrets \
  && chmod 700 /secrets

# Run everything after as non-privileged user.
USER pptruser

ENV DBUS_SESSION_BUS_ADDRESS=autolaunch: \
    NODE_ENV=production \
    PUPPETEER_SKIP_DOWNLOAD=true \
    TS_NODE_PROJECT=none \
    THECOIN_CONSOLE_ONLY=true \
    THECOIN_DATA=/data \
    TC_LOG_FOLDER=/data/logs \
    STORAGE_PATH=/data/dbs/ \
    THECOIN_SECRETS=/secrets

WORKDIR /app

# Copy workspace files
COPY temp/package.json ./
COPY temp/.yarnrc.yml ./
COPY temp/yarn.lock ./
COPY temp/environments/*.env /app/environments/

# Install dependencies and cleanup sensitive files
RUN yarn workspaces focus --production && \
    rm -f .yarnrc.yml

# Copy source code
COPY build ./build

# Create volume mount points
VOLUME /data
VOLUME /secrets

# Hard-code the path to run-env to avoid issues with
# Yarn not thinking it's been installed
CMD ["node", "node_modules/@thecointech/setenv/bin/run-env.mjs", "build/main.js"]
