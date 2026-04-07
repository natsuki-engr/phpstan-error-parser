<?php

/**
 * Bootstrap file for collecting PHPStan error messages via Docker.
 *
 * Uses uopz to hook into RuleTestCase::analyse() and capture the expected
 * error message strings without actually running PHPStan analysis.
 *
 * Output is split by rule category directory (e.g., Methods, Cast, Classes).
 */

declare(strict_types=1);

// Load the original bootstrap first
require_once __DIR__ . '/../phpstan-src/tests/bootstrap.php';

$outputDir = getenv('COLLECTOR_OUTPUT_DIR') ?: '/tmp/phpstan-errors';

// Clear the output directory
if (is_dir($outputDir)) {
    array_map('unlink', glob($outputDir . '/*.txt'));
} else {
    mkdir($outputDir, 0755, true);
}

// Hook into RuleTestCase::analyse() to capture expected error messages
uopz_set_hook(
    \PHPStan\Testing\RuleTestCase::class,
    'analyse',
    function (array $files, array $expectedErrors) use ($outputDir): void {
        $messages = array_map(
            fn(array $error): string => $error[0],
            $expectedErrors,
        );

        if (count($messages) === 0) {
            return;
        }

        // Determine rule category from the calling test file
        $category = 'Other';
        $trace = debug_backtrace(DEBUG_BACKTRACE_IGNORE_ARGS, 3);
        foreach ($trace as $frame) {
            if (isset($frame['file']) && preg_match('#/Rules/([^/]+)/#', $frame['file'], $matches)) {
                $category = $matches[1];
                break;
            }
        }

        $outputFile = $outputDir . '/' . $category . '.txt';
        file_put_contents(
            $outputFile,
            implode("\n", $messages) . "\n",
            FILE_APPEND,
        );
    },
);

// Skip the actual analysis by returning immediately
uopz_set_return(
    \PHPStan\Testing\RuleTestCase::class,
    'analyse',
    null,
);
