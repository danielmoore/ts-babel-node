'use strict';

var spawn = require('child_process').spawn;
var concat = require('concat-stream');
var merge = require('merge2');
var Promise = require('bluebird');
var path = require('path');

var casesDirPath = path.join(__dirname, 'cases');
var binPath = require.resolve('../bin/ts-babel-node');

module.exports = function (filename) {
  return new Promise(function (resolve, reject) {
    var child = spawn('node', [ binPath, filename ], { cwd: casesDirPath });

    var out;
    merge([ child.stdout, child.stderr ])
      .on('error', reject)
      .pipe(concat({ encoding: 'string' }, function (_out) {
        out = _out;
      }));

    child
      .on('error', reject)
      .on('exit', function (code) {
        resolve({
          code: code,
          out: out,
        });
      });
  });
};
