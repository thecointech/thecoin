#!/bin/bash

# TODO: We need a way to update the transforms module when updating the model
# Create the target directory
mkdir -p src/transformers_modules

# remove existing files
rm src/transformers_modules/*.*

# Get the snapshot directory
SNAPSHOT_DIR=".model_cache/models--allenai--Molmo-7B-D-0924/snapshots/1721478b71306fb7dc671176d5c204dc7a4d27d7"

# For each Python file in the snapshot directory
for src in "$SNAPSHOT_DIR"/*.py; do
    # Get the filename
    filename=$(basename "$src")
    # Get the actual file that the symlink points to
    actual_file=$(readlink -f "$src")
    # Copy with the correct name
    cp "$actual_file" "src/transformers_modules/$filename"
done
