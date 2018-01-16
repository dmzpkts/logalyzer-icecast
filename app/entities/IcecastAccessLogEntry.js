import Nymph from "Nymph";
import Entity from "NymphEntity";
import LogEntry from "LogEntry";

export default class IcecastAccessLogEntry extends LogEntry {

  // === Static Properties ===

  static etype = "logentry_icecast_access";
  // The name of the server class
  static class = "IcecastAccessLogEntry";

  static title = "IceCast Access Log Entry";
  static filePattern = /^access.log/;
  static usesIpLocationInfo = true;
  static checkMalformedLines = false;

  static aggregateFunctions = {
    totalListenersOverTime: {
      name: "Total Listeners Over Time",
      axisLabel: "Listeners",
      defaultChartFunction: "timeSeriesSteppedArea",
      sorting: ["unchanged"],
      func: function (entries, sort) {
        const timeFormat = "YYYY-MM-DD HH:mm:ss";

        function newDateString(timestamp) {
          return moment(""+timestamp, "X").format(timeFormat);
        }

        let earliest, latest, deltas = {}, data = [];

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

        return {data};
      }
    },

    ...LogEntry.httpRequestBasedAggregateFunctions,

    ...LogEntry.refererBasedAggregateFunctions,

    ...LogEntry.userAgentBasedAggregateFunctions,

    ...LogEntry.geoBasedAggregateFunctions,

    ...LogEntry.defaultAggregateFunctions
  }

  // === Constructor ===

  constructor(id) {
    super(id);
  }

  // === Instance Methods ===

  /**
   * @return {boolean} True if the line was parsed, false if the entry should be skipped according to options.
   */
  async parseAndSet(options, ipDataCache) {
    const line = this.getLogLine();

    // Read each field. They're separated by spaces, but can be put together with quotes or square brackets.
    let fields = this.parseFields(line, 10);
    if (fields.length !== 10) {
      console.log('\nThis line doesn\'t have 10 fields like the usual Icecast log line. I\'m going to ignore it.');
      console.log(line, '\n');
      return false;
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
    if (!options['dont-skip-status'] && resource === '/status.xsl') {
      return false;
    }
    if (!options['dont-skip-metadata'] && resource === '/admin/metadata') {
      return false;
    }

    // Parse user agent string.
    const uaParts = this.parseUAString(userAgent);

    // Check whether this log entry has already been added.
    let ipInfo;
    if (!options['skip-dupe-check']) {
      let dupes;
      [ipInfo, dupes] = await Promise.all([
        LogEntry.getIpLocationData(remoteHost, ipDataCache),
        Nymph.getEntities({'class': IcecastAccessLogEntry.class}, {'type': '&', 'strict': ['line', line]}).then((e) => e, (err) => {
          console.log('\nCouldn\'t check for dupes. Got err: ', err, '\n');
        })
      ]);
      if (dupes.length) {
        console.log(`\nSkipping duplicate log entry, already in the db ${dupes.length} time(s):\n${line}\n`);
        return false;
      }
    } else {
      ipInfo = await LogEntry.getIpLocationData(remoteHost, ipDataCache);
    }

    this.set({
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
      ...uaParts,
      duration,
      time,
      timeStart: time,
      timeEnd,
      method,
      resource,
      protocol,
      ...ipInfo
    });

    return true;
  }
}

Nymph.setEntityClass(IcecastAccessLogEntry.class, IcecastAccessLogEntry);
export {IcecastAccessLogEntry};
