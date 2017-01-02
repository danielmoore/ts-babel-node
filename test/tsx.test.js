'use strict';
var exec = require('./exec');
var lab = exports.lab = require('lab').script();
var expect = require('code').expect;

// Typescript supports a second file type
lab.experiment('When my code uses tsx files', function () {
  var result;

  lab.before(function () {
    return exec('supports.tsx')
      .then(function (_result) {
        result = _result;
      });
  });

  lab.test('it runs successfully', function (done) {
    expect(result.code).to.equal(0);
    done();
  });

  lab.test('it prints the correct output', function (done) {
    expect(result.out).to.equal('testing\n');
    done();
  });
});
