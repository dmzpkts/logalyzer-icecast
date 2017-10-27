# Logalyzer for Icecast

If you run an Icecast server and you want to analyze your logs, this is it.

## Installation

1. Set up an HTTP server with PHP.
2. Set up MySQL (or Postgres). Make sure it works with PHP.
3. Clone this repository into your web server and update the config files in conf.
4. Run `composer install`.
5. Run `npm install`.
4. Now that you're all set up, you can use `node logalyze.js` to add your log files to the database.

## Hey there, it's not quite ready.

You can install this and play around with it, but the query editor and the charts aren't quite ready yet.

## Shoutouts

This product includes GeoLite2 data created by MaxMind, available from [maxmind.com](http://www.maxmind.com).

This product also uses IP geolocation data from [ip2c.org](http://ip2c.org/).
