#!/bin/bash

script_folder=$(dirname "$0")
base_folder="$script_folder/../.."
echo $base_folder
changed_files=$(git diff --name-only | grep package.json | grep -E "(lib|api)")

for file in $changed_files; do
    dir=$(dirname $file)
    echo "Publishing $dir"
    (cd "$base_folder/$dir" && npm publish)
done