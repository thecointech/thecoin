#!/bin/sh

# Load the appropriate environment file based on CONFIG_NAME
if [ -f "/app/config/${CONFIG_NAME}.env" ]; then
    echo "Loading environment for ${CONFIG_NAME}"
    set -a
    . "/app/config/${CONFIG_NAME}.env"
    set +a
else
    echo "Warning: No environment file found for ${CONFIG_NAME}"
fi

# Execute the main command
exec "$@"