#!/usr/bin/env bash
set -euo pipefail

# Run the error message collector in Docker.
#
# Usage:
#   ./run.sh [branch...]
#
# Examples:
#   ./run.sh                  # Collect from 2.2.x (default)
#   ./run.sh 2.1.x 2.2.x     # Collect from multiple branches

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "${SCRIPT_DIR}")"

BRANCHES=("${@:-2.2.x}")

echo "==> Building Docker image..."
docker build -t phpstan-error-collector "${SCRIPT_DIR}"

for BRANCH in "${BRANCHES[@]}"; do
    echo ""
    echo "=========================================="
    echo "  Collecting from branch: ${BRANCH}"
    echo "=========================================="

    docker run --rm \
        -v "${PROJECT_DIR}:/app" \
        phpstan-error-collector \
        bash /app/collector/collect.sh "${BRANCH}"
done

echo ""
echo "==> Done. Collected error messages:"
ls -la "${PROJECT_DIR}/test/fixtures/phpstan-errors-"*.txt 2>/dev/null || echo "No files found"
