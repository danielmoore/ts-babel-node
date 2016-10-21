'use strict';
var exec = require('./exec');
var lab = exports.lab = require('lab').script();
var expect = require('code').expect;

// the .babelrc in the custom-babel folder removes all console.* statements.
// We selectively include this to demonstrate that the .babelrc is picked up.
lab.experiment('When I have set a custom .babelrc', function () {
  var result;

  lab.before(function () {
    return exec('custom-babel/test.ts')
      .then(function (_result) {
        result = _result;
      });
  });

  lab.test('it runs successfully', function (done) {
    expect(result.code).to.equal(0);
    done();
  });

  lab.test('it prints the correct output', function (done) {
    expect(result.out).to.equal('this is the only thing that should appear\n');
    done();
  });
});
