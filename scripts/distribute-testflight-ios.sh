#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if [[ "${1:-}" == "" ]]; then
  echo "Usage: scripts/distribute-testflight-ios.sh <build-number> [group[,group...]]" >&2
  exit 1
fi

BUILD_NUMBER="$1"
GROUPS="${2:-External Testing}"

fastlane ios distribute_existing_external build_number:"$BUILD_NUMBER" groups:"$GROUPS"
