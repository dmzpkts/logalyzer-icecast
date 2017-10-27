const fs = require('fs');
const nReadlines = require('n-readlines');
const argv = require('minimist')(process.argv.slice(2));
const uaParser = require('ua-parser-js');
const curl = require('curl');

// Nymph Node client for the win.
const Nymph = require('nymph-client-node');

// Making gratuitous requests to someone else's service isn't very nice.
const ipDataCache = {};

if (argv.help || argv.h) {
  printHelp();
  process.exit(0);
}

if (argv.version) {
  printVersion();
  process.exit(0);
}

// Did they call us correctly?
if (argv._.length !== 1) {
  printHelp();
  process.exit(1);
}

// Set up Nymph.
const nymphOptions = require('./conf/config.js').config;
Nymph.init(nymphOptions);
const LogEntry = require('./build/cjs/LogEntry').LogEntry;

// Did they download the GeoLite2 database?
(async function() {
  try {
    await LogEntry.getIpInfo('8.8.8.8');
  } catch (e) {
    if (e.code === 4000) {
      printIpDbInstructions();
      process.exit(1);
    } else {
      console.log("Can't communicate with backend to lookup IPs.");
      process.exit(1);
    }
  }
})();

(async () => {
  switch (argv._[0]) {
    case 'add':
    case 'remove':
      if (!argv.f) {
        console.log('You\'re missing the file part of the command...');
        printHelp();
        process.exit(1);
      }

      let inputFile, uncompressedFile;
      if (argv.f.match(/\.gz$/)) {
        // Uncompress the gzipped log file.
        console.log("Uncompressing input file to temporary file.");

        const compressing = require('compressing');
        uncompressedFile = argv.f.replace(/\.gz$/, "");
        await compressing.gzip.uncompress(argv.f, uncompressedFile);
        inputFile = uncompressedFile;
      } else {
        inputFile = argv.f;
      }

      console.log(`Beginning reading input file ${inputFile}...`);
      const lineReader = new nReadlines(inputFile);
      let i = 0, liner;
      while (liner = lineReader.next()) {
        const line = liner.toString('utf-8');

        // 198.199.105.67 - - [05/Sep/2017:15:57:17 -0700] "GET /admin/metadata HTTP/1.0" 200 335 "-" "libshout/2.3.1" 0

        // Removes are super easy to handle.
        if (argv._[0] === 'remove') {
          try {
            const removes = await Nymph.getEntities({'class': LogEntry.class}, {'type': '&', 'strict': ['line', line]});
            if (removes.length) {
              console.log(`\nRemoving ${removes.length} entries...`);
              console.log(await Nymph.deleteEntities(removes));
            }
            // Wait 10 msec between each request, to not overload the server.
            await new Promise((r) => {setTimeout(() => r(), 10)});
          } catch (err) {
            console.log('\nCouldn\'t check for entry. Got err: ', err, '\n');
          }
          continue;
        }

        // Read each field. They're separated by spaces, but can be put together with quotes or square brackets.
        let fieldsBroken = line.split(' '), fields = [], searching = null;
        for (let k = 0; k < fieldsBroken.length; k++) {
          if (searching) {
            fields[fields.length - 1] += ' ' + fieldsBroken[k];
            if (fieldsBroken[k].substr(-1) === searching) {
              searching = null;
            }
          } else {
            fields.push(fieldsBroken[k]);
            if (fieldsBroken[k].substr(0, 1) === '"' && (fieldsBroken[k].length === 1 || fieldsBroken[k].substr(-1) !== '"')) {
              searching = '"';
            } else if (fieldsBroken[k].substr(0, 1) === '[' && fieldsBroken[k].substr(-1) !== ']') {
              searching = ']';
            }
          }
        }
        if (fields.length !== 10) {
          console.log('\nThis line doesn\'t have 10 fields like the usual Icecast log line. I\'m going to ignore it.');
          console.log(line, '\n');
        }

        // Now let's analyze the fields.
        let [
          remoteHost,
          userIdentity,
          userName,
          timeString,
          requestLine,
          statusCode,
          responseBytes,
          referer,
          userAgent,
          duration
        ] = fields;
        duration = parseInt(duration, 10);
        timeString = timeString.slice(1, -1);
        requestLine = requestLine.slice(1, -1);
        statusCode = parseInt(statusCode, 10);
        responseBytes = parseInt(responseBytes, 10);
        referer = referer.slice(1, -1);
        userAgent = userAgent.slice(1, -1);
        const time = Date.parse(timeString.replace(/\//g, '-').replace(/:/, ' ')) / 1000;
        const timeEnd = time + duration;
        const [method, resource, protocol] = requestLine.split(' ');
        if (!argv['dont-skip-status'] && resource === '/status.xsl') {
          continue;
        }
        if (!argv['dont-skip-metadata'] && resource === '/admin/metadata') {
          continue;
        }

        // Parse user agent string.
        const uaParts = uaParser(userAgent);

        // These go in the entity.
        const uaBrowserName = uaParts.browser.name;
        const uaBrowserVersion = uaParts.browser.version;
        const uaCpuArchitecture = uaParts.cpu.architecture;
        const uaDeviceModel = uaParts.device.model;
        const uaDeviceType = uaParts.device.type;
        const uaDeviceVendor = uaParts.device.vendor;
        const uaEngineName = uaParts.engine.name;
        const uaEngineVersion = uaParts.engine.version;
        const uaOsName = uaParts.os.name;
        const uaOsVersion = uaParts.os.version;
        let ipInfo;

        // Check whether this log entry has already been added.
        if (!argv['skip-dupe-check']) {
          let dupes;
          [ipInfo, dupes] = await Promise.all([
            getIpLocationData(remoteHost),
            Nymph.getEntities({'class': LogEntry.class}, {'type': '&', 'strict': ['line', line]}).then((e) => e, (err) => {
              console.log('\nCouldn\'t check for dupes. Got err: ', err, '\n');
            })
          ]);
          if (dupes.length) {
            console.log(`\nSkipping duplicate log entry, already in the db ${dupes.length} time(s):\n${line}\n`);
            continue;
          }
        } else {
          ipInfo = await getIpLocationData(remoteHost);
        }

        const {
          timeZone,
          continentCode,
          continent,
          countryCode,
          country,
          provinceCode,
          province,
          postalCode,
          city
        } = ipInfo;

        // Save the entry to the DB.
        const entry = new LogEntry();
        entry.set({
          line,
          remoteHost,
          userIdentity,
          userName,
          timeString,
          requestLine,
          statusCode,
          responseBytes,
          referer,
          userAgent,
          uaBrowserName,
          uaBrowserVersion,
          uaCpuArchitecture,
          uaDeviceModel,
          uaDeviceType,
          uaDeviceVendor,
          uaEngineName,
          uaEngineVersion,
          uaOsName,
          uaOsVersion,
          duration,
          time,
          timeStart: time,
          timeEnd,
          method,
          resource,
          protocol,
          timeZone,
          continentCode,
          continent,
          countryCode,
          country,
          provinceCode,
          province,
          postalCode,
          city
        });

        console.log('Saving log entry: ', ++i);
        await entry.save();
        if (!entry.guid) {
          console.log('\nCouldn\'t save log entry: ', entry, '\n');
        }

        // Wait 5 msec between each request, to not overload the server.
        // await new Promise((r) => {setTimeout(() => r(), 5)});
      }

      if (argv.f.match(/\.gz$/)) {
        console.log("Removing uncompressed input file.");
        fs.unlinkSync(inputFile);
      }
      break;
    case 'prune':
      break;
    case 'purge':
      console.log('I\'m going to purge all log entries in 5 seconds unless you CTRL+c to cancel me...');
      console.log('5...');
      await new Promise((r) => {setTimeout(() => r(), 1000)});
      console.log('4...');
      await new Promise((r) => {setTimeout(() => r(), 1000)});
      console.log('3...');
      await new Promise((r) => {setTimeout(() => r(), 1000)});
      console.log('2...');
      await new Promise((r) => {setTimeout(() => r(), 1000)});
      console.log('1...');
      await new Promise((r) => {setTimeout(() => r(), 1000)});
      console.log('Purging all entries from the database, 50 at a time...');

      while (1) {
        try {
          const removes = await Nymph.getEntities({'class': LogEntry.class, 'limit': 50});
          if (removes.length) {
            console.log(`\nRemoving ${removes.length} entries...`);
            console.log(await Nymph.deleteEntities(removes));
          } else {
            break;
          }
        } catch (err) {
          console.log('\nCouldn\'t retrieve entities. Got err: ', err, '\n');
        }
        // Wait 10 msec between each request, to not overload the server.
        await new Promise((r) => {setTimeout(() => r(), 10)});
      }
      break;
    default:
      printHelp();
      break;
  }

  return;
})();

function printVersion() {
  console.log(`Icecast Logalyzer by Hunter Perrin
Version 1.0.0`);
}

function printHelp() {
  printVersion();
  console.log(`
This logalyzer requires you to have MySQL set up and put the configuration for it in
conf/config.php.

Once you've done that, you can run this script file and give it an action.

Actions are:

  node logalyzer.js add -f <file> [--skip-dupe-check] [--dont-skip-status] [--dont-skip-metadata]
    Reads the log file <file> and adds all the entries to the database.
    --skip-dupe-check will cause Logalyzer to skip the duplicate entry check it does for each
      entry. (Use this if you know you've never imported these entries before.)
    --dont-skip-status will cause Logalizer to not skip /status.xsl requests.
    --dont-skip-metadata will cause Logalyzer to not skip /admin/metadata requests.

  node logalyzer.js remove -f <file>
    Reads the log file <file> and removes all the matching entries from the
    database. Don't you hate when you accidentally import the wrong file and you
    have to rebuild the entire database? Not anymore, you don't.

  node logalyzer.js prune -h <hostname>
    Removes log entries from the database that are from <hostname>. You
    probably want to do this with your own hostname so that you don't have
    to filter out your own requests each time you view the logs.

  node logalyzer.js purge
    Removes all logs from the database.


Thanks for using the logalyzer. I hope you find it useful.
`);
}

function printIpDbInstructions() {
  console.log(`
It looks like you haven't set up the IP geolocation database on your server. You should do
that now.

1. Go to https://dev.maxmind.com/geoip/geoip2/geolite2/
2. Download the GeoLite2 City database in "MaxMind DB binary, gzipped" format.
3. Extract it, and take the "GeoLite2-City.mmdb" file.
4. Put that file in the "geolite2db" folder in the Logalyzer folder on your server.
5. MaxMind releases an updated DB the first Tuesday of each month, so remember to update it.

Kudos to MaxMind for providing this DB for free!
`);
}

function getIpLocationData(ip) {
  if (ipDataCache[ip]) {
    return Promise.resolve(ipDataCache[ip]);
  }

  console.log("Looking up location data for IP: "+ip);

  return new Promise((resolve, reject) => {
    LogEntry.getIpInfo(ip).then((ipInfo) => {
      let nonNullFound = false;
      for (let p in ipInfo) {
        if (ipInfo[p] !== null) {
          nonNullFound = true;
          break;
        }
      }
      if (!nonNullFound) {
        console.log("IP location data not found in GeoLite2 DB.");
        console.log("Falling back to ip2c.org...");
        fallback();
        return;
      }
      ipDataCache[ip] = ipInfo;
      resolve(ipInfo);
    }, (err) => {
      console.log("Couldn't get location data from GeoLite2 DB: "+err);
      console.log("Falling back to ip2c.org...");
      fallback();
    });
    function fallback() {
      const ipInfoUrl = `http://ip2c.org/${ip}`;
      curl.get(ipInfoUrl, null, function(err, response, body) {
        if (err) {
          console.log("Couldn't get location data: "+err);
          reject(err);
          return;
        }
        const [result, countryCode, unused, country] = body.split(';', 4);
        switch (result) {
          case '0':
          case '2':
          default:
            ipDataCache[ip] = {
              timeZone: null,
              continentCode: null,
              continent: null,
              countryCode: null,
              country: null,
              provinceCode: null,
              province: null,
              postalCode: null,
              city: null
            };
            break;
          case '1':
            ipDataCache[ip] = {
              timeZone: null,
              continentCode: null,
              continent: null,
              countryCode,
              country,
              provinceCode: null,
              province: null,
              postalCode: null,
              city: null
            };
            break;
        }
        resolve(ipDataCache[ip]);
      });
    }
  });
}
