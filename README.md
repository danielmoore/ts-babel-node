# TypeScript-Babel Node [![Build Status](https://travis-ci.org/danielmoore/ts-babel-node.svg?branch=master)](https://travis-ci.org/danielmoore/ts-babel-node)

This package enables Babel compilation of TypeScript compilation output through a registration function and a Node binary proxy.

### Why do I want this?

Because you want `ts-node` to run `async`/`await` code, but TypeScript will only compile `async`/`await` to ES6 and Node 5.x doesn't support all of ES6 yet. So you need Babel to bridge that gap.

`ts-babel-node` wraps `ts-node` so you can do just that. Run the `ts-babel-node` executable exactly the same way you'd run `ts-node` and require `ts-babel-node/register` instead of `ts-node/register`.

## Installation

### Command Line

To use `ts-babel-node` on the command line, install this package globally. Be sure to include whichever version of TypeScript you want to compile against.

```
$ npm install --global ts-babel-node typescript@1.8

$ ts-babel-node my-file.ts
```

### Library

To include `ts-babel-node` as a register function, install this package as a development dependency. Be sure to include whichever version of TypeScript you want to compile against.

```
$ npm install --save-dev ts-babel-node typescript@1.8
```

## Usage

### Command Line

Since `ts-babel-node` is a wrapper around `ts-node`, anything you can do with `ts-node` works with `ts-babel-node`. See [`ts-node`'s docs](https://github.com/TypeStrong/ts-node/#usage) for more details.

To configure babel, you can pass in an options object to the appropriate register function or use a [babelrc](http://babeljs.io/docs/usage/babelrc/). All babelrc locations are supported. **Note**: if you use a babelrc, the default babel configuration provided by ts-babel-node will not be used. Simply include the `env` preset in your config (or don't, if you don't want it).

### Library

`ts-babel-node` exposes two APIs. The first is a wrapper around the `ts-node` API.

```js
// $ node this-file.js

require('ts-babel-node').register(tsNodeOpts, babelOpts); // both opts are optional
// Or
require('ts-babel-node/register');
```

You can also use this with the `--require ` option on `node`.

```
$ node --require ts-babel-node/register my-file.ts
```

The second API only adds the babel-compilation step. This is useful if your code is run from `ts-node`, as is the case in the [gulp](#gulp) scenario.

```js
// $ ts-node this-file.js

require('ts-babel-node').registerBabel(babelOpts); // babelOpts is optional
// Or
require('ts-babel-node/register-babel');
```

### Mocha

```
$ mocha --require ts-babel-node/register [...args]
```

### Tape

```
$ ts-babel-node node_modules/.bin/tape [...args]
```

### Gulp

In your `gulpfile.ts` (note, `.ts`, not `.js`):

```
import 'ts-babel-node/register-babel';
// ...
```

Then use `gulp` normally. Keep in mind that the babel transpiler won't be active in your `gulpfile.ts`, but will be running in all your imports.

### Debugging

In order to debug with `ts-babel-node` you must run with one of the following options:

```
> node [debug_opts] -r ts-babel-node/register [args]
> node [debug_opts] node_modules/.bin/ts-babel-node [args]

```

This is a current limitation due to this module not spawning it's own node process, so debug
arguments aren't passed to node as execArgs, instead they're passed as normal script arguments.
