'use strict';
var exec = require('./exec');
var lab = exports.lab = require('lab').script();
var expect = require('code').expect;

lab.experiment('When an error is thrown', function () {
  runExperiment('synchronously', 'sync-throw.ts', 'throwError (sync-throw.ts:8:9)');

  runExperiment('in a promise', 'promise-throw.ts', 'throwError (promise-throw.ts:16:9)');
});

function runExperiment(title, file, errorLcoation) {
  lab.experiment(title, function () {
    var result;

    lab.before(function () {
      return exec(file)
        .then(function (_result) {
          result = _result;
        });
    });

    lab.test('it exits successfully', function (done) {
      expect(result.code).to.equal(0);
      done();
    });

    lab.test('it prints a stack trace with the correct line info', function (done) {
      expect(result.out).to.startWith('Error: test error');
      expect(result.out).to.include('\n    at ' + errorLcoation + '\n');
      done();
    });
  });
}
