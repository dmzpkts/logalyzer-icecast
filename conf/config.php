<?php

// Nymph's configuration.

$nymphConfig = [];

$nymphConfig['MySQL'] = [
  'host' => '127.0.0.1',
  'database' => 'logalyzer_icecast',
  'user' => 'logalyzer',
  'password' => 'supersecurepassword'
];

\Nymph\Nymph::configure($nymphConfig);
