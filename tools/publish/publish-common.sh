#!/usr/bin/env bash
# Common helpers shared by the publishing scripts in this directory.

# Validate a release version string against the intended grammar:
# major.minor.patch with optional pre-release/build metadata.
# Exits with an error message on invalid input.
validate_version() {
  local version="$1"
  local version_re='^[0-9]+\.[0-9]+\.[0-9]+(-[0-9A-Za-z.-]+)?(\+[0-9A-Za-z.-]+)?$'
  if [[ ! "$version" =~ $version_re ]]; then
    echo "Invalid version format: $version" >&2
    return 1
  fi
}
