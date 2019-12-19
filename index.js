'use strict';

const generate = require('./src/generate');
const consume = require('./src/consume');

const count = 10000;
const type = 'foo'; // type containing all numbers and booleans
//const type = 'user'; // type containing mostly strings and a few numbers

(async function() {
  await generate.sampleData(type, count);
  await consume.sampleData(type);
})();
