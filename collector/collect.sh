#!/usr/bin/env bash
set -euo pipefail

# Collect PHPStan error messages from test suite using uopz.
#
# Usage:
#   ./collect.sh [branch]
#
# Arguments:
#   branch  - phpstan-src branch to collect from (default: 2.2.x)
#
# Output:
#   ../test/fixtures/phpstan-errors-{branch}.txt

BRANCH="${1:-2.2.x}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
WORKDIR="/app"
PHPSTAN_DIR="${WORKDIR}/phpstan-src"
OUTPUT_FILE="/tmp/phpstan-error-messages.txt"
SANITIZED_BRANCH="${BRANCH//\//-}"

echo "==> Collecting error messages from phpstan-src branch: ${BRANCH}"

# Clone or update phpstan-src
if [ -d "${PHPSTAN_DIR}" ]; then
    echo "==> Updating phpstan-src..."
    cd "${PHPSTAN_DIR}"
    git fetch origin "${BRANCH}"
    git checkout "${BRANCH}"
    git reset --hard "origin/${BRANCH}"
else
    echo "==> Cloning phpstan-src..."
    git clone --depth 1 --branch "${BRANCH}" \
        --filter=blob:none \
        https://github.com/phpstan/phpstan-src.git "${PHPSTAN_DIR}"
fi

cd "${PHPSTAN_DIR}"

echo "==> Installing dependencies..."
composer install --no-interaction --quiet

echo "==> Collecting error messages..."
vendor/bin/phpunit \
    --bootstrap "${WORKDIR}/collector/bootstrap.php" \
    --no-coverage \
    --dont-report-useless-tests \
    tests/PHPStan/Rules/ \
    2>/dev/null || true

# Sort and deduplicate
if [ -f "${OUTPUT_FILE}" ]; then
    TOTAL=$(wc -l < "${OUTPUT_FILE}")
    sort -u "${OUTPUT_FILE}" -o "${OUTPUT_FILE}"
    UNIQUE=$(wc -l < "${OUTPUT_FILE}")
    echo "==> Collected ${TOTAL} messages (${UNIQUE} unique)"

    DEST="${WORKDIR}/test/fixtures/phpstan-errors-${SANITIZED_BRANCH}.txt"
    mkdir -p "$(dirname "${DEST}")"
    cp "${OUTPUT_FILE}" "${DEST}"
    echo "==> Output: ${DEST}"
else
    echo "==> ERROR: No error messages collected"
    exit 1
fi
