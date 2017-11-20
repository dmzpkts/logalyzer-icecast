<?php

require '../vendor/autoload.php';

use MaxMind\Db\Reader;

$ipAddress = '8.8.8.8';
$databaseFile = 'GeoLite2-City.mmdb';

$reader = new Reader($databaseFile);

$ipInfo = $reader->get($ipAddress);

$returnInfo = [
  'timeZone' => @$ipInfo['location']['time_zone'],
  'continentCode' => @$ipInfo['continent']['code'],
  'continent' => @$ipInfo['continent']['names']['en'],
  'countryCode' => @$ipInfo['country']['iso_code'],
  'country' => @$ipInfo['country']['names']['en'],
  'provinceCode' => @$ipInfo['subdivisions'][0]['iso_code'],
  'province' => @$ipInfo['subdivisions'][0]['names']['en'],
  'postalCode' => @$ipInfo['postal']['code'],
  'city' => @$ipInfo['city']['names']['en'],
];

print_r($returnInfo);

$reader->close();
