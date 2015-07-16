'use strict';

var addDefaultLoggingAndName = require('./lib/default-logging');
var chromedriver = require('./lib/chromedriver');
var publishCode = require('./lib/publish-code');
var runJsdom = null
var runChromedriver = require('./lib/run-chromedriver');
var runSauceLabs = require('./lib/run-sauce-labs');
var runBrowsers = require('./lib/run-browsers');

module.exports = runTests;
module.exports.publishCode = publishCode;
function runTests(entries, remote, options) {
  if (remote === 'chromedriver') {
    chromedriver.start();
  }
  addDefaultLoggingAndName(options);

  return publishCode(entries, {
    browserify: options.browserify,
    libraries: options.libraries,
    style: options.style,
    stylesheets: options.stylesheets,
    html: options.html,
    disableSSL: options.disableSSL
  }).then(function (location) {
    options.onPublish(location.url);
    if (remote === 'jsdom') {
      if (!runJsdom) runJsdom = require('./lib/run-jsdom');
      return runJsdom(location, remote, {
        name: options.name,
        throttle: options.throttle,
        debug: options.debug,
        allowExceptions: options.allowExceptions,
        testComplete: options.testComplete,
        testPassed: options.testPassed,
        timeout: options.timeout
      }).then(function (result) {
        options.onAllResults(result);
        return result;
      });
    } else if (remote === 'chromedriver') {
      return runChromedriver(location, remote, {
        name: options.name,
        throttle: options.throttle,
        platform: options.platform,
        capabilities: options.capabilities,
        debug: options.debug,
        allowExceptions: options.allowExceptions,
        testComplete: options.testComplete,
        testPassed: options.testPassed,
        timeout: options.timeout,
        chromedriverStarted: true,
        keepChromedriverAlive: false
      }).then(function (result) {
        options.onAllResults(result);
        return result;
      });
    } else if (remote.indexOf('saucelabs') !== -1) {
      return runSauceLabs(location, remote, {
        name: options.name,
        username: options.username,
        accessKey: options.accessKey,
        filterPlatforms: options.filterPlatforms,
        choosePlatforms: options.choosePlatforms,
        parallel: options.parallel,
        platforms: options.platforms,
        throttle: options.throttle,
        capabilities: options.capabilities,
        debug: options.debug,
        jobInfo: options.jobInfo,
        allowExceptions: options.allowExceptions,
        testComplete: options.testComplete,
        testPassed: options.testPassed,
        bail: options.bail,
        timeout: options.timeout,
        onStart: options.onStart,
        onQueue: options.onQueue,
        onResult: options.onResult,
        onBrowserResults: options.onBrowserResults
      }).then(function (results) {
        if (results.passedBrowsers && results.failedBrowsers) {
          results.passed = results.failedBrowsers.length === 0;
        }
        options.onAllResults(results);
        return results;
      });
    } else {
      return runBrowsers(location, remote, {
        name: options.name,
        parallel: options.parallel,
        platforms: options.platforms,
        platform: options.platform,
        throttle: options.throttle,
        capabilities: options.capabilities,
        debug: options.debug,
        allowExceptions: options.allowExceptions,
        testComplete: options.testComplete,
        testPassed: options.testPassed,
        bail: options.bail,
        timeout: options.timeout,
        onStart: options.onStart,
        onQueue: options.onQueue,
        onResult: options.onResult,
        onBrowserResults: options.onBrowserResults
      }).then(function (results) {
        if (results.passedBrowsers && results.failedBrowsers) {
          results.passed = results.failedBrowsers.length === 0;
        }
        options.onAllResults(results);
        return results;
      });
    }
  });
}
