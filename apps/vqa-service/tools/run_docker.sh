#!/bin/bash

# WSL options
# --device=/dev/dxg \
# -v /usr/lib/wsl/lib/libdxcore.so:/usr/lib/libdxcore.so \
# -v /opt/rocm/lib/libhsa-runtime64.so.1:/opt/rocm/lib/libhsa-runtime64.so.1 \


sudo docker run -it --rm \
    --ipc=host \
    --shm-size 16G \
    -e CONFIG_NAME=prodtest \
    -p 7004:7004 \
    -v ${THECOIN_SECRETS}:/secrets:ro \
    -v $(pwd)/.model_cache:/app/.model_cache \
    -v $(pwd)/logs:/app/logs \
    --device /dev/kfd \
    --device /dev/dri \
    --security-opt seccomp=unconfined \
    vqa-service:latest /bin/bash
