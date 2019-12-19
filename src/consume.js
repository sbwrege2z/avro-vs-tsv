'use strict';

const fs = require('fs');
const streams = require('./streams');
const models = require('./models');

module.exports = {
  sampleData: consumeSampleData
};

async function consumeSampleData(type) {
  const model = models[type];
  const path = './data/' + type + 's';
  if (!model) throw new Error('Invalid type: ' + type);

  let filename;

  filename = path + '.avro';
  if (fs.existsSync(filename)) {
    let count = 0;
    const decoder = new Promise((resolve, reject) => {
      streams
        .createAvroDecoder({
          path: filename
        })
        .on('data', (obj) => {
          count++;
          // do something with the object
        })
        .on('end', () => resolve())
        .on('error', reject);
    });

    console.log('');
    console.log('Decoding ' + model.name + 's from ' + filename);
    const stats = fs.statSync(filename);
    console.log('File size: ' + stats['size'].toLocaleString());
    console.time('decode');
    await decoder;
    console.log(count.toLocaleString() + ' ' + model.name + 's decoded');
    console.timeEnd('decode');
  }

  const keys = Object.keys(model.new);

  filename = path + '.tsv';
  if (fs.existsSync(filename)) {
    let count = -1; // Ignore first line contains field names
    const input = fs.createReadStream(filename);
    const splitter = streams
      .splitter({ mapper: (line) => line.split('\t') })
      .on('data', (values) => {
        if (count >= 0) {
          const obj = Object.assign({}, model.new);
          for (let [index, key] of keys) obj[key] = values[index];
        }
        count++;
        // do something with the object
      });

    console.log('');
    console.log('Decoding ' + filename);
    const stats = fs.statSync(filename);
    console.log('File size: ' + stats['size'].toLocaleString());
    console.time('decode');
    await streams.pipeline(input, splitter);
    console.log(count.toLocaleString() + ' ' + model.name + 's decoded');
    console.timeEnd('decode');
  }

  filename = path + '.tsv.gz';
  if (fs.existsSync(filename)) {
    let count = -1; // Ignore first line contains field names
    const input = fs.createReadStream(filename);
    const unzip = streams.unzip();
    const splitter = streams
      .splitter({ mapper: (line) => line.split('\t') })
      .on('data', (values) => {
        if (count >= 0) {
          const obj = Object.assign({}, model.new);
          for (let [index, key] of keys) obj[key] = values[index];
        }
        count++;
        // do something with object
      });

    console.log('');
    console.log('Decoding ' + filename);
    const stats = fs.statSync(filename);
    console.log('File size: ' + stats['size'].toLocaleString());
    console.time('decode');
    await streams.pipeline(input, unzip, splitter);
    console.log(count.toLocaleString() + ' ' + model.name + 's decoded');
    console.timeEnd('decode');
  }
}
