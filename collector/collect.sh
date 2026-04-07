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
#   ../test/fixtures/{branch}/{Category}.txt

BRANCH="${1:-2.2.x}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
WORKDIR="/app"
PHPSTAN_DIR="${WORKDIR}/phpstan-src"
OUTPUT_DIR="/tmp/phpstan-errors"
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
COLLECTOR_OUTPUT_DIR="${OUTPUT_DIR}" \
vendor/bin/phpunit \
    --bootstrap "${WORKDIR}/collector/bootstrap.php" \
    --no-coverage \
    --dont-report-useless-tests \
    tests/PHPStan/Rules/ \
    2>/dev/null || true

# Sort and deduplicate each category file
DEST_DIR="${WORKDIR}/test/fixtures/${SANITIZED_BRANCH}"
mkdir -p "${DEST_DIR}"

TOTAL=0
UNIQUE=0
for f in "${OUTPUT_DIR}"/*.txt; do
    [ -f "$f" ] || continue
    CATEGORY=$(basename "$f")
    FILE_TOTAL=$(wc -l < "$f")
    sort -u "$f" -o "$f"
    FILE_UNIQUE=$(wc -l < "$f")
    TOTAL=$((TOTAL + FILE_TOTAL))
    UNIQUE=$((UNIQUE + FILE_UNIQUE))
    cp "$f" "${DEST_DIR}/${CATEGORY}"
    echo "    ${CATEGORY}: ${FILE_TOTAL} messages (${FILE_UNIQUE} unique)"
done

if [ "${TOTAL}" -eq 0 ]; then
    echo "==> ERROR: No error messages collected"
    exit 1
fi

echo "==> Collected ${TOTAL} messages (${UNIQUE} unique) across $(ls "${DEST_DIR}"/*.txt | wc -l) categories"
echo "==> Output: ${DEST_DIR}/"
