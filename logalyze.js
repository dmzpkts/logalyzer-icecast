const fs = require('fs');
const argv = require('minimist')(process.argv.slice(2));

if (argv._.length !== 1) {
  printHelp();
}
console.log(argv);

switch (argv._[0]) {

}

function printHelp() {
  console.log(`
      ## Icecast Logalyzer by Hunter Perrin ##

This logalyzer requires you to have MySQL set up and put the configuration
for it in conf/config.php.

Once you've done that, you can run this script file and give it an action.

Actions are such:

  node logalyzer.js add -f <file>
    Reads the log file <file> and adds all the entries to the database.

  node logalyzer.js prune -h <hostname>
    Removes log entries from the database that are from <hostname>. You
    probably want to do this with your own hostname so that you don't have
    to filter out your own requests each time you view the logs.

  node logalyzer.js purge
    Removes all logs from the database.


Thanks for using the logalyzer. I hope you find it useful.
`);
}
