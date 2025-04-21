sudo docker run -d \
    --ipc=host \
    --shm-size 16G \
    --device=/dev/dxg \
    -e CONFIG_NAME=vqa \
    -p 7004:7004 \
    -v $(pwd)/secrets:/secrets:ro \
    -v /usr/lib/wsl/lib/libdxcore.so:/usr/lib/libdxcore.so \
    -v /opt/rocm/lib/libhsa-runtime64.so.1:/opt/rocm/lib/libhsa-runtime64.so.1 \
    -v $(pwd)/.model_cache:/app/.model_cache \
    -v $(pwd)/logs:/app/logs \
    vqa-service:latest