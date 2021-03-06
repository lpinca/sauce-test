'use strict';

var getDriver = require('cabbie');
var retry = require('./retry');
var runDriver = require('./run-driver');

module.exports = runSingleBrowser;
/**
 * Run a test in a single browser, then return the result
 *
 * @option {Object}          capabilities
 * @option {Boolean}         debug
 * @option {Object|Function} jobInfo
 * @option {Boolean}         allowExceptions
 * @option {String|Function} testComplete
 * @option {String|Function} testPassed
 * @option {String}          timeout
 *
 * Returns:
 *
 * ```js
 * { "passed": true, "duration": "3000" }
 * ```
 *
 * @param {Location} location
 * @param {Object}   remote
 * @param {Object}   platform
 * @param {Options}  options
 * @returns {Promise}
 */
function runSingleBrowser(location, remote, platform, options) {
  var capabilities = {};
  Object.keys(platform).forEach(function (key) {
    capabilities[key] = platform[key];
  });
  var extraCapabilities = typeof options.capabilities === 'function' ?
      options.capabilities(platform) :
      (options.capabilities || {});
  Object.keys(extraCapabilities).forEach(function (key) {
    capabilities[key] = extraCapabilities[key];
  });
  return retry(function (err) {
    var driver = getDriver(remote, capabilities, {
      mode: 'async',
      debug: options.debug,
      httpDebug: options.httpDebug,
    });
    return driver._session().then(function () {
      return driver;
    });
  }, 4, function (attempt) { return attempt * attempt * 5000; }, {debug: options.debug}).then(function (driver) {
    return runDriver(location, driver, {
      name: options.name,
      jobInfo: typeof options.jobInfo === 'function' ? options.jobInfo(platform) : options.jobInfo,
      allowExceptions: options.allowExceptions,
      testComplete: options.testComplete,
      testPassed: options.testPassed,
      timeout: options.timeout,
      debug: options.debug
    }).then(function (result) {
      return result;
    });
  });
}
