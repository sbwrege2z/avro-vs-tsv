'use strict';

const generate = require('./generate');
const consume = require('./consume');

const users = 10000;
(async function() {
  //await generate.sampleData(users);
  await consume.sampleData('./data/sample');
})();
