'use strict';
var exec = require('./exec');
var lab = exports.lab = require('lab').script();
var expect = require('code').expect;
var stackParser = require('error-stack-parser');

lab.experiment('When an error is thrown', function () {
  runExperiment('synchronously', 'sync-throw.ts', {
    fileName: require.resolve('./cases/sync-throw.ts'),
    functionName: 'throwError',
    lineNumber: 8,
    columnNumber: 9,
  });

  runExperiment('in a promise', 'promise-throw.ts',  {
    fileName: require.resolve('./cases/promise-throw.ts'),
    functionName: 'throwError',
    lineNumber: 16,
    columnNumber: 9,
  });
});

function runExperiment(title, file, errorLocation) {
  lab.experiment(title, function () {
    var result, frames = [];

    lab.before(function () {
      return exec(file)
        .then(function (_result) {
          result = _result;

          if (result.out.startsWith('Error:'))
            // fake out an Error object
            frames = stackParser.parse({ stack: result.out });
        });
    });

    lab.test('it exits successfully', function (done) {
      expect(result.code).to.equal(0);
      done();
    });

    lab.test('it prints a stack trace with the correct message', function (done) {
      expect(result.out).to.startWith('Error: test error');
      done();
    });

    lab.test('it prints a stack trace with the correct location', function (done) {
      expect(frames[0]).to.include(errorLocation);
      done();
    });
  });
}
