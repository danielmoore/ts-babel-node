'use strict';

var babel = require('babel-core');
var sourceMapSupport = require('source-map-support');
var convertSourceMap = require('convert-source-map');

var outputs = {}; // filename => { code, map }

var babelOpts = {
  presets: [ require('babel-preset-es2015') ],
  ast: false,
};

exports.registerBabel = registerBabel;
function registerBabel() {
  overrideSourceMaps();

  // In case ts-node has already run...
  var tsLoader = wrap(require.extensions['.ts'], hook);

  Object.defineProperty(require.extensions, '.ts', {
    enumerable: true,

    // In case ts-node hasn't run yet...
    set: function (newTSLoader) {
      tsLoader = wrap(newTSLoader, hook);
    },
    get: function () {
      return tsLoader;
    },
  });
}

exports.register = register;
function register(opts) {
  registerBabel();
  require('ts-node').register(opts);
}

function hook(base, m, filename) {
  m._compile = wrap(m._compile, compile);
  base(m, filename);
}

function compile(base, code, filename) {
  var sourcemap = convertSourceMap.fromMapFileSource(code, '.').toObject();
  convertSourceMap.removeMapFileComments(code);

  var babelOutput = babel.transform(code, Object.assign({ inputSourceMap: sourcemap }, babelOpts));

  // babelOutput has a bunch of undocumented stuff on it. Just grab what we need to save memory
  outputs[filename] = { code: babelOutput.code, map: babelOutput.map };

  return base.call(this, babelOutput.code, filename);
}

function overrideSourceMaps() {
  sourceMapSupport.install({
    handleUncaughtExceptions: false,
    retrieveFile: function (filename) {
      return outputs && outputs[filename] && outputs[filename].code;
    },
    retrieveSourceMap: function (filename) {
      var map = outputs && outputs[filename] && outputs[filename].map;

      if (!map) return null;


      return {
        url: null,
        map: map,
      };
    },

    // In case ts-node has already run...
    overrideRetrieveFile: true,
    overrideRetrieveSourceMap: true,
  });

  // Prevent ts-node from adding its own lookups.
  sourceMapSupport.install = function () { };
}

function wrap(base, fn) {
  if (!(typeof base === 'function')) return base;
  return function ()  {
    var args = Array.prototype.slice.call(arguments, 0);
    args.unshift(base);
    return fn.apply(this, args);
  };
}
