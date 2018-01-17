<?php

if (php_sapi_name() != "cli") {
  die("You can only run cron.php from the command line.");
}

require '/var/www/html/config.php';

echo "Running Logalyzer Cron Job...\n";

IcecastAccessLogEntry::cron();


echo "Done.\n";
