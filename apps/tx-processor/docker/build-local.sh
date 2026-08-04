#!/usr/bin/env bash

# Resolve repo root without changing the caller's working directory.
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(dirname $(dirname "$(dirname "$SCRIPT_DIR")"))"
DOCKERFILE="$SCRIPT_DIR/Dockerfile"

echo "Building Docker image from: $ROOT_DIR"
docker build \
  -t tx-processor \
  -f "$DOCKERFILE" \
  --rm=false \
  "$ROOT_DIR"
