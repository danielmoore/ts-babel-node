'use strict';

var path = require('path');
var babel = require('babel-core');
var buildConfigChain = require('babel-core/lib/transformation/file/options/build-config-chain');
var sourceMapSupport = require('source-map-support');
var convertSourceMap = require('convert-source-map');

var outputs = {}; // filename => { code, map }

var baseBabelOpts = { ast: false };

var defaultBabelOpts = {
  presets: [ require('babel-preset-es2015') ],
};

exports.registerBabel = registerBabel;
function registerBabel(babelOpts) {
  if (babelOpts) {
    Object.assign(baseBabelOpts, babelOpts);
    defaultBabelOpts = {};
  }

  overrideSourceMaps();

  [ '.ts', '.tsx' ].forEach(function (fileType) {
    // In case ts-node has already run...
    var tsLoader = wrap(require.extensions[fileType], hook);

    Object.defineProperty(require.extensions, fileType, {
      enumerable: true,

      // In case ts-node hasn't run yet...
      set: function (newTSLoader) {
        tsLoader = wrap(newTSLoader, hook);
      },
      get: function () {
        return tsLoader;
      },
    });
  });
}

exports.register = register;
function register(tsNodeOpts, babelOpts) {
  registerBabel(babelOpts);
  require('ts-node').register(tsNodeOpts);
}

function hook(base, m, filename) {
  m._compile = wrap(m._compile, compile);
  base(m, filename);
}

function compile(base, code, filename) {
  var sourcemap = convertSourceMap.fromMapFileSource(code, '.').toObject();
  code = convertSourceMap.removeMapFileComments(code);

  var babelOutput = babel.transform(code, getBabelOpts(filename, sourcemap));

  // babelOutput has a bunch of undocumented stuff on it. Just grab what we need to save memory
  outputs[filename] = { code: babelOutput.code, map: babelOutput.map };

  return base.call(this, babelOutput.code, filename);
}

function getBabelOpts(filename, sourcemap) {
  // this function does roughly what OptionsManager.init does, but we add our own defaulting logic

  var chain = buildConfigChain(Object.assign({ filename: filename, inputSourceMap: sourcemap }, baseBabelOpts));

  var optionsManager = new babel.OptionManager();
  chain.forEach(function (c) { optionsManager.mergeOptions(c); });

  // custom defaulting logic: If the user doesn't provide a .babelrc (or equivalent), then we supply our default.
  if (chain.length < 2) // our base config counts as a config
    optionsManager.mergeOptions({
      options: defaultBabelOpts,
      alias: 'default',
      loc: 'default',
      dirname: path.dirname(filename),
    });

  optionsManager.normaliseOptions();

  return optionsManager.options;
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
  return function () {
    var args = Array.prototype.slice.call(arguments, 0);
    args.unshift(base);
    return fn.apply(this, args);
  };
}
