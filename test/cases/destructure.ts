import 'babel-polyfill';
import { delay } from 'bluebird';

async function main() {
  const { foo } = await getStuff();
  console.log(foo);
}

async function getStuff() {
  await delay(100);
  return { foo: 'bar', bar: 'baz' };
}

main().catch(err => console.log(err.stack));
