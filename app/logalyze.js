const fs = require('fs');
const path = require('path');
const readline = require('readline');
const Writable = require('stream').Writable;
const nReadlines = require('n-readlines');
const argv = require('minimist')(process.argv.slice(2));

// Nymph Node client for the win.
const NymphNode = require('nymph-client-node');
NymphNode.enableCookies();
const Nymph = NymphNode.Nymph;

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
Nymph.init({
  restURL: argv['rest-url'] || 'http://localhost:8080/rest.php'
});
const logEntryTypes = {};
const logEntryFiles = fs.readdirSync('./entities/');
for (let file of logEntryFiles) {
  if (file.match(/\.js$/) && file !== 'LogEntry.js') {
    const name = path.basename(file, '.js');
    logEntryTypes[name] = require('./build/'+file.replace(/\.js$/, ''))[name];
  }
}

const User = require('tilmeld').User;
const Group = require('tilmeld').Group;

const mutableStdout = new Writable({
  write: function(chunk, encoding, callback) {
    if (!this.muted) {
      process.stdout.write(chunk, encoding);
    }
    callback();
  }
});

mutableStdout.muted = false;

const rl = readline.createInterface({
  input: process.stdin,
  output: mutableStdout,
  terminal: true
});

(async () => {
  let LogEntry;
  if (argv.type || argv.t) {
    LogEntry = logEntryTypes[argv.type || argv.t];
  } else if (argv.f) {
    const matchedLogEntryTypes = [];
    for (let logEntryType in logEntryTypes) {
      if (path.basename(argv.f).match(logEntryTypes[logEntryType].filePattern)) {
        matchedLogEntryTypes.push(logEntryType);
      }
    }
    if (matchedLogEntryTypes.length === 1) {
      LogEntry = logEntryTypes[matchedLogEntryTypes[0]];
    } else if (matchedLogEntryTypes.length > 1) {
      console.log('Log file matches multiple log entry type patterns. You must specify from the following log types:\n');
      for (let logEntryType of matchedLogEntryTypes) {
        console.log('*', logEntryType, '-', logEntryTypes[logEntryType].title);
      }
      console.log('');
    }
  }
  if (!LogEntry) {
    console.log('Couldn\'t determine the log type. You need to provide one.');
    printHelp();
    process.exit(1);
  } else {
    console.log('Using Log Type:', LogEntry.class, '-', LogEntry.title);
  }

  // Did they provide a username?
  let username = '';
  if (argv.username) {
    username = argv.username;
  } else if (argv.u) {
    username = argv.u;
  } else {
    username = await new Promise((resolve) => rl.question('Username for Lagalyzer server: ', (answer) => resolve(answer)));
  }

  // Did they provide a password?
  let password = '';
  if (argv.password) {
    password = argv.password;
  } else if (argv.p) {
    password = argv.p;
  } else {
    password = await new Promise((resolve) => {
      rl.question('Password for Lagalyzer server: ', (answer) => resolve(answer));
      mutableStdout.muted = true;
    });
    console.log('');
    mutableStdout.muted = false;
  }

  // Can we log in?
  try {
    let data = await User.loginUser({username, password});
    if (!data.result) {
      console.log("Couldn't log in: ", data.message);
      process.exit(1);
    }
  } catch (err) {
    console.log("err: ", err);
    process.exit(1);
  }

  if (LogEntry.usesIpLocationInfo) {
    // Did they download the GeoLite2 database?
    try {
      await LogEntry.getGeoLite2IpInfo('8.8.8.8');
    } catch (e) {
      if (e.code === 4000) {
        printIpDbInstructions();
        process.exit(1);
      } else {
        console.log("Can't communicate with backend to lookup IPs.");
        process.exit(1);
      }
    }
  }

  // Main function.
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

        // Parse the log line.
        const entry = new LogEntry();
        const parseResult = await entry.parseAndSet(line, argv, ipDataCache);

        if (!parseResult) {
          continue;
        }

        // Save the entry to the DB.
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

  process.exit(0);
})();

function printVersion() {
  console.log(`Logalyzer Client by Hunter Perrin
Version 1.0.0`);
}

function printHelp() {
  printVersion();
  console.log(`
This Logalyzer client requires you to have a Logalyzer server.
TODO(hperrin): expand this help printout.

usage: node logalyzer.js <command> [--rest-url=<Logalyzer server Rest URL>]
                         [--username=<username> | -u <username>]
                         [--password=<password> | -p <password>]
                         [--type=<type> | -t <type>]

If you don't specify a Rest URL, 'http://localhost:8080/rest.php' will be used.

Commands are:

  add -f <file> [--skip-dupe-check] [--dont-skip-status] [--dont-skip-metadata]
    Reads the log file <file> and adds all the entries to the database.
    --skip-dupe-check will cause Logalyzer to skip the duplicate entry check it
      does for each entry. (Use this if you know you've never imported these
      entries before.)
    --dont-skip-status will cause Logalyzer to not skip /status.xsl requests.
    --dont-skip-metadata will cause Logalyzer to not skip /admin/metadata
      requests.

  remove -f <file>
    Reads the log file <file> and removes all the matching entries from the
    database. Don't you hate when you accidentally import the wrong file and you
    have to rebuild the entire database? Not anymore, you don't.

  prune -h <hostname>
    Removes log entries from the database that are from <hostname>. You probably
    want to do this with your own hostname so that you don't have to filter out
    your own requests each time you view the logs.

  purge
    Removes all logs from the database.


Thanks for using Logalyzer. I hope you find it useful.
`);
}

function printIpDbInstructions() {
  console.log(`
It looks like you haven't set up the IP geolocation database on your server. You
should do that now.

1. Go to https://dev.maxmind.com/geoip/geoip2/geolite2/
2. Download the GeoLite2 City database in "MaxMind DB binary, gzipped" format.
3. Extract it, and take the "GeoLite2-City.mmdb" file.
4. Put that file in the "geolite2db" folder in the Logalyzer folder on your
   server.
5. MaxMind releases an updated DB the first Tuesday of each month, so remember
   to update it.

Kudos to MaxMind for providing this DB for free!
`);
}
