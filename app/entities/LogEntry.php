<?php

use MaxMind\Db\Reader;
use Tilmeld\Tilmeld;

/**
 * @property string $line The log entry's original log line.
 */
class LogEntry extends \Nymph\Entity {
  const ETYPE = 'logentry';
  static $clientEnabledStaticMethods = ['getGeoLite2IpInfo'];
  // These don't need to be private, they just take up space going over the
  // wire.
  protected $privateData = [
    'user',
    'group',
    'ac_user',
    'ac_group',
    'ac_other'
  ];
  protected $whitelistData = [];
  protected $protectedTags = [];
  protected $whitelistTags = [];

  public function __construct($id = 0) {
    $this->line = null;
    parent::__construct($id);
  }

  public static function getGeoLite2IpInfo($ipAddress) {
    if (!Tilmeld::gatekeeper()) {
      return false;
    }

    $databaseFile = __DIR__.'/../geolite2db/GeoLite2-City.mmdb';

    if (!file_exists($databaseFile)) {
      throw new Exception("The database file is missing.", 4000);
    }

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

    return $returnInfo;
  }
}
