import 'babel-polyfill';

function main() {
  throwError();
}

function throwError() {
  throw new Error('test error');
}

try {
  main();
} catch (err) {
  console.log(err.stack);
}
