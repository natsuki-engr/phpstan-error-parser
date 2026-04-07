<?php

/**
 * Bootstrap file for collecting PHPStan error messages in CI.
 *
 * Uses uopz to hook into RuleTestCase::analyse() and capture the expected
 * error message strings without actually running PHPStan analysis.
 *
 * Unlike bootstrap.php (for Docker), this resolves phpstan-src path
 * from the PHPSTAN_DIR environment variable or the current working directory.
 */

declare(strict_types=1);

// Load the original bootstrap from phpstan-src (cwd is phpstan-src during phpunit run)
require_once getcwd() . '/tests/bootstrap.php';

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
