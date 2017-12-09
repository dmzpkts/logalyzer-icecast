(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(["exports", "Nymph", "NymphEntity", "./LogEntry"], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require("Nymph"), require("NymphEntity"), require("./LogEntry"));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.Nymph, global.NymphEntity, global.LogEntry);
    global.IcecastAccessLogEntry = mod.exports;
  }
})(this, function (exports, _Nymph, _NymphEntity, _LogEntry) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.IcecastAccessLogEntry = undefined;

  var _Nymph2 = _interopRequireDefault(_Nymph);

  var _NymphEntity2 = _interopRequireDefault(_NymphEntity);

  var _LogEntry2 = _interopRequireDefault(_LogEntry);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  var _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  var _slicedToArray = function () {
    function sliceIterator(arr, i) {
      var _arr = [];
      var _n = true;
      var _d = false;
      var _e = undefined;

      try {
        for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
          _arr.push(_s.value);

          if (i && _arr.length === i) break;
        }
      } catch (err) {
        _d = true;
        _e = err;
      } finally {
        try {
          if (!_n && _i["return"]) _i["return"]();
        } finally {
          if (_d) throw _e;
        }
      }

      return _arr;
    }

    return function (arr, i) {
      if (Array.isArray(arr)) {
        return arr;
      } else if (Symbol.iterator in Object(arr)) {
        return sliceIterator(arr, i);
      } else {
        throw new TypeError("Invalid attempt to destructure non-iterable instance");
      }
    };
  }();

  function _asyncToGenerator(fn) {
    return function () {
      var gen = fn.apply(this, arguments);
      return new Promise(function (resolve, reject) {
        function step(key, arg) {
          try {
            var info = gen[key](arg);
            var value = info.value;
          } catch (error) {
            reject(error);
            return;
          }

          if (info.done) {
            resolve(value);
          } else {
            return Promise.resolve(value).then(function (value) {
              step("next", value);
            }, function (err) {
              step("throw", err);
            });
          }
        }

        return step("next");
      });
    };
  }

  class IcecastAccessLogEntry extends _LogEntry2.default {

    // === Constructor ===

    // === Static Properties ===

    constructor(id) {
      super(id);
    }

    // === Instance Methods ===

    /**
     * @return {boolean} True if the line was parsed, false if the entry should be skipped according to options.
     */

    // The name of the server class
    parseAndSet(options, ipDataCache) {
      var _this = this;

      return _asyncToGenerator(function* () {
        const line = _this.getLogLine();

        // Read each field. They're separated by spaces, but can be put together with quotes or square brackets.
        let fields = _this.parseFields(line, 10);
        if (fields.length !== 10) {
          console.log('\nThis line doesn\'t have 10 fields like the usual Icecast log line. I\'m going to ignore it.');
          console.log(line, '\n');
          return false;
        }

        // Now let's analyze the fields.

        var _fields = _slicedToArray(fields, 10);

        let remoteHost = _fields[0],
            userIdentity = _fields[1],
            userName = _fields[2],
            timeString = _fields[3],
            requestLine = _fields[4],
            statusCode = _fields[5],
            responseBytes = _fields[6],
            referer = _fields[7],
            userAgent = _fields[8],
            duration = _fields[9];

        duration = parseInt(duration, 10);
        timeString = timeString.slice(1, -1);
        requestLine = requestLine.slice(1, -1);
        statusCode = parseInt(statusCode, 10);
        responseBytes = parseInt(responseBytes, 10);
        referer = referer.slice(1, -1);
        userAgent = userAgent.slice(1, -1);
        const time = Date.parse(timeString.replace(/\//g, '-').replace(/:/, ' ')) / 1000;
        const timeEnd = time + duration;

        var _requestLine$split = requestLine.split(' '),
            _requestLine$split2 = _slicedToArray(_requestLine$split, 3);

        const method = _requestLine$split2[0],
              resource = _requestLine$split2[1],
              protocol = _requestLine$split2[2];

        if (!options['dont-skip-status'] && resource === '/status.xsl') {
          return false;
        }
        if (!options['dont-skip-metadata'] && resource === '/admin/metadata') {
          return false;
        }

        // Parse user agent string.
        const uaParts = _this.parseUAString(userAgent);

        // Check whether this log entry has already been added.
        let ipInfo;
        if (!options['skip-dupe-check']) {
          let dupes;

          var _ref = yield Promise.all([_LogEntry2.default.getIpLocationData(remoteHost, ipDataCache), _Nymph2.default.getEntities({ 'class': IcecastAccessLogEntry.class }, { 'type': '&', 'strict': ['line', line] }).then(function (e) {
            return e;
          }, function (err) {
            console.log('\nCouldn\'t check for dupes. Got err: ', err, '\n');
          })]);

          var _ref2 = _slicedToArray(_ref, 2);

          ipInfo = _ref2[0];
          dupes = _ref2[1];

          if (dupes.length) {
            console.log(`\nSkipping duplicate log entry, already in the db ${dupes.length} time(s):\n${line}\n`);
            return false;
          }
        } else {
          ipInfo = yield _LogEntry2.default.getIpLocationData(remoteHost, ipDataCache);
        }

        _this.set(_extends({
          line,
          remoteHost,
          userIdentity,
          userName,
          timeString,
          requestLine,
          statusCode,
          responseBytes,
          referer,
          userAgent
        }, uaParts, {
          duration,
          time,
          timeStart: time,
          timeEnd,
          method,
          resource,
          protocol
        }, ipInfo));

        return true;
      })();
    }
  }

  exports.default = IcecastAccessLogEntry;
  IcecastAccessLogEntry.etype = "logentry_icecast_access";
  IcecastAccessLogEntry.class = "IcecastAccessLogEntry";
  IcecastAccessLogEntry.title = "IceCast Access Log Entry";
  IcecastAccessLogEntry.usesIpLocationInfo = true;
  IcecastAccessLogEntry.filePattern = /^access.log/;
  IcecastAccessLogEntry.aggregateFunctions = _extends({
    totalListenersOverTime: {
      name: "Total Listeners Over Time",
      axisLabel: "Listeners",
      defaultChartFunction: "timeSeriesSteppedArea",
      func: function func(entries) {
        const timeFormat = 'YYYY-MM-DD HH:mm:ss';

        function newDateString(timestamp) {
          return moment("" + timestamp, "X").format(timeFormat);
        }

        let earliest,
            latest,
            deltas = {},
            data = [];

        // Go through and save every time someone logs on and off and the
        // earliest/latest delta.
        for (let i = 0; i < entries.length; i++) {
          const entry = entries[i];
          const timeOn = Math.floor(entry.get("time"));
          const timeOff = Math.floor(entry.get("timeEnd"));

          if (timeOn < earliest || earliest === undefined) {
            earliest = timeOn;
          }
          if (timeOff > latest || latest === undefined) {
            latest = timeOff;
          }
          if (deltas[timeOn]) {
            deltas[timeOn]++;
          } else {
            deltas[timeOn] = 1;
          }
          if (deltas[timeOff]) {
            deltas[timeOff]--;
          } else {
            deltas[timeOff] = -1;
          }
        }

        // Now comes the hard part. Going through every second from earliest to
        // latest and calculating number of listeners.
        let currentListeners = 0;
        for (let i = earliest; i <= latest; i++) {
          if (deltas[i]) {
            currentListeners += deltas[i];

            data.push({
              label: newDateString(i),
              value: currentListeners
            });
          }
        }

        return { data };
      }
    }

  }, _LogEntry2.default.httpRequestBasedAggregateFunctions, _LogEntry2.default.refererBasedAggregateFunctions, _LogEntry2.default.userAgentBasedAggregateFunctions, _LogEntry2.default.geoBasedAggregateFunctions);
  _Nymph2.default.setEntityClass(IcecastAccessLogEntry.class, IcecastAccessLogEntry);
  exports.IcecastAccessLogEntry = IcecastAccessLogEntry;
});