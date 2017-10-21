<?php

/**
 * @property string $line The log entry's original log line.
 * @property string $remoteHost
 * @property string $userIdentity
 * @property string $userName
 * @property string $timeString
 * @property string $requestLine
 * @property int $statusCode
 * @property int $responseBytes
 * @property string $referer
 * @property string $userAgent
 * @property int $duration
 * @property int $time Unix timestamp of the request in milliseconds.
 * @property int $timeStart Unix timestamp of the request in milliseconds.
 * @property int $timeEnd Unix timestamp of the termination of the request in milliseconds.
 * @property string $method
 * @property string $resource
 * @property string $protocol
 */
class LogEntry extends \Nymph\Entity {
  const ETYPE = 'logentry';
  protected $clientEnabledMethods = ['archive'];
  protected $whitelistData = [
    'line',
    'remoteHost',
    'userIdentity',
    'userName',
    'timeString',
    'requestLine',
    'statusCode',
    'responseBytes',
    'referer',
    'userAgent',
    'duration',
    'time',
    'timeStart',
    'timeEnd',
    'method',
    'resource',
    'protocol'];
  protected $protectedTags = ['archived'];
  protected $whitelistTags = [];

  public function __construct($id = 0) {
    $this->line = null;
    parent::__construct($id);
  }

  public function info($type) {
    if ($type == 'name' && isset($this->line)) {
      return $this->line;
    } elseif ($type == 'type') {
      return 'log entry';
    } elseif ($type == 'types') {
      return 'log entries';
    }
    return null;
  }

  public function archive() {
    if ($this->hasTag('archived')) {
      return true;
    }
    $this->addTag('archived');
    return $this->save();
  }
}
