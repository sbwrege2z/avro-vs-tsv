'use strict';

const generate = require('./src/generate');
const consume = require('./src/consume');

const count = 100000;
const type = 'foo'; // type containing all numbers and booleans
//const type = 'user'; // type containing mostly strings and a few numbers

(async function() {
  await generate.sampleData(type, count);
  await consume.sampleData(type);
})();

/*
Deserialization (ms)

|    Rows   |   Avro  |   TSV   | TSV.GZ  |
|----------:|--------:|--------:|--------:|
|         1 |       8 |       4 |       3 |
|     1,000 |      28 |      35 |      25 |
|    10,000 |      90 |      98 |     127 |
|   100,000 |     340 |     729 |   1,150 |
|   500,000 |   2,157 |   4,048 |   5,984 |
| 1,000,000 |   2,535 |   6,947 |  11,508 |

File Size (MB)

|    Rows   |   Avro  |   TSV   | TSV.GZ  |
|----------:|--------:|--------:|--------:|
|         1 |   1047B |    506B |    294B |
|     1,000 |    116K |    351K |    165K |
|    10,000 |     1.2 |     3.5 |     1.6 |
|   100,000 |    11.5 |    35.1 |    16.4 |
|   500,000 |    57.6 |   175.7 |    81.9 |
| 1,000,000 |   115.2 |   351.4 |   163.7 |
*/
