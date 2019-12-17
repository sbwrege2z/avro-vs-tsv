'use strict';

const generate = require('./src/generate');
const consume = require('./src/consume');

const users = 10000;
(async function() {
  await generate.sampleData(users);
  await consume.sampleData('./data/sample');
})();
