
# TODO: We need a way to update the transforms module when updating the model
cp -r .model_cache/models--allenai--Molmo-7B-D-0924/snapshots/1721478b71306fb7dc671176d5c204dc7a4d27d7/*.py src/transformers_modules/

sudo docker run -d \
    --ipc=host \
    --shm-size 16G \
    --device=/dev/dxg \
    -p 7004:7004 \
    -v /usr/lib/wsl/lib/libdxcore.so:/usr/lib/libdxcore.so \
    -v /opt/rocm/lib/libhsa-runtime64.so.1:/opt/rocm/lib/libhsa-runtime64.so.1 \
    -v $(pwd)/.model_cache:/app/.model_cache \
    -v $(pwd)/logs:/app/logs \
    -e MODEL_CACHE_DIR=/app/.model_cache \
    -e MODEL_URL="" \
    vqa-service:latest