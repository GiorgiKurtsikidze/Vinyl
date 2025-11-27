<?php
// Database configuration
define('DB_PATH', __DIR__ . '/data.db');

// Ensure data directory exists
if (!file_exists(__DIR__ . '/data')) {
    mkdir(__DIR__ . '/data', 0755, true);
}

// Set timezone
date_default_timezone_set('UTC');
?>
