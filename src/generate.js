'use strict';

const fs = require('fs');
const streams = require('./streams');
const models = require('./models');

module.exports = {
  sampleData: generateSampleData
};

async function generateSampleData(type, count) {
  const model = models[type];
  if (!model) throw new Error('Invalid type: ' + type);

  console.log('Generating ' + count.toLocaleString() + ' ' + model.name + 's');

  /*
      Define the streams
  */
  const input = streams
    .passThrough({ objectMode: true })
    .on('data', (obj) => passThroughObjects.push(obj))
    .on('end', () => passThroughObjects.end());
  const passThroughObjects = streams.passThrough({ objectMode: true });
  const passThroughStrings = streams.passThrough({ objectMode: false });
  const tsv = streams
    .tsv()
    .on('data', (str) => passThroughStrings.push(str))
    .on('end', () => passThroughStrings.end());
  const gzip = streams.gzip();
  const encoder = streams.createAvroEncoder({
    schema: { explicit: model.avro },
    //options: { codec: 'snappy' }
    //options: { codec: 'null' }
    options: { codec: 'deflate' }
  });
  const subdir = './data';
  //const subdir = './data/_' + count.toLocaleString();
  if (!fs.existsSync(subdir)) fs.mkdirSync(subdir);
  const outputTsv = fs.createWriteStream(subdir + '/' + type + 's.tsv');
  const outputZip = fs.createWriteStream(subdir + '/' + type + 's.tsv.gz');
  const outputAvro = fs.createWriteStream(subdir + '/' + type + 's.avro');

  /*
      Define the pipelines
  */
  const pipelines = [];
  pipelines.push(streams.pipeline(input, tsv, outputTsv));
  pipelines.push(streams.pipeline(passThroughStrings, gzip, outputZip));
  pipelines.push(streams.pipeline(passThroughObjects, encoder, outputAvro));

  /*
      Push sample data
  */
  for (let i = 1; i <= count; i++) {
    if (i % 1000 === 0) console.log(i.toLocaleString());
    input.push(model.random);
  }
  input.end();

  /*
      Wait for the pipelines to complete
  */
  await Promise.all(pipelines);
}
