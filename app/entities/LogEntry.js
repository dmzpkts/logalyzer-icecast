import Nymph from "Nymph";
import Entity from "NymphEntity";

export default class LogEntry extends Entity {

  // === Static Properties ===

  static etype = "logentry";
  // The name of the server class
  static class = "LogEntry";

  static aggregateFunctions = {
    totalListenersOverTime: {
      name: "Total Listeners Over Time",
      axisLabel: "Listeners",
      defaultChartFunction: "timeSeriesSteppedArea",
      func: function (entries) {
        const timeFormat = 'YYYY-MM-DD HH:mm:ss';

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

    remoteHost: {
      name: "Remote Host (Unique Visitors)",
      axisLabel: "Requests",
      defaultChartFunction: "horizontalBar",
      func: LogEntry.aggregateExtractBy("remoteHost", "Unknown")
    },

    resources: {
      name: "Requested Resources",
      axisLabel: "Requests",
      defaultChartFunction: "horizontalBar",
      func: LogEntry.aggregateExtractBy("resource", "Unknown")
    },

    refererByDomain: {
      name: "Referer By Domain",
      axisLabel: "Requests",
      defaultChartFunction: "horizontalBar",
      func: function (entries) {
        const values = {
          "Direct Request": 0,
          "Unknown": 0
        };
        const refererDomainRegex = /^\w+:\/\/(?:www\.)?([A-Za-z0-9-:.]+)/g;
        const data = [], eventHandlers = {};

        // Go through and parse out the domain of the referer.
        for (let i = 0; i < entries.length; i++) {
          const entry = entries[i];
          const value = entry.get("referer");

          if (!value || value === "-") {
            values["Direct Request"]++;
          } else {
            const match = refererDomainRegex.exec(value);
            if (match !== null && match.length > 1) {
              if (values[match[1]]) {
                values[match[1]]++;
              } else {
                values[match[1]] = 1;
              }
            } else {
              values["Unknown"]++;
            }
          }
        }

        // Convert every entry to an array.
        for (let k in values) {
          data.push({
            label: k + " (" + (Math.round(values[k] / entries.length * 10000) / 100) + "%, " + values[k] + ")",
            value: values[k]
          });
        }

        data.sort((a, b) => b.value - a.value);

        return {data, eventHandlers};
      }
    },

    searchTerms: {
      name: "Search Terms",
      axisLabel: "Requests",
      defaultChartFunction: "horizontalBar",
      func: function (entries) {
        const values = {};
        const searchTermsByServiceRegex = /^\w+:\/\/(?:www\.)?[A-Za-z0-9-:.]+\/.*q=([^&]+)(?:&|$)/g;
        const data = [], eventHandlers = {};

        // Go through and parse out the search terms and service.
        for (let i = 0; i < entries.length; i++) {
          const entry = entries[i];
          const value = entry.get("referer");

          if (!(!value || value === "-")) {
            const match = searchTermsByServiceRegex.exec(value);
            if (match !== null && match.length > 1) {
              const key = decodeURIComponent(match[1].replace(/\+/g, ' '));
              if (values[key]) {
                values[key]++;
              } else {
                values[key] = 1;
              }
            }
          }
        }

        // Convert every entry to an array.
        for (let k in values) {
          const label = k + " (" + (Math.round(values[k] / entries.length * 10000) / 100) + "%, " + values[k] + ")";
          data.push({
            label: label,
            value: values[k]
          });
          eventHandlers[label] = function(app) {
            const selectors = app.get("selectors");
            selectors.push({
              type: "&",
              like: [
                ["referer", "%q="+(encodeURIComponent(k).replace(/%20/g, '+').replace(/%/g, '\%').replace(/_/g, '\_'))+"%"]
              ]
            });
            app.set({selectors});
            alert("Added selector to filter for this searth term.");
          };
        }

        data.sort((a, b) => b.value - a.value);

        return {data, eventHandlers};
      }
    },

    searchTermsByService: {
      name: "Search Terms by Service",
      axisLabel: "Requests",
      defaultChartFunction: "horizontalBar",
      func: function (entries) {
        const values = {};
        const searchTermsByServiceRegex = /^\w+:\/\/(?:www\.)?([A-Za-z0-9-:.]+)\/.*q=([^&]+)(?:&|$)/g;
        const data = [], eventHandlers = {};

        // Go through and parse out the search terms and service.
        for (let i = 0; i < entries.length; i++) {
          const entry = entries[i];
          const value = entry.get("referer");

          if (!(!value || value === "-")) {
            const match = searchTermsByServiceRegex.exec(value);
            if (match !== null && match.length > 2) {
              const key = match[1] + ": " + decodeURIComponent(match[2].replace(/\+/g, ' '));
              if (values[key]) {
                values[key]++;
              } else {
                values[key] = 1;
              }
            }
          }
        }

        // Convert every entry to an array.
        for (let k in values) {
          const label = k + " (" + (Math.round(values[k] / entries.length * 10000) / 100) + "%, " + values[k] + ")";
          data.push({
            label: label,
            value: values[k]
          });
          eventHandlers[label] = function(app) {
            const selectors = app.get("selectors");
            selectors.push({
              type: "&",
              like: [
                ["referer", "%"+k.split(": ", 2)[0]+"/%q="+(encodeURIComponent(k.split(": ", 2)[1]).replace(/%20/g, '+').replace(/%/g, '\%').replace(/_/g, '\_'))+"%"]
              ]
            });
            app.set({selectors});
            alert("Added selector to filter for this searth term and service.");
          };
        }

        data.sort((a, b) => b.value - a.value);

        return {data, eventHandlers};
      }
    },

    allReferers: {
      name: "All Referers",
      axisLabel: "Requests",
      defaultChartFunction: "horizontalBar",
      func: LogEntry.aggregateExtractBy("referer", "Direct Request")
    },

    browser: {
      name: "Browser",
      axisLabel: "Requests",
      defaultChartFunction: "pie",
      func: LogEntry.aggregateExtractBy("uaBrowserName", "Unknown")
    },

    browserVersion: {
      name: "Browser Version",
      axisLabel: "Requests",
      defaultChartFunction: "pie",
      func: LogEntry.aggregateExtractBy("uaBrowserName", "Unknown", "uaBrowserVersion")
    },

    cpuArchitecture: {
      name: "CPU Architecture",
      axisLabel: "Requests",
      defaultChartFunction: "pie",
      func: LogEntry.aggregateExtractBy("uaCpuArchitecture", "Unknown")
    },

    deviceType: {
      name: "Device Type",
      axisLabel: "Requests",
      defaultChartFunction: "pie",
      func: LogEntry.aggregateExtractBy("uaDeviceType", "Unknown")
    },

    deviceVendor: {
      name: "Device Vendor",
      axisLabel: "Requests",
      defaultChartFunction: "pie",
      func: LogEntry.aggregateExtractBy("uaDeviceVendor", "Unknown")
    },

    deviceModel: {
      name: "Device Model",
      axisLabel: "Requests",
      defaultChartFunction: "pie",
      func: LogEntry.aggregateExtractBy("uaDeviceVendor", "Unknown", "uaDeviceModel")
    },

    engine: {
      name: "Engine",
      axisLabel: "Requests",
      defaultChartFunction: "pie",
      func: LogEntry.aggregateExtractBy("uaEngineName", "Unknown")
    },

    engineVersion: {
      name: "Engine Version",
      axisLabel: "Requests",
      defaultChartFunction: "pie",
      func: LogEntry.aggregateExtractBy("uaEngineName", "Unknown", "uaEngineVersion")
    },

    os: {
      name: "OS",
      axisLabel: "Requests",
      defaultChartFunction: "pie",
      func: LogEntry.aggregateExtractBy("uaOsName", "Unknown")
    },

    osVersion: {
      name: "OS Version",
      axisLabel: "Requests",
      defaultChartFunction: "pie",
      func: LogEntry.aggregateExtractBy("uaOsName", "Unknown", "uaOsVersion")
    },

    allUserAgents: {
      name: "All User Agents",
      axisLabel: "Requests",
      defaultChartFunction: "horizontalBar",
      func: LogEntry.aggregateExtractBy("userAgent", "Unknown")
    },

    timeZone: {
      name: "Timezone",
      axisLabel: "Requests",
      defaultChartFunction: "pie",
      func: LogEntry.aggregateExtractBy("timeZone", "Unknown")
    },

    continentCode: {
      name: "Continent Code",
      axisLabel: "Requests",
      defaultChartFunction: "pie",
      func: LogEntry.aggregateExtractBy("continentCode", "Unknown")
    },

    continent: {
      name: "Continent",
      axisLabel: "Requests",
      defaultChartFunction: "pie",
      func: LogEntry.aggregateExtractBy("continent", "Unknown")
    },

    countryCode: {
      name: "Country Code",
      axisLabel: "Requests",
      defaultChartFunction: "pie",
      func: LogEntry.aggregateExtractBy("countryCode", "Unknown")
    },

    country: {
      name: "Country",
      axisLabel: "Requests",
      defaultChartFunction: "pie",
      func: LogEntry.aggregateExtractBy("country", "Unknown")
    },

    provinceCode: {
      name: "Province Code",
      axisLabel: "Requests",
      defaultChartFunction: "pie",
      func: LogEntry.aggregateExtractBy("provinceCode", "Unknown")
    },

    province: {
      name: "Province",
      axisLabel: "Requests",
      defaultChartFunction: "pie",
      func: LogEntry.aggregateExtractBy("province", "Unknown")
    },

    postalCode: {
      name: "Postal Code",
      axisLabel: "Requests",
      defaultChartFunction: "pie",
      func: LogEntry.aggregateExtractBy("postalCode", "Unknown")
    },

    city: {
      name: "City",
      axisLabel: "Requests",
      defaultChartFunction: "pie",
      func: LogEntry.aggregateExtractBy("city", "Unknown")
    },

    countryProvince: {
      name: "Country and Province",
      axisLabel: "Requests",
      defaultChartFunction: "pie",
      func: LogEntry.aggregateExtractBy("country", "Unknown", "province")
    },

    countryCity: {
      name: "Country and City",
      axisLabel: "Requests",
      defaultChartFunction: "pie",
      func: LogEntry.aggregateExtractBy("country", "Unknown", "city")
    },

    countryPostalCode: {
      name: "Country and Postal Code",
      axisLabel: "Requests",
      defaultChartFunction: "pie",
      func: LogEntry.aggregateExtractBy("country", "Unknown", "postalCode")
    },

    provinceCity: {
      name: "Province and City",
      axisLabel: "Requests",
      defaultChartFunction: "pie",
      func: LogEntry.aggregateExtractBy("province", "Unknown", "city")
    },

    responseStatusCode: {
      name: "Response Status Code",
      axisLabel: "Requests",
      defaultChartFunction: "horizontalBar",
      func: LogEntry.aggregateExtractBy("statusCode", "Unknown")
    },
  }

  // === Constructor ===

  constructor(id) {
    super(id);
  }

  // === Instance Methods ===

  /**
   * @return {boolean} True is the line was parsed, false if the entry should be skipped according to options.
   */
  async parseAndSet(line, options, ipDataCache) {
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
        Nymph.getEntities({'class': LogEntry.class}, {'type': '&', 'strict': ['line', line]}).then((e) => e, (err) => {
          console.log('\nCouldn\'t check for dupes. Got err: ', err, '\n');
        })
      ]);
      if (dupes.length) {
        console.log(`\nSkipping duplicate log entry, already in the db ${dupes.length} time(s):\n${line}\n`);
        return false;
      }
    } else {
      ipInfo = await LogEntry.getIpLocationData(remoteHost);
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

  parseUAString(userAgent) {
    const uaParser = require('ua-parser-js');

    const uaParts = uaParser(userAgent);

    return {
      uaBrowserName: uaParts.browser.name,
      uaBrowserVersion: uaParts.browser.version,
      uaCpuArchitecture: uaParts.cpu.architecture,
      uaDeviceModel: uaParts.device.model,
      uaDeviceType: uaParts.device.type,
      uaDeviceVendor: uaParts.device.vendor,
      uaEngineName: uaParts.engine.name,
      uaEngineVersion: uaParts.engine.version,
      uaOsName: uaParts.os.name,
      uaOsVersion: uaParts.os.version,
    }
  }

  // === Static Methods ===

  static getIpLocationData(ip, ipDataCache) {
    const curl = require('curl');

    if (ipDataCache[ip]) {
      return Promise.resolve(ipDataCache[ip]);
    }

    console.log("Looking up location data for IP: "+ip);

    return new Promise((resolve, reject) => {
      LogEntry.getGeoLite2IpInfo(ip).then((ipInfo) => {
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

  static getGeoLite2IpInfo(...args) {
    return LogEntry.serverCallStatic('getGeoLite2IpInfo', args);
  }

  ///////////////////////////////////////
  //  Aggregetor Functions
  ///////////////////////////////////////

  static aggregateExtractBy(property, unknownIsCalled, appendProperty) {
    return function (entries) {
      const values = {};
      const data = [], eventHandlers = {};

      for (let i = 0; i < entries.length; i++) {
        const entry = entries[i];
        const value = entry.get(property);

        if (!value || value === "-") {
          if (values[unknownIsCalled]) {
            values[unknownIsCalled].value++;
          } else {
            values[unknownIsCalled] = {value: 1};
          }
        } else {
          let finalVal = value, valueAppend;
          if (appendProperty) {
            valueAppend = entry.get(appendProperty);
            if (!valueAppend) {
              valueAppend = '-';
            }
            finalVal += ' '+valueAppend;
          }
          if (values[finalVal]) {
            values[finalVal].value++;
          } else {
            if (appendProperty) {
              values[finalVal] = {
                propValue: value,
                appendValue: valueAppend,
                value: 1
              };
            } else {
              values[finalVal] = {
                propValue: value,
                value: 1
              };
            }
          }
        }
      }

      // Convert every entry to an array.
      for (let k in values) {
        const label = k + " (" + (Math.round(values[k].value / entries.length * 10000) / 100) + "%, " + values[k].value + ")";
        data.push({
          label: label,
          value: values[k].value
        });
        if (k === unknownIsCalled) {
          eventHandlers[label] = function(app) {
            const selectors = app.get("selectors");
            selectors.push({
              type: "|",
              data: [
                [property, false]
              ],
              strict: [
                [property, "-"]
              ],
              "!isset": [property]
            });
            app.set({selectors});
            alert("Added selector to filter for an unknown " + property + ".");
          };
        } else {
          eventHandlers[label] = function(app) {
            const selectors = app.get("selectors");
            if (appendProperty) {
              if (values[k].appendValue === "-") {
                selectors.push({
                  type: "&",
                  "1": {
                    type: "|",
                    data: [
                      [appendProperty, false]
                    ],
                    strict: [
                      [appendProperty, "-"]
                    ],
                    "!isset": [appendProperty]
                  },
                  strict: [
                    [property, values[k].propValue]
                  ]
                });
              } else {
                selectors.push({
                  type: "&",
                  strict: [
                    [property, values[k].propValue],
                    [appendProperty, values[k].appendValue]
                  ]
                });
              }
            } else {
              selectors.push({
                type: "&",
                strict: [
                  [property, values[k].propValue]
                ]
              });
            }
            app.set({selectors});
            alert("Added selector to filter for this " + property + (appendProperty ? " and " + appendProperty : "") + ".");
          };
        }
      }

      data.sort((a, b) => b.value - a.value);

      return {data, eventHandlers};
    };
  }
}

Nymph.setEntityClass(LogEntry.class, LogEntry);
export {LogEntry};
