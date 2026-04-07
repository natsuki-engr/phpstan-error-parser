<?php

/**
 * Bootstrap file for collecting PHPStan error messages from test suite.
 *
 * Uses uopz to hook into RuleTestCase::analyse() and capture the expected
 * error message strings without actually running PHPStan analysis.
 *
 * Usage: Include this file via PHPUnit's --bootstrap option or phpunit.xml.
 */

declare(strict_types=1);

// Load the original bootstrap first
require_once __DIR__ . '/../phpstan-src/tests/bootstrap.php';

$outputFile = getenv('COLLECTOR_OUTPUT_FILE') ?: '/tmp/phpstan-error-messages.txt';

// Clear the output file
file_put_contents($outputFile, '');

// Hook into RuleTestCase::analyse() to capture expected error messages
uopz_set_hook(
    \PHPStan\Testing\RuleTestCase::class,
    'analyse',
    function (array $files, array $expectedErrors) use ($outputFile): void {
        $messages = array_map(
            fn(array $error): string => $error[0],
            $expectedErrors,
        );

        if (count($messages) > 0) {
            file_put_contents(
                $outputFile,
                implode("\n", $messages) . "\n",
                FILE_APPEND,
            );
        }
    },
);

// Skip the actual analysis by returning immediately
uopz_set_return(
    \PHPStan\Testing\RuleTestCase::class,
    'analyse',
    null,
);
