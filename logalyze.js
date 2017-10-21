const fs = require('fs');
const nReadlines = require('n-readlines');
const argv = require('minimist')(process.argv.slice(2));
// Nymph Node client for the win.
const Nymph = require('nymph-client-node');

// Did they call us correctly?
if (argv._.length !== 1) {
  printHelp();
  return;
}

// Set up Nymph.
const nymphOptions = require('./conf/config.js').config;
Nymph.init(nymphOptions);
const LogEntry = require('./build/cjs/LogEntry').LogEntry;

(async () => {
  switch (argv._[0]) {
    case 'add':
    case 'remove':
      if (!argv.f) {
        console.log('You\'re missing the file part of the command...');
        printHelp();
        return;
      }
      console.log(`Beginning reading input file ${argv.f}...`);
      const lineReader = new nReadlines(argv.f);
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
        let time = Date.parse(timeString.replace(/\//g, '-').replace(/:/, ' ')) / 1000;
        let timeEnd = time + duration;
        let [method, resource, protocol] = requestLine.split(' ');
        if (!argv['dont-skip-status'] && resource === '/status.xsl') {
          continue;
        }
        if (!argv['dont-skip-metadata'] && resource === '/admin/metadata') {
          continue;
        }

        // Check whether this log entry has already been added.
        if (!argv['skip-dupe-check']) {
          const dupes = await Nymph.getEntities({'class': LogEntry.class}, {'type': '&', 'strict': ['line', line]}).then((e) => e, (err) => {
            console.log('\nCouldn\'t check for dupes. Got err: ', err, '\n');
          });
          if (dupes.length) {
            console.log(`\nSkipping duplicate log entry, already in the db ${dupes.length} time(s):\n${line}\n`);
            continue;
          }
        }

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
          duration,
          time,
          timeStart: time,
          timeEnd,
          method,
          resource,
          protocol
        });

        console.log('Saving log entry: ', ++i);
        await entry.save();
        if (!entry.guid) {
          console.log('\nCouldn\'t save log entry: ', entry, '\n');
        }

        // Wait 10 msec between each request, to not overload the server.
        await new Promise((r) => {setTimeout(() => r(), 10)});
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

function printHelp() {
  console.log(`
      ## Icecast Logalyzer by Hunter Perrin ##

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
