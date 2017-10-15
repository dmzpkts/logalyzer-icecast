const fs = require('fs');
const readline = require('readline');
const argv = require('minimist')(process.argv.slice(2));
// Nymph Node client for the win.
const Nymph = require('nymph-client-node');

// Did they call us correctly?
if (argv._.length !== 1) {
  printHelp();
  return;
}
console.log(argv);

// Set up Nymph.
const nymphOptions = {
  restURL: 'http://localhost:8000/logalyzer-icecast/src/rest.php'
};
Nymph.init(nymphOptions);
const LogEntry = require('./build/cjs/LogEntry').LogEntry;

Nymph.getEntities({'class': LogEntry.class}).then(() => {}, (err) => console.log(err));
(async () => {await new Promise((r) => {setTimeout(() => r(), 5000)})})();

// (async () => {
//   switch (argv._[0]) {
//     case 'add':
//     case 'remove':
//       if (!argv.f) {
//         console.log('You\'re missing the file part of the command...');
//         printHelp();
//         return;
//       }
//       console.log(`Beginning reading input file ${argv.f}...`);
//       const inputFile = fs.createReadStream(argv.f);
//       const lineReader = readline.createInterface({
//         input: inputFile
//       });
//       let i = 0;
//       lineReader.on('line', (line) => {
//         // 198.199.105.67 - - [05/Sep/2017:15:57:17 -0700] "GET /admin/metadata HTTP/1.0" 200 335 "-" "libshout/2.3.1" 0
//
//         // Check whether this log entry has already been added.
//         if (argv._[0] === 'remove' || !argv['skip-dupe-check']) {
//           const dupes = await (Nymph.getEntities({'class': LogEntry.class}, {'type': '&', 'strict': ['line', line]}));
//           if (argv._[0] === 'remove') {
//             if (dupes.length) {
//               console.log(`\nRemoving ${dupes.length} entries...`);
//               console.log(await (Nymph.deleteEntities(dupes)));
//             }
//             return;
//           } else {
//             if (dupes.length) {
//               console.log(`\nSkipping duplicate log entry, already in the db ${dupes.length} time(s):\n${line}\n`);
//               return;
//             }
//           }
//         }
//
//         // Read each field. They're separated by spaces, but can be put together with quotes or square brackets.
//         let fieldsBroken = line.split(' ');
//         let fields = [];
//         let searching = null;
//         for (let k = 0; k < fieldsBroken.length; k++) {
//           if (searching) {
//             fields[fields.length - 1] += fieldsBroken[k];
//             if (fieldsBroken[k].substr(-1) === searching) {
//               searching = null;
//             }
//           } else {
//             fields.push(fieldsBroken[k]);
//             if (fieldsBroken[k].substr(0, 1) === '"' && (fieldsBroken[k].length === 1 || fieldsBroken[k].substr(-1) !== '"')) {
//               searching = '"';
//             } else if (fieldsBroken[k].substr(0, 1) === '[' && fieldsBroken[k].substr(-1) !== ']') {
//               searching = ']';
//             }
//           }
//         }
//         if (fields.length !== 10) {
//           console.log('\nThis line doesn\'t have 10 fields like the usual Icecast log line. I\'m going to ignore it.');
//           console.log(line, '\n');
//         }
//
//         // Now let's analyze the fields.
//         console.log(fields);
//         let [
//           remoteHost,
//           userIdentity,
//           userName,
//           timeString,
//           requestLine,
//           statusCode,
//           responseBytes,
//           referer,
//           userAgent,
//           duration
//         ] = fields;
//         statusCode = parseInt(statusCode, 10);
//         responseBytes = parseInt(responseBytes, 10);
//         duration = parseInt(duration, 10);
//
//         // Save the entry to the DB.
//         const entry = new LogEntry();
//         entry.set({
//           line,
//           remoteHost,
//           userIdentity,
//           userName,
//           timeString,
//           requestLine,
//           statusCode,
//           responseBytes,
//           referer,
//           userAgent,
//           duration
//         });
//         console.log('Saving log entry: ', ++i);
//         await (entry.save());
//         if (!entry.guid) {
//           console.log('\nCouldn\'t save log entry: ', entry, '\n');
//         }
//       });
//       break;
//     case 'prune':
//       break;
//     case 'purge':
//       break;
//     default:
//       printHelp();
//       return;
//   }
//   return;
// })();

function printHelp() {
  console.log(`
      ## Icecast Logalyzer by Hunter Perrin ##

This logalyzer requires you to have MySQL set up and put the configuration
for it in conf/config.php.

Once you've done that, you can run this script file and give it an action.

Actions are:

  node logalyzer.js add -f <file> [--skip-dupe-check]
    Reads the log file <file> and adds all the entries to the database.
    --skip-dupe-check will cause Logalyzer to skip the duplicate entry check it
      does for each entry. (Use this if you know you've never imported these
      entries before.)

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
