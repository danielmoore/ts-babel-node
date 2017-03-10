'use strict';
var exec = require('./exec');
var lab = exports.lab = require('lab').script();
var expect = require('code').expect;
var ReactTestUtils = require('react-addons-test-utils');

// Typescript supports async when compiling to ES6, but Node 5.x doesn't support
// destructuring. If the babel compiler is working, the code will run without errors.
lab.experiment('When my code has react elements', function () {
  var result;

  lab.before(function () {
    return exec('react/basic.tsx')
      .then(function (_result) {
        result = _result;
      });
  });

  lab.test('it runs successfully', function (done) {
    expect(result.code).to.equal(0);
    done();
  });

  lab.test('it prints the correct output', function (done) {
    expect(ReactTestUtils.isElementOfType(result, 'div')).to.be.true();
    done();
  });
});
