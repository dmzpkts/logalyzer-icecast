// Edit the config here.
const config = {
  restURL: 'http://localhost/logalyzer-icecast/src/rest.php'
};

// This stuff you don't need to touch.
if (typeof exports !== 'undefined') {
  exports.config = config;
}
if (typeof nymphConfigSet !== 'undefined') {
  nymphConfigSet(config);
}
